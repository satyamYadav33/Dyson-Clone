import React from 'react';
import { triggerHaptic } from '../utils/haptics';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A] py-16 text-gray-400 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          {/* Left Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-light text-white text-2xl tracking-tighter mb-2 font-heading">
              <span className="lowercase">dyson</span>
              <span className="w-2 h-2 rounded-full bg-[#7E3AF2]" />
            </div>
            <p className="text-gray-400 text-xs leading-relaxed font-sans font-light">
              Re-engineering daily rituals through fluid dynamics, acoustic optimization, and onboard artificial intelligence.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <div className="text-white font-medium mb-3 uppercase tracking-wider text-[11px]">Oral Care AI</div>
              <ul className="space-y-2 text-xs font-light">
                <li><a href="#section-3d-model" className="hover:text-white transition-colors">3D Disassembly</a></li>
                <li><a href="#section-motor-sound" className="hover:text-white transition-colors">Acoustic Motor</a></li>
                <li><a href="#section-sonic-tech" className="hover:text-white transition-colors">Sonic Cavitation</a></li>
                <li><a href="#section-bluetooth-tracker" className="hover:text-white transition-colors">Bluetooth App</a></li>
              </ul>
            </div>

            <div>
              <div className="text-white font-medium mb-3 uppercase tracking-wider text-[11px]">Engineering</div>
              <ul className="space-y-2 text-xs font-light">
                <li><span className="hover:text-white transition-colors">Malmesbury Labs</span></li>
                <li><span className="hover:text-white transition-colors">Acoustic Baffles</span></li>
                <li><span className="hover:text-white transition-colors">Qi2 Induction Dock</span></li>
                <li><span className="hover:text-white transition-colors">Firmware v2.4</span></li>
              </ul>
            </div>

            <div>
              <div className="text-white font-medium mb-3 uppercase tracking-wider text-[11px]">Sustainability</div>
              <ul className="space-y-2 text-xs font-light">
                <li><span className="text-emerald-400">100% Recycled Al</span></li>
                <li><span className="text-emerald-400">Zero Plastic Pack</span></li>
                <li><span>IPX8 Serviceable</span></li>
                <li><span>2-Year Guarantee</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 font-light">
          <div>
            &copy; {new Date().getFullYear()} Dyson Technology Limited. Dyson SonicPulse™ and Dyson V-Pulse™ are trademarks of Dyson.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Sale</span>
            <span>Safety & Compliance</span>
            <span className="text-[#A78BFA]">Precision Crafted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
