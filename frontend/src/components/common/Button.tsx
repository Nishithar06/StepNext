import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[#635BFF] hover:bg-[#5046E5] text-white shadow-sm shadow-[#635BFF]/20 active:scale-[0.98]',
    secondary: 'bg-white hover:bg-[#FAF9F5] text-[#171827] border border-[#E5E5DC] light-card-shadow active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-[#FAF9F5] text-[#667085] hover:text-[#171827]',
    danger: 'bg-[#FF7A6B] hover:bg-[#E06456] text-white shadow-sm shadow-[#FF7A6B]/20'
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
