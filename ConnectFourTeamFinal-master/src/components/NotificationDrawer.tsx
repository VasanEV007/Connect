import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Bell, 
  Check, 
  CheckCheck, 
  Mail, 
  Award, 
  Clock, 
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    acceptInvite, 
    declineInvite, 
    setSelectedODSlipForView, 
    odSlips, 
    posts, 
    setSelectedPostForDetail, 
    setSelectedPostForChat 
  } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Notifications belonging to current user
  const userNotifications = currentUser ? notifications.filter(n => n.user_id === currentUser.id) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-drawer-title"
    >
      <div className="relative w-full max-w-md h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col overflow-hidden text-[var(--color-text-main)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-burgundy/15 text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-burgundy)]/30 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 id="notification-drawer-title" className="text-base font-bold text-[var(--color-text-main)]">
                Notifications
              </h2>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-[var(--color-burgundy)] dark:text-[#E5DED2] bg-burgundy/10 border border-[var(--color-burgundy)]/30 hover:bg-burgundy/20 transition-colors flex items-center gap-1 cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close notification drawer"
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userNotifications.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-text-muted)] text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30 text-[var(--color-text-muted)]" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            userNotifications.map((notif) => {
              const relatedPost = posts.find(p => p.id === notif.related_post_id);
              const relatedSlip = odSlips.find(s => s.id === notif.action_data?.od_id);

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
                    !notif.read
                      ? 'border-[var(--color-burgundy)]/40 bg-[var(--color-surface-card)] shadow-xs'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {notif.type === 'APP_APPROVED' && <Check className="w-4 h-4 text-[var(--color-burgundy)]" />}
                      {notif.type === 'APP_REJECTED' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                      {notif.type === 'INVITE_RECEIVED' && <Mail className="w-4 h-4 text-[var(--color-burgundy)]" />}
                      {notif.type === 'OD_GENERATED' && <Award className="w-4 h-4 text-amber-500" />}
                      {notif.type === 'APP_SUBMITTED' && <Clock className="w-4 h-4 text-sky-500" />}
                      <h4 className="font-bold text-[var(--color-text-main)]">
                        {notif.title}
                      </h4>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-[10px] text-[var(--color-burgundy)] dark:text-[#E5DED2] hover:underline shrink-0 cursor-pointer font-semibold"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <p className="text-[var(--color-text-muted)] leading-relaxed text-[11px]">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)]">
                    <span>
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Contextual Action Buttons */}
                  {notif.type === 'INVITE_RECEIVED' && notif.related_post_id && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => acceptInvite(notif.id, notif.related_post_id!)}
                        className="flex-1 py-1.5 px-3 rounded-full bg-[var(--color-burgundy)] hover:opacity-95 text-[#E5DED2] font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Accept Invite
                      </button>
                      <button
                        onClick={() => declineInvite(notif.id)}
                        className="py-1.5 px-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] text-[11px] font-semibold cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {notif.type === 'OD_GENERATED' && relatedSlip && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setSelectedODSlipForView(relatedSlip);
                          onClose();
                        }}
                        className="w-full py-1.5 px-3 rounded-full bg-burgundy/10 border border-[var(--color-burgundy)] hover:bg-burgundy/20 text-[var(--color-burgundy)] dark:text-[#E5DED2] font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        View & Print Official OD Slip
                      </button>
                    </div>
                  )}

                  {(notif.type === 'APP_APPROVED' || notif.type === 'APP_SUBMITTED') && relatedPost && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedPostForDetail(relatedPost);
                          onClose();
                        }}
                        className="flex-1 py-1 px-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] text-[11px] font-semibold cursor-pointer"
                      >
                        View Event
                      </button>
                      {notif.type === 'APP_APPROVED' && (
                        <button
                          onClick={() => {
                            setSelectedPostForChat(relatedPost);
                            onClose();
                          }}
                          className="flex-1 py-1 px-2.5 rounded-full bg-[var(--color-burgundy)] hover:opacity-95 text-[#E5DED2] font-bold text-[11px] cursor-pointer"
                        >
                          Open Chat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
