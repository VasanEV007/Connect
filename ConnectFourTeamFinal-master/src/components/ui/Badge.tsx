import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide transition-colors shrink-0';

  const sizeStyles = {
    sm: 'text-[10px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
  }[size];

  const variantStyles = {
    default: 'bg-[#141824] text-slate-300 border border-[#222738]',
    primary: 'bg-[#0D331B] text-[#4ADE80] border border-green-500/30',
    success: 'bg-[#0D331B] text-[#4ADE80] border border-green-500/30',
    warning: 'bg-[#382A0E] text-[#FBBF24] border border-amber-500/30',
    error: 'bg-[#3B1214] text-[#F87171] border border-rose-500/30',
    outline: 'border border-[#232B3E] text-slate-300 bg-[#0E121A]',
  }[variant];

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-[#22C55E]',
    success: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    error: 'bg-[#EF4444]',
    outline: 'bg-slate-400',
  }[variant];

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors} shrink-0 animate-pulse`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
