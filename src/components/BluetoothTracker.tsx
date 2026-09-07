import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { BluetoothSessionState, PressureStatus, DentalZone } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { motorSound } from '../utils/audioEngine';
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BatteryCharging,
  Clock,
  Sparkles,
  Zap,
  Layers,
  Award,
  Activity,
} from 'lucide-react';

const INITIAL_ZONES: DentalZone[] = [
  // Upper Jaw
  { id: 'ur-outer', name: 'Upper Right Outer', quadrant: 'Q1', surface: 'outer', coverage: 85, completed: false },
  { id: 'ur-bite', name: 'Upper Right Bite', quadrant: 'Q1', surface: 'chewing', coverage: 90, completed: false },
  { id: 'ur-inner', name: 'Upper Right Inner', quadrant: 'Q1', surface: 'inner', coverage: 70, completed: false },

  { id: 'uf-outer', name: 'Upper Front Outer', quadrant: 'Q2', surface: 'outer', coverage: 95, completed: false },
  { id: 'uf-inner', name: 'Upper Front Inner', quadrant: 'Q2', surface: 'inner', coverage: 80, completed: false },

  { id: 'ul-outer', name: 'Upper Left Outer', quadrant: 'Q2', surface: 'outer', coverage: 75, completed: false },
  { id: 'ul-bite', name: 'Upper Left Bite', quadrant: 'Q2', surface: 'chewing', coverage: 85, completed: false },
  { id: 'ul-inner', name: 'Upper Left Inner', quadrant: 'Q2', surface: 'inner', coverage: 65, completed: false },

  // Lower Jaw
  { id: 'll-outer', name: 'Lower Left Outer', quadrant: 'Q3', surface: 'outer', coverage: 80, completed: false },
  { id: 'll-bite', name: 'Lower Left Bite', quadrant: 'Q3', surface: 'chewing', coverage: 85, completed: false },
  { id: 'll-inner', name: 'Lower Left Inner', quadrant: 'Q3', surface: 'inner', coverage: 70, completed: false },

  { id: 'lf-outer', name: 'Lower Front Outer', quadrant: 'Q4', surface: 'outer', coverage: 95, completed: false },
  { id: 'lf-inner', name: 'Lower Front Inner', quadrant: 'Q4', surface: 'inner', coverage: 80, completed: false },

  { id: 'lr-outer', name: 'Lower Right Outer', quadrant: 'Q4', surface: 'outer', coverage: 75, completed: false },
  { id: 'lr-bite', name: 'Lower Right Bite', quadrant: 'Q4', surface: 'chewing', coverage: 90, completed: false },
  { id: 'lr-inner', name: 'Lower Right Inner', quadrant: 'Q4', surface: 'inner', coverage: 60, completed: false },
];

export const BluetoothTracker: React.FC = () => {
  const [session, setSession] = useState<BluetoothSessionState>({
    isConnected: true,
    isSimulated: true,
    deviceName: 'Dyson SonicPulse AI #7492',
    batteryLevel: 94,
    brushingActive: false,
    elapsedSeconds: 42,
    totalDurationSeconds: 120,
    currentQuadrant: 2,
    pressureGrams: 195,
    pressureStatus: 'optimal',
    overallCoverage: 82,
    activeMode: 'sonic-precision',
    bristleDaysRemaining: 74,
  });

  const [zones, setZones] = useState<DentalZone[]>(INITIAL_ZONES);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Connected via Bluetooth Low Energy 5.4');
  const timerRef = useRef<number | null>(null);

  // Trigger web bluetooth connect
  const handleConnectBluetooth = async () => {
    triggerHaptic('medium');
    setIsConnecting(true);

    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const nav = navigator as unknown as {
          bluetooth: {
            requestDevice: (options: unknown) => Promise<{ name?: string }>;
          };
        };
        const device = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'device_information'],
        });

        setSession((prev) => ({
          ...prev,
          isConnected: true,
          isSimulated: false,
          deviceName: device.name || 'Dyson SonicPulse AI',
        }));
        setStatusMessage('Paired to hardware device via Web Bluetooth API');
        triggerHaptic('success');
      } catch (err) {
        // Fallback to live simulated mode
        setSession((prev) => ({
          ...prev,
          isConnected: true,
          isSimulated: true,
          deviceName: 'Dyson SonicPulse AI (Telemetry Active)',
        }));
        setStatusMessage('Live Telemetry Simulation Active');
      }
    } else {
      // Browser doesn't have Web Bluetooth API (or in iframe)
      setSession((prev) => ({
        ...prev,
        isConnected: true,
        isSimulated: true,
        deviceName: 'Dyson SonicPulse AI (Telemetry Active)',
      }));
      setStatusMessage('Live Telemetry Simulation Active');
      triggerHaptic('success');
    }
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    triggerHaptic('light');
    if (session.brushingActive) {
      motorSound.stop();
    }
    setSession((prev) => ({ ...prev, isConnected: false, brushingActive: false }));
    setStatusMessage('Device Disconnected');
  };

  // Toggle Brushing Session
  const toggleBrushing = () => {
    triggerHaptic('medium');
    if (!session.isConnected) {
      handleConnectBluetooth();
      return;
    }

    const nextState = !session.brushingActive;
    setSession((prev) => ({ ...prev, brushingActive: nextState }));

    if (nextState) {
      motorSound.start();
    } else {
      motorSound.stop();
    }
  };

  const resetSession = () => {
    triggerHaptic('light');
    motorSound.stop();
    setSession((prev) => ({
      ...prev,
      brushingActive: false,
      elapsedSeconds: 0,
      currentQuadrant: 1,
      overallCoverage: 0,
    }));
    setZones((prev) => prev.map((z) => ({ ...z, coverage: 0, completed: false })));
  };

  // Live Brushing Loop: timer, quadrant advancement, coverage calculation
  useEffect(() => {
    if (session.brushingActive) {
      timerRef.current = window.setInterval(() => {
        setSession((prev) => {
          if (prev.elapsedSeconds >= prev.totalDurationSeconds) {
            motorSound.stop();
            triggerHaptic('success');
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff1e82', '#00d4ff', '#ffffff'],
              });
            } catch {}
            return { ...prev, brushingActive: false };
          }

          const newElapsed = prev.elapsedSeconds + 1;
          const quadrantDuration = prev.totalDurationSeconds / 4; // 30s per quadrant
          const nextQuadrant = Math.min(4, Math.floor(newElapsed / quadrantDuration) + 1) as 1 | 2 | 3 | 4;

          // Haptic alert when switching quadrants
          if (nextQuadrant !== prev.currentQuadrant) {
            triggerHaptic('quadrant');
          }

          // Random slight realistic pressure variance
          const variance = (Math.random() - 0.5) * 15;
          const newPressure = Math.round(Math.max(80, Math.min(320, prev.pressureGrams + variance)));
          let status: PressureStatus = 'optimal';
          if (newPressure < 140) status = 'low';
          else if (newPressure > 280) {
            status = 'excessive';
            triggerHaptic('warning');
          }

          return {
            ...prev,
            elapsedSeconds: newElapsed,
            currentQuadrant: nextQuadrant,
            pressureGrams: newPressure,
            pressureStatus: status,
          };
        });

        // Increment dental zone coverage for current quadrant
        setZones((prevZones) => {
          const currentQuadKey = `Q${session.currentQuadrant}`;
          return prevZones.map((zone) => {
            if (zone.quadrant === currentQuadKey) {
              const add = Math.random() * 4;
              const newCov = Math.min(100, Math.round(zone.coverage + add));
              return { ...zone, coverage: newCov, completed: newCov >= 95 };
            }
            return zone;
          });
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [session.brushingActive, session.currentQuadrant]);

  // Recalculate overall coverage average
  useEffect(() => {
    const total = zones.reduce((acc, z) => acc + z.coverage, 0);
    const avg = Math.round(total / zones.length);
    setSession((prev) => ({ ...prev, overallCoverage: avg }));
  }, [zones]);

  const minutes = Math.floor(session.elapsedSeconds / 60);
  const seconds = session.elapsedSeconds % 60;
  const progressPercent = Math.min(100, Math.round((session.elapsedSeconds / session.totalDurationSeconds) * 100));

  const quadrantNames = {
    1: 'Quadrant 1: Upper Right',
    2: 'Quadrant 2: Upper Left',
    3: 'Quadrant 3: Lower Left',
    4: 'Quadrant 4: Lower Right',
  };

  return (
    <div id="section-bluetooth-tracker" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#7E3AF2] uppercase mb-2">
            <Bluetooth className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Connected Dyson Companion Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white font-heading">
            Real-Time Progress Tracker <br className="hidden sm:inline" />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Synced via Bluetooth Low Energy
            </span>
          </h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed font-light">
          Embedded 6-axis IMU sensors and micro-strain gauges map your dental topology in real-time, streaming 100 telemetry packets per second to monitor oral coverage.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        {/* Device Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                session.isConnected ? 'bg-[#7E3AF2]/20 text-[#A78BFA] border border-[#7E3AF2]/40 shadow-[0_0_15px_rgba(126,58,242,0.3)]' : 'bg-white/5 text-gray-400'
              }`}
            >
              {session.isConnected ? <BluetoothConnected className="w-5 h-5" /> : <BluetoothOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 font-medium text-white text-sm sm:text-base">
                <span>{session.deviceName}</span>
                {session.isConnected && (
                  <span className="bg-[#7E3AF2]/20 text-[#A78BFA] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#7E3AF2]/30">
                    BLE 5.4 PAIRED
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-gray-400 font-light">{statusMessage}</span>
            </div>
          </div>

          {/* Actions: Connect / Disconnect + Battery */}
          <div className="flex items-center gap-3">
            {session.isConnected && (
              <div className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-xl border border-white/5 text-xs font-mono text-gray-300">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span>{session.batteryLevel}%</span>
              </div>
            )}

            {session.isConnected ? (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectBluetooth}
                disabled={isConnecting}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#7E3AF2] hover:bg-[#6C2BD9] text-white transition-all shadow-[0_0_15px_rgba(126,58,242,0.4)]"
              >
                {isConnecting ? 'Searching...' : 'Pair Toothbrush'}
              </button>
            )}
          </div>
        </div>

        {/* Live Brushing Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
          {/* Left: 2-Minute Timer & Quadrant Indicator */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Timer Dial Card */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 text-center relative overflow-hidden flex flex-col items-center">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                Session Duration (Dentist Recommended)
              </span>

              {/* Circular Progress & Clock */}
              <div className="relative w-48 h-48 flex items-center justify-center my-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-[#1E1E1E]"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-[#7E3AF2] transition-all duration-500"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className="text-4xl font-light text-white tracking-tighter">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">{progressPercent}% COMPLETE</span>
                </div>
              </div>

              {/* Current Active Quadrant Pacer */}
              <div className="w-full bg-[#1A1A1A] rounded-xl p-3 border border-white/5 mt-2">
                <div className="flex justify-between items-center text-xs font-mono text-gray-400 mb-1.5">
                  <span>ACTIVE PACER ZONE</span>
                  <span className="text-[#A78BFA] font-medium">{quadrantNames[session.currentQuadrant]}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((q) => (
                    <div
                      key={q}
                      className={`py-1.5 rounded-lg text-center text-[10px] font-mono transition-all ${
                        session.currentQuadrant === q
                          ? 'bg-[#7E3AF2] text-white font-medium shadow-[0_0_10px_rgba(126,58,242,0.5)]'
                          : session.currentQuadrant > q
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      Q{q} {session.currentQuadrant > q ? '✓' : ''}
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mt-5 w-full">
                <button
                  id="btn-toggle-brushing"
                  onClick={toggleBrushing}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    session.brushingActive
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-[#7E3AF2] hover:bg-[#6C2BD9] text-white shadow-[0_0_20px_rgba(126,58,242,0.4)]'
                  }`}
                >
                  {session.brushingActive ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{session.brushingActive ? 'Pause Session' : 'Start Live Session'}</span>
                </button>
                <button
                  id="btn-reset-brushing"
                  onClick={resetSession}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-colors"
                  title="Reset 2-minute timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Smart Pressure Sensor Meter */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#A78BFA]" />
                  OPTICAL PRESSURE SENSOR
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    session.pressureStatus === 'optimal'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : session.pressureStatus === 'excessive'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-bounce'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {session.pressureGrams}g &bull; {session.pressureStatus.toUpperCase()}
                </span>
              </div>

              {/* Visual gauge bar */}
              <div className="relative w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden my-3">
                <div
                  className={`h-full transition-all duration-300 ${
                    session.pressureStatus === 'optimal'
                      ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                      : session.pressureStatus === 'excessive'
                      ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)]'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (session.pressureGrams / 350) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>0g (Under)</span>
                <span className="text-emerald-400">150g - 250g (Optimal)</span>
                <span className="text-red-400">&gt;280g (Excessive)</span>
              </div>

              {session.pressureStatus === 'excessive' && (
                <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>AI Warning: Excessive pressure detected. Motor speed auto-dampened to preserve enamel.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: 16-Zone Dental Arch Mapping */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 mb-6 gap-2">
                <div>
                  <div className="text-base font-medium text-white flex items-center gap-2">
                    <span>16-Zone Dental Coverage Map</span>
                    <span className="bg-[#7E3AF2]/15 text-[#A78BFA] text-xs font-mono px-2 py-0.5 rounded border border-[#7E3AF2]/30">
                      LIVE TOPOLOGY
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-light">
                    Real-time surface tracking via onboard 6-axis gyroscope
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-light text-[#A78BFA] font-mono">{session.overallCoverage}%</span>
                  <span className="text-xs text-gray-500 block font-mono">TOTAL COVERAGE</span>
                </div>
              </div>

              {/* Visual Arch representation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upper Arch */}
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3">
                    <span className="text-white font-medium">MAXILLARY ARCH (UPPER)</span>
                    <span className="text-[#A78BFA]">Q1 & Q2</span>
                  </div>
                  <div className="space-y-2">
                    {zones
                      .filter((z) => z.quadrant === 'Q1' || z.quadrant === 'Q2')
                      .map((zone) => (
                        <div key={zone.id} className="text-xs">
                          <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                            <span>{zone.name}</span>
                            <span className={zone.coverage >= 90 ? 'text-emerald-400 font-bold' : 'text-gray-300'}>
                              {zone.coverage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#121212] rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                zone.coverage >= 90
                                  ? 'bg-emerald-400'
                                  : zone.coverage >= 70
                                  ? 'bg-[#A78BFA]'
                                  : 'bg-amber-400'
                              }`}
                              style={{ width: `${zone.coverage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Lower Arch */}
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3">
                    <span className="text-white font-medium">MANDIBULAR ARCH (LOWER)</span>
                    <span className="text-[#7E3AF2]">Q3 & Q4</span>
                  </div>
                  <div className="space-y-2">
                    {zones
                      .filter((z) => z.quadrant === 'Q3' || z.quadrant === 'Q4')
                      .map((zone) => (
                        <div key={zone.id} className="text-xs">
                          <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                            <span>{zone.name}</span>
                            <span className={zone.coverage >= 90 ? 'text-emerald-400 font-bold' : 'text-gray-300'}>
                              {zone.coverage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#121212] rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                zone.coverage >= 90
                                  ? 'bg-emerald-400'
                                  : zone.coverage >= 70
                                  ? 'bg-[#7E3AF2]'
                                  : 'bg-amber-400'
                              }`}
                              style={{ width: `${zone.coverage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Coverage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-white/5 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> 90-100% Mastered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A78BFA]" /> 70-89% In Progress
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> &lt;70% Missed
                  </span>
                </div>
                <span className="text-gray-500">Auto-synced with Apple Health & Dyson Cloud</span>
              </div>
            </div>

            {/* Smart Insights & Bristle Wear Monitor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-gray-500 block mb-1">SMART BRISTLE MONITOR</span>
                  <div className="text-lg font-medium text-white">{session.bristleDaysRemaining} Days Left</div>
                  <span className="text-xs text-gray-400 font-light">RFID filament fatigue tracking</span>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500/40 flex items-center justify-center font-mono text-xs text-emerald-400 font-bold">
                  82%
                </div>
              </div>

              <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-gray-500 block mb-1">CLEANING CONSISTENCY</span>
                  <div className="text-lg font-medium text-[#A78BFA]">14-Day Streak</div>
                  <span className="text-xs text-gray-400 font-light">Twice daily &bull; 99% score</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#7E3AF2]/15 border border-[#7E3AF2]/30 flex items-center justify-center text-[#A78BFA]">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
