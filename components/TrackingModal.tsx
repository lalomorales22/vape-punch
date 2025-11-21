import React, { useState } from 'react';
import { BioMetrics, LogType } from '../types';
import { X, Activity, GlassWater, Moon, Utensils, Frown, Meh } from 'lucide-react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (metrics: BioMetrics) => void;
  type: LogType;
}

const RangeInput: React.FC<{ 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  icon: React.ReactNode;
  min?: number;
  max?: number;
  color?: string;
}> = ({ label, value, onChange, icon, min=1, max=10, color="accent" }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs uppercase tracking-wider text-zinc-500 mb-1">
      <span className="flex items-center gap-2">{icon} {label}</span>
      <span className="text-zinc-300 font-mono">{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-${color}-500`}
    />
  </div>
);

const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose, onConfirm, type }) => {
  const [metrics, setMetrics] = useState<BioMetrics>({
    stress: 5,
    hunger: 5,
    stomach: 5,
    thirst: 5,
    waterIntake: 4,
    sleepHours: 7
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(metrics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {type === LogType.VAPE ? <span className="text-red-500">LOGGING RELAPSE</span> : <span className="text-emerald-500">LOGGING VICTORY</span>}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <p className="text-zinc-400 text-sm mb-4">
            Capture your current state. Be honest. The AI needs this to help you.
          </p>

          <RangeInput 
            label="Stress Level" 
            value={metrics.stress} 
            onChange={v => setMetrics({...metrics, stress: v})} 
            icon={<Activity size={14} />}
            color="red"
          />
           <RangeInput 
            label="Hunger" 
            value={metrics.hunger} 
            onChange={v => setMetrics({...metrics, hunger: v})} 
            icon={<Utensils size={14} />}
            color="orange"
          />
          <RangeInput 
            label="Thirst" 
            value={metrics.thirst} 
            onChange={v => setMetrics({...metrics, thirst: v})} 
            icon={<GlassWater size={14} />}
            color="blue"
          />
          <RangeInput 
            label="Stomach Discomfort" 
            value={metrics.stomach} 
            onChange={v => setMetrics({...metrics, stomach: v})} 
            icon={<Frown size={14} />}
            color="yellow"
          />
          <RangeInput 
            label="Sleep Last Night (Hours)" 
            value={metrics.sleepHours} 
            onChange={v => setMetrics({...metrics, sleepHours: v})} 
            min={0} max={14}
            icon={<Moon size={14} />}
            color="indigo"
          />
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className={`flex-1 py-3 rounded-lg font-bold text-black transition-colors ${
              type === LogType.VAPE ? 'bg-red-500 hover:bg-red-400' : 'bg-emerald-500 hover:bg-emerald-400'
            }`}
          >
            Confirm Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;