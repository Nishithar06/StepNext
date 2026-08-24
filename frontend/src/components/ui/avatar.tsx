import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'away' | 'offline';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback = 'U', size = 'default', status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      default: 'w-10 h-10 text-sm',
      lg: 'w-14 h-14 text-lg',
      xl: 'w-20 h-20 text-2xl',
    }[size];

    const statusClasses = {
      online: 'bg-[#32C6A6]',
      busy: 'bg-[#FF7A6B]',
      away: 'bg-[#F5C96A]',
      offline: 'bg-[#98A2B3]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-[#635BFF]/10 to-[#8C84FF]/20 border border-[#635BFF]/20 text-[#635BFF] font-bold select-none shrink-0 shadow-sm',
          sizeClasses,
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-heading">{fallback}</span>
        )}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
              statusClasses[status]
            )}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
