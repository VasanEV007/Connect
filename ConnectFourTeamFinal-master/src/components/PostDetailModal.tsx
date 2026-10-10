import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Post } from '../types';
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
  Send
} from 'lucide-react';

interface Props {
  post: Post | null;
  onClose: () => void;
}

export const PostDetailModal: React.FC<Props> = ({ post, onClose }) => {
  const { 
    currentUser, 
    joinPost, 
    applications, 
    checkScheduleClash, 
    setSelectedPostForChat, 
    setIsMapModalOpen 
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [applicantNote, setApplicantNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const isHost = post.host_id === currentUser.id;
  const existingApp = applications.find(a => a.post_id === post.id && a.applicant_id === currentUser.id);
  const isAccepted = existingApp?.status === 'ACCEPTED';
  const isPending = existingApp?.status === 'PENDING';
  const isFull = post.filled_slots >= post.total_slots;

  // Eligibility check
  const deptEligible = post.eligible_departments.includes('ANY') || 
    (currentUser.department && post.eligible_departments.some(d => currentUser.department?.toUpperCase().includes(d.toUpperCase())));
  
  const yearEligible = post.eligible_years.length === 0 || 
    (currentUser.joining_year && post.eligible_years.includes(currentUser.joining_year));
  
  const isEligible = deptEligible && yearEligible;

  // Clash check
  const clash = checkScheduleClash(post.start_time, post.end_time);

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
      <div className="relative w-full max-w-3xl bg-[#0D1017] rounded-2xl shadow-2xl border border-[#1E2433] flex flex-col max-h-[92vh] overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1E2433] bg-[#0A0D14]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#141824] text-slate-300 border border-[#222738]">
                {post.category.replace('_', ' ')}
              </span>

              {post.join_mode === 'UNLOCKED' ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0D331B] text-[#4ADE80] border border-green-500/30 flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" /> Instant Join
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#141824] text-slate-300 border border-[#222738] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Host Approval Required
                </span>
              )}

              {post.od_available && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#382A0E] text-[#FBBF24] border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {post.od_hours}h Verified OD
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {post.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161B26] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Schedule Clash Warning Alert Banner */}
          {clash.hasClash && !isAccepted && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-200 text-xs flex items-start gap-3">
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
            <div className="p-4 rounded-xl border border-[#1E2433] bg-[#0A0D14] flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1A202C] border border-[#2D3748] text-green-400 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                {post.host_avatar ? (
                  <img src={post.host_avatar} alt={post.host_name} className="w-full h-full object-cover" />
                ) : (
                  post.host_name.charAt(0)
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Organized By
                </div>
                <div className="font-bold text-sm text-white">
                  {post.host_name}
                </div>
                <div className="text-xs text-slate-400 line-clamp-1">
                  {post.host_designation || (post.host_role === 'FACULTY' ? 'Faculty Coordinator' : 'Student Organizer')}
                </div>
              </div>
            </div>

            {/* Time & Venue */}
            <div className="p-4 rounded-xl border border-[#1E2433] bg-[#0A0D14] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>
                  {new Date(post.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <Clock className="w-4 h-4 text-[#22C55E] shrink-0 ml-2" />
                <span>
                  {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(post.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span className="truncate">{post.venue_name}</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setIsMapModalOpen(true);
                  }}
                  className="text-green-400 font-semibold hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Map Pin
                </button>
              </div>
            </div>

          </div>

          {/* Description & Instructions */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-white">About this Opportunity</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {post.description}
            </p>

            {post.instructions && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60 text-xs text-amber-200">
                <strong className="block mb-1 font-semibold text-amber-300">Special Instructions from Host:</strong>
                {post.instructions}
              </div>
            )}
          </div>

          {/* Capacity Progress Bar */}
          <div className="p-4 rounded-xl border border-[#1E2433] bg-[#0A0D14] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-4 h-4 text-[#22C55E]" />
                Participation Capacity
              </span>
              <span className={isFull ? 'text-rose-400 font-bold' : 'text-[#22C55E]'}>
                {post.filled_slots} of {post.total_slots} Slots Filled ({post.total_slots - post.filled_slots} remaining)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#1A202C] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isFull ? 'bg-rose-500' : 'bg-[#22C55E]'
                }`}
                style={{ width: `${Math.min(100, (post.filled_slots / post.total_slots) * 100)}%` }}
              />
            </div>
          </div>

          {/* Target Roles Breakdown (if configured) */}
          {post.target_roles && post.target_roles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#22C55E]" />
                Specific Role Allocations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {post.target_roles.map((tr, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      selectedRole === tr.role
                        ? 'border-[#22C55E] bg-[#22C55E]/10 ring-1 ring-[#22C55E]'
                        : 'border-[#1E2433] bg-[#0A0D14]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{tr.role}</div>
                      <div className="text-[11px] text-slate-400">
                        {tr.filled} / {tr.slots} filled
                      </div>
                    </div>
                    {!isAccepted && !isPending && !isHost && tr.filled < tr.slots && (
                      <button
                        type="button"
                        onClick={() => setSelectedRole(tr.role)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          selectedRole === tr.role
                            ? 'bg-[#22C55E] text-black font-bold'
                            : 'bg-[#141A26] border border-[#232B3B] text-slate-200 hover:text-white'
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
              <div className="p-3.5 rounded-xl border border-amber-900/60 bg-amber-950/20 text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
                  <ShieldCheck className="w-4 h-4" /> Official On-Duty (OD)
                </div>
                <p className="text-[11px] leading-relaxed">
                  {post.od_details || `${post.od_hours} hours of verified academic OD regularized with departmental seal.`}
                </p>
              </div>
            )}

            {post.research_perks && (
              <div className="p-3.5 rounded-xl border border-green-900/40 bg-green-950/20 text-green-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-green-300">
                  <Sparkles className="w-4 h-4" /> Research Perks
                </div>
                <p className="text-[11px] leading-relaxed">
                  {post.research_perks}
                </p>
              </div>
            )}

            {post.carpool_cost_split && (
              <div className="p-3.5 rounded-xl border border-[#1E2433] bg-[#0A0D14] text-slate-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-green-400">
                  <DollarSign className="w-4 h-4" /> Fare Splitting
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {post.carpool_cost_split} • Destination: {post.carpool_destination || 'Town'}
                </p>
              </div>
            )}
          </div>

          {/* Required Skills & Whitelist */}
          <div className="space-y-3 pt-2 border-t border-[#1E2433]">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Skills / Tags Expected
              </span>
              <div className="flex flex-wrap gap-1.5">
                {post.required_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[#141A26] text-green-400 font-medium text-xs border border-[#232B3B]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400 font-semibold">Department Whitelist: </span>
                <span className="font-mono text-slate-200">
                  {post.eligible_departments.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Eligible Batches: </span>
                <span className="font-mono text-slate-200">
                  {post.eligible_years.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Note Input (for Locked Join Mode) */}
          {post.join_mode === 'LOCKED' && !isAccepted && !isPending && !isHost && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-300">
                Introduce Yourself & State Portfolio / Motivation (Optional)
              </label>
              <textarea
                value={applicantNote}
                onChange={(e) => setApplicantNote(e.target.value)}
                placeholder="Mention relevant projects, GitHub links, or past experience..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E2433] bg-[#07090E] text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          )}

          {/* Feedback banner */}
          {submitFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              submitFeedback.type === 'success' 
                ? 'bg-[#0D331B] text-[#4ADE80] border border-green-500/30' 
                : 'bg-rose-950/40 text-rose-300 border border-rose-900'
            }`}>
              {submitFeedback.message}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#1E2433] bg-[#0A0D14] flex flex-wrap items-center justify-between gap-3">
          
          <div className="text-xs text-slate-400">
            {isHost ? (
              <span className="text-green-400 font-semibold">
                You are the creator and coordinator of this post.
              </span>
            ) : isAccepted ? (
              <span className="text-[#4ADE80] font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> You are an active participant in this activity.
              </span>
            ) : isPending ? (
              <span className="text-amber-400 font-semibold">
                Your request is pending host review.
              </span>
            ) : !isEligible ? (
              <span className="text-amber-400 font-medium">
                Note: Your department or batch is outside the strict whitelist.
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {(isHost || isAccepted) && (
              <button
                onClick={() => {
                  setSelectedPostForChat(post);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#141A26] border border-[#232B3B] hover:bg-[#1E2536] text-green-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Open Scoped Group Chat
              </button>
            )}

            {!isHost && !isAccepted && !isPending && (
              <button
                onClick={handleJoinOrApply}
                disabled={isFull || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all cursor-pointer"
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
              className="px-4 py-2.5 rounded-xl border border-[#1E2433] bg-[#0D1017] hover:border-[#2D3748] text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
