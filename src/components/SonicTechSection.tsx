import React, { useEffect, useRef, useState } from 'react';
import { CleaningMode, CleaningModeInfo } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { motorSound } from '../utils/audioEngine';
import { Waves, Sparkles, Shield, HeartPulse, Zap, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';

export const CLEANING_MODES: Record<CleaningMode, CleaningModeInfo> = {
  'sonic-precision': {
    id: 'sonic-precision',
    name: 'Sonic Precision',
    vpm: 84000,
    frequencyHz: 1400,
    intensity: 9,
    description: 'High-frequency acoustic cavitation generates rapid micro-bubble shockwaves to dislodge subgingival plaque biofilm.',
    targetFocus: 'Interdental gaps & gumline deep clean',
    acousticProfile: 'Harmonic 1.4 kHz pure resonance',
  },
  'deep-gum': {
    id: 'deep-gum',
    name: 'Deep Gum Hydro-Care',
    vpm: 62000,
    frequencyHz: 1033,
    intensity: 6,
    description: 'Pulsed hydrodynamic fluid drive provides gentle micro-massage to stimulate blood flow and strengthen gingival tissues.',
    targetFocus: 'Sulcus sulcular cleansing & gingival health',
    acousticProfile: 'Modulated rhythmic pulses',
  },
  'micro-whitening': {
    id: 'micro-whitening',
    name: 'Micro-Pulse Whitening',
    vpm: 78000,
    frequencyHz: 1300,
    intensity: 8,
    description: 'Alternating dual-phase sonic sweeps remove extrinsic stains from coffee, tea, and tobacco without enamel abrasiveness.',
    targetFocus: 'Enamel surface stain dissolution',
    acousticProfile: 'Dual-phase alternating sweep',
  },
  'sensitive-ai': {
    id: 'sensitive-ai',
    name: 'Sensitive AI Adaptive',
    vpm: 46000,
    frequencyHz: 766,
    intensity: 4,
    description: 'Dynamically adapts amplitude in real-time if excessive pressure or tooth hypersensitivity is detected by the onboard AI.',
    targetFocus: 'Receding gums & exposed dentin',
    acousticProfile: 'Soft whisper damped tone',
  },
};

export const SonicTechSection: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CleaningMode>('sonic-precision');
  const [fluidIntensity, setFluidIntensity] = useState(1.0);
  const [plaqueCleaned, setPlaqueCleaned] = useState(65);
  const [comparisonValue, setComparisonValue] = useState(60);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const handleSelectMode = (mode: CleaningMode) => {
    triggerHaptic('medium');
    setActiveMode(mode);
    const info = CLEANING_MODES[mode];
    motorSound.setVpm(info.vpm);
  };

  // Micro-bubble Cavitation Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    // Bubbles and Plaque particles
    interface Bubble {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      imploding: boolean;
      implodeRadius: number;
    }

    interface PlaqueParticle {
      x: number;
      y: number;
      size: number;
      color: string;
      dissolved: boolean;
      vx: number;
      vy: number;
    }

    const bubbles: Bubble[] = [];
    const plaqueParticles: PlaqueParticle[] = [];

    // Seed plaque biofilm between two teeth
    const initPlaque = () => {
      plaqueParticles.length = 0;
      for (let i = 0; i < 90; i++) {
        plaqueParticles.push({
          x: width * 0.45 + (Math.random() - 0.5) * 60,
          y: height * 0.35 + Math.random() * (height * 0.4),
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.4 ? 'rgba(217, 119, 6, 0.7)' : 'rgba(180, 83, 9, 0.8)',
          dissolved: false,
          vx: 0,
          vy: 0,
        });
      }
    };

    initPlaque();

    let bristlePhase = 0;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      width = canvas.width;
      height = canvas.height;

      // Clean background
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, width, height);

      // Draw Teeth Geometries (Cross-section)
      ctx.fillStyle = '#1E1E1E';
      ctx.strokeStyle = '#2E2E2E';
      ctx.lineWidth = 2;

      // Left Tooth
      ctx.beginPath();
      ctx.roundRect(width * 0.12, height * 0.25, width * 0.3, height * 0.65, [28, 28, 6, 6]);
      ctx.fill();
      ctx.stroke();

      // Right Tooth
      ctx.beginPath();
      ctx.roundRect(width * 0.58, height * 0.25, width * 0.3, height * 0.65, [28, 28, 6, 6]);
      ctx.fill();
      ctx.stroke();

      // Tooth labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('ENAMEL SURFACE A', width * 0.16, height * 0.3);
      ctx.fillText('ENAMEL SURFACE B', width * 0.62, height * 0.3);

      // Draw Interdental gap label
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('INTERDENTAL FLUID CHANNEL', width * 0.36, height * 0.18);

      // Sonic Bristle Head at top
      bristlePhase += 0.2 * fluidIntensity;
      const bristleOffset = Math.sin(bristlePhase) * 6 * fluidIntensity;

      ctx.fillStyle = '#ff1e82';
      const bristleHeadY = height * 0.12;
      ctx.beginPath();
      ctx.roundRect(width * 0.42 + bristleOffset, bristleHeadY - 14, width * 0.16, 12, 4);
      ctx.fill();

      // Draw pulsing bristle filaments
      ctx.strokeStyle = '#ff1e82';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {
        const bx = width * 0.43 + i * ((width * 0.14) / 13) + bristleOffset;
        ctx.beginPath();
        ctx.moveTo(bx, bristleHeadY - 2);
        ctx.lineTo(bx + (i % 2 === 0 ? 2 : -2), bristleHeadY + 22);
        ctx.stroke();
      }

      // Generate Acoustic Cavitation Bubbles
      if (Math.random() < 0.7 * fluidIntensity) {
        bubbles.push({
          x: width * 0.5 + (Math.random() - 0.5) * 40,
          y: bristleHeadY + 24,
          radius: 1.5 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 2,
          vy: 2.5 + Math.random() * 3.5 * fluidIntensity,
          life: 0,
          maxLife: 50 + Math.random() * 40,
          imploding: false,
          implodeRadius: 0,
        });
      }

      // Update & Render Cavitation Bubbles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life++;
        b.x += b.vx + Math.sin(b.life * 0.2) * 1.5;
        b.y += b.vy;

        // Check if near plaque
        for (const p of plaqueParticles) {
          if (!p.dissolved && Math.hypot(p.x - b.x, p.y - b.y) < 14) {
            b.imploding = true;
            p.dissolved = true;
            p.vx = (Math.random() - 0.5) * 4;
            p.vy = 2 + Math.random() * 3;
          }
        }

        // Draw bubble or cavitation micro-implosion
        if (b.imploding) {
          b.implodeRadius += 1.8;
          ctx.strokeStyle = `rgba(0, 212, 255, ${Math.max(0, 1 - b.implodeRadius / 15)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.implodeRadius, 0, Math.PI * 2);
          ctx.stroke();

          if (b.implodeRadius > 16 || b.life > b.maxLife) {
            bubbles.splice(i, 1);
          }
        } else {
          ctx.fillStyle = 'rgba(0, 212, 255, 0.75)';
          ctx.shadowColor = '#00d4ff';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          if (b.y > height * 0.95 || b.life > b.maxLife) {
            bubbles.splice(i, 1);
          }
        }
      }

      // Update & Render Plaque Biofilm particles
      let activePlaque = 0;
      for (const p of plaqueParticles) {
        if (!p.dissolved) {
          activePlaque++;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Dissolved wash away
          p.x += p.vx;
          p.y += p.vy;
          ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const currentScore = Math.round(100 - (activePlaque / plaqueParticles.length) * 100);
      setPlaqueCleaned(currentScore);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [fluidIntensity]);

  return (
    <div id="section-sonic-tech" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#7E3AF2] uppercase mb-2">
            <Waves className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Fluid Dynamic Cavitation &bull; Acoustics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white font-heading">
            Precision Sonic Cleaning <br className="hidden sm:inline" />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Micro-Bubble Hydrodynamics
            </span>
          </h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed font-light">
          Traditional bristles only clean where they physically touch. Dyson Sonic AI propels energetic micro-bubbles deep into interdental gaps where bristles cannot reach.
        </p>
      </div>

      {/* Main Grid: Simulation + Mode Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Interactive Cavitation Chamber */}
        <div className="lg:col-span-7 bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse" />
              <span className="text-xs font-mono text-white font-medium">INTERDENTAL CAVITATION LAB</span>
            </div>
            <div className="text-xs font-mono text-gray-400">
              BIOFILM REMOVAL: <span className="text-[#A78BFA] font-bold">{plaqueCleaned}%</span>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#121212]">
            <canvas
              ref={canvasRef}
              width={700}
              height={420}
              className="w-full h-[300px] sm:h-[380px] object-cover"
            />

            {/* Simulation Controls Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-[#1A1A1A]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-xs font-mono">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                ACOUSTIC ENERGY: {Math.round(fluidIntensity * 100)}%
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setFluidIntensity((prev) => (prev >= 1.6 ? 0.6 : prev + 0.3));
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Zap className="w-3 h-3 text-[#A78BFA]" />
                  Boost Pulse
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono text-gray-400">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[#A78BFA] font-bold block text-sm">0.02mm</span>
              Fine Bristles
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white font-bold block text-sm">84,000</span>
              VPM Sweeps
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[#A78BFA] font-bold block text-sm">24x</span>
              Deeper Reach
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white font-bold block text-sm">0%</span>
              Enamel Wear
            </div>
          </div>
        </div>

        {/* Right: 4 AI Cleaning Modes */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1 flex items-center justify-between">
            <span>Intelligent Cleaning Modes</span>
            <span className="text-[#A78BFA] font-mono">{CLEANING_MODES[activeMode].vpm.toLocaleString()} VPM</span>
          </div>

          <div className="flex flex-col gap-3">
            {(Object.keys(CLEANING_MODES) as CleaningMode[]).map((modeKey) => {
              const mode = CLEANING_MODES[modeKey];
              const isSelected = activeMode === modeKey;

              return (
                <button
                  key={modeKey}
                  id={`mode-card-${modeKey}`}
                  onClick={() => handleSelectMode(modeKey)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative ${
                    isSelected
                      ? 'border-[#7E3AF2] bg-[#7E3AF2]/10 shadow-[0_0_20px_rgba(126,58,242,0.2)] ring-1 ring-[#7E3AF2]/40'
                      : 'border-white/5 bg-[#1A1A1A] hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#7E3AF2] text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {modeKey === 'sonic-precision' && <Zap className="w-4 h-4" />}
                        {modeKey === 'deep-gum' && <HeartPulse className="w-4 h-4" />}
                        {modeKey === 'micro-whitening' && <Sparkles className="w-4 h-4" />}
                        {modeKey === 'sensitive-ai' && <Shield className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{mode.name}</div>
                        <span className="text-[11px] font-mono text-gray-400">
                          {mode.vpm.toLocaleString()} VPM &bull; {mode.frequencyHz} Hz
                        </span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#A78BFA]" />}
                  </div>

                  <p className="text-xs text-gray-400 mt-2 leading-relaxed font-light">{mode.description}</p>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
                    <span>FOCUS: {mode.targetFocus}</span>
                    <span className={isSelected ? 'text-[#A78BFA]' : 'text-gray-500'}>
                      INTENSITY {mode.intensity}/10
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Real-time Mode Summary Banner */}
          <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#7E3AF2]/20 border border-[#7E3AF2]/30 flex items-center justify-center shrink-0">
              <Waves className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <div className="text-xs">
              <div className="text-white font-medium">Active Acoustic Profile</div>
              <div className="text-gray-400 font-mono text-[11px]">{CLEANING_MODES[activeMode].acousticProfile}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Technology Comparison Slider */}
      <div className="mt-16 bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 lg:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1">
              Comparative Clinical Efficacy
            </span>
            <h3 className="text-xl sm:text-2xl font-light text-white font-heading">Manual vs Electric vs Dyson AI Sonic</h3>
          </div>
          <div className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg text-gray-400 border border-white/5">
            DYNAMIC EFFICACY COMPARISON
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-gray-500 block mb-1">CATEGORY 01</span>
              <div className="text-base font-medium text-gray-300 mb-2">Manual Toothbrush</div>
              <ul className="text-xs text-gray-400 space-y-2 font-light">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> ~300 strokes/min
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> 0% fluid cavitation reach
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Relies on inconsistent manual force
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-xs font-mono">
              <span className="text-gray-500">Plaque Removal</span>
              <span className="text-red-400 font-medium">42%</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121212] border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-gray-500 block mb-1">CATEGORY 02</span>
              <div className="text-base font-medium text-gray-300 mb-2">Standard Oscillating Electric</div>
              <ul className="text-xs text-gray-400 space-y-2 font-light">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 8,800 mechanical rotations/min
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Harsh friction causes gum recession
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Loud motor vibration (&gt;75 dBA)
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-xs font-mono">
              <span className="text-gray-500">Plaque Removal</span>
              <span className="text-amber-400 font-medium">76%</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#7E3AF2]/15 to-[#121212] border border-[#7E3AF2]/40 shadow-[0_0_25px_rgba(126,58,242,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[#A78BFA] font-semibold">DYSON ORAL CARE AI</span>
                <span className="bg-[#7E3AF2] text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold">PINNACLE</span>
              </div>
              <div className="text-base font-medium text-white mb-2">Dyson SonicPulse™ AI</div>
              <ul className="text-xs text-gray-300 space-y-2 font-light">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" /> 84,000 sonic vibrations/min
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" /> Micro-bubble fluid drive reaches 4mm
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Real-time AI pressure feedback
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-xs font-mono">
              <span className="text-gray-400">Plaque Removal</span>
              <span className="text-[#A78BFA] font-bold text-sm">99.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
