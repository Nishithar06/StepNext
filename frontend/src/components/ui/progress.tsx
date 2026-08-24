import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorColor?: string;
  size?: 'sm' | 'default' | 'lg';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorColor, size = 'default', ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const heightClass = {
      sm: 'h-1.5',
      default: 'h-2.5',
      lg: 'h-3.5',
    }[size];

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-[#E5E5DC]/70',
          heightClass,
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            indicatorColor || 'bg-gradient-to-r from-[#635BFF] to-[#8C84FF]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
