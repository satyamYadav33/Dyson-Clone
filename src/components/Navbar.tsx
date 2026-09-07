import React, { useState } from 'react';
import { Volume2, VolumeX, Vibrate, Bluetooth, Menu, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { triggerHaptic, getHapticsEnabled, setHapticsEnabled } from '../utils/haptics';
import { motorSound } from '../utils/audioEngine';

interface NavbarProps {
  onPreOrderClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onPreOrderClick }) => {
  const [isAudioActive, setIsAudioActive] = useState(motorSound.getIsRunning());
  const [isHapticsOn, setIsHapticsOn] = useState(getHapticsEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    triggerHaptic('light');
    const newState = motorSound.toggle();
    setIsAudioActive(newState);
  };

  const toggleHaptics = () => {
    const next = !isHapticsOn;
    setIsHapticsOn(next);
    setHapticsEnabled(next);
    if (next) {
      triggerHaptic('medium');
    }
  };

  const scrollToSection = (id: string) => {
    triggerHaptic('section');
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Dyson Brandmark matching Elegant Dark theme */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection('hero')}>
          <div className="flex items-center gap-1.5 font-bold tracking-tighter text-white text-xl sm:text-2xl">
            <span className="font-heading lowercase">dyson</span>
            <span className="font-light text-gray-500 text-lg">| sonic</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-gray-400">
          <button
            onClick={() => scrollToSection('section-3d-model')}
            className="hover:text-white transition-colors"
          >
            Precision Tech
          </button>
          <button
            onClick={() => scrollToSection('section-motor-sound')}
            className="hover:text-white transition-colors"
          >
            Motor Dynamics
          </button>
          <button
            onClick={() => scrollToSection('section-sonic-tech')}
            className="hover:text-white transition-colors"
          >
            Acoustics
          </button>
          <button
            onClick={() => scrollToSection('section-bluetooth-tracker')}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Live Sync</span>
          </button>
          <button
            onClick={() => scrollToSection('section-specs')}
            className="hover:text-white transition-colors"
          >
            Specs
          </button>

          {/* BT Status Badge from Elegant Dark design */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7E3AF2]/10 border border-[#7E3AF2]/30 rounded-full text-[#A78BFA] text-[11px] font-mono tracking-wider">
            <div className="w-1.5 h-1.5 bg-[#A78BFA] rounded-full animate-pulse" />
            <span>BT CONNECTED</span>
          </div>
        </nav>

        {/* Controls and Pre-Order Action */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Audio Synthesizer Toggle */}
          <button
            id="nav-audio-toggle"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              isAudioActive
                ? 'bg-[#7E3AF2]/20 border-[#7E3AF2]/50 text-[#A78BFA] shadow-[0_0_12px_rgba(126,58,242,0.35)]'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title={isAudioActive ? 'Mute Motor Acoustics' : 'Enable Digital Motor Acoustics'}
          >
            {isAudioActive ? <Volume2 className="w-4 h-4 animate-pulse text-[#A78BFA]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptics Toggle */}
          <button
            id="nav-haptics-toggle"
            onClick={toggleHaptics}
            className={`p-2 rounded-xl border transition-all ${
              isHapticsOn
                ? 'bg-[#7E3AF2]/20 border-[#7E3AF2]/40 text-[#A78BFA] shadow-[0_0_12px_rgba(126,58,242,0.3)]'
                : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
            }`}
            title={isHapticsOn ? 'Subtle Haptics Enabled' : 'Haptics Disabled'}
          >
            <Vibrate className="w-4 h-4" />
          </button>

          {/* Pre-Order CTA */}
          <button
            id="nav-preorder-cta"
            onClick={() => {
              triggerHaptic('medium');
              onPreOrderClick();
            }}
            className="hidden sm:flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-[11px] transition-all shadow-md active:scale-95"
          >
            <span>Pre-Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            id="nav-mobile-menu"
            onClick={() => {
              triggerHaptic('light');
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 md:hidden rounded-xl bg-white/5 border border-white/10 text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-b border-white/10 px-6 py-6 flex flex-col gap-4 text-xs uppercase tracking-widest">
          <button
            onClick={() => scrollToSection('section-3d-model')}
            className="text-left py-2 text-gray-300 hover:text-white border-b border-white/5"
          >
            Precision Tech
          </button>
          <button
            onClick={() => scrollToSection('section-motor-sound')}
            className="text-left py-2 text-gray-300 hover:text-white border-b border-white/5"
          >
            Motor Dynamics
          </button>
          <button
            onClick={() => scrollToSection('section-sonic-tech')}
            className="text-left py-2 text-gray-300 hover:text-white border-b border-white/5"
          >
            Acoustics
          </button>
          <button
            onClick={() => scrollToSection('section-bluetooth-tracker')}
            className="text-left py-2 text-gray-300 hover:text-white border-b border-white/5 flex items-center justify-between"
          >
            <span>Live Sync Tracker</span>
            <span className="text-[#A78BFA] text-[10px] font-mono">CONNECTED</span>
          </button>
          <button
            onClick={() => scrollToSection('section-specs')}
            className="text-left py-2 text-gray-300 hover:text-white border-b border-white/5"
          >
            Technical Specifications
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onPreOrderClick();
            }}
            className="mt-2 w-full py-3 bg-[#7E3AF2] hover:bg-[#6C2BD9] text-white rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-xs shadow-[0_0_20px_rgba(126,58,242,0.4)]"
          >
            <span>Pre-Order ($399)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
