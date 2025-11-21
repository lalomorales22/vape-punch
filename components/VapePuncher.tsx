import React, { useState } from 'react';

interface VapePuncherProps {
  onPunch: () => void;
  label: string;
  color?: 'red' | 'emerald';
  size?: 'normal' | 'small';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rX: number; // Random X movement factor
  emoji: string;
}

const VapePuncher: React.FC<VapePuncherProps> = ({ onPunch, label, color = 'red', size = 'normal' }) => {
  const [isPunched, setIsPunched] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    if (isPunched) return;
    setIsPunched(true);
    onPunch();

    // Visual Effects logic
    if (color === 'emerald') {
      // Spawn Love Particles
      const newParticles: Particle[] = [];
      const emojis = ['❤️', '💖', '✨', '💪', '😤', '🔥', '🧘', '🔋', '🌟'];
      
      // More particles for resistance
      for (let i = 0; i < 18; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: Math.random() * 60 - 30, // Start position variance
          y: Math.random() * -20,
          rX: Math.random() * 100 - 50, // Drift amount
          emoji: emojis[Math.floor(Math.random() * emojis.length)]
        });
      }
      setParticles(prev => [...prev, ...newParticles]);
      
      // Cleanup particles
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.includes(p)));
      }, 1500);
    }

    setTimeout(() => setIsPunched(false), color === 'red' ? 400 : 400);
  };

  // Dimensions based on size
  const dimClass = size === 'small' ? 'w-20 h-20' : 'w-32 h-32';
  const marginClass = size === 'small' ? 'my-4' : 'my-8';
  // The box depth must be half of the width to form a cube.
  // w-32 = 8rem = 128px -> half is 64px
  // w-20 = 5rem = 80px -> half is 40px
  const HALF_SIZE = size === 'small' ? '40px' : '64px';
  const fontSize = size === 'small' ? 'text-xs' : 'text-xl';

  // Colors
  const faceColor = color === 'red' ? 'bg-red-600' : 'bg-emerald-600';
  const sideColor = color === 'red' ? 'bg-red-800' : 'bg-emerald-800';
  const topColor = color === 'red' ? 'bg-red-500' : 'bg-emerald-500';
  const glowColor = color === 'red' ? 'group-hover:shadow-[0_0_50px_rgba(239,68,68,0.6)]' : 'group-hover:shadow-[0_0_50px_rgba(16,185,129,0.6)]';
  
  // Animations
  // Default pose is slightly rotated to show 3D depth immediately
  const defaultPose = 'rotate-x-[-20deg] rotate-y-[25deg]';
  const hoverPose = 'group-hover:rotate-x-[-10deg] group-hover:rotate-y-[45deg]';

  const punchAnimation = isPunched 
    ? (color === 'red' ? 'animate-violent-shake' : 'scale-90 rotate-x-12 duration-200 ease-out') 
    : `${defaultPose} ${hoverPose}`;

  return (
    <div className={`relative ${dimClass} group cursor-pointer perspective-1000 select-none ${marginClass}`} onClick={handleClick}>
      
      {/* Particles Container */}
      <div className="absolute inset-0 pointer-events-none z-50 flex justify-center items-center" style={{ transform: 'translateZ(100px)' }}>
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute text-2xl animate-flutter"
            style={{ 
              left: `calc(50% + ${p.x}px)`, 
              top: `calc(50% + ${p.y}px)`,
              '--tw-translate-x': `${p.rX}px`
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Container for the Cube */}
      <div 
        className={`relative w-full h-full transition-transform duration-300 ease-out transform-style-3d ${punchAnimation}`}
      >
        {/* Flash Effect for Red */}
        {color === 'red' && isPunched && (
            <div className="absolute -inset-12 bg-white animate-flash rounded-full z-50 blur-2xl pointer-events-none mix-blend-overlay"></div>
        )}

        {/* Front Face */}
        <div className={`absolute w-full h-full ${faceColor} ${glowColor} transition-shadow duration-300 flex items-center justify-center text-white font-bold ${fontSize} tracking-tighter border-2 border-black/20 overflow-hidden backface-hidden`}
             style={{ transform: `translateZ(${HALF_SIZE})` }}>
          {isPunched ? (color === 'red' ? 'DAMAGED' : 'NICE!') : label}
          
          {/* Cracks SVG for red */}
          {color === 'red' && (
             <svg className={`absolute inset-0 w-full h-full transition-opacity duration-100 ${isPunched ? 'opacity-80' : 'opacity-0'}`} viewBox="0 0 100 100">
               <path d="M10,10 L40,40 M90,10 L60,40 M50,50 L50,90 M10,90 L30,70 M20,20 L80,80" stroke="black" strokeWidth="4" strokeLinecap="round" />
               <path d="M90,90 L10,10" stroke="black" strokeWidth="2" strokeDasharray="5,5" />
             </svg>
          )}
        </div>
        
        {/* Back Face */}
        <div className={`absolute w-full h-full ${sideColor} opacity-80 border border-black/20`}
             style={{ transform: `rotateY(180deg) translateZ(${HALF_SIZE})` }}></div>

        {/* Right Face */}
        <div className={`absolute w-full h-full ${sideColor} border-l border-black/20 flex items-center justify-center`}
             style={{ transform: `rotateY(90deg) translateZ(${HALF_SIZE})` }}>
             <div className="w-2 h-full bg-black/10 absolute left-4"></div>
        </div>

        {/* Left Face */}
        <div className={`absolute w-full h-full ${sideColor} border-r border-black/20`}
             style={{ transform: `rotateY(-90deg) translateZ(${HALF_SIZE})` }}></div>

        {/* Top Face */}
        <div className={`absolute w-full h-full ${topColor} border-b border-black/20 flex items-center justify-center`}
             style={{ transform: `rotateX(90deg) translateZ(${HALF_SIZE})` }}>
             <div className={`rounded-full bg-black/20 blur-md ${size === 'small' ? 'w-4 h-4' : 'w-8 h-8'}`}></div>
        </div>

        {/* Bottom Face */}
        <div className={`absolute w-full h-full ${sideColor}`}
             style={{ transform: `rotateX(-90deg) translateZ(${HALF_SIZE})` }}></div>
      </div>
      
      {/* Shadow beneath the cube */}
      <div className={`absolute -bottom-16 left-1/2 bg-black/50 blur-xl rounded-[100%] transform -translate-x-1/2 rotate-x-[60deg] ${size === 'small' ? 'w-16 h-4 -bottom-10' : 'w-24 h-8'}`}></div>

      <div className={`absolute left-1/2 transform -translate-x-1/2 text-center opacity-50 group-hover:opacity-100 transition-opacity text-[10px] ${color === 'red' ? 'text-red-500' : 'text-emerald-500'} font-mono pointer-events-none whitespace-nowrap tracking-widest ${size === 'small' ? '-bottom-8' : '-bottom-14'}`}>
        {color === 'red' ? '[DESTROY]' : '[BUILD]'}
      </div>
    </div>
  );
};

export default VapePuncher;