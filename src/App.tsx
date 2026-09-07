/**
 * Dyson Oral Care AI Toothbrush Landing Page
 * Full scroll animation experience featuring interactive 3D models,
 * high-speed motor sound visualizations, sonic cavitation tech,
 * subtle haptic feedback, and real-time Bluetooth progress tracker.
 */

import React, { useState, useEffect } from 'react';
import { Colorway } from './types';
import { triggerHaptic } from './utils/haptics';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ModelExplodedSection } from './components/ModelExplodedSection';
import { MotorSoundVisualizer } from './components/MotorSoundVisualizer';
import { SonicTechSection } from './components/SonicTechSection';
import { BluetoothTracker } from './components/BluetoothTracker';
import { TechSpecsSection } from './components/TechSpecsSection';
import { Footer } from './components/Footer';
import { PreOrderModal } from './components/PreOrderModal';

export default function App() {
  const [selectedColorway, setSelectedColorway] = useState<Colorway>('obsidian-violet');
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);

  // Subtle haptic triggers on section entry during scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            triggerHaptic('section');
          }
        });
      },
      { threshold: [0.4] }
    );

    const sectionIds = [
      'hero',
      'section-3d-model',
      'section-motor-sound',
      'section-sonic-tech',
      'section-bluetooth-tracker',
      'section-specs',
    ];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleExploreClick = () => {
    triggerHaptic('section');
    const el = document.getElementById('section-3d-model');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-gray-100 overflow-x-hidden selection:bg-[#7E3AF2] selection:text-white font-sans">
      {/* Navigation */}
      <Navbar onPreOrderClick={() => setIsPreOrderOpen(true)} />

      {/* Main Sections */}
      <main className="flex flex-col w-full">
        {/* Hero Section */}
        <HeroSection
          colorway={selectedColorway}
          onColorChange={setSelectedColorway}
          onExploreClick={handleExploreClick}
          onPreOrderClick={() => setIsPreOrderOpen(true)}
        />

        {/* Section 2: Interactive 3D Disassembly & Inspection */}
        <ModelExplodedSection
          colorway={selectedColorway}
          onColorChange={setSelectedColorway}
        />

        {/* Section 3: High-Speed Motor Sound Visualization */}
        <MotorSoundVisualizer />

        {/* Section 4: Precision Sonic Cleaning & Fluid Dynamics */}
        <SonicTechSection />

        {/* Section 5: Real-time Progress Tracker Synced via Bluetooth */}
        <BluetoothTracker />

        {/* Section 6: Technical Specifications & In The Box */}
        <TechSpecsSection onPreOrderClick={() => setIsPreOrderOpen(true)} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Pre-Order Modal */}
      <PreOrderModal
        isOpen={isPreOrderOpen}
        onClose={() => setIsPreOrderOpen(false)}
        selectedColorway={selectedColorway}
        onSelectColorway={setSelectedColorway}
      />
    </div>
  );
}
