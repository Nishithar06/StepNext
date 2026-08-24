import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative w-full rounded-2xl border p-4 text-xs [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-[#FAF9F5] border-[#E5E5DC] text-[#171827]',
        destructive: 'border-[#FF4D4D]/30 bg-[#FF4D4D]/10 text-[#D84B3B] [&>svg]:text-[#D84B3B]',
        success: 'border-[#32C6A6]/30 bg-[#32C6A6]/10 text-[#158060] [&>svg]:text-[#158060]',
        warning: 'border-[#F5C96A]/40 bg-[#F5C96A]/15 text-[#A66F00] [&>svg]:text-[#A66F00]',
        indigo: 'border-[#635BFF]/30 bg-[#635BFF]/10 text-[#635BFF] [&>svg]:text-[#635BFF]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-bold leading-none tracking-tight font-heading', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-xs [&_p]:leading-relaxed text-inherit opacity-90', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
