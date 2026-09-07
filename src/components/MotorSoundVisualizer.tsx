import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motorSound } from '../utils/audioEngine';
import { triggerHaptic } from '../utils/haptics';
import { Volume2, VolumeX, Play, Square, Activity, Gauge, Zap, Waves, Sliders, Shield } from 'lucide-react';

export const MotorSoundVisualizer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [vpm, setVpm] = useState(84000);
  const [visualizerMode, setVisualizerMode] = useState<'both' | 'waveform' | 'spectrum'>('both');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Toggle motor sound
  const handleToggleSound = useCallback(() => {
    triggerHaptic('medium');
    const newState = motorSound.toggle();
    setIsPlaying(newState);
    if (newState) {
      motorSound.setVpm(vpm);
    }
  }, [vpm]);

  // Update speed
  const handleVpmChange = (newVpm: number) => {
    setVpm(newVpm);
    motorSound.setVpm(newVpm);
    if (newVpm % 10000 === 0) {
      triggerHaptic('light');
    }
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      // Dark translucent clear for persistence trail
      ctx.fillStyle = 'rgba(11, 12, 16, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const analyser = motorSound.getAnalyser();
      const hasLiveAudio = isPlaying && analyser;

      const bufferLength = analyser ? analyser.frequencyBinCount : 256;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      if (hasLiveAudio) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);
      } else {
        // Subtle ambient synthetic idling wave
        phase += 0.04;
        for (let i = 0; i < bufferLength; i++) {
          timeData[i] = 128 + Math.sin(i * 0.08 + phase) * 8;
          freqData[i] = Math.max(0, 40 - i * 0.4 + Math.sin(i * 0.2 + phase) * 10);
        }
      }

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridLines = 5;
      for (let g = 1; g < gridLines; g++) {
        const y = (height / gridLines) * g;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render Waveform (Oscilloscope)
      if (visualizerMode === 'both' || visualizerMode === 'waveform') {
        ctx.lineWidth = 2.5;
        const waveGradient = ctx.createLinearGradient(0, 0, width, 0);
        waveGradient.addColorStop(0, '#7E3AF2');
        waveGradient.addColorStop(0.5, '#A78BFA');
        waveGradient.addColorStop(1, '#7E3AF2');
        ctx.strokeStyle = waveGradient;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();

        // Waveform glow
        ctx.shadowColor = isPlaying ? '#7E3AF2' : 'transparent';
        ctx.shadowBlur = isPlaying ? 16 : 0;
      }

      // Render Spectrum Frequency Bars
      if (visualizerMode === 'both' || visualizerMode === 'spectrum') {
        const barCount = 48;
        const barWidth = (width / barCount) * 0.7;
        const step = Math.floor(bufferLength / barCount);

        for (let b = 0; b < barCount; b++) {
          const barHeight = (freqData[b * step] / 255) * (height * 0.45);
          const bx = b * (width / barCount) + (width / barCount - barWidth) / 2;
          const by = height - barHeight;

          const barGrad = ctx.createLinearGradient(0, height, 0, by);
          barGrad.addColorStop(0, 'rgba(126, 58, 242, 0.15)');
          barGrad.addColorStop(0.6, 'rgba(126, 58, 242, 0.85)');
          barGrad.addColorStop(1, '#A78BFA');

          ctx.fillStyle = barGrad;
          ctx.fillRect(bx, by, barWidth, barHeight);

          // Top luminous cap
          if (barHeight > 4) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(bx, by - 2, barWidth, 2);
          }
        }
      }
      ctx.shadowBlur = 0;
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, visualizerMode]);

  const fundamentalHz = Math.round(vpm / 60);
  const calculatedDb = Math.round(44 + (vpm / 90000) * 8.5);

  return (
    <div id="section-motor-sound" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#7E3AF2] uppercase mb-2">
            <Activity className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Motor Dynamics &bull; Acoustic Engineering</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white font-heading">
            High-Speed Sonic Motor <br className="hidden sm:inline" />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Acoustic Visualizer
            </span>
          </h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed font-light">
          Engineered with 13-stage resonance baffles, the Dyson V-Pulse motor harnesses 84,000 vibrations per minute with ultrasonic pitch suppression below 52 dBA.
        </p>
      </div>

      {/* Main Visualizer Container */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7E3AF2]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#7E3AF2]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-4">
            <button
              id="btn-motor-sound-toggle"
              onClick={handleToggleSound}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                isPlaying
                  ? 'bg-[#7E3AF2] text-white shadow-[0_0_24px_rgba(126,58,242,0.5)] animate-pulse'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isPlaying ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              <span>{isPlaying ? 'Halt Motor Audio' : 'Ignite Sonic Motor'}</span>
            </button>

            <span className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#A78BFA] animate-ping' : 'bg-gray-600'}`} />
              {isPlaying ? 'ACOUSTIC SYNTHESIS LIVE' : 'SYNTHESIS STANDBY'}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-xl border border-white/5 text-xs font-mono">
            <button
              onClick={() => setVisualizerMode('both')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                visualizerMode === 'both' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setVisualizerMode('waveform')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                visualizerMode === 'waveform' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Oscilloscope
            </button>
            <button
              onClick={() => setVisualizerMode('spectrum')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                visualizerMode === 'spectrum' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              FFT Bars
            </button>
          </div>
        </div>

        {/* Real-time Oscilloscope & Frequency Canvas */}
        <div className="relative my-6 rounded-2xl overflow-hidden bg-[#121212] border border-white/5 shadow-inner">
          <canvas
            ref={canvasRef}
            width={1000}
            height={320}
            className="w-full h-[260px] sm:h-[320px] object-cover"
          />

          {/* Real-time Overlay HUD */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 font-mono text-xs text-gray-400 bg-[#1A1A1A]/90 backdrop-blur px-3 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">VELOCITY:</span>
              <span className="text-white font-bold">{vpm.toLocaleString()} VPM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">FREQUENCY:</span>
              <span className="text-[#A78BFA] font-bold">{fundamentalHz} Hz</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">ACOUSTIC DAMPING:</span>
              <span className="text-[#7E3AF2] font-bold">{calculatedDb} dBA</span>
            </div>
          </div>

          {/* Cavitation status tag */}
          <div className="absolute top-4 right-4 bg-[#1A1A1A]/90 backdrop-blur px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-mono">
            <Waves className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span className={vpm >= 60000 ? 'text-[#A78BFA] font-bold' : 'text-gray-400'}>
              {vpm >= 60000 ? 'MICRO-BUBBLE CAVITATION ACTIVE' : 'LOW FREQUENCY MODE'}
            </span>
          </div>
        </div>

        {/* Speed Slider & Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          {/* Slider */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-gray-500" />
                VIBRATION FREQUENCY TUNER
              </span>
              <span className="text-white font-bold bg-white/10 px-2.5 py-0.5 rounded-md">
                {vpm.toLocaleString()} VPM ({fundamentalHz} Hz)
              </span>
            </div>

            <input
              type="range"
              id="slider-vpm-tuner"
              min={30000}
              max={88000}
              step={1000}
              value={vpm}
              onChange={(e) => handleVpmChange(Number(e.target.value))}
              className="w-full h-2 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-[#7E3AF2]"
            />

            <div className="flex justify-between text-[11px] font-mono text-gray-500 px-1">
              <span>30,000 VPM (Sensitive)</span>
              <span>60,000 VPM (Cavitation Threshold)</span>
              <span className="text-[#A78BFA]">88,000 VPM (Peak Sonic)</span>
            </div>
          </div>

          {/* Quick Frequency Presets */}
          <div className="lg:col-span-4 flex flex-wrap lg:flex-nowrap gap-2">
            {[
              { label: 'Whisper 48K', val: 48000 },
              { label: 'Standard 72K', val: 72000 },
              { label: 'Dyson AI 84K', val: 84000 },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => {
                  triggerHaptic('medium');
                  handleVpmChange(preset.val);
                }}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono transition-all ${
                  vpm === preset.val
                    ? 'border-[#7E3AF2] bg-[#7E3AF2]/20 text-white shadow-[0_0_12px_rgba(126,58,242,0.3)]'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Engineering Metric Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
            <span className="text-gray-500 text-xs font-mono block mb-1">01 / DUAL-MAGNET ROTOR</span>
            <div className="text-lg font-bold text-white mb-1">Neodymium N52</div>
            <p className="text-xs text-gray-400 font-light">Zero magnetic torque loss with instantaneous dynamic load compensation.</p>
          </div>
          <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
            <span className="text-gray-500 text-xs font-mono block mb-1">02 / SOUND PRESSURE LEVEL</span>
            <div className="text-lg font-bold text-[#A78BFA] mb-1">&lt; 52 dBA Whisper</div>
            <p className="text-xs text-gray-400 font-light">Silicone acoustic isolation mounts eliminate hand fatigue and resonance.</p>
          </div>
          <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
            <span className="text-gray-500 text-xs font-mono block mb-1">03 / SONIC AMPLITUDE</span>
            <div className="text-lg font-bold text-white mb-1">4.2mm Micro-Sweep</div>
            <p className="text-xs text-gray-400 font-light">Precisely sweeps interdental spaces without abrasive enamel wear.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
