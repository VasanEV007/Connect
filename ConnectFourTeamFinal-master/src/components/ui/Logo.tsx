import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  showCampusTag?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  showCampusTag = true,
  className = '',
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Geometric Connection Mark: Two linked nodes with bridging accent */}
      <div
        className={`${iconSizeClasses[size]} rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center p-1.5 shadow-xs transition-colors shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full"
        >
          {/* Connecting link bridge */}
          <line
            x1="6"
            y1="12"
            x2="18"
            y2="12"
            stroke="#798DA6"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle
            cx="12"
            cy="12"
            r="1.8"
            fill="#798DA6"
          />

          {/* Left Node: Burgundy Primary */}
          <circle
            cx="6"
            cy="12"
            r="3.8"
            fill="#490B1A"
            stroke="#E5DED2"
            strokeWidth="1.5"
          />

          {/* Right Node: Deep Navy / Cream Adaptive */}
          <circle
            cx="18"
            cy="12"
            r="3.8"
            fill="#142841"
            stroke="#798DA6"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {showWordmark && (
        <span className={`font-bold ${titleSizeClasses[size]} tracking-tight text-[var(--color-text-main)]`}>
          Connect
        </span>
      )}
    </div>
  );
};
