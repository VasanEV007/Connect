import React from 'react';
import { UserRole } from '../../types';

interface UserAvatarProps {
  name: string;
  role?: UserRole;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRoleIndicator?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  role,
  size = 'md',
  className = '',
  showRoleIndicator = false,
}) => {
  // Extract up to 2 uppercase initials from the provided name
  const getInitials = (fullName: string): string => {
    if (!fullName || !fullName.trim()) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs font-semibold',
    lg: 'w-11 h-11 text-sm font-bold',
    xl: 'w-14 h-14 text-base font-bold',
  };

  const roleIndicatorColors: Record<UserRole, string> = {
    STUDENT: 'bg-[#798DA6]',
    FACULTY: 'bg-[#A16207]',
    ADMIN: 'bg-[#490B1A]',
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-main)] flex items-center justify-center font-mono tracking-wider select-none shadow-xs ${className}`}
        title={name}
        aria-label={name}
      >
        {initials}
      </div>

      {showRoleIndicator && role && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[var(--color-page-bg)] ${roleIndicatorColors[role]}`}
          title={`Role: ${role}`}
        />
      )}
    </div>
  );
};
