import { LogEntry, DbSchema, LogType, BioMetrics } from '../types';

const DB_KEY = 'vapepunch_db_v1';

// Initial state if DB is empty
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
    // Update persistent water tracking if changed in metrics
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
    // Analyze last 5 logs to get current "feeling" state
    const recentLogs = logs.slice(0, 5); 
    
    if (recentLogs.length === 0) return { hydration: 50, fuel: 50 };

    // Calculate average thirst and hunger from recent logs
    const avgThirst = recentLogs.reduce((acc, l) => acc + l.metrics.thirst, 0) / recentLogs.length;
    const avgHunger = recentLogs.reduce((acc, l) => acc + l.metrics.hunger, 0) / recentLogs.length;

    // Logic: 
    // High Thirst (10) = Low Hydration (0%)
    // Low Thirst (1) = High Hydration (100%)
    // Formula: 110 - (Value * 10). Clamped 0-100.
    
    const hydration = Math.max(5, Math.min(100, 110 - (avgThirst * 10)));
    const fuel = Math.max(5, Math.min(100, 110 - (avgHunger * 10)));

    return {
        hydration: Math.round(hydration),
        fuel: Math.round(fuel)
    };
  }

  // --- Analytics Helpers ---

  public getBiometricAverages() {
      const logs = this.getLogs();
      const vapes = logs.filter(l => l.type === LogType.VAPE);
      const resists = logs.filter(l => l.type === LogType.CRAVING);

      const avg = (arr: LogEntry[], key: keyof BioMetrics) => {
          if (arr.length === 0) return 0;
          const sum = arr.reduce((acc, curr) => acc + curr.metrics[key], 0);
          return parseFloat((sum / arr.length).toFixed(1));
      };

      return [
          { name: 'Stress', vape: avg(vapes, 'stress'), resist: avg(resists, 'stress') },
          { name: 'Hunger', vape: avg(vapes, 'hunger'), resist: avg(resists, 'hunger') },
          { name: 'Thirst', vape: avg(vapes, 'thirst'), resist: avg(resists, 'thirst') },
          { name: 'Stomach', vape: avg(vapes, 'stomach'), resist: avg(resists, 'stomach') },
      ];
  }

  public getHourlyBreakdown() {
      const logs = this.getLogs();
      const hours = Array(24).fill(0).map((_, i) => ({ hour: i, vapes: 0, resists: 0 }));
      
      logs.forEach(log => {
          const hour = new Date(log.timestamp).getHours();
          if (log.type === LogType.VAPE) hours[hour].vapes++;
          else hours[hour].resists++;
      });

      return hours.map(h => ({
          name: `${h.hour}:00`,
          vapes: h.vapes,
          resists: h.resists
      }));
  }

  public getSleepCorrelation() {
    // Check distribution of Vape events based on Sleep buckets
    const logs = this.getLogs().filter(l => l.type === LogType.VAPE);
    const buckets = { '< 6h': 0, '6-8h': 0, '> 8h': 0 };
    
    logs.forEach(l => {
      if (l.metrics.sleepHours < 6) buckets['< 6h']++;
      else if (l.metrics.sleepHours <= 8) buckets['6-8h']++;
      else buckets['> 8h']++;
    });

    return Object.keys(buckets).map(k => ({
      name: k,
      value: buckets[k as keyof typeof buckets]
    }));
  }

  public getWeekdayStats() {
    const logs = this.getLogs().filter(l => l.type === LogType.VAPE);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const stats = days.map(d => ({ name: d, count: 0 }));

    logs.forEach(l => {
      const day = new Date(l.timestamp).getDay();
      stats[day].count++;
    });
    return stats;
  }

  public exportForAI(): string {
    const logs = this.getLogs().slice(0, 50); // Last 50 entries for context
    if (logs.length === 0) return "No data recorded yet.";
    
    return JSON.stringify(logs.map(l => ({
      date: new Date(l.timestamp).toLocaleString(),
      action: l.type,
      stress: l.metrics.stress,
      hunger: l.metrics.hunger,
      sleep: l.metrics.sleepHours,
      thirst: l.metrics.thirst
    })), null, 2);
  }
}

export const dbService = new DatabaseService();