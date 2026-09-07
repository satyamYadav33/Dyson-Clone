/**
 * Types for Dyson Oral Care AI Toothbrush
 */

export type Colorway = 'obsidian-violet' | 'iron-fuchsia' | 'prussian-copper' | 'ceramic-mandarin';

export interface ColorScheme {
  id: Colorway;
  name: string;
  bodyColor: string;
  accentColor: string;
  gripColor: string;
  bristleColor: string;
  description: string;
}

export type CleaningMode = 'sonic-precision' | 'deep-gum' | 'micro-whitening' | 'sensitive-ai';

export interface CleaningModeInfo {
  id: CleaningMode;
  name: string;
  vpm: number; // Vibrations per minute
  frequencyHz: number;
  intensity: number; // 1 to 10
  description: string;
  targetFocus: string;
  acousticProfile: string;
}

export interface DentalZone {
  id: string;
  name: string;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4'; // Q1: Top Right, Q2: Top Left, Q3: Bottom Left, Q4: Bottom Right
  surface: 'outer' | 'inner' | 'chewing';
  coverage: number; // 0 to 100%
  completed: boolean;
}

export type PressureStatus = 'low' | 'optimal' | 'excessive';

export interface BluetoothSessionState {
  isConnected: boolean;
  isSimulated: boolean;
  deviceName: string;
  batteryLevel: number;
  brushingActive: boolean;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  currentQuadrant: 1 | 2 | 3 | 4;
  pressureGrams: number;
  pressureStatus: PressureStatus;
  overallCoverage: number;
  activeMode: CleaningMode;
  bristleDaysRemaining: number;
}
