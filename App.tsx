import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Droplets, Zap, Heart, BrainCircuit } from 'lucide-react';
import { LogType, ViewMode, LogEntry, BioMetrics } from './types';
import { dbService } from './services/dbService';
import { geminiService } from './services/geminiService';

import VapePuncher from './components/VapePuncher';
import TrackingModal from './components/TrackingModal';
import ChatInterface from './components/ChatInterface';
import Analytics from './components/Analytics';
import BodyStatus from './components/BodyStatus';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.FULL);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [todayStats, setTodayStats] = useState({ vaped: 0, resisted: 0 });
  const [bioState, setBioState] = useState({ hydration: 50, fuel: 50 });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingLogType, setPendingLogType] = useState<LogType | null>(null);
  
  // AI Analysis State
  const [analysis, setAnalysis] = useState<string | null>(null);

  const refreshData = () => {
    setLogs(dbService.getLogs());
    setTodayStats(dbService.getTodayStats());
    setBioState(dbService.getCurrentBioState());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handlePunchStart = (type: LogType) => {
    setPendingLogType(type);
    // Delay showing the modal so the animation is visible first
    setTimeout(() => {
        setIsModalOpen(true);
    }, 700);
  };

  const handleLogConfirm = (metrics: BioMetrics) => {
    if (pendingLogType) {
      dbService.addLog(pendingLogType, metrics);
      refreshData();
    }
  };

  const runAnalysis = async () => {
      setAnalysis("Crunching data...");
      const context = dbService.exportForAI();
      const result = await geminiService.analyzeHabits(context);
      setAnalysis(result);
  };

  // --- RENDER MODES ---

  if (viewMode === ViewMode.COMPACT) {
    return (
      <div className="fixed bottom-4 right-4 w-64 bg-black border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
        <div className="p-3 flex justify-between items-center bg-zinc-900 border-b border-zinc-800">
          <span className="text-xs font-bold text-zinc-400">MINI PUNCH</span>
          <button onClick={() => setViewMode(ViewMode.FULL)} className="text-zinc-500 hover:text-white">
            <Maximize2 size={14} />
          </button>
        </div>
        
        <div className="p-4 grid grid-cols-2 gap-4 items-center justify-items-center">
           <div className="transform scale-90">
              <VapePuncher label="VAPE" onPunch={() => handlePunchStart(LogType.VAPE)} color="red" size="small" />
           </div>
           <div className="transform scale-90">
              <VapePuncher label="RESIST" onPunch={() => handlePunchStart(LogType.CRAVING)} color="emerald" size="small" />
           </div>
        </div>
        
        <div className="px-4 pb-3 flex gap-2 text-[10px] font-mono w-full justify-between text-zinc-500 border-t border-zinc-900 pt-2">
             <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> {todayStats.vaped}</span>
             <span className="flex items-center gap-1 text-emerald-500">{todayStats.resisted} <div className="w-2 h-2 bg-emerald-500 rounded-full"></div></span>
        </div>

        {isModalOpen && pendingLogType && (
             <TrackingModal 
             isOpen={isModalOpen} 
             onClose={() => setIsModalOpen(false)} 
             onConfirm={handleLogConfirm}
             type={pendingLogType}
           />
        )}
      </div>
    );
  }

  // FULL MODE (UNIFIED DASHBOARD)
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-900 selection:text-white overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex-none w-full bg-black/80 backdrop-blur-md border-b border-zinc-900 z-40 h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
           <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center font-black text-black text-sm rotate-3 shadow-[0_0_15px_rgba(220,38,38,0.5)]">P</div>
           <h1 className="font-bold tracking-tight text-white text-sm uppercase">VapePunch</h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-500">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800">
               <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
               RELAPSES: <span className="text-white font-bold">{todayStats.vaped}</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
               WINS: <span className="text-white font-bold">{todayStats.resisted}</span>
             </div>
           </div>
           <button 
             onClick={() => setViewMode(ViewMode.COMPACT)}
             className="text-zinc-500 hover:text-white transition-colors"
             title="Mini Mode"
           >
             <Minimize2 size={18} />
           </button>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: ACTIONS (Punchers & Stats) - 3/12 width */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* The Punchers Card */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-purple-600 to-emerald-600 opacity-50"></div>
              
              {/* Red Zone */}
              <div className="w-full flex flex-col items-center pb-6 border-b border-zinc-900/50 border-dashed">
                <div className="flex items-center gap-2 text-xs font-mono text-red-500 tracking-widest mb-2 opacity-70">
                  <Zap size={12} />
                  <span>DESTROY URGE</span>
                </div>
                <VapePuncher label="VAPE" onPunch={() => handlePunchStart(LogType.VAPE)} color="red" />
              </div>
              
              {/* Green Zone */}
               <div className="w-full flex flex-col items-center pt-2">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 tracking-widest mb-2 opacity-70">
                  <Heart size={12} />
                  <span>BUILD HABIT</span>
                </div>
                <VapePuncher label="RESIST" onPunch={() => handlePunchStart(LogType.CRAVING)} color="emerald" />
              </div>
            </div>

            {/* Bio Status Widget */}
             <BodyStatus hydrationPercent={bioState.hydration} fuelPercent={bioState.fuel} />

          </div>

          {/* Middle Column: ANALYTICS - 5/12 width */}
          <div className="lg:col-span-5 flex flex-col gap-4 min-h-[500px]">
             <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
                   LIVE BIOMETRICS
                </h2>
                <button onClick={runAnalysis} className="text-xs bg-zinc-900 hover:bg-zinc-800 px-3 py-1 rounded text-zinc-400 border border-zinc-800 hover:text-white transition-colors flex items-center gap-2">
                  <BrainCircuit size={12} /> Analyze Now
                </button>
             </div>

             {/* Analytics Component */}
             <div className="flex-1 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 overflow-y-auto custom-scrollbar shadow-inner">
                {analysis && (
                  <div className="mb-6 p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl">
                    <h3 className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-2">
                       AI INSIGHT
                    </h3>
                    <div className="text-xs text-indigo-200 leading-relaxed whitespace-pre-line">
                      {analysis}
                    </div>
                  </div>
                )}
                <Analytics logs={logs} />
             </div>
          </div>

          {/* Right Column: CHAT - 4/12 width */}
          <div className="lg:col-span-4 h-[600px] lg:h-auto flex flex-col">
             <h2 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
                 COACHING
             </h2>
             <div className="flex-1 shadow-2xl rounded-xl overflow-hidden border border-zinc-800">
               <ChatInterface />
             </div>
          </div>

        </div>
      </main>

      <TrackingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleLogConfirm}
        type={pendingLogType || LogType.VAPE}
      />
    </div>
  );
};

export default App;