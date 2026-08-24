import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#635BFF] text-white hover:bg-[#5249ea] shadow-sm hover:shadow-md hover:shadow-[#635BFF]/20',
        destructive: 'bg-[#FF4D4D] text-white hover:bg-[#e03838] shadow-sm',
        outline: 'border border-[#E5E5DC] bg-white hover:bg-[#FAF9F5] hover:border-[#D1D1C7] text-[#171827]',
        secondary: 'bg-[#FAF9F5] text-[#171827] hover:bg-[#F0EEFF] border border-[#E5E5DC]',
        ghost: 'hover:bg-[#F0EEFF] text-[#667085] hover:text-[#171827]',
        link: 'text-[#635BFF] underline-offset-4 hover:underline p-0 h-auto',
        gradient: 'bg-gradient-to-r from-[#635BFF] to-[#8C84FF] text-white hover:opacity-95 shadow-md hover:shadow-lg hover:shadow-[#635BFF]/25',
        mint: 'bg-[#32C6A6] text-white hover:bg-[#2bb294] shadow-sm hover:shadow-[#32C6A6]/25',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-6 text-base font-bold',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
