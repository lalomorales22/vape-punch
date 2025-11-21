export enum LogType {
  VAPE = 'VAPE',
  CRAVING = 'CRAVING'
}

export interface BioMetrics {
  stress: number; // 1-10
  hunger: number; // 1-10
  stomach: number; // 1-10 (Health)
  thirst: number; // 1-10
  waterIntake: number; // Cups today
  sleepHours: number; // Previous night
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