
import { LogEntry, DbSchema, LogType, BioMetrics } from '../types';

const DB_KEY = 'vapepunch_db_v2';

// Initial state
const INITIAL_DB: DbSchema = {
  logs: [],
  lastWaterIntake: 0,
};

class DatabaseService {
  private getDb(): DbSchema {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      return INITIAL_DB;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("DB Corrupt, resetting", e);
      return INITIAL_DB;
    }
  }

  private saveDb(db: DbSchema): void {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  public addLog(type: LogType, metrics: BioMetrics): LogEntry {
    const db = this.getDb();
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      metrics
    };
    db.logs.push(newLog);
    if (metrics.waterIntake > 0) {
        db.lastWaterIntake = metrics.waterIntake;
    }
    this.saveDb(db);
    return newLog;
  }

  public getLogs(): LogEntry[] {
    return this.getDb().logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getTodayStats() {
    const logs = this.getLogs();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const todayLogs = logs.filter(l => l.timestamp >= todayStart);
    
    return {
      vaped: todayLogs.filter(l => l.type === LogType.VAPE).length,
      resisted: todayLogs.filter(l => l.type === LogType.CRAVING).length,
      lastLog: todayLogs[0] || null
    };
  }

  public getCurrentBioState() {
    const logs = this.getLogs();
    const recentLogs = logs.slice(0, 5); 
    
    if (recentLogs.length === 0) return { hydration: 50, fuel: 50 };

    const avgThirst = recentLogs.reduce((acc, l) => acc + l.metrics.thirst, 0) / recentLogs.length;
    const avgHunger = recentLogs.reduce((acc, l) => acc + l.metrics.hunger, 0) / recentLogs.length;

    // 0-100 Scale: 
    // Thirst 100 = Hydration 0.
    // Hunger 100 = Fuel 0.
    
    const hydration = Math.max(5, Math.min(100, 100 - avgThirst));
    const fuel = Math.max(5, Math.min(100, 100 - avgHunger));

    return {
        hydration: Math.round(hydration),
        fuel: Math.round(fuel)
    };
  }

  // --- ADVANCED ANALYTICS ---

  public getRadarData() {
    const logs = this.getLogs();
    const vapes = logs.filter(l => l.type === LogType.VAPE);
    const resists = logs.filter(l => l.type === LogType.CRAVING);

    const avg = (arr: LogEntry[], key: keyof BioMetrics) => {
        if (arr.length === 0) return 0;
        const sum = arr.reduce((acc, curr) => acc + curr.metrics[key], 0);
        return Math.round(sum / arr.length);
    };

    return [
        { subject: 'Stress', A: avg(vapes, 'stress'), B: avg(resists, 'stress'), fullMark: 100 },
        { subject: 'Hunger', A: avg(vapes, 'hunger'), B: avg(resists, 'hunger'), fullMark: 100 },
        { subject: 'Energy', A: avg(vapes, 'energy'), B: avg(resists, 'energy'), fullMark: 100 },
        { subject: 'Mood', A: avg(vapes, 'mood'), B: avg(resists, 'mood'), fullMark: 100 },
        { subject: 'Focus', A: avg(vapes, 'focus'), B: avg(resists, 'focus'), fullMark: 100 },
        { subject: 'Urge', A: avg(vapes, 'urgeIntensity'), B: avg(resists, 'urgeIntensity'), fullMark: 100 },
    ];
  }

  public getScatterData() {
      // Map: X=Time(Hour), Y=UrgeIntensity, Z=Stress(Size)
      const logs = this.getLogs();
      return logs.map(l => ({
          hour: new Date(l.timestamp).getHours() + (new Date(l.timestamp).getMinutes() / 60),
          urge: l.metrics.urgeIntensity,
          stress: l.metrics.stress,
          type: l.type,
          timestamp: l.timestamp
      }));
  }

  public getStreamData() {
      // Area chart for Energy vs Mood over time
      return this.getLogs().slice(0, 30).reverse().map(l => ({
          time: new Date(l.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          energy: l.metrics.energy,
          mood: l.metrics.mood,
          stress: l.metrics.stress
      }));
  }

  public exportForAI(): string {
    const logs = this.getLogs().slice(0, 40);
    if (logs.length === 0) return "No data recorded yet.";
    
    return JSON.stringify(logs.map(l => ({
      date: new Date(l.timestamp).toLocaleString(),
      action: l.type,
      metrics: l.metrics
    })), null, 2);
  }
}

export const dbService = new DatabaseService();
