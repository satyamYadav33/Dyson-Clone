import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Colorway, ColorScheme } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { RotateCw, Layers, Eye, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

export const COLORWAYS: Record<Colorway, ColorScheme> = {
  'obsidian-violet': {
    id: 'obsidian-violet',
    name: 'Obsidian & Violet',
    bodyColor: '#121212',
    accentColor: '#7E3AF2',
    gripColor: '#1a1a1a',
    bristleColor: '#a78bfa',
    description: 'Deep matte obsidian ceramic chassis with royal electric violet anodized accents.',
  },
  'iron-fuchsia': {
    id: 'iron-fuchsia',
    name: 'Iron & Fuchsia',
    bodyColor: '#2b2d35',
    accentColor: '#ff1e82',
    gripColor: '#1c1e24',
    bristleColor: '#ff1e82',
    description: 'Iconic Dyson industrial iron with signature precision fuchsia anodized accents.',
  },
  'prussian-copper': {
    id: 'prussian-copper',
    name: 'Prussian Blue & Copper',
    bodyColor: '#0e2338',
    accentColor: '#c87a51',
    gripColor: '#071524',
    bristleColor: '#e09875',
    description: 'Deep matte prussian blue chassis complemented by rich satin electroplated copper.',
  },
  'ceramic-mandarin': {
    id: 'ceramic-mandarin',
    name: 'Ceramic White & Mandarin',
    bodyColor: '#e4e7eb',
    accentColor: '#ff6200',
    gripColor: '#cdd3da',
    bristleColor: '#00d4ff',
    description: 'Ultra-smooth ceramic touch coating with high-contrast vibrant mandarin accents.',
  },
};

interface Toothbrush3DCanvasProps {
  colorway: Colorway;
  onColorChange: (color: Colorway) => void;
  isVibrating?: boolean;
  explodedProgress?: number; // 0 (assembled) to 1 (fully exploded)
  className?: string;
  interactive?: boolean;
}

export const Toothbrush3DCanvas: React.FC<Toothbrush3DCanvasProps> = ({
  colorway,
  onColorChange,
  isVibrating = false,
  explodedProgress: initialExploded = 0,
  className = '',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState(initialExploded > 0.5);
  const [isXray, setIsXray] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  // References to 3D parts to animate
  const partsRef = useRef<{
    root: THREE.Group;
    body: THREE.Mesh;
    grip: THREE.Mesh;
    ledRing: THREE.Mesh;
    button: THREE.Mesh;
    neck: THREE.Mesh;
    head: THREE.Group;
    shaft: THREE.Mesh;
    motor: THREE.Group;
    battery: THREE.Mesh;
    pcb: THREE.Mesh;
    chargerBase: THREE.Group;
    bristles: THREE.Group;
    sonicWaves: THREE.Points;
  } | null>(null);

  const materialsRef = useRef<{
    bodyMat: THREE.MeshStandardMaterial;
    accentMat: THREE.MeshStandardMaterial;
    gripMat: THREE.MeshStandardMaterial;
    shaftMat: THREE.MeshStandardMaterial;
    headMat: THREE.MeshStandardMaterial;
    ledRingMat: THREE.MeshStandardMaterial;
    bristleMat: THREE.MeshStandardMaterial;
    motorCopperMat: THREE.MeshStandardMaterial;
    internalMat: THREE.MeshStandardMaterial;
    pcbMat: THREE.MeshStandardMaterial;
  } | null>(null);

  const sceneState = useRef({
    explodedFactor: 0,
    targetExplodedFactor: 0,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
    rotationX: 0.15,
    rotationY: 0.4,
    vibrationPhase: 0,
  });

  // Sync initial exploded prop
  useEffect(() => {
    sceneState.current.targetExplodedFactor = exploded ? 1 : 0;
  }, [exploded]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 600;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.2);

    // Renderer setup with antialias and tone mapping for Dyson photographic metallic finish
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Lighting - Elegant Dark palette
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7e3af2, 2.0);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xa78bfa, 0.9);
    fillLight.position.set(0, -5, 4);
    scene.add(fillLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Initial Material Palette based on default colorway
    const scheme = COLORWAYS[colorway];

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(scheme.bodyColor),
      metalness: 0.4,
      roughness: 0.28,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(scheme.accentColor),
      metalness: 0.85,
      roughness: 0.18,
      emissive: new THREE.Color(scheme.accentColor),
      emissiveIntensity: 0.15,
    });

    const gripMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(scheme.gripColor),
      metalness: 0.1,
      roughness: 0.75,
    });

    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xe6e9ec,
      metalness: 0.95,
      roughness: 0.12,
    });

    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(scheme.bodyColor),
      metalness: 0.3,
      roughness: 0.35,
    });

    const ledRingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(scheme.accentColor),
      emissive: new THREE.Color(scheme.accentColor),
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });

    const bristleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(scheme.bristleColor),
      roughness: 0.4,
      metalness: 0.2,
      transparent: true,
      opacity: 0.92,
    });

    const motorCopperMat = new THREE.MeshStandardMaterial({
      color: 0xc86432,
      metalness: 0.8,
      roughness: 0.25,
    });

    const internalMat = new THREE.MeshStandardMaterial({
      color: 0x333742,
      metalness: 0.7,
      roughness: 0.3,
    });

    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x0e3820,
      metalness: 0.3,
      roughness: 0.5,
    });

    materialsRef.current = {
      bodyMat,
      accentMat,
      gripMat,
      shaftMat,
      headMat,
      ledRingMat,
      bristleMat,
      motorCopperMat,
      internalMat,
      pcbMat,
    };

    // ==========================================
    // 1. Toothbrush Main Body (Handle)
    // ==========================================
    const bodyGeometry = new THREE.CylinderGeometry(0.38, 0.34, 3.2, 48);
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMat);
    bodyMesh.position.y = -0.6;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    rootGroup.add(bodyMesh);

    // Ergonomic rear grip grooves
    const gripGeo = new THREE.CylinderGeometry(0.384, 0.344, 2.2, 48, 1, false, 0, Math.PI * 0.8);
    const gripMesh = new THREE.Mesh(gripGeo, gripMat);
    gripMesh.position.set(0, -0.6, 0);
    gripMesh.rotation.y = Math.PI * 0.6;
    rootGroup.add(gripMesh);

    // Dyson Smart LED Ring at Handle Collar
    const ringGeo = new THREE.TorusGeometry(0.382, 0.024, 24, 48);
    const ringMesh = new THREE.Mesh(ringGeo, ledRingMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 1.0;
    rootGroup.add(ringMesh);

    // Tactile Dyson Power / Mode Button with micro status dot
    const btnGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32);
    const btnMesh = new THREE.Mesh(btnGeo, accentMat);
    btnMesh.rotation.x = Math.PI / 2;
    btnMesh.position.set(0, 0.1, 0.36);
    rootGroup.add(btnMesh);

    // ==========================================
    // 2. Titanium Acoustic Drive Shaft
    // ==========================================
    const shaftGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.9, 32);
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.position.y = 1.45;
    rootGroup.add(shaftMesh);

    // Neck bevel collar
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.36, 0.3, 32);
    const neckMesh = new THREE.Mesh(neckGeo, accentMat);
    neckMesh.position.y = 1.15;
    rootGroup.add(neckMesh);

    // ==========================================
    // 3. Precision Brush Head & Multi-Tuft Bristles
    // ==========================================
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.4;

    // Head base stem
    const headBaseGeo = new THREE.CylinderGeometry(0.14, 0.18, 1.2, 32);
    const headBaseMesh = new THREE.Mesh(headBaseGeo, headMat);
    headBaseMesh.position.y = -0.3;
    headGroup.add(headBaseMesh);

    // Head bristle backing plate (elliptical aerodynamic pod)
    const backingGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.9, 32);
    backingGeo.scale(1.2, 1.0, 0.65);
    const backingMesh = new THREE.Mesh(backingGeo, headMat);
    backingMesh.position.set(0, 0.55, 0.05);
    headGroup.add(backingMesh);

    // Bristle array (detailed multi-tier tuft modeling)
    const bristlesGroup = new THREE.Group();
    const bristleTuftGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.38, 12);

    const tuftRows = 6;
    const tuftCols = 3;
    for (let r = 0; r < tuftRows; r++) {
      for (let c = 0; c < tuftCols; c++) {
        const x = (c - 1) * 0.12;
        const y = 0.32 + r * 0.09;
        const z = 0.22;
        const isOuter = c === 0 || c === 2 || r === 0 || r === tuftRows - 1;
        const tuft = new THREE.Mesh(bristleTuftGeo, isOuter ? bristleMat : accentMat);
        tuft.position.set(x, y, z);
        tuft.rotation.x = Math.PI / 2 + (isOuter ? 0.05 * (r - 2.5) : 0);
        bristlesGroup.add(tuft);
      }
    }
    headGroup.add(bristlesGroup);
    rootGroup.add(headGroup);

    // ==========================================
    // 4. Internal Components (Revealed on Explode)
    // ==========================================
    // Dyson Digital V-Pulse Motor Core
    const motorGroup = new THREE.Group();
    motorGroup.position.set(0, 0.2, 0);

    const motorCasingGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.9, 32);
    const motorCasing = new THREE.Mesh(motorCasingGeo, internalMat);
    motorGroup.add(motorCasing);

    // Copper winding rings
    for (let i = -2; i <= 2; i++) {
      const coilGeo = new THREE.TorusGeometry(0.285, 0.035, 16, 32);
      const coil = new THREE.Mesh(coilGeo, motorCopperMat);
      coil.rotation.x = Math.PI / 2;
      coil.position.y = i * 0.15;
      motorGroup.add(coil);
    }
    motorGroup.visible = false;
    rootGroup.add(motorGroup);

    // High-Density Lithium-ion Battery Cell
    const battGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.2, 32);
    const battMesh = new THREE.Mesh(battGeo, internalMat);
    battMesh.position.set(0, -0.9, 0);
    battMesh.visible = false;
    rootGroup.add(battMesh);

    // Smart Gyroscope & AI Pressure PCB
    const pcbGeo = new THREE.BoxGeometry(0.12, 1.8, 0.03);
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.set(0, -0.4, 0.22);
    pcbMesh.visible = false;
    rootGroup.add(pcbMesh);

    // ==========================================
    // 5. Magnetic Induction Charging Pod
    // ==========================================
    const chargerGroup = new THREE.Group();
    chargerGroup.position.set(0, -2.4, 0);

    const chargerPuckGeo = new THREE.CylinderGeometry(0.9, 0.98, 0.18, 48);
    const chargerPuck = new THREE.Mesh(chargerPuckGeo, bodyMat);
    chargerGroup.add(chargerPuck);

    const chargerRingGeo = new THREE.TorusGeometry(0.85, 0.02, 16, 48);
    const chargerGlow = new THREE.Mesh(chargerRingGeo, ledRingMat);
    chargerGlow.rotation.x = Math.PI / 2;
    chargerGlow.position.y = 0.08;
    chargerGroup.add(chargerGlow);
    rootGroup.add(chargerGroup);

    // ==========================================
    // 6. Sonic Vibration Micro-Acoustic Wave Particles
    // ==========================================
    const waveParticleCount = 80;
    const waveGeo = new THREE.BufferGeometry();
    const wavePositions = new Float32Array(waveParticleCount * 3);
    for (let i = 0; i < waveParticleCount; i++) {
      const angle = (i / waveParticleCount) * Math.PI * 2;
      const radius = 0.25 + Math.random() * 0.45;
      wavePositions[i * 3] = Math.cos(angle) * radius;
      wavePositions[i * 3 + 1] = 2.8 + (Math.random() - 0.5) * 0.6;
      wavePositions[i * 3 + 2] = 0.3 + Math.sin(angle) * radius;
    }
    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    const waveMat = new THREE.PointsMaterial({
      color: new THREE.Color(scheme.accentColor),
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const sonicWaves = new THREE.Points(waveGeo, waveMat);
    sonicWaves.visible = isVibrating;
    rootGroup.add(sonicWaves);

    // Save parts for animation loop
    partsRef.current = {
      root: rootGroup,
      body: bodyMesh,
      grip: gripMesh,
      ledRing: ringMesh,
      button: btnMesh,
      neck: neckMesh,
      head: headGroup,
      shaft: shaftMesh,
      motor: motorGroup,
      battery: battMesh,
      pcb: pcbMesh,
      chargerBase: chargerGroup,
      bristles: bristlesGroup,
      sonicWaves,
    };

    // Responsive window resizing
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Mouse / Touch Drag Rotation Handling
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      sceneState.current.isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      sceneState.current.prevPointerX = clientX;
      sceneState.current.prevPointerY = clientY;
      setAutoRotate(false);
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!sceneState.current.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - sceneState.current.prevPointerX;
      const deltaY = clientY - sceneState.current.prevPointerY;

      sceneState.current.rotationY += deltaX * 0.008;
      sceneState.current.rotationX += deltaY * 0.006;
      sceneState.current.rotationX = Math.max(-0.6, Math.min(0.6, sceneState.current.rotationX));

      sceneState.current.prevPointerX = clientX;
      sceneState.current.prevPointerY = clientY;
    };

    const onPointerUp = () => {
      sceneState.current.isDragging = false;
    };

    if (interactive) {
      container.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      container.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);
    }

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth interpolation for exploded factor
      sceneState.current.explodedFactor += (sceneState.current.targetExplodedFactor - sceneState.current.explodedFactor) * 0.08;
      const exp = sceneState.current.explodedFactor;

      // Auto-rotation when not dragging
      if (autoRotate && !sceneState.current.isDragging) {
        sceneState.current.rotationY += delta * 0.45;
      }

      // Root rotation
      rootGroup.rotation.y = sceneState.current.rotationY;
      rootGroup.rotation.x = sceneState.current.rotationX;

      // Exploded View Offsets
      if (partsRef.current) {
        const { head, shaft, neck, body, grip, motor, battery, pcb, chargerBase, sonicWaves } = partsRef.current;

        // Head and shaft push upwards
        head.position.y = 2.4 + exp * 1.8;
        shaft.position.y = 1.45 + exp * 1.1;
        neck.position.y = 1.15 + exp * 0.6;

        // Outer chassis slides down slightly or splits
        body.position.y = -0.6 - exp * 0.7;
        grip.position.y = -0.6 - exp * 0.7;
        chargerBase.position.y = -2.4 - exp * 0.8;

        // Internal parts visibility and separation
        const showInternals = exp > 0.05;
        motor.visible = showInternals;
        battery.visible = showInternals;
        pcb.visible = showInternals;

        if (showInternals) {
          motor.position.y = 0.3 + exp * 0.2;
          battery.position.y = -0.9 - exp * 0.2;
          pcb.position.z = 0.22 + exp * 0.5;
        }

        // High-frequency Sonic Vibration Simulation
        if (isVibrating) {
          sceneState.current.vibrationPhase += delta * 70;
          const jitterX = Math.sin(sceneState.current.vibrationPhase) * 0.012;
          const jitterZ = Math.cos(sceneState.current.vibrationPhase * 1.3) * 0.008;
          head.position.x = jitterX;
          head.position.z = jitterZ;
          sonicWaves.visible = true;
          sonicWaves.rotation.y += delta * 2;
        } else {
          head.position.x = 0;
          head.position.z = 0;
          sonicWaves.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (interactive) {
        container.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        container.removeEventListener('touchstart', onPointerDown);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
      }
      renderer.dispose();
    };
  }, [interactive]);

  // Update Materials when colorway or xray changes
  useEffect(() => {
    if (!materialsRef.current) return;
    const scheme = COLORWAYS[colorway];
    const { bodyMat, accentMat, gripMat, headMat, ledRingMat, bristleMat } = materialsRef.current;

    bodyMat.color.set(scheme.bodyColor);
    bodyMat.wireframe = isXray;

    accentMat.color.set(scheme.accentColor);
    accentMat.emissive.set(scheme.accentColor);
    accentMat.wireframe = isXray;

    gripMat.color.set(scheme.gripColor);
    gripMat.wireframe = isXray;

    headMat.color.set(scheme.bodyColor);
    headMat.wireframe = isXray;

    ledRingMat.color.set(scheme.accentColor);
    ledRingMat.emissive.set(scheme.accentColor);

    bristleMat.color.set(scheme.bristleColor);

    if (partsRef.current) {
      partsRef.current.sonicWaves.material = new THREE.PointsMaterial({
        color: new THREE.Color(scheme.accentColor),
        size: 0.05,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });
    }
  }, [colorway, isXray]);

  const toggleExploded = () => {
    triggerHaptic('medium');
    setExploded(!exploded);
  };

  const toggleXray = () => {
    triggerHaptic('light');
    setIsXray(!isXray);
  };

  const toggleAutoRotate = () => {
    triggerHaptic('light');
    setAutoRotate(!autoRotate);
  };

  const handleSelectColor = (cw: Colorway) => {
    triggerHaptic('medium');
    onColorChange(cw);
  };

  return (
    <div className={`relative w-full h-full select-none flex flex-col items-center justify-center ${className}`}>
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none min-h-[440px] md:min-h-[560px]"
        title="Click and drag to rotate the Dyson AI Toothbrush 360°"
      />

      {/* Interactive 3D Control Pill */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-[#121212]/90 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-xl text-xs">
        <button
          id="btn-3d-explode"
          onClick={toggleExploded}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
            exploded
              ? 'bg-[#7E3AF2] text-white shadow-[0_0_15px_rgba(126,58,242,0.45)]'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Exploded Mechanical Assembly"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{exploded ? 'Assembled' : 'Disassemble'}</span>
        </button>

        <button
          id="btn-3d-xray"
          onClick={toggleXray}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
            isXray
              ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Acoustic Baffle X-Ray Wireframe"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>X-Ray</span>
        </button>

        <button
          id="btn-3d-autorotate"
          onClick={toggleAutoRotate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
            autoRotate
              ? 'bg-white/20 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle 360° Auto-Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>Rotate</span>
        </button>
      </div>

      {/* Exploded Callout Annotations Overlay when disassembled */}
      {exploded && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 font-mono text-[11px] text-gray-400">
          <div className="flex justify-between items-start">
            <div className="bg-[#1A1A1A]/90 backdrop-blur-md border border-[#7E3AF2]/40 px-3.5 py-2 rounded-xl text-gray-200 max-w-[210px] shadow-lg">
              <span className="text-[#A78BFA] font-semibold block mb-0.5">01. Sonic Micro-Tuft Head</span>
              1,800 micro-filaments pulsing at 84,000 VPM for fluid cavitation.
            </div>
            <div className="bg-[#1A1A1A]/90 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl text-gray-200 max-w-[210px] shadow-lg">
              <span className="text-white font-semibold block mb-0.5">02. Titanium Shaft</span>
              Acoustically tuned drive transmission with zero harmonic damping.
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="bg-[#1A1A1A]/90 backdrop-blur-md border border-[#7E3AF2]/30 px-3.5 py-2 rounded-xl text-gray-200 max-w-[220px] shadow-lg">
              <span className="text-[#A78BFA] font-semibold block mb-0.5">03. Digital Motor V-Pulse</span>
              Neodymium magnetic core with precision frequency governor.
            </div>
            <div className="bg-[#1A1A1A]/90 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl text-gray-200 max-w-[210px] shadow-lg">
              <span className="text-gray-300 font-semibold block mb-0.5">04. Magnetic Induction Pod</span>
              Qi2 inductive fast-charge base with aerospace anodized finish.
            </div>
          </div>
        </div>
      )}

      {/* Colorway Selection Bar */}
      <div className="absolute bottom-4 z-20 flex items-center gap-2 bg-[#121212]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl">
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
          Finish:
        </span>
        {(Object.keys(COLORWAYS) as Colorway[]).map((cw) => {
          const item = COLORWAYS[cw];
          const isSelected = colorway === cw;
          return (
            <button
              key={cw}
              id={`colorway-${cw}`}
              onClick={() => handleSelectColor(cw)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all ${
                isSelected
                  ? 'bg-white/15 text-white ring-1 ring-white/40 shadow-inner'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/30 flex items-center justify-center"
                style={{ backgroundColor: item.bodyColor }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: item.accentColor }}
                />
              </span>
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
