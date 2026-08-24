import React from 'react';
import stepNextLogoAsset from '../../assets/stepnext-logo.svg';

interface StepNextLogoProps {
  className?: string;
  height?: string;
}

export const StepNextLogo: React.FC<StepNextLogoProps> = ({
  className = '',
  height = 'h-[54px]'
}) => {
  return (
    <img
      src={stepNextLogoAsset}
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src !== '/stepnext-logo.svg') {
          target.src = '/stepnext-logo.svg';
        }
      }}
      alt="StepNext — Your next step, made clearer."
      className={`${height} w-auto object-contain max-w-full shrink-0 ${className}`}
    />
  );
};
