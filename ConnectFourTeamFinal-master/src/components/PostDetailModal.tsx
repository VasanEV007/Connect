import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Post } from '../types';
import { ClashDetail } from '../utils/clashDetector';
import { UserAvatar } from './ui/UserAvatar';
import { Badge } from './ui/Badge';
import { isPostHost } from '../utils/security';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Briefcase,
  ShieldCheck,
  Sparkles,
  DollarSign,
  MessageSquare,
  Send,
  Check,
  UserCheck,
  Trash2,
  XCircle
} from 'lucide-react';

interface Props {
  post: Post | null;
  onClose: () => void;
}

export const PostDetailModal: React.FC<Props> = ({ post, onClose }) => {
  const { 
    currentUser, 
    joinPost, 
    deletePost,
    cancelEventParticipation,
    reviewApplication,
    applications, 
    checkScheduleClash, 
    setSelectedPostForChat, 
    setIsMapModalOpen 
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [applicantNote, setApplicantNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);
  const [hostReviewFeedback, setHostReviewFeedback] = useState<{ appId: string; type: 'success' | 'error'; message: string } | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const isHost = isPostHost(currentUser, post);
  const existingApp = currentUser ? applications.find(a => a.post_id === post.id && a.applicant_id === currentUser.id) : undefined;
  const isAccepted = existingApp?.status === 'ACCEPTED';
  const isPending = existingApp?.status === 'PENDING';
  const isRejected = existingApp?.status === 'REJECTED';
  const isFull = post.filled_slots >= post.total_slots;

  const postPendingApps = applications.filter(a => a.post_id === post.id && a.status === 'PENDING');
  const postAcceptedApps = applications.filter(a => a.post_id === post.id && a.status === 'ACCEPTED');

  const handleReview = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setReviewingAppId(appId);
    setHostReviewFeedback(null);
    try {
      const res = await reviewApplication(appId, status);
      if (res.success) {
        setHostReviewFeedback({ appId, type: 'success', message: res.message });
      } else {
        setHostReviewFeedback({ appId, type: 'error', message: res.message });
      }
    } catch (err: any) {
      setHostReviewFeedback({ appId, type: 'error', message: err.message || 'Action failed' });
    } finally {
      setReviewingAppId(null);
    }
  };

  // Eligibility check
  const deptEligible = !currentUser || post.eligible_departments.includes('ANY') || 
    (currentUser.department && post.eligible_departments.some(d => currentUser.department?.toUpperCase().includes(d.toUpperCase())));
  
  const yearEligible = !currentUser || post.eligible_years.length === 0 || 
    (currentUser.joining_year && post.eligible_years.includes(currentUser.joining_year));
  
  const isEligible = deptEligible && yearEligible;

  // Clash check
  const clash: ClashDetail = currentUser 
    ? checkScheduleClash(post.start_time, post.end_time, post.id) 
    : { hasClash: false, severity: 'NONE' };

  const handleJoinOrApply = async () => {
    setIsSubmitting(true);
    setSubmitFeedback(null);
    try {
      const res = await joinPost(post.id, selectedRole || undefined, applicantNote || undefined);
      if (res.success) {
        setSubmitFeedback({ type: 'success', message: res.message });
      } else {
        setSubmitFeedback({ type: 'error', message: res.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`post-detail-title-${post.id}`}
    >
      <div className="relative w-full max-w-3xl bg-[var(--color-surface-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[92vh] overflow-hidden text-[var(--color-text-main)]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                {post.category.replace('_', ' ')}
              </span>

              {post.join_mode === 'UNLOCKED' ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)] flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Instant Join
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] border border-[var(--color-border)] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Host Approval Required
                </span>
              )}

              {post.od_available && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {post.od_hours}h Verified OD
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
              {post.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Schedule Clash Warning Alert Banner */}
          {clash.hasClash && !isAccepted && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Schedule Conflict Warning!</p>
                <p className="mt-0.5">
                  This activity clashes with your existing schedule: <strong>"{clash.conflictTitle}"</strong> ({clash.conflictTimeDescription}). Please ensure you don't miss mandatory academic commitments.
                </p>
              </div>
            </div>
          )}

          {/* Host Card & Venue Quick Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Host Profile */}
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3">
              <UserAvatar name={post.host_name} role={post.host_role} size="lg" />
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Organized By
                </div>
                <div className="font-bold text-sm text-[var(--color-text-main)]">
                  {post.host_name}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                  {post.host_designation || (post.host_role === 'FACULTY' ? 'Faculty Coordinator' : 'Student Organizer')}
                </div>
              </div>
            </div>

            {/* Time & Venue */}
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Calendar className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0" />
                <span>
                  {new Date(post.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <Clock className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0 ml-2" />
                <span>
                  {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(post.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0" />
                  <span className="truncate text-[var(--color-text-main)]">{post.venue_name}</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setIsMapModalOpen(true);
                  }}
                  className="text-[var(--color-primary)] dark:text-[#E5DED2] font-semibold hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Map Pin
                </button>
              </div>
            </div>

          </div>

          {/* Description & Instructions */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[var(--color-text-main)]">About this Event</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
              {post.description}
            </p>

            {post.instructions && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200">
                <strong className="block mb-1 font-semibold text-amber-800 dark:text-amber-300">Special Instructions from Host:</strong>
                {post.instructions}
              </div>
            )}
          </div>

          {/* Capacity Progress Bar */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                <Users className="w-4 h-4 text-[var(--color-text-subtle)]" />
                Participation Capacity
              </span>
              <span className={isFull ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-[var(--color-text-main)] font-semibold'}>
                {post.filled_slots} of {post.total_slots} Slots Filled ({post.total_slots - post.filled_slots} remaining)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isFull ? 'bg-rose-500' : 'bg-[var(--color-primary)]'
                }`}
                style={{ width: `${Math.min(100, (post.filled_slots / post.total_slots) * 100)}%` }}
              />
            </div>
          </div>

          {/* Target Roles Breakdown (if configured) */}
          {post.target_roles && post.target_roles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-[var(--color-text-main)] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--color-burgundy)]" />
                Specific Role Allocations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {post.target_roles.map((tr, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      selectedRole === tr.role
                        ? 'border-[var(--color-burgundy)] bg-[var(--color-burgundy)]/15 ring-1 ring-[var(--color-burgundy)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[var(--color-text-main)]">{tr.role}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">
                        {tr.filled} / {tr.slots} filled
                      </div>
                    </div>
                    {!isAccepted && !isPending && !isHost && tr.filled < tr.slots && (
                      <button
                        type="button"
                        onClick={() => setSelectedRole(tr.role)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          selectedRole === tr.role
                            ? 'bg-[var(--color-burgundy)] text-[#E5DED2] font-bold'
                            : 'bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-main)] hover:text-white'
                        }`}
                      >
                        {selectedRole === tr.role ? 'Selected' : 'Select Role'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perks & Special Attributes (OD / Carpool / Research) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {post.od_available && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
                  <ShieldCheck className="w-4 h-4" /> Official On-Duty (OD)
                </div>
                <p className="text-[11px] leading-relaxed">
                  {post.od_details || `${post.od_hours} hours of verified academic OD regularized with departmental seal.`}
                </p>
              </div>
            )}

            {post.research_perks && (
              <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-[var(--color-primary)] dark:text-[#E5DED2]">
                  <Sparkles className="w-4 h-4 text-[var(--color-primary)] dark:text-[#E5DED2]" /> Research Perks
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                  {post.research_perks}
                </p>
              </div>
            )}

            {post.carpool_cost_split && (
              <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-[var(--color-primary)] dark:text-[#E5DED2]">
                  <DollarSign className="w-4 h-4 text-[var(--color-primary)] dark:text-[#E5DED2]" /> Fare Splitting
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                  {post.carpool_cost_split} • Destination: {post.carpool_destination || 'Town'}
                </p>
              </div>
            )}
          </div>

          {/* Required Skills & Whitelist */}
          <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
            <div>
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">
                Skills / Tags Expected
              </span>
              <div className="flex flex-wrap gap-1.5">
                {post.required_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[var(--color-burgundy)]/10 text-[var(--color-burgundy)] dark:text-[#E5DED2] font-medium text-xs border border-[var(--color-burgundy)]/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs pt-1">
              <div>
                <span className="text-[var(--color-text-muted)] font-semibold">Department Whitelist: </span>
                <span className="font-mono text-[var(--color-text-main)]">
                  {post.eligible_departments.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] font-semibold">Eligible Batches: </span>
                <span className="font-mono text-[var(--color-text-main)]">
                  {post.eligible_years.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Student Status Alerts */}
          {isPending && !isHost && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                Your join request is currently pending review by <strong>{post.host_name}</strong>. You will be notified immediately upon approval.
              </span>
            </div>
          )}

          {isRejected && !isHost && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>
                Your request to join this initiative was not accepted by the host.
              </span>
            </div>
          )}

          {/* Submission Note Input (for Locked Join Mode) */}
          {post.join_mode === 'LOCKED' && !isAccepted && !isPending && !isRejected && !isHost && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-[var(--color-text-main)]">
                Introduce Yourself & State Portfolio / Motivation (Optional)
              </label>
              <textarea
                value={applicantNote}
                onChange={(e) => setApplicantNote(e.target.value)}
                placeholder="Mention relevant projects, GitHub links, or past experience..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-burgundy)]"
              />
            </div>
          )}

          {/* Feedback banner */}
          {submitFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              submitFeedback.type === 'success' 
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-500/30'
            }`}>
              {submitFeedback.message}
            </div>
          )}

          {/* HOST PARTICIPATION & APPROVAL MANAGEMENT SECTION */}
          {isHost && (
            <div className="space-y-3 pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--color-text-main)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-burgundy)]" />
                  <span>Participant Requests ({postPendingApps.length} Pending)</span>
                </h3>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">
                  {post.filled_slots} of {post.total_slots} Slots Filled
                </span>
              </div>

              {postPendingApps.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] italic text-center sm:text-left">
                  No pending requests for this event. When students request to join, you can approve or decline them here.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {postPendingApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2.5 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-[var(--color-text-main)] flex items-center gap-2">
                            <span>{app.applicant_name}</span>
                            {app.applicant_roll && (
                              <span className="text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-card)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                                {app.applicant_roll}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">
                            {app.applicant_dept || 'Engineering'} {app.applicant_year ? `• Batch ${app.applicant_year}` : ''} • Role: <strong className="text-[var(--color-text-main)]">{app.assigned_role || 'Participant'}</strong>
                          </div>
                        </div>

                        <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />} dot>
                          Pending Review
                        </Badge>
                      </div>

                      {app.message && (
                        <p className="text-xs text-[var(--color-text-muted)] italic bg-[var(--color-surface-card)] p-2 rounded-lg border border-[var(--color-border)]">
                          "{app.message}"
                        </p>
                      )}

                      {app.applicant_skills && app.applicant_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {app.applicant_skills.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {hostReviewFeedback?.appId === app.id && (
                        <div className={`p-2 rounded-lg text-xs font-semibold ${
                          hostReviewFeedback.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {hostReviewFeedback.message}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
                        <button
                          type="button"
                          disabled={reviewingAppId === app.id || post.filled_slots >= post.total_slots}
                          onClick={() => handleReview(app.id, 'ACCEPTED')}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{reviewingAppId === app.id ? 'Processing...' : 'Approve'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={reviewingAppId === app.id}
                          onClick={() => handleReview(app.id, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirmed Participants Roster */}
              {postAcceptedApps.length > 0 && (
                <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                  <div className="font-bold text-xs text-[var(--color-text-main)] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Confirmed Team Members ({postAcceptedApps.length} / {post.total_slots})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {postAcceptedApps.map(a => (
                      <span key={a.id} className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{a.applicant_name}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">({a.assigned_role || 'Participant'})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex flex-wrap items-center justify-between gap-3">
          
          <div className="text-xs text-[var(--color-text-muted)]">
            {isHost ? (
              <span className="text-[var(--color-burgundy)] dark:text-[#E5DED2] font-semibold">
                You are the creator and coordinator of this event.
              </span>
            ) : isAccepted ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> You are an active participant in this event.
              </span>
            ) : isPending ? (
              <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" /> Request submitted: Pending host approval.
              </span>
            ) : isRejected ? (
              <span className="text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Request declined by host.
              </span>
            ) : !isEligible ? (
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                Note: Your department or batch is outside the strict whitelist.
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Host Actions: Delete Event */}
            {isHost && (
              <>
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-1.5 p-1 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                    <span className="text-[11px] text-rose-500 font-semibold px-2">Delete this event permanently?</span>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={async () => {
                        setIsDeleting(true);
                        const res = await deletePost(post.id);
                        if (res.success) {
                          onClose();
                        } else {
                          setSubmitFeedback({ type: 'error', message: res.message });
                          setIsDeleting(false);
                          setIsConfirmingDelete(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Event</span>
                  </button>
                )}
              </>
            )}

            {/* Confirmed / Accepted Participant: Team Chat & Cancel Participation */}
            {isAccepted && !isHost && (
              <>
                {isConfirmingCancel ? (
                  <div className="flex items-center gap-1.5 p-1 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                    <span className="text-[11px] text-rose-500 font-semibold px-2">Leave event and cancel your registration?</span>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={async () => {
                        setIsCancelling(true);
                        const res = await cancelEventParticipation(post.id);
                        if (res.success) {
                          setSubmitFeedback({ type: 'success', message: res.message });
                          setIsConfirmingCancel(false);
                        } else {
                          setSubmitFeedback({ type: 'error', message: res.message });
                        }
                        setIsCancelling(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => setIsConfirmingCancel(false)}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingCancel(true)}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Participation</span>
                  </button>
                )}
              </>
            )}

            {/* Team Chat button */}
            {(isHost || isAccepted) && (
              <button
                onClick={() => {
                  setSelectedPostForChat(post);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text-main)] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[var(--color-burgundy)]" />
                <span>Open Team Chat</span>
              </button>
            )}

            {/* Pending Request: Status pill & Cancel/Withdraw option */}
            {isPending && !isHost && (
              <>
                {isConfirmingCancel ? (
                  <div className="flex items-center gap-1.5 p-1 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                    <span className="text-[11px] text-rose-500 font-semibold px-2">Withdraw your join request?</span>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={async () => {
                        setIsCancelling(true);
                        const res = await cancelEventParticipation(post.id);
                        if (res.success) {
                          setSubmitFeedback({ type: 'success', message: res.message });
                          setIsConfirmingCancel(false);
                        } else {
                          setSubmitFeedback({ type: 'error', message: res.message });
                        }
                        setIsCancelling(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      {isCancelling ? 'Withdrawing...' : 'Yes, Withdraw'}
                    </button>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => setIsConfirmingCancel(false)}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Request Pending</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingCancel(true)}
                      className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Withdraw Request</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {isRejected && !isHost && (
              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-2 cursor-not-allowed"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Request Declined</span>
              </button>
            )}

            {!isHost && !isAccepted && !isPending && !isRejected && (
              <button
                onClick={handleJoinOrApply}
                disabled={isFull || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] disabled:opacity-50 text-[#E5DED2] font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {post.join_mode === 'UNLOCKED' ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    Instant Join Now
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request to Join
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-main)] font-medium text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
