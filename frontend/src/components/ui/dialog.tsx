import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  className,
  maxWidth = 'lg',
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Smooth Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Container */}
      <div
        className={cn(
          'relative w-full bg-white rounded-[28px] border border-[#E5E5DC] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-6 sm:p-8 z-10 transition-all duration-300 transform animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto',
          maxWidthClass,
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#E5E5DC] flex items-center justify-center text-[#667085] hover:text-[#171827] hover:bg-[#F0EEFF] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1.5 pb-4 border-b border-[#E5E5DC] mb-5', className)}
    {...props}
  />
);

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2
    className={cn('text-xl font-extrabold text-[#171827] font-heading tracking-tight', className)}
    {...props}
  />
);

const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn('text-xs text-[#667085] leading-relaxed', className)}
    {...props}
  />
);

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-[#E5E5DC] mt-6', className)}
    {...props}
  />
);

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
