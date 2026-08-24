import React from 'react';

interface LifeOrbitProps {
  userName?: string;
  userGoal?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LifeOrbit: React.FC<LifeOrbitProps> = ({
  userName = 'Alex',
  userGoal = 'AI Engineer',
  size = 'md'
}) => {
  const nodeNodes = [
    { label: 'Career', color: 'bg-[#5850EC]', textColor: 'text-[#5850EC]', border: 'border-[#5850EC]/20', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-3' },
    { label: 'Skills', color: 'bg-[#10B981]', textColor: 'text-[#10B981]', border: 'border-[#10B981]/20', pos: 'right-0 top-1/2 translate-x-3 -translate-y-1/2' },
    { label: 'Energy', color: 'bg-[#F43F5E]', textColor: 'text-[#F43F5E]', border: 'border-[#F43F5E]/20', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-3' },
    { label: 'Trajectory', color: 'bg-[#F59E0B]', textColor: 'text-[#D97706]', border: 'border-[#F59E0B]/20', pos: 'left-0 top-1/2 -translate-x-3 -translate-y-1/2' }
  ];

  return (
    <div className="relative flex items-center justify-center p-6 my-auto">
      {/* SVG Orbital Track with Luminous Gradients */}
      <svg className="w-64 h-64 text-slate-200" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5850EC" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5850EC" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.7" />
        <circle cx="100" cy="100" r="52" stroke="url(#orbitGrad)" strokeWidth="1.5" />
        
        {/* Directional trajectory glow arc */}
        <path d="M100 18 A82 82 0 0 1 182 100" stroke="#5850EC" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
        <circle cx="182" cy="100" r="4" fill="#5850EC" className="animate-ping" opacity="0.75" />
        <circle cx="182" cy="100" r="3.5" fill="#5850EC" />
      </svg>

      {/* Central Identity Node */}
      <div className="absolute flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.06),0_0_0_1px_rgba(99,102,241,0.1)] text-center p-3 z-10 hover:scale-105 transition-transform duration-300">
        <span className="text-[9px] font-mono uppercase font-bold tracking-[0.18em] text-[#5850EC]">DIGITAL TWIN</span>
        <span className="text-base font-extrabold text-[#0F172A] font-heading mt-0.5">{userName}</span>
        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[100px] mt-0.5">{userGoal}</span>
      </div>

      {/* Floating Orbit Nodes with Glass effect */}
      {nodeNodes.map((node, idx) => (
        <div
          key={idx}
          className={`absolute flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border ${node.border} shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[11px] font-semibold ${node.pos} hover:scale-110 transition-transform duration-200 select-none`}
        >
          <span className={`w-2 h-2 rounded-full ${node.color} animate-pulse`} />
          <span className={node.textColor}>{node.label}</span>
        </div>
      ))}
    </div>
  );
};
