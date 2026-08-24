import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  level?: 1 | 2 | 3;
  activeBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  level = 2,
  activeBorder = false,
  className = '',
  ...props
}) => {
  const levelStyles = {
    1: 'bg-[#FAF9F5] border border-[#E5E5DC] rounded-xl p-4',
    2: 'bg-white border border-[#E5E5DC] rounded-[18px] light-card-shadow p-5',
    3: 'bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/30 rounded-[24px] light-card-shadow p-6'
  };

  return (
    <div
      className={`${levelStyles[level]} ${
        activeBorder ? 'border-[#635BFF] ring-2 ring-[#635BFF]/20 shadow-md' : 'hover:border-[#D1D1C7]'
      } transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E5DC]">
          <div>
            {title && <h3 className="text-sm font-bold text-[#171827] font-heading">{title}</h3>}
            {subtitle && <p className="text-xs text-[#667085] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
