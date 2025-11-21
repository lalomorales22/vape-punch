import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend
} from 'recharts';
import { LogEntry } from '../types';
import { dbService } from '../services/dbService';

interface AnalyticsProps {
  logs: LogEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded shadow-xl z-50">
        <p className="text-zinc-300 font-mono text-xs mb-2">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} className="text-xs font-bold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics: React.FC<AnalyticsProps> = ({ logs }) => {
  // Prepare Data
  
  // 1. Timeline Data (Area Chart)
  const timelineData = logs.slice(0, 20).reverse().map(log => ({
    time: new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    stress: log.metrics.stress,
    hunger: log.metrics.hunger,
    type: log.type
  }));

  // 2. Comparison Data (Bar Chart)
  const bioAverages = dbService.getBiometricAverages();

  // 3. Hourly Activity (Bar Chart)
  const hourlyData = dbService.getHourlyBreakdown();

  // 4. Sleep Correlation
  const sleepData = dbService.getSleepCorrelation();

  // 5. Weekday Stats
  const weekdayData = dbService.getWeekdayStats();

  if (logs.length < 2) {
      return (
          <div className="h-full w-full flex flex-col items-center justify-center text-zinc-600 font-mono text-sm space-y-4 min-h-[300px]">
              <p className="animate-pulse">AWAITING DATA STREAMS...</p>
              <p className="text-xs text-zinc-700">Interact with the 3D devices to begin.</p>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-4">
      
      {/* TOP ROW: Trigger Comparison */}
      <div className="bg-zinc-900/20 rounded-xl border border-zinc-800 p-4 min-h-[200px]">
        <h3 className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-wider">Triggers: Relapse vs Resist</h3>
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bioAverages} barGap={4} barSize={20}>
               <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
               <YAxis stroke="#52525b" fontSize={9} tickLine={false} domain={[0, 10]} />
               <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
               <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }}/>
               <Bar name="Vape State" dataKey="vape" fill="#ef4444" radius={[2, 2, 0, 0]} />
               <Bar name="Resist State" dataKey="resist" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MID ROW: Hourly & Sleep */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/20 rounded-xl border border-zinc-800 p-4 min-h-[180px]">
             <h3 className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-wider">Danger Zones (Hour)</h3>
             <div className="h-[140px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={hourlyData}>
                   <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} interval={3} />
                   <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(239, 68, 68, 0.1)'}} />
                   <Bar dataKey="vapes" name="Vapes" stackId="a" fill="#ef4444" />
                   <Bar dataKey="resists" name="Resists" stackId="a" fill="#10b981" />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-zinc-900/20 rounded-xl border border-zinc-800 p-4 min-h-[180px]">
            <h3 className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-wider">Sleep Impact</h3>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(239, 68, 68, 0.1)'}} />
                  <Bar dataKey="value" name="Vapes" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>

      {/* BOTTOM ROW: Stress Timeline */}
      <div className="bg-zinc-900/20 rounded-xl border border-zinc-800 p-4 min-h-[180px]">
        <h3 className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-wider">Recent Stress Trend</h3>
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#52525b" fontSize={9} tickLine={false} minTickGap={20} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="stress" stroke="#f43f5e" fillOpacity={1} fill="url(#colorStress)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
};

export default Analytics;