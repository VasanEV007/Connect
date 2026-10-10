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
      {/* Reusable Linked-Nodes Collaboration Symbol */}
      <div
        className={`${iconSizeClasses[size]} rounded-xl bg-[#11151B] border border-[#27303D] text-[#22C55E] flex items-center justify-center p-1.5 shadow-sm shadow-green-500/10 group-hover:border-[#22C55E]/60 transition-colors shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Connection links */}
          <line x1="6.5" y1="12" x2="17.5" y2="6.5" stroke="#27303D" strokeWidth="1.8" />
          <line x1="6.5" y1="12" x2="17.5" y2="17.5" stroke="#27303D" strokeWidth="1.8" />
          <line x1="17.5" y1="6.5" x2="17.5" y2="17.5" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2 2" />
          
          {/* Nodes */}
          <circle cx="6.5" cy="12" r="3.2" fill="#22C55E" stroke="#11151B" strokeWidth="1.5" />
          <circle cx="17.5" cy="6.5" r="2.8" fill="#F8FAFC" stroke="#11151B" strokeWidth="1.5" />
          <circle cx="17.5" cy="17.5" r="2.8" fill="#22C55E" stroke="#11151B" strokeWidth="1.5" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${titleSizeClasses[size]} tracking-tight text-[#F8FAFC]`}>
              Connect
            </span>
            {showCampusTag && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase bg-[#171C24] text-[#22C55E] border border-[#27303D]">
                Amrita
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#A1AAB8] font-medium leading-none hidden sm:block">
            Connect with people. Discover opportunities. Build together.
          </span>
        </div>
      )}
    </div>
  );
};
