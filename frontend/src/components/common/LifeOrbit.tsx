import React from 'react';

interface LifeOrbitProps {
  userName?: string;
  userGoal?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LifeOrbit: React.FC<LifeOrbitProps> = ({
  userName = 'Alex',
  userGoal = 'Senior AI Engineer',
  size = 'md'
}) => {
  const nodeNodes = [
    { label: 'Career', color: 'bg-[#635BFF]', textColor: 'text-[#635BFF]', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-3' },
    { label: 'Skills', color: 'bg-[#32C6A6]', textColor: 'text-[#32C6A6]', pos: 'right-0 top-1/2 translate-x-3 -translate-y-1/2' },
    { label: 'Energy', color: 'bg-[#FF7A6B]', textColor: 'text-[#FF7A6B]', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-3' },
    { label: 'Goals', color: 'bg-[#F5C96A]', textColor: 'text-[#E5B54A]', pos: 'left-0 top-1/2 -translate-x-3 -translate-y-1/2' }
  ];

  return (
    <div className="relative flex items-center justify-center p-6 my-auto">
      {/* SVG Orbital Track */}
      <svg className="w-56 h-56 text-[#E5E5DC]" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="45" stroke="#635BFF" strokeWidth="1" strokeOpacity="0.2" />
        {/* Directional trajectory arrow */}
        <path d="M100 25 A75 75 0 0 1 175 100" stroke="#635BFF" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="175" cy="100" r="3" fill="#635BFF" />
      </svg>

      {/* Central Identity Node */}
      <div className="absolute flex flex-col items-center justify-center w-28 h-28 rounded-full bg-white border border-[#E5E5DC] light-card-shadow text-center p-2 z-10">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#635BFF]">YOU</span>
        <span className="text-sm font-bold text-[#171827] font-heading">{userName}</span>
        <span className="text-[9px] text-[#667085] truncate max-w-[90px]">{userGoal}</span>
      </div>

      {/* Floating Orbit Nodes */}
      {nodeNodes.map((node, idx) => (
        <div
          key={idx}
          className={`absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E5E5DC] shadow-sm text-[11px] font-semibold ${node.pos} orbit-node`}
        >
          <span className={`w-2 h-2 rounded-full ${node.color}`} />
          <span className={node.textColor}>{node.label}</span>
        </div>
      ))}
    </div>
  );
};
