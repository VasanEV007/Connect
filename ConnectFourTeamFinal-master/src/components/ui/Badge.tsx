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
    default: 'bg-[var(--color-surface-hover)] text-[var(--color-text-main)] border border-[var(--color-border)]',
    primary: 'bg-[#490B1A]/15 text-[#490B1A] dark:text-[#E5DED2] border border-[#490B1A]/40',
    success: 'bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-950/20 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    error: 'bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-500/30',
    outline: 'border border-[var(--color-border)] text-[var(--color-text-muted)] bg-transparent',
  }[variant];

  const dotColors = {
    default: 'bg-[var(--color-text-subtle)]',
    primary: 'bg-[#490B1A] dark:bg-[#E5DED2]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    outline: 'bg-[var(--color-text-subtle)]',
  }[variant];

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
