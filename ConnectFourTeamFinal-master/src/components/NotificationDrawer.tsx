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
      <div className="relative w-full max-w-md h-full bg-[#0D1017] border-l border-[#1E2433] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2433] bg-[#0A0D14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 id="notification-drawer-title" className="text-base font-bold text-white">
                Notifications
              </h2>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 hover:bg-[#22C55E]/20 transition-colors flex items-center gap-1"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close notification drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#131722] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userNotifications.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
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
                      ? 'border-[#22C55E]/40 bg-[#07090E] shadow-sm'
                      : 'border-[#1E2433] bg-[#0A0D14]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {notif.type === 'APP_APPROVED' && <Check className="w-4 h-4 text-[#22C55E]" />}
                      {notif.type === 'APP_REJECTED' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                      {notif.type === 'INVITE_RECEIVED' && <Mail className="w-4 h-4 text-[#22C55E]" />}
                      {notif.type === 'OD_GENERATED' && <Award className="w-4 h-4 text-amber-400" />}
                      {notif.type === 'APP_SUBMITTED' && <Clock className="w-4 h-4 text-sky-400" />}
                      <h4 className="font-bold text-white">
                        {notif.title}
                      </h4>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-[10px] text-[#22C55E] hover:underline shrink-0"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#1E2433] text-[10px] text-slate-500">
                    <span>
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Contextual Action Buttons */}
                  {notif.type === 'INVITE_RECEIVED' && notif.related_post_id && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => acceptInvite(notif.id, notif.related_post_id!)}
                        className="flex-1 py-1.5 px-3 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-[11px] transition-colors"
                      >
                        Accept Invite
                      </button>
                      <button
                        onClick={() => declineInvite(notif.id)}
                        className="py-1.5 px-3 rounded-full border border-[#232B3C] bg-[#131722] text-slate-300 hover:text-white text-[11px] font-semibold"
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
                        className="w-full py-1.5 px-3 rounded-full bg-[#22C55E]/10 border border-[#22C55E] hover:bg-[#22C55E]/20 text-[#22C55E] font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs"
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
                        className="flex-1 py-1 px-2.5 rounded-full border border-[#232B3C] bg-[#131722] hover:bg-[#1A202F] text-slate-300 text-[11px] font-semibold"
                      >
                        View Event
                      </button>
                      {notif.type === 'APP_APPROVED' && (
                        <button
                          onClick={() => {
                            setSelectedPostForChat(relatedPost);
                            onClose();
                          }}
                          className="flex-1 py-1 px-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-[11px]"
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
