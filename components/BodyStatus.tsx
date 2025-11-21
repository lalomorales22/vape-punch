import React from 'react';

interface BodyStatusProps {
  hydrationPercent: number; // 0-100
  fuelPercent: number; // 0-100 (Hunger inverted)
}

const BodyStatus: React.FC<BodyStatusProps> = ({ hydrationPercent, fuelPercent }) => {
  
  // SVG Path for a simple human silhouette
  const humanPath = "M12 2C13.6569 2 15 3.34315 15 5C15 6.65685 13.6569 8 12 8C10.3431 8 9 6.65685 9 5C9 3.34315 10.3431 2 12 2ZM12 9C14.6667 9 19 10 19 13V15C19 15.5523 18.5523 16 18 16H17V21C17 21.5523 16.5523 22 16 22H14V17H10V22H8C7.44772 22 7 21.5523 7 21V16H6C5.44772 16 5 15.5523 5 15V13C5 10 9.33333 9 12 9Z";

  const renderHuman = (percent: number, color: string, label: string) => {
    return (
      <div className="flex flex-col items-center gap-2 relative group">
        <div className="text-center z-10">
            <div className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">{label}</div>
            <div className={`text-xl font-bold font-mono drop-shadow-md transition-colors ${percent < 30 ? 'text-red-500 animate-pulse' : 'text-zinc-200'}`}>
                {percent}%
            </div>
        </div>
        
        <div className="relative w-20 h-36">
            {/* Background Silhouette (Empty) */}
            <svg viewBox="0 0 24 24" className="w-full h-full text-zinc-800 drop-shadow-lg">
            <path d={humanPath} fill="currentColor" />
            </svg>

            {/* Liquid Mask Container */}
            <div className="absolute inset-0 overflow-hidden">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                <defs>
                    <mask id={`humanMask-${label}`}>
                        <path d={humanPath} fill="white" />
                    </mask>
                </defs>

                <g mask={`url(#humanMask-${label})`}>
                    {/* Animated Liquid Rect */}
                    <rect 
                        x="-10" 
                        y={24 - (24 * (percent / 100))} 
                        width="50" 
                        height="30" 
                        fill={color} 
                        opacity={0.8}
                        className="transition-all duration-1000 ease-in-out"
                    />
                    
                    {/* Surface Line / Wave */}
                    <path 
                        d="M0 0 Q 12 2, 24 0" 
                        stroke="white" 
                        strokeWidth="0.5" 
                        strokeOpacity="0.5"
                        fill="none"
                        className="animate-wave"
                        transform={`translate(0, ${24 - (24 * (percent / 100))})`}
                    />
                </g>
                </svg>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full flex items-end justify-around bg-zinc-950/50 rounded-2xl border border-zinc-900 overflow-hidden p-6 py-8">
        {renderHuman(hydrationPercent, '#3b82f6', 'Water')}
        {renderHuman(fuelPercent, '#f59e0b', 'Fuel')}
        
        {/* Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 via-transparent to-amber-900 opacity-50"></div>
    </div>
  );
};

export default BodyStatus;