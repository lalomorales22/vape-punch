
import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
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
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded shadow-xl z-50 backdrop-blur-md bg-opacity-90">
        <p className="text-zinc-400 font-mono text-[10px] mb-2 uppercase tracking-wider">{label}</p>
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
              <p className="text-xs font-bold text-zinc-200">
                {p.name}: <span className="font-mono text-white">{Math.round(p.value)}</span>
              </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics: React.FC<AnalyticsProps> = ({ logs }) => {
  
  // Get specialized data sets
  const radarData = dbService.getRadarData();
  const scatterData = dbService.getScatterData();
  const streamData = dbService.getStreamData();

  if (logs.length < 2) {
      return (
          <div className="h-full w-full flex flex-col items-center justify-center text-zinc-600 font-mono text-sm space-y-4 min-h-[300px]">
              <p className="animate-pulse">AWAITING BIOMETRIC CALIBRATION...</p>
              <div className="flex gap-2">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 gap-6 pb-4">
      
      {/* ROW 1: THE BIO-WEB (RADAR) */}
      <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800 p-6 min-h-[350px] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
        <h3 className="text-xs font-mono text-indigo-400 mb-4 uppercase tracking-widest flex items-center gap-2">
            Bio-Web <span className="text-zinc-600">///</span> <span className="text-zinc-500">Relapse vs Resist Profile</span>
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#3f3f46" strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              
              <Radar name="Vape State" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.2} />
              <Radar name="Resist State" dataKey="B" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
              
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} iconType="circle" />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2: URGE CLOUD (SCATTER) */}
      <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800 p-6 min-h-[300px] relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50"></div>
        <h3 className="text-xs font-mono text-rose-400 mb-4 uppercase tracking-widest flex items-center gap-2">
            Urge Cloud <span className="text-zinc-600">///</span> <span className="text-zinc-500">Intensity vs Time (Size = Stress)</span>
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <XAxis type="number" dataKey="hour" name="Hour" unit="h" domain={[0, 24]} stroke="#52525b" fontSize={10} tickCount={12} />
              <YAxis type="number" dataKey="urge" name="Urge" unit="%" stroke="#52525b" fontSize={10} />
              <ZAxis type="number" dataKey="stress" range={[50, 500]} name="Stress" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Scatter name="Urge Events" data={scatterData} fill="#f43f5e" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 3: STATE STREAM (AREA) */}
      <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800 p-6 min-h-[250px] relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
        <h3 className="text-xs font-mono text-cyan-400 mb-4 uppercase tracking-widest">State Stream (Energy vs Mood)</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={streamData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#52525b" fontSize={9} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="energy" stroke="#10b981" fillOpacity={1} fill="url(#colorEnergy)" strokeWidth={2} />
              <Area type="monotone" dataKey="mood" stroke="#06b6d4" fillOpacity={1} fill="url(#colorMood)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
};

export default Analytics;
