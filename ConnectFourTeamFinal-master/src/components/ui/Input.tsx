import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const generatedId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={generatedId} 
          className="block text-xs font-semibold text-[var(--color-text-main)]"
        >
          {label} {required && <span className="text-[#490B1A] dark:text-rose-400 font-bold">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={generatedId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--color-surface)] transition-colors placeholder:text-[var(--color-text-subtle)] ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-rose-500 text-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500'
              : 'border-[var(--color-border)] text-[var(--color-text-main)] hover:border-[var(--color-blue-grey)] focus:ring-1 focus:ring-[var(--color-blue-grey)] focus:border-[#490B1A]'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] shrink-0">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${generatedId}-error`} className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${generatedId}-helper`} className="text-[11px] text-[var(--color-text-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
