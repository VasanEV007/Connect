import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const generatedId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

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

      <textarea
        ref={ref}
        id={generatedId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-[#07090E] transition-colors leading-relaxed placeholder:text-slate-500 ${
          error
            ? 'border-rose-500/80 text-rose-200 focus:ring-1 focus:ring-rose-500 focus:border-rose-500'
            : 'border-[#1E2433] text-slate-100 hover:border-[#2D3748] focus:ring-1 focus:ring-[#22C55E]/40 focus:border-[#22C55E]'
        } ${className}`}
        {...props}
      />

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

Textarea.displayName = 'Textarea';
