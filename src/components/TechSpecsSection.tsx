import React from 'react';
import { Cpu, Battery, Shield, Wifi, Waves, Award, Check, Sparkles, Box } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface TechSpecsSectionProps {
  onPreOrderClick: () => void;
}

export const TechSpecsSection: React.FC<TechSpecsSectionProps> = ({ onPreOrderClick }) => {
  return (
    <div id="section-specs" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#7E3AF2] uppercase mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Engineering Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white font-heading">
            Technical Specifications. <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Zero Compromise Craftsmanship.
            </span>
          </h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed font-light">
          Over 4,200 hours of acoustic testing and 120 precision prototypes developed in Malmesbury, UK.
        </p>
      </div>

      {/* Bento Grid Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Motor & Acoustics */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#7E3AF2]/15 border border-[#7E3AF2]/30 flex items-center justify-center text-[#A78BFA] mb-4">
              <Waves className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Digital Motor V-Pulse</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed font-light">
              Neodymium magnetic core delivering up to 84,000 vibrations per minute with dynamic torque stabilization.
            </p>
          </div>
          <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Velocity:</span>
              <span className="text-white font-medium">84,000 VPM</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Acoustic Damping:</span>
              <span className="text-[#A78BFA] font-medium">&lt; 52 dBA Whisper</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Drive Transmission:</span>
              <span className="text-white font-medium">Lossless Titanium</span>
            </div>
          </div>
        </div>

        {/* Card 2: AI Sensors & Bluetooth */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#7E3AF2]/15 border border-[#7E3AF2]/30 flex items-center justify-center text-[#A78BFA] mb-4">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Smart Connectivity & Sensors</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed font-light">
              6-axis IMU position sensor combined with optical strain gauge to monitor dental arch angle and contact pressure.
            </p>
          </div>
          <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Bluetooth:</span>
              <span className="text-white font-medium">BLE 5.4 Low Latency</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Pressure Polling:</span>
              <span className="text-[#A78BFA] font-medium">200 Checks / Sec</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Zone Mapping:</span>
              <span className="text-white font-medium">16 Discrete Zones</span>
            </div>
          </div>
        </div>

        {/* Card 3: Battery & Charging */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Battery className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Power & Endurance</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed font-light">
              High-density lithium cell engineered for two full months of twice-daily 2-minute sessions on a single charge.
            </p>
          </div>
          <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Battery Runtime:</span>
              <span className="text-emerald-400 font-medium">60 Days Typical</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Charging Standard:</span>
              <span className="text-white font-medium">Qi2 Magnetic Induction</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Fast Charge:</span>
              <span className="text-white font-medium">10 Mins = 7 Days</span>
            </div>
          </div>
        </div>

        {/* Card 4: Materials & Ergonomics */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Build & Durability</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed font-light">
              6000-series anodized aluminum unibody with IPX8 waterproof rating and antimicrobial silicone grip.
            </p>
          </div>
          <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Waterproof Rating:</span>
              <span className="text-white font-medium">IPX8 (2m submersible)</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Total Weight:</span>
              <span className="text-white font-medium">118g (Balanced)</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Drop Resistance:</span>
              <span className="text-amber-400 font-medium">1.5m Impact Rated</span>
            </div>
          </div>
        </div>

        {/* Card 5: In The Box Showcase */}
        <div className="md:col-span-2 lg:col-span-2 bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">In The Box</h3>
                  <span className="text-xs text-gray-400 font-light">Dyson Oral Care AI Complete Kit</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#A78BFA] bg-[#7E3AF2]/15 px-3 py-1 rounded-full border border-[#7E3AF2]/30">
                PREMIUM PACKAGE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              {[
                'Dyson SonicPulse™ AI Intelligent Handle',
                '2x Precision Micro-Tuft Replacement Heads',
                'Qi2 Magnetic Fast-Charging Induction Pod',
                'UV-C Sanitizing Traveling Charging Case',
                '1.5m Braided USB-C Power Cable',
                '2-Year Dyson International Warranty',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300 bg-white/5 p-2.5 rounded-xl border border-white/5 font-light">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-gray-400">
              MSRP <span className="text-white font-medium text-base">$399 USD</span> &bull; Free Global Express Delivery
            </div>
            <button
              onClick={() => {
                triggerHaptic('heavy');
                onPreOrderClick();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest bg-[#7E3AF2] hover:bg-[#6C2BD9] text-white transition-all shadow-[0_0_15px_rgba(126,58,242,0.4)]"
            >
              Configure & Pre-Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
