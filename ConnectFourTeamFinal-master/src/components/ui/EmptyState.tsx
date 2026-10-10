import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-12 sm:py-16 px-4 bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border)] space-y-3 transition-colors">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-primary)] mx-auto flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-bold text-sm sm:text-base text-[var(--color-text-main)]">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {(action || (actionLabel && onAction)) && (
        <div className="pt-2">
          {action ? (
            action
          ) : (
            <button
              onClick={onAction}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] font-bold text-xs border border-[#798DA6]/40 shadow-xs transition-all cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
