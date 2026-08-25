import React from 'react';

interface StepNextLogoProps {
  className?: string;
  height?: string;
  alt?: string;
}

export const StepNextLogo: React.FC<StepNextLogoProps> = ({
  className = '',
  height = 'h-16',
  alt = 'StepNext - Your next step, made clearer.'
}) => {
  return (
    <img
      src="/stepnext-logo.png"
      alt={alt}
      className={`w-auto object-contain ${height} ${className}`}
    />
  );
};
