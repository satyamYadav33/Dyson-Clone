import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Colorway } from '../types';
import { COLORWAYS } from './Toothbrush3DCanvas';
import { triggerHaptic } from '../utils/haptics';
import { X, Check, Shield, Truck, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColorway: Colorway;
  onSelectColorway: (cw: Colorway) => void;
}

export const PreOrderModal: React.FC<PreOrderModalProps> = ({
  isOpen,
  onClose,
  selectedColorway,
  onSelectColorway,
}) => {
  const [tier, setTier] = useState<'standard' | 'care'>('standard');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    setIsSubmitted(true);
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7E3AF2', '#A78BFA', '#ffffff', '#C084FC'],
      });
    } catch {}
  };

  const scheme = COLORWAYS[selectedColorway];
  const price = tier === 'standard' ? 399 : 449;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7E3AF2]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Modal Title */}
            <div className="mb-6">
              <span className="text-xs font-mono text-[#A78BFA] uppercase tracking-wider block mb-1">
                Priority Allocation
              </span>
              <h3 className="text-2xl font-light text-white font-heading">
                Reserve Dyson SonicPulse™ AI
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-light">
                Be the first to receive the next generation of acoustic oral engineering.
              </p>
            </div>

            {/* Colorway Choice */}
            <div className="mb-5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-2">
                Select Finish: <span className="text-white font-medium">{scheme.name}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(COLORWAYS) as Colorway[]).map((cw) => {
                  const item = COLORWAYS[cw];
                  const isSelected = selectedColorway === cw;
                  return (
                    <button
                      key={cw}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        onSelectColorway(cw);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-[#7E3AF2] bg-[#7E3AF2]/10 ring-1 ring-[#7E3AF2]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center"
                        style={{ backgroundColor: item.bodyColor }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.accentColor }} />
                      </span>
                      <span className="text-[11px] font-medium text-gray-200">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Package Choice */}
            <div className="mb-6 space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">
                Package Tier
              </label>

              <div
                onClick={() => {
                  triggerHaptic('light');
                  setTier('standard');
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  tier === 'standard' ? 'border-[#7E3AF2] bg-[#7E3AF2]/15' : 'border-white/10 bg-white/5'
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-white">Standard AI Package</div>
                  <div className="text-xs text-gray-400 font-light">Includes handle, 2x heads, Qi2 dock, UV-C case</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-medium text-white font-mono">$399</div>
                </div>
              </div>

              <div
                onClick={() => {
                  triggerHaptic('light');
                  setTier('care');
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  tier === 'care' ? 'border-[#7E3AF2] bg-[#7E3AF2]/15' : 'border-white/10 bg-white/5'
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    <span>Dyson Care+ Bundle</span>
                    <span className="bg-[#7E3AF2] text-white text-[10px] font-mono px-2 py-0.5 rounded-full">POPULAR</span>
                  </div>
                  <div className="text-xs text-gray-400 font-light">Standard pack + 4x replacement heads + accidental cover</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-medium text-white font-mono">$449</div>
                </div>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1.5">
                  Email For Reservation Pass
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7E3AF2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-[#7E3AF2] hover:bg-[#6C2BD9] text-white transition-all shadow-[0_0_20px_rgba(126,58,242,0.5)] flex items-center justify-center gap-2"
              >
                <span>Complete Pre-Order Reservation (${price})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center text-[10px] font-mono text-gray-400">
              <span className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> 2-Yr Warranty
              </span>
              <span className="flex items-center justify-center gap-1">
                <Truck className="w-3 h-3 text-[#A78BFA]" /> Free Global Ship
              </span>
              <span className="flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3 text-[#7E3AF2]" /> 30-Day Return
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-light text-white mb-2 font-heading">Reservation Confirmed!</h3>
            <p className="text-xs text-gray-300 max-w-xs mb-6 font-light">
              Your priority reservation pass for the Dyson SonicPulse™ AI in <span className="text-[#A78BFA] font-medium">{scheme.name}</span> has been locked. Check your email for shipping updates.
            </p>
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsSubmitted(false);
                onClose();
              }}
              className="px-6 py-2.5 rounded-full bg-[#7E3AF2] text-white font-medium text-xs hover:bg-[#6C2BD9] transition-colors"
            >
              Return to Showcase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
