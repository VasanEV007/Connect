import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  children,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

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

      <select
        ref={ref}
        id={generatedId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--color-surface)] transition-colors ${
          error
            ? 'border-rose-500 text-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500'
            : 'border-[var(--color-border)] text-[var(--color-text-main)] hover:border-[var(--color-blue-grey)] focus:ring-1 focus:ring-[var(--color-blue-grey)] focus:border-[#490B1A]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>

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

Select.displayName = 'Select';
