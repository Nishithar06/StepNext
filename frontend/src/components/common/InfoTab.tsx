import React from 'react';

export interface InfoTabProps {
  label?: string;
  icon?: React.ReactNode;
  value?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: 'neutral' | 'indigo' | 'green' | 'amber' | 'red' | 'purple';
  layout?: 'inline' | 'stacked' | 'auto';
  className?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  neutral: 'bg-[#FAF9F5] border-[#E5E5DC] text-[#171827]',
  indigo: 'bg-[#635BFF]/5 border-[#635BFF]/30 text-[#171827]',
  green: 'bg-[#32C6A6]/10 border-[#32C6A6]/30 text-[#171827]',
  amber: 'bg-[#F5C96A]/10 border-[#F5C96A]/40 text-[#171827]',
  red: 'bg-[#FF7A6B]/10 border-[#FF7A6B]/30 text-[#171827]',
  purple: 'bg-[#F0EEFF] border-[#635BFF]/20 text-[#171827]'
};

const labelVariantStyles: Record<string, string> = {
  neutral: 'text-[#667085]',
  indigo: 'text-[#635BFF]',
  green: 'text-[#219B81]',
  amber: 'text-[#D97706]',
  red: 'text-[#D84B3B]',
  purple: 'text-[#635BFF]'
};

export const InfoTab: React.FC<InfoTabProps> = ({
  label,
  icon,
  value,
  badge,
  variant = 'neutral',
  layout = 'auto',
  className = '',
  children
}) => {
  const content = value || children;
  const isStacked = layout === 'stacked';
  const isInline = layout === 'inline';

  return (
    <div
      className={`w-full min-w-0 rounded-2xl border p-3.5 sm:px-5 sm:py-3.5 transition-all duration-200 box-border light-card-shadow ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {isInline ? (
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 w-full min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {icon && <span className="shrink-0">{icon}</span>}
            {label && (
              <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 ${labelVariantStyles[variant]}`}>
                {label}{label.endsWith(':') ? '' : ':'}
              </span>
            )}
            {content && (
              <div className="text-xs font-medium min-w-0 flex-1 whitespace-normal break-words leading-relaxed">
                {content}
              </div>
            )}
          </div>
          {badge && <div className="shrink-0 whitespace-nowrap self-start sm:self-center">{badge}</div>}
        </div>
      ) : isStacked ? (
        <div className="space-y-1.5 w-full min-w-0">
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {icon && <span className="shrink-0">{icon}</span>}
              {label && (
                <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider block ${labelVariantStyles[variant]}`}>
                  {label}
                </span>
              )}
            </div>
            {badge && <div className="shrink-0 whitespace-nowrap">{badge}</div>}
          </div>
          {content && (
            <div className="text-xs font-medium text-[#171827] whitespace-normal break-words leading-relaxed min-w-0">
              {content}
            </div>
          )}
        </div>
      ) : (
        /* Auto responsive layout: inline label on desktop, stacks gracefully on mobile or if text wraps */
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              {icon && <span className="shrink-0">{icon}</span>}
              {label && (
                <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 ${labelVariantStyles[variant]}`}>
                  {label}{label.endsWith(':') ? '' : ':'}
                </span>
              )}
            </div>
            {content && (
              <div className="text-xs font-medium text-[#171827] whitespace-normal break-words leading-relaxed min-w-0 flex-1">
                {content}
              </div>
            )}
          </div>
          {badge && <div className="shrink-0 whitespace-nowrap self-start sm:self-center mt-1 sm:mt-0">{badge}</div>}
        </div>
      )}
    </div>
  );
};
