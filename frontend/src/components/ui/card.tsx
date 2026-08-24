import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { level?: 1 | 2 | 3; hoverEffect?: boolean }
>(({ className, level = 2, hoverEffect = true, ...props }, ref) => {
  const levelClass = {
    1: 'bg-[#FAF9F5] border border-[#E5E5DC] rounded-2xl shadow-none',
    2: 'bg-white border border-[#E5E5DC] rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.03)]',
    3: 'bg-gradient-to-br from-white via-[#FAF9F5] to-[#F5F3FF] border border-[#635BFF]/30 rounded-[26px] shadow-[0_8px_32px_rgba(99,91,255,0.08)]',
  }[level];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-300',
        levelClass,
        hoverEffect && 'hover:border-[#D1D1C7] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]',
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-bold leading-none tracking-tight text-[#171827] font-heading',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-[#667085] leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0 border-t border-[#E5E5DC] mt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
