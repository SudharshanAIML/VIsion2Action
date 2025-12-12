export enum AppRoute {
  HOME = '/',
  NAVIGATION = '/navigation'
}

export interface AnalysisResult {
  text: string;
  timestamp: number;
}

export interface CameraHandle {
  captureFrame: () => string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export interface MemoryTag {
  id: string;
  name: string;
  timestamp: number;
}

export interface SensorData {
  isMoving: boolean;
  heading: number | null; // 0-360
  stepCount: number;
}

export interface LanguageDefinition {
  code: string; // BCP 47 (e.g., 'en-US')
  name: string; // Display name (e.g., 'English')
  nativeName: string; // Native name (e.g., 'Español')
}

export type TranslationKey = 
  | 'listening' 
  | 'processing' 
  | 'paused' 
  | 'monitoring' 
  | 'hazard' 
  | 'nav_active' 
  | 'tap_start' 
  | 'tap_pause'
  | 'hold_ask'
  | 'scanning'
  | 'mic_error'
  | 'welcome';
