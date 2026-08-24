import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#171827] text-white shadow hover:bg-[#171827]/80',
        secondary:
          'border-transparent bg-[#FAF9F5] text-[#171827] border border-[#E5E5DC]',
        destructive:
          'border-transparent bg-[#FF4D4D]/10 text-[#D84B3B] border border-[#FF4D4D]/20',
        outline: 'text-[#171827] border border-[#E5E5DC] bg-white',
        success: 'bg-[#32C6A6]/10 text-[#158060] border border-[#32C6A6]/30',
        warning: 'bg-[#F5C96A]/20 text-[#A66F00] border border-[#F5C96A]/40',
        indigo: 'bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/25',
        mint: 'bg-[#32C6A6]/15 text-[#158060] border border-[#32C6A6]/30',
        purple: 'bg-[#8C84FF]/15 text-[#5B4EFF] border border-[#8C84FF]/30',
      },
      size: {
        default: 'text-xs px-2.5 py-0.5',
        sm: 'text-[10px] px-2 py-0.2',
        lg: 'text-sm px-3.5 py-1',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, size, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5 inline-block animate-pulse',
            dotColor || 'bg-current'
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
