import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Post } from '../types';
import { UserAvatar } from './ui/UserAvatar';
import { X, Send, Lock, Users, MessageSquare, Shield } from 'lucide-react';

interface Props {
  post: Post | null;
  onClose: () => void;
}

export const GroupChatModal: React.FC<Props> = ({ post, onClose }) => {
  const { currentUser, messages, sendMessage, refreshMessages, canAccessChat, applications } = useApp();
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasAccess = post ? canAccessChat(post, currentUser?.id ?? '') : false;
  const postMessages = post ? messages.filter(m => m.post_id === post.id) : [];

  // Fetch latest messages from Supabase whenever chat is opened for this event
  useEffect(() => {
    if (post) {
      refreshMessages(post.id);
    }
  }, [post, refreshMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (post) {
      scrollToBottom();
    }
  }, [postMessages.length, post]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && post) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post, onClose]);

  if (!post) return null;

  // Accepted members in this chat
  const acceptedMembers = [
    {
      name: post.host_name,
      role: post.host_role,
      isHost: true,
      roll: undefined,
    },
    ...applications
      .filter(a => a.post_id === post.id && a.status === 'ACCEPTED')
      .map(a => ({
        name: a.applicant_name,
        role: 'STUDENT' as const,
        isHost: false,
        roll: a.applicant_roll,
      }))
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || !hasAccess) return;
    const textToSend = content.trim();
    setContent('');
    await sendMessage(post.id, textToSend);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Group coordination chat for ${post.title}`}
    >
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[750px] bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy/15 text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-burgundy)]/30 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--color-text-main)] line-clamp-1">
                  {post.title}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-burgundy/10 text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-burgundy)]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-burgundy)]" />
                  <Shield className="w-3 h-3" /> Scoped Room
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Host: <span className="font-semibold text-[var(--color-text-main)]">{post.host_name}</span> • {acceptedMembers.length} joined participants
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Chat Stream + Participant Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Message Stream */}
          <div className="flex-1 flex flex-col bg-[var(--color-surface)] overflow-hidden">
            
            {/* Scoped Security Banner */}
            <div className="px-4 py-2 bg-[var(--color-surface-card)] border-b border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-[var(--color-text-subtle)]" />
                End-to-End Scoped: Only approved members have read and write privileges.
              </span>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                Room #{post.id.slice(-6)}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {postMessages.length === 0 ? (
                <div className="text-center py-16 text-[var(--color-text-muted)] text-sm">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-[var(--color-text-muted)]" />
                  No messages yet. Say hello to kick off coordination!
                </div>
              ) : (
                postMessages.map((msg) => {
                  const isMe = currentUser ? msg.sender_id === currentUser.id : false;
                  const isHost = msg.sender_id === post.host_id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      {/* User Avatar */}
                      <UserAvatar name={msg.sender_name} role={msg.sender_role} size="sm" />

                      {/* Bubble */}
                      <div className={`space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-semibold text-[var(--color-text-main)]">
                            {msg.sender_name}
                          </span>
                          
                          {isHost && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-bold">
                              HOST
                            </span>
                          )}

                          {msg.sender_role === 'FACULTY' && (
                            <span className="px-1.5 py-0.2 rounded-full bg-burgundy/10 border border-[var(--color-burgundy)]/30 text-[var(--color-burgundy)] dark:text-[#E5DED2] text-[9px] font-bold">
                              FACULTY
                            </span>
                          )}

                          {msg.sender_roll && (
                            <span className="font-mono text-[9px] text-[var(--color-text-muted)]">
                              {msg.sender_roll}
                            </span>
                          )}

                          <span className="text-[10px] text-[var(--color-text-muted)] ml-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-[var(--color-burgundy)] text-[#E5DED2] font-medium rounded-tr-none shadow-md'
                            : 'bg-[var(--color-surface-card)] text-[var(--color-text-main)] rounded-tl-none border border-[var(--color-border)] shadow-xs'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-card)]">
              {hasAccess ? (
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message to coordinated team..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-burgundy)]"
                  />
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="p-2.5 rounded-xl bg-[var(--color-burgundy)] hover:opacity-95 disabled:opacity-40 text-[#E5DED2] font-bold transition-colors shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-2 text-xs text-amber-500 font-medium flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Read-only view. You must join or be approved by the host to chat.
                </div>
              )}
            </div>

          </div>

          {/* Members Sidebar */}
          <div className="hidden sm:flex w-64 border-l border-[var(--color-border)] bg-[var(--color-surface-card)] flex-col overflow-y-auto p-4">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              <Users className="w-4 h-4 text-[var(--color-text-subtle)]" />
              Team Roster ({acceptedMembers.length})
            </div>

            <div className="space-y-2">
              {acceptedMembers.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors">
                  <UserAvatar name={m.name} role={m.role} size="xs" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-[var(--color-text-main)] truncate">
                        {m.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate font-mono">
                      {m.isHost ? 'Event Host' : (m.roll || m.role)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]">
              <p className="font-semibold text-[var(--color-text-main)] mb-1">Event Venue:</p>
              <p className="text-xs text-[var(--color-text-muted)]">{post.venue_name}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
