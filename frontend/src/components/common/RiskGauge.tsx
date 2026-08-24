import React from 'react';

interface RiskGaugeProps {
  score: number;
  level: string;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level, size = 160 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Semi-circle arc
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (levelStr: string) => {
    switch (levelStr.toLowerCase()) {
      case 'low': return '#32C6A6'; // Mint / Success
      case 'moderate': return '#F5C96A'; // Soft Yellow / Warning
      case 'high':
      case 'critical': return '#FF7A6B'; // Coral / Danger
      default: return '#F5C96A';
    }
  };

  const color = getColor(level);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size / 1.8 }}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          stroke="#E5E5DC"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {/* Progress Arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-[#171827] font-mono font-heading leading-none">
          {score}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] mt-0.5">
          / 100 OVERLOAD
        </span>
      </div>
    </div>
  );
};
