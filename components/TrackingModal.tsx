
import React, { useState, useRef, useEffect } from 'react';
import { BioMetrics, LogType } from '../types';
import { X, Activity, GlassWater, Moon, Utensils, Frown, Zap, Smile, BrainCircuit, Flame } from 'lucide-react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (metrics: BioMetrics) => void;
  type: LogType;
}

const DialInput: React.FC<{ 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  icon: React.ReactNode;
  color: string;
  max?: number;
}> = ({ label, value, onChange, icon, color, max = 100 }) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Colors mapping for Tailwind classes construction
  const getColorHex = (c: string) => {
      const colors: Record<string, string> = {
          red: '#ef4444', orange: '#f97316', blue: '#3b82f6', yellow: '#eab308',
          indigo: '#6366f1', violet: '#8b5cf6', emerald: '#10b981', rose: '#f43f5e', cyan: '#06b6d4'
      };
      return colors[c] || '#ffffff';
  };

  const handleInteraction = (e: React.MouseEvent | MouseEvent) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY; // Invert Y for standard unit circle? No, screen coords.
    
    // Calculate angle in degrees. 0 at top?
    // Atan2(y, x) gives angle from positive X axis.
    // We want 0 at bottom-left, 100 at bottom-right? Or 360 continuous?
    // Let's do a simple "distance from bottom left" or just use vertical drag on the circle?
    
    // Let's do Radial: -135deg (min) to +135deg (max) starting from top (0) is confusing.
    // Standard volume knob: starts at 7 o'clock, ends at 5 o'clock.
    // Math.atan2(y, x) -> -PI to PI. 
    
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    // Shift so 0 is at 6 o'clock? No, let's make it simple.
    // Atan2: Right=0, Down=90, Left=180/-180, Up=-90.
    // We want start at 135 (bottom left) and end at 45 (bottom right) going clockwise.
    
    // New approach: Just mapping rotation.
    let deg = angle + 90; // Up is 0.
    if (deg < 0) deg += 360;
    
    // Cap range for a "gap" at the bottom
    // 0-100 map.
    // Let's use a simpler UX: Click on ring.
    // Map angle to 0-100.
    // Let's say Top (0deg) is 50%. Right (90deg) is 75%. Bottom (180deg) is 100%. Left (270deg) is 25%.
    
    const percent = Math.min(100, Math.max(0, (deg / 360) * 100));
    // Actually let's just use vertical drag distance if they hold click?
    // No, the circular interaction is requested.
    
    // Let's use simple 0-100 radial. 0 at top, clockwise.
    let newVal = Math.round((deg / 360) * max);
    onChange(newVal);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      handleInteraction(e);
  };

  useEffect(() => {
      const handleGlobalMouseMove = (e: MouseEvent) => {
          if (isDragging) {
              handleInteraction(e);
              e.preventDefault();
          }
      };
      const handleGlobalMouseUp = () => setIsDragging(false);

      if (isDragging) {
          window.addEventListener('mousemove', handleGlobalMouseMove);
          window.addEventListener('mouseup', handleGlobalMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleGlobalMouseMove);
          window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
  }, [isDragging]);

  // Visuals
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((value / max) * circumference);
  const activeColor = getColorHex(color);

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        ref={dialRef}
        onMouseDown={handleMouseDown}
        className="relative w-20 h-20 cursor-pointer group"
      >
        {/* Background Ring */}
        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
           <circle
             cx="40" cy="40" r={radius}
             stroke="#27272a"
             strokeWidth="6"
             fill="transparent"
           />
           {/* Active Ring */}
           <circle
             cx="40" cy="40" r={radius}
             stroke={activeColor}
             strokeWidth="6"
             fill="transparent"
             strokeDasharray={circumference}
             strokeDashoffset={strokeDashoffset}
             strokeLinecap="round"
             className="transition-all duration-75 ease-out"
           />
        </svg>
        
        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold font-mono text-white">{Math.round(value)}</span>
            <span className="text-[8px] uppercase text-zinc-500 tracking-wider">{max === 100 ? '%' : ''}</span>
        </div>

        {/* Hover Glow */}
        <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none`} style={{ backgroundColor: activeColor, filter: 'blur(10px)' }}></div>
      </div>
      
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
         {icon} {label}
      </div>
    </div>
  );
};

const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose, onConfirm, type }) => {
  const [metrics, setMetrics] = useState<BioMetrics>({
    stress: 50, hunger: 50, thirst: 50, stomach: 10,
    energy: 50, mood: 50, focus: 50, urgeIntensity: 80,
    waterIntake: 4, sleepHours: 7
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(metrics);
    onClose();
  };

  const update = (key: keyof BioMetrics, val: number) => {
      setMetrics(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                {type === LogType.VAPE ? <span className="text-red-500">Relapse Protocol</span> : <span className="text-emerald-500">Resistance Protocol</span>}
            </h2>
            <p className="text-zinc-500 text-xs font-mono mt-1">CALIBRATE BIOMETRICS FOR AI ANALYSIS</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full hover:bg-zinc-800">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* Primary Metrics */}
            <div className="mb-8">
                <h3 className="text-xs font-mono text-zinc-500 mb-6 border-l-2 border-indigo-500 pl-3 uppercase">Core Physiology</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                    <DialInput label="Thirst" value={metrics.thirst} onChange={v => update('thirst', v)} icon={<GlassWater size={12}/>} color="blue" />
                    <DialInput label="Hunger" value={metrics.hunger} onChange={v => update('hunger', v)} icon={<Utensils size={12}/>} color="orange" />
                    <DialInput label="Stomach Pain" value={metrics.stomach} onChange={v => update('stomach', v)} icon={<Frown size={12}/>} color="yellow" />
                    <DialInput label="Sleep (Hrs)" value={metrics.sleepHours} onChange={v => update('sleepHours', v)} icon={<Moon size={12}/>} color="indigo" max={14} />
                </div>
            </div>

            {/* Psychology Metrics */}
            <div className="mb-8">
                <h3 className="text-xs font-mono text-zinc-500 mb-6 border-l-2 border-rose-500 pl-3 uppercase">Psych State</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 justify-items-center">
                    <DialInput label="Stress" value={metrics.stress} onChange={v => update('stress', v)} icon={<Activity size={12}/>} color="red" />
                    <DialInput label="Energy" value={metrics.energy} onChange={v => update('energy', v)} icon={<Zap size={12}/>} color="emerald" />
                    <DialInput label="Mood" value={metrics.mood} onChange={v => update('mood', v)} icon={<Smile size={12}/>} color="cyan" />
                    <DialInput label="Focus" value={metrics.focus} onChange={v => update('focus', v)} icon={<BrainCircuit size={12}/>} color="violet" />
                    <DialInput label="Urge Intensity" value={metrics.urgeIntensity} onChange={v => update('urgeIntensity', v)} icon={<Flame size={12}/>} color="rose" />
                </div>
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-900/20 flex gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all font-mono text-xs tracking-widest uppercase">
            Abort
          </button>
          <button 
            onClick={handleConfirm}
            className={`flex-1 py-4 rounded-xl font-black text-black transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider ${
              type === LogType.VAPE ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-900/20'
            }`}
          >
            {type === LogType.VAPE ? 'CONFIRM RELAPSE' : 'CONFIRM VICTORY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
