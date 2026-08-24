import React from 'react';

interface ProgressBarProps {
  label?: string;
  value: number;
  max?: number;
  color?: string;
  showPercentage?: boolean;
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  color = 'bg-[#635BFF]',
  showPercentage = true,
  height = 'h-2'
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className="space-y-1.5 w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs text-[#171827]">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="font-mono text-[#667085] font-bold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#E5E5DC] ${height} rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-600 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
