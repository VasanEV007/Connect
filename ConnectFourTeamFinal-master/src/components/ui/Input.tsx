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
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={generatedId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-[#07090E] transition-colors placeholder:text-slate-500 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-rose-500/80 text-rose-200 focus:ring-1 focus:ring-rose-500 focus:border-rose-500'
              : 'border-[#1E2433] text-slate-100 hover:border-[#2D3748] focus:ring-1 focus:ring-[#22C55E]/40 focus:border-[#22C55E]'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 shrink-0">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${generatedId}-error`} className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${generatedId}-helper`} className="text-[11px] text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
