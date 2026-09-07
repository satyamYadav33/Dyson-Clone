import React, { useState } from 'react';
import { Colorway } from '../types';
import { Toothbrush3DCanvas, COLORWAYS } from './Toothbrush3DCanvas';
import { triggerHaptic } from '../utils/haptics';
import { motorSound } from '../utils/audioEngine';
import { ChevronDown, Play, Sparkles, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  colorway: Colorway;
  onColorChange: (cw: Colorway) => void;
  onExploreClick: () => void;
  onPreOrderClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  colorway,
  onColorChange,
  onExploreClick,
  onPreOrderClick,
}) => {
  const [isVibrating, setIsVibrating] = useState(false);

  const handleTestSonic = () => {
    triggerHaptic('heavy');
    const newState = !isVibrating;
    setIsVibrating(newState);
    if (newState) {
      motorSound.start();
    } else {
      motorSound.stop();
    }
  };

  return (
    <section id="hero" className="relative min-h-screen pt-24 sm:pt-28 pb-16 flex flex-col justify-between overflow-hidden">
      {/* Elegant Dark Subtle Radial Glow & Grid Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[600px] bg-[radial-gradient(circle_at_50%_50%,rgba(126,58,242,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 dyson-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Dyson Engineering Narrative */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Supertitle badge */}
            <div className="space-y-1 mb-4">
              <span className="text-[#7E3AF2] text-xs sm:text-sm font-semibold uppercase tracking-widest block">
                Core Innovation
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
                <span>Hyperdymium™ Sonic &bull; Series 01</span>
              </div>
            </div>

            {/* Main Headline matching Elegant Dark template */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.08] mb-6 font-heading">
              AI Sonic <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                Precision.
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed mb-8 font-light">
              Experience the future of oral care. 84,000 VPM high-velocity digital motor tuned by AI to your unique dental architecture, creating acoustic micro-bubble fluid drive that cleans where bristles cannot reach.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
              <button
                id="hero-test-sonic-btn"
                onClick={handleTestSonic}
                className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl ${
                  isVibrating
                    ? 'bg-[#7E3AF2] text-white shadow-[0_0_25px_rgba(126,58,242,0.5)] animate-pulse'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${isVibrating ? 'fill-white' : 'fill-black'}`} />
                <span>{isVibrating ? 'Sonic Motor Active' : 'Test Motor Dynamics'}</span>
              </button>

              <button
                id="hero-preorder-btn"
                onClick={onPreOrderClick}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest bg-transparent hover:bg-white/10 text-white border border-white/20 backdrop-blur transition-all"
              >
                <span>Pre-Order ($399)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Core Metrics matching Elegant Dark template */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/10 w-full">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-2xl font-medium text-white mb-1">84k</div>
                <div className="text-[10px] uppercase text-gray-500 tracking-wider">Motor VPM</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-2xl font-medium text-[#A78BFA] mb-1">99.9%</div>
                <div className="text-[10px] uppercase text-gray-500 tracking-wider">Efficiency</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-2xl font-medium text-white mb-1">16</div>
                <div className="text-[10px] uppercase text-gray-500 tracking-wider">Dental Zones</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Interactive 3D Model Stage */}
          <div className="lg:col-span-6 relative w-full aspect-square max-h-[580px] flex items-center justify-center">
            {/* Halo Backdrop matching Elegant Dark rounded stage */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2A2A2A]/40 via-[#1A1A1A]/70 to-[#2A2A2A]/40 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden">
              <Toothbrush3DCanvas
                colorway={colorway}
                onColorChange={onColorChange}
                isVibrating={isVibrating}
                className="w-full h-full"
              />
            </div>

            {/* Floating Sonic Frequency Badge matching Elegant Dark design */}
            <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-3 bg-black/50 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 pointer-events-none">
              <div className="text-left">
                <div className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Sonic Frequency</div>
                <div className="text-base font-mono font-medium text-[#A78BFA]">44.1 kHz</div>
              </div>
              <div className="flex gap-1 h-6 items-end">
                <div className="w-1 h-3 bg-[#7E3AF2]/40 rounded-full animate-pulse" />
                <div className="w-1 h-6 bg-[#7E3AF2] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-4 bg-[#7E3AF2]/70 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <div className="w-1 h-2 bg-[#7E3AF2]/40 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="w-full flex flex-col items-center justify-center pt-8 cursor-pointer relative z-10" onClick={onExploreClick}>
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-gray-500 mb-1 flex items-center gap-1.5">
          <span>Explore Tech</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500 animate-bounce" />
      </div>
    </section>
  );
};
