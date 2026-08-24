import React from 'react';

export interface BadgeProps {
  variant?: 'green' | 'amber' | 'red' | 'indigo' | 'neutral' | 'purple';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className = ''
}) => {
  const variantStyles = {
    green: 'bg-[#32C6A6]/10 text-[#219B81] border-[#32C6A6]/30',
    amber: 'bg-[#F5C96A]/15 text-[#B5861E] border-[#F5C96A]/40',
    red: 'bg-[#FF7A6B]/10 text-[#D84B3B] border-[#FF7A6B]/30',
    indigo: 'bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    neutral: 'bg-[#FAF9F5] text-[#171827] border-[#E5E5DC]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
