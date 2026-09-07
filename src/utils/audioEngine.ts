/**
 * Dyson Digital Motor V-Pulse Acoustic Sound Engine
 * Uses Web Audio API to synthesize high-speed sonic motor acoustic frequencies and drive real-time visualizers.
 */

class MotorSoundEngine {
  private ctx: AudioContext | null = null;
  private isRunning = false;
  private masterGain: GainNode | null = null;
  private fundamentalOsc: OscillatorNode | null = null;
  private harmonicOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentVpm = 84000;
  private volume = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getCurrentVpm(): number {
    return this.currentVpm;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setVpm(vpm: number) {
    this.currentVpm = Math.max(20000, Math.min(90000, vpm));
    // Fundamental frequency in Hz: vpm / 60
    const fundamentalHz = this.currentVpm / 60; // e.g., 84,000 / 60 = 1400 Hz

    if (this.ctx && this.isRunning) {
      const now = this.ctx.currentTime;
      if (this.fundamentalOsc) {
        this.fundamentalOsc.frequency.setTargetAtTime(fundamentalHz, now, 0.05);
      }
      if (this.harmonicOsc) {
        this.harmonicOsc.frequency.setTargetAtTime(fundamentalHz * 2, now, 0.05);
      }
      if (this.subOsc) {
        this.subOsc.frequency.setTargetAtTime(fundamentalHz * 0.5, now, 0.05);
      }
      if (this.filter) {
        this.filter.frequency.setTargetAtTime(fundamentalHz * 3.2, now, 0.05);
      }
    }
  }

  public start() {
    if (this.isRunning) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.Q.value = 3.5;

      const fundamentalHz = this.currentVpm / 60;
      this.filter.frequency.setValueAtTime(fundamentalHz * 3.2, this.ctx.currentTime);

      // Fundamental oscillator (triangle wave gives pleasant metallic mechanical purr)
      this.fundamentalOsc = this.ctx.createOscillator();
      this.fundamentalOsc.type = 'triangle';
      this.fundamentalOsc.frequency.setValueAtTime(fundamentalHz, this.ctx.currentTime);

      // Harmonic oscillator (sine wave for pure sonic resonance)
      this.harmonicOsc = this.ctx.createOscillator();
      this.harmonicOsc.type = 'sine';
      this.harmonicOsc.frequency.setValueAtTime(fundamentalHz * 2, this.ctx.currentTime);
      const harmonicGain = this.ctx.createGain();
      harmonicGain.gain.value = 0.35;
      this.harmonicOsc.connect(harmonicGain);

      // Sub harmonic for physical vibration resonance
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(fundamentalHz * 0.5, this.ctx.currentTime);
      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.2;
      this.subOsc.connect(subGain);

      // White noise buffer for Dyson aerodynamic air rush / whisper acoustic damping
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 2400;
      noiseFilter.Q.value = 4.0;

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.value = 0.08;

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);

      // Connect nodes
      this.fundamentalOsc.connect(this.filter);
      harmonicGain.connect(this.filter);
      subGain.connect(this.filter);
      this.noiseGain.connect(this.filter);

      this.filter.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.fundamentalOsc.start();
      this.harmonicOsc.start();
      this.subOsc.start();
      this.noiseNode.start();

      this.isRunning = true;
    } catch (e) {
      console.warn('Audio start prevented:', e);
    }
  }

  public stop() {
    if (!this.isRunning) return;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
      setTimeout(() => {
        try {
          this.fundamentalOsc?.stop();
          this.harmonicOsc?.stop();
          this.subOsc?.stop();
          this.noiseNode?.stop();
          this.fundamentalOsc?.disconnect();
          this.harmonicOsc?.disconnect();
          this.subOsc?.disconnect();
          this.noiseNode?.disconnect();
        } catch {}
        this.isRunning = false;
      }, 100);
    } else {
      this.isRunning = false;
    }
  }

  public toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }
}

export const motorSound = new MotorSoundEngine();
