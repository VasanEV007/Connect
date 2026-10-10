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
    <div className="text-center py-12 sm:py-16 px-4 bg-[#11151B] rounded-2xl border border-[#27303D] space-y-3">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#171C24] border border-[#27303D] text-[#22C55E] mx-auto flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-bold text-sm sm:text-base text-white">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[#A1AAB8] max-w-sm mx-auto leading-relaxed">
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
              className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-xs shadow-md shadow-green-500/20 transition-all cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
