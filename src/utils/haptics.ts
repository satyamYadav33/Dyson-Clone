/**
 * Haptic feedback utility using Web Vibration API with audio click fallbacks
 */

let hapticsEnabled = true;

export const setHapticsEnabled = (enabled: boolean) => {
  hapticsEnabled = enabled;
};

export const getHapticsEnabled = () => hapticsEnabled;

// Audio context for subtle micro-click fallback on desktop
let audioCtx: AudioContext | null = null;

const playMicroClick = (freq = 800, duration = 0.015, gainVal = 0.05) => {
  if (!hapticsEnabled) return;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'running') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'section' | 'quadrant' | 'warning' | 'success' = 'light') => {
  if (!hapticsEnabled) return;

  const hasVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  switch (type) {
    case 'light':
      if (hasVibrate) {
        try { navigator.vibrate(8); } catch {}
      }
      playMicroClick(900, 0.01, 0.02);
      break;

    case 'medium':
      if (hasVibrate) {
        try { navigator.vibrate(18); } catch {}
      }
      playMicroClick(650, 0.02, 0.04);
      break;

    case 'heavy':
      if (hasVibrate) {
        try { navigator.vibrate(35); } catch {}
      }
      playMicroClick(400, 0.03, 0.06);
      break;

    case 'section':
      if (hasVibrate) {
        try { navigator.vibrate([12, 30, 16]); } catch {}
      }
      playMicroClick(750, 0.02, 0.03);
      break;

    case 'quadrant':
      if (hasVibrate) {
        try { navigator.vibrate([25, 40, 25, 40, 45]); } catch {}
      }
      playMicroClick(520, 0.04, 0.05);
      break;

    case 'warning':
      if (hasVibrate) {
        try { navigator.vibrate([60, 40, 60, 40, 80]); } catch {}
      }
      playMicroClick(220, 0.08, 0.08);
      break;

    case 'success':
      if (hasVibrate) {
        try { navigator.vibrate([15, 30, 20, 30, 40]); } catch {}
      }
      playMicroClick(880, 0.03, 0.05);
      break;
  }
};
