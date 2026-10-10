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
    withdrawApplication 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'joined' | 'pending' | 'hosted' | 'od-slips'>('joined');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  // Joined (Accepted)
  const myAcceptedApps = useMemo(() => {
    return applications.filter(a => a.applicant_id === currentUser.id && a.status === 'ACCEPTED');
  }, [applications, currentUser.id]);

  const joinedPosts = useMemo(() => {
    return posts.filter(p => myAcceptedApps.some(a => a.post_id === p.id));
  }, [posts, myAcceptedApps]);

  // Pending
  const myPendingApps = useMemo(() => {
    return applications.filter(a => a.applicant_id === currentUser.id && a.status === 'PENDING');
  }, [applications, currentUser.id]);

  // Hosted by me
  const hostedByMe = useMemo(() => {
    return posts.filter(p => p.host_id === currentUser.id);
  }, [posts, currentUser.id]);

  // My OD Slips
  const myODSlips = useMemo(() => {
    return odSlips.filter(s => {
      const app = applications.find(a => a.id === s.application_id);
      return app?.applicant_id === currentUser.id || s.student_roll === currentUser.roll_number;
    });
  }, [odSlips, applications, currentUser.id, currentUser.roll_number]);

  const handleWithdraw = (appId: string) => {
    withdrawApplication(appId);
    setWithdrawingId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Module Header */}
      <div className="bg-[#0D1017] p-6 rounded-2xl border border-[#1E2433] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              My Campus Collaborations & History
            </h1>
            <Badge variant="primary" size="sm">
              Personal Vault
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
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
                ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 font-bold shadow-xs'
                : 'border border-[#222634] text-slate-400 hover:text-white bg-[#0A0D14]'
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
                ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 font-bold shadow-xs'
                : 'border border-[#222634] text-slate-400 hover:text-white bg-[#0A0D14]'
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
                ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 font-bold shadow-xs'
                : 'border border-[#222634] text-slate-400 hover:text-white bg-[#0A0D14]'
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
                ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 font-bold shadow-xs'
                : 'border border-[#222634] text-slate-400 hover:text-white bg-[#0A0D14]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            My OD Slips ({myODSlips.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Joined Activities */}
      {activeSubTab === 'joined' && (
        <div className="space-y-4">
          {joinedPosts.length === 0 ? (
            <EmptyState
              icon={<FolderCheck className="w-6 h-6 text-slate-400" />}
              title="You have not joined any campus activities yet"
              description="Explore the Events Feed to discover workshops, research calls, hackathons, and carpools."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-[#0D1017] border border-[#1E2433] shadow-xl space-y-4 hover:border-[#2D3748] transition-all flex flex-col justify-between"
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

                    <h3 className="font-bold text-sm text-white">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>

                    <div className="pt-2 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-green-400" />
                        <span>{new Date(post.start_time).toLocaleDateString()} at {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-green-400" />
                        <span className="truncate">{post.venue_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1E2433] flex items-center justify-between gap-2">
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
              icon={<CheckCircle className="w-6 h-6 text-slate-400" />}
              title="No pending applications awaiting review"
              description="Applications submitted to approval-required opportunities will be tracked here until the organizer approves or declines."
            />
          ) : (
            <div className="space-y-3">
              {myPendingApps.map((app) => {
                const post = posts.find(p => p.id === app.post_id);

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-[#0D1017] border border-[#1E2433] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />} dot>
                          Awaiting Host Review
                        </Badge>
                        <span className="text-xs text-slate-400">
                          Submitted {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white">
                        {post?.title || 'Campus Opportunity'}
                      </h4>

                      <p className="text-xs text-slate-400 mt-1">
                        Organizer: <strong className="text-slate-200">{post?.host_name}</strong> • Role Applied: <strong className="text-slate-200">{app.assigned_role || 'General'}</strong>
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
              icon={<FolderCheck className="w-6 h-6 text-slate-400" />}
              title="You haven't posted any campus opportunities yet"
              description="Host a hackathon team, study group, carpool ride, or student project using the Post Opportunity button."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hostedByMe.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-[#0D1017] border border-[#1E2433] shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="warning" size="sm">
                        Organizer View
                      </Badge>
                      <span className="font-mono text-xs text-slate-400 font-semibold">
                        {post.filled_slots} of {post.total_slots} Slots Filled
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white">
                      {post.title}
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1E2433] flex items-center justify-between gap-2">
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
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Verified Institutional On-Duty (OD) Certificates
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Official attendance regularizations authenticated by faculty coordinators for departmental ERP adjustment.
            </p>
          </div>

          {myODSlips.length === 0 ? (
            <EmptyState
              icon={<Award className="w-6 h-6 text-slate-400" />}
              title="No official OD certificates issued yet"
              description="Once faculty coordinators mark and verify your attendance in official academic workshops or research sessions, your printable slips will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myODSlips.map((slip) => (
                <div
                  key={slip.id}
                  className="p-5 rounded-2xl bg-[#0D1017] border border-[#1E2433] shadow-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />} dot>
                      OD Verified
                    </Badge>
                    <span className="font-mono text-[10px] text-slate-400">
                      {slip.verification_hash.slice(0, 18)}...
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {slip.event_title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sanctioned by: <strong className="text-slate-200">{slip.faculty_name}</strong> ({slip.faculty_dept})
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07090E] border border-[#1E2433] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-green-400">Sanctioned: {slip.od_hours} Hours OD</div>
                      <div className="text-[11px] text-slate-400">Date: {slip.event_date}</div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-slate-300">
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
