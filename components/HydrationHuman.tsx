import React from 'react';

interface HydrationHumanProps {
  waterIntake: number; // Cups
  thirst: number; // 1-10
}

const HydrationHuman: React.FC<HydrationHumanProps> = ({ waterIntake, thirst }) => {
  // Calculate liquid height percentage (assuming 8 cups is 100%)
  const percentage = Math.min(Math.max((waterIntake / 8) * 100, 5), 100);
  
  // Determine liquid color based on thirst
  // Low thirst = nice blue. High thirst = murky/purple warning.
  const isDehydrated = thirst > 6;
  const liquidColor = isDehydrated ? '#8b5cf6' : '#3b82f6'; // Violet if thirsty, Blue if good
  const liquidOpacity = isDehydrated ? 0.8 : 0.9;

  // SVG Path for a simple human silhouette
  const humanPath = "M12 2C13.6569 2 15 3.34315 15 5C15 6.65685 13.6569 8 12 8C10.3431 8 9 6.65685 9 5C9 3.34315 10.3431 2 12 2ZM12 9C14.6667 9 19 10 19 13V15C19 15.5523 18.5523 16 18 16H17V21C17 21.5523 16.5523 22 16 22H14V17H10V22H8C7.44772 22 7 21.5523 7 21V16H6C5.44772 16 5 15.5523 5 15V13C5 10 9.33333 9 12 9Z";

  return (
    <div className="relative w-full h-48 flex items-center justify-center bg-zinc-950/50 rounded-xl border border-zinc-900 overflow-hidden p-4 group">
      
      <div className="relative w-24 h-40">
        {/* Background Silhouette (Empty) */}
        <svg viewBox="0 0 24 24" className="w-full h-full text-zinc-800 drop-shadow-lg">
           <path d={humanPath} fill="currentColor" />
        </svg>

        {/* Liquid Mask Container */}
        <div className="absolute inset-0 overflow-hidden">
             <svg viewBox="0 0 24 24" className="w-full h-full">
               <defs>
                  {/* Mask defined by the human shape */}
                  <mask id="humanMask">
                     <path d={humanPath} fill="white" />
                  </mask>
               </defs>

               {/* The Water Rect */}
               <g mask="url(#humanMask)">
                  {/* Animated Liquid Rect */}
                  <rect 
                    x="-10" 
                    y={24 - (24 * (percentage / 100))} 
                    width="50" 
                    height="30" 
                    fill={liquidColor} 
                    opacity={liquidOpacity}
                    className="transition-all duration-1000 ease-in-out"
                  >
                     {/* Add a subtle bobbing animation via CSS if desired, or rely on transition */}
                  </rect>
                  
                  {/* Surface Line / Wave */}
                  <path 
                     d="M0 0 Q 12 2, 24 0" 
                     stroke="white" 
                     strokeWidth="0.5" 
                     strokeOpacity="0.5"
                     fill="none"
                     className="animate-wave"
                     transform={`translate(0, ${24 - (24 * (percentage / 100))})`}
                  />
               </g>
             </svg>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-2 right-2 text-right">
         <div className="text-2xl font-bold font-mono text-white drop-shadow-md">
           {Math.round(percentage)}%
         </div>
         <div className="text-[10px] text-zinc-400 font-mono uppercase bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
           {waterIntake} Cups
         </div>
      </div>

      {/* Thirst Warning */}
      {isDehydrated && (
         <div className="absolute top-2 right-2 animate-pulse">
            <span className="text-xs font-bold text-yellow-500 bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/20">
               THIRSTY
            </span>
         </div>
      )}

      <div className="absolute top-2 left-2">
         <span className="text-[10px] text-zinc-600 font-mono">HYDRATION</span>
      </div>

    </div>
  );
};

export default HydrationHuman;