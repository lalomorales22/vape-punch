
export enum LogType {
  VAPE = 'VAPE',
  CRAVING = 'CRAVING'
}

export interface BioMetrics {
  stress: number;        // 0-100
  hunger: number;        // 0-100
  stomach: number;       // 0-100 (Discomfort)
  thirst: number;        // 0-100
  energy: number;        // 0-100
  mood: number;          // 0-100 (0=Depressed, 100=Ecstatic)
  focus: number;         // 0-100
  urgeIntensity: number; // 0-100
  waterIntake: number;   // Cups today (Absolute)
  sleepHours: number;    // Previous night (Absolute)
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: LogType;
  metrics: BioMetrics;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum ViewMode {
  FULL = 'FULL',
  COMPACT = 'COMPACT'
}

export interface DbSchema {
  logs: LogEntry[];
  lastWaterIntake: number;
}
