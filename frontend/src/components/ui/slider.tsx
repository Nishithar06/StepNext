import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: React.ReactNode;
  hint?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueDisplay, hint, min = 0, max = 100, step = 1, value, onChange, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {(label || valueDisplay) && (
          <div className="flex items-center justify-between text-xs">
            {label && <span className="font-semibold text-[#171827]">{label}</span>}
            {valueDisplay !== undefined && (
              <span className="font-mono font-bold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-md">
                {valueDisplay}
              </span>
            )}
          </div>
        )}
        <div className="relative flex items-center select-none touch-none w-full">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className={cn(
              'w-full h-2 bg-[#E5E5DC] rounded-lg appearance-none cursor-pointer accent-[#635BFF] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 transition-all',
              className
            )}
            {...props}
          />
        </div>
        {hint && <p className="text-[11px] text-[#667085]">{hint}</p>}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
