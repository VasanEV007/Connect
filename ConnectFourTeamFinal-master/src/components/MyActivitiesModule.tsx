import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FolderCheck, 
  MessageSquare, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Award, 
  Printer, 
  ShieldCheck, 
  Calendar,
  XCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

export const MyActivitiesModule: React.FC = () => {
  const { 
    currentUser, 
    posts, 
    applications, 
    odSlips, 
    setSelectedPostForDetail, 
    setSelectedPostForChat, 
    setSelectedODSlipForView,
    withdrawApplication,
    setIsAuthModalOpen,
    setAuthModalMode
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'joined' | 'pending' | 'hosted' | 'od-slips'>('joined');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  // Joined (Accepted)
  const myAcceptedApps = useMemo(() => {
    if (!currentUser) return [];
    return applications.filter(a => a.applicant_id === currentUser.id && a.status === 'ACCEPTED');
  }, [applications, currentUser]);

  const joinedPosts = useMemo(() => {
    return posts.filter(p => myAcceptedApps.some(a => a.post_id === p.id));
  }, [posts, myAcceptedApps]);

  // Pending
  const myPendingApps = useMemo(() => {
    if (!currentUser) return [];
    return applications.filter(a => a.applicant_id === currentUser.id && a.status === 'PENDING');
  }, [applications, currentUser]);

  // Hosted by me
  const hostedByMe = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter(p => p.host_id === currentUser.id);
  }, [posts, currentUser]);

  // My OD Slips
  const myODSlips = useMemo(() => {
    if (!currentUser) return [];
    return odSlips.filter(s => {
      const app = applications.find(a => a.id === s.application_id);
      return app?.applicant_id === currentUser.id || s.student_roll === currentUser.roll_number;
    });
  }, [odSlips, applications, currentUser]);

  const handleWithdraw = (appId: string) => {
    withdrawApplication(appId);
    setWithdrawingId(null);
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[var(--color-surface-card)] p-8 rounded-2xl border border-[var(--color-border)] text-center space-y-4 shadow-xl">
        <FolderCheck className="w-12 h-12 text-[var(--color-burgundy)] dark:text-[#E5DED2] mx-auto" />
        <h2 className="text-xl font-bold text-[var(--color-text-main)]">Sign In to View Your Activities</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Log in with your official university email to see joined events, application statuses, and verified On-Duty records.
        </p>
        <button
          onClick={() => {
            setAuthModalMode('LOGIN');
            setIsAuthModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] font-bold text-xs cursor-pointer shadow-md"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Module Header */}
      <div className="bg-[var(--color-surface-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)]">
              My Campus Collaborations & History
            </h1>
            <Badge variant="primary" size="sm">
              Personal Vault
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Track your confirmed event registrations, pending applications, hosted initiatives, and verified departmental On-Duty certificates.
          </p>
        </div>

        {/* Subtabs Navigation Bar - Haveloc Capsule Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold" role="tablist">
          <button
            onClick={() => setActiveSubTab('joined')}
            role="tab"
            aria-selected={activeSubTab === 'joined'}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeSubTab === 'joined'
                ? 'border border-[var(--color-burgundy)] text-[var(--color-burgundy)] dark:text-[#E5DED2] bg-[var(--color-burgundy)]/15 font-bold shadow-xs'
                : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface)]'
            }`}
          >
            Joined Events ({joinedPosts.length})
          </button>

          <button
            onClick={() => setActiveSubTab('pending')}
            role="tab"
            aria-selected={activeSubTab === 'pending'}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeSubTab === 'pending'
                ? 'border border-[var(--color-burgundy)] text-[var(--color-burgundy)] dark:text-[#E5DED2] bg-[var(--color-burgundy)]/15 font-bold shadow-xs'
                : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface)]'
            }`}
          >
            Pending Requests ({myPendingApps.length})
          </button>

          <button
            onClick={() => setActiveSubTab('hosted')}
            role="tab"
            aria-selected={activeSubTab === 'hosted'}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeSubTab === 'hosted'
                ? 'border border-[var(--color-burgundy)] text-[var(--color-burgundy)] dark:text-[#E5DED2] bg-[var(--color-burgundy)]/15 font-bold shadow-xs'
                : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface)]'
            }`}
          >
            Hosted by Me ({hostedByMe.length})
          </button>

          <button
            onClick={() => setActiveSubTab('od-slips')}
            role="tab"
            aria-selected={activeSubTab === 'od-slips'}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
              activeSubTab === 'od-slips'
                ? 'border border-[var(--color-burgundy)] text-[var(--color-burgundy)] dark:text-[#E5DED2] bg-[var(--color-burgundy)]/15 font-bold shadow-xs'
                : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface)]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            My OD Slips ({myODSlips.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Joined Activities */}
      {activeSubTab === 'joined' && (
        <div className="space-y-4">
          {joinedPosts.length === 0 ? (
            <EmptyState
              icon={<FolderCheck className="w-6 h-6 text-[var(--color-text-muted)]" />}
              title="You have not joined any campus activities yet"
              description="Explore the Events Feed to discover workshops, research calls, hackathons, and carpools."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-md space-y-4 hover:border-[var(--color-blue-grey)] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="primary" size="sm">
                        {post.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />} dot>
                        Confirmed Member
                      </Badge>
                    </div>

                    <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                      {post.title}
                    </h3>

                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>

                    <div className="pt-2 text-xs text-[var(--color-text-muted)] space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-text-subtle)]" />
                        <span>{new Date(post.start_time).toLocaleDateString()} at {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-text-subtle)]" />
                        <span className="truncate">{post.venue_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPostForDetail(post)}
                    >
                      View Details
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedPostForChat(post)}
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Open Team Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: Pending Applications */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {myPendingApps.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="w-6 h-6 text-[var(--color-text-muted)]" />}
              title="No pending applications awaiting review"
              description="Applications submitted to approval-required events will be tracked here until the organizer approves or declines."
            />
          ) : (
            <div className="space-y-3">
              {myPendingApps.map((app) => {
                const post = posts.find(p => p.id === app.post_id);

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />} dot>
                          Awaiting Host Review
                        </Badge>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Submitted {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                        {post?.title || 'Campus Event'}
                      </h4>

                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Organizer: <strong className="text-[var(--color-text-main)]">{post?.host_name}</strong> • Role Applied: <strong className="text-[var(--color-text-main)]">{app.assigned_role || 'General'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {post && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPostForDetail(post)}
                        >
                          View Details
                        </Button>
                      )}

                      {withdrawingId === app.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-rose-600 font-semibold">Confirm?</span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleWithdraw(app.id)}
                          >
                            Yes, Withdraw
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setWithdrawingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setWithdrawingId(app.id)}
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Withdraw Request
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: Hosted By Me */}
      {activeSubTab === 'hosted' && (
        <div className="space-y-4">
          {hostedByMe.length === 0 ? (
            <EmptyState
              icon={<FolderCheck className="w-6 h-6 text-[var(--color-text-muted)]" />}
              title="You haven't posted any campus events yet"
              description="Host a hackathon team, study group, carpool ride, or student project using the Create Event button."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hostedByMe.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="warning" size="sm">
                        Organizer View
                      </Badge>
                      <span className="font-mono text-xs text-[var(--color-text-muted)] font-semibold">
                        {post.filled_slots} of {post.total_slots} Slots Filled
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                      {post.title}
                    </h4>

                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPostForDetail(post)}
                    >
                      Manage Listing
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedPostForChat(post)}
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Host Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: My Verified OD Slips */}
      {activeSubTab === 'od-slips' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[var(--color-text-main)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-text-subtle)]" />
              Verified Institutional On-Duty (OD) Certificates
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Official attendance regularizations authenticated by faculty coordinators for departmental ERP adjustment.
            </p>
          </div>

          {myODSlips.length === 0 ? (
            <EmptyState
              icon={<Award className="w-6 h-6 text-[var(--color-text-muted)]" />}
              title="No official OD certificates issued yet"
              description="Once faculty coordinators mark and verify your attendance in official academic workshops or research sessions, your printable slips will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myODSlips.map((slip) => (
                <div
                  key={slip.id}
                  className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />} dot>
                      OD Verified
                    </Badge>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      {slip.verification_hash.slice(0, 18)}...
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                      {slip.event_title}
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Sanctioned by: <strong className="text-[var(--color-text-main)]">{slip.faculty_name}</strong> ({slip.faculty_dept})
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[var(--color-burgundy)] dark:text-[#E5DED2]">Sanctioned: {slip.od_hours} Hours OD</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">Date: {slip.event_date}</div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-[var(--color-text-muted)]">
                      {slip.student_roll}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedODSlipForView(slip)}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                    >
                      View & Print Certificate Slip
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
