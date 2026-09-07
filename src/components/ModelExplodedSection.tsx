import React, { useState } from 'react';
import { Colorway } from '../types';
import { Toothbrush3DCanvas } from './Toothbrush3DCanvas';
import { triggerHaptic } from '../utils/haptics';
import { Layers, ShieldCheck, Cpu, Battery, Wrench, Sparkles, Sliders } from 'lucide-react';

interface ModelExplodedSectionProps {
  colorway: Colorway;
  onColorChange: (cw: Colorway) => void;
}

const ARCHITECTURE_STEPS = [
  {
    id: 'bristles',
    title: '01. Multi-Tier Micro-Filament Head',
    subtitle: '1,800 dual-length PBT bristles',
    description: 'Tapered to 0.02mm to sweep subgingival pocket depths without puncturing delicate gingiva. Embedded RFID chip tracks wear in real-time.',
    icon: Sparkles,
  },
  {
    id: 'shaft',
    title: '02. Titanium Acoustic Waveguide',
    subtitle: 'Grade 5 Aerospace Titanium',
    description: 'Lossless acoustic transmission directly conveys 84,000 VPM oscillation from motor to bristles with 0.003% damping.',
    icon: Wrench,
  },
  {
    id: 'motor',
    title: '03. Digital Motor V-Pulse Core',
    subtitle: 'High-speed acoustic resonance',
    description: 'Custom stator with neodymium N52 magnets generates dynamic frequency sweeps between 500 Hz and 1,466 Hz, creating hydrodynamic micro-bubble cavitation.',
    icon: Cpu,
  },
  {
    id: 'pcb',
    title: '04. AI Sensor Core & 6-Axis IMU',
    subtitle: '100Hz Spatial Mapping Engine',
    description: 'Tracks dental arch angles in 3D space, monitoring pressure at 200 checks/sec to automatically throttle motor force when user presses too firmly.',
    icon: ShieldCheck,
  },
  {
    id: 'battery',
    title: '05. High-Density Lithium-Ion Cell',
    subtitle: '60-Day Single Charge Endurance',
    description: 'Ultra-compact cylindrical energy cell backed by intelligent power management and magnetic induction fast-charging.',
    icon: Battery,
  },
];

export const ModelExplodedSection: React.FC<ModelExplodedSectionProps> = ({ colorway, onColorChange }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleStepClick = (index: number) => {
    triggerHaptic('light');
    setActiveStep(index);
  };

  return (
    <div id="section-3d-model" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#7E3AF2] uppercase mb-2">
            <Layers className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Precision Tech &bull; Mechanical Disassembly</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white font-heading">
            Exploded Engineering. <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Interactive 3D Inspection.
            </span>
          </h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed font-light">
          Rotate in 360°, inspect individual components, or disassemble the chassis to examine the precision acoustic drive mechanism.
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Violet Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#7E3AF2]/5 blur-3xl rounded-full pointer-events-none" />

        {/* Left: 3D Interactive Canvas */}
        <div className="lg:col-span-7 h-[500px] sm:h-[600px] relative rounded-2xl overflow-hidden bg-[#121212] border border-white/5">
          <Toothbrush3DCanvas
            colorway={colorway}
            onColorChange={onColorChange}
            explodedProgress={1}
            className="w-full h-full"
          />
        </div>

        {/* Right: Interactive Architectural Callouts */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1 flex items-center justify-between">
            <span>Mechanical Subsystems</span>
            <span className="text-[#A78BFA] font-mono">5 KEY PATENTS</span>
          </div>

          <div className="space-y-3">
            {ARCHITECTURE_STEPS.map((step, idx) => {
              const isSelected = activeStep === idx;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  onClick={() => handleStepClick(idx)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-[#7E3AF2] bg-[#7E3AF2]/10 shadow-[0_0_20px_rgba(126,58,242,0.2)] ring-1 ring-[#7E3AF2]/40'
                      : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#7E3AF2] text-white' : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{step.title}</div>
                      <div className="text-[11px] font-mono text-[#A78BFA]">{step.subtitle}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 pl-10 leading-relaxed font-light">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Tip Pill */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
            <span className="font-light">Tip: Drag 3D model with mouse/touch to inspect internal motor coils in 360°.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
