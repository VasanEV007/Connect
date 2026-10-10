import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './ui/UserAvatar';
import { canAccessFacultyPortal } from '../utils/security';
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  ShieldAlert,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { EmptyState } from './ui/EmptyState';

export const FacultyPortal: React.FC = () => {
  const { 
    currentUser, 
    posts, 
    applications, 
    reviewApplication, 
    markAttendance, 
    generateODSlip, 
    setSelectedODSlipForView, 
    setIsCreatePostModalOpen,
    setActiveTab,
    odSlips
  } = useApp();

  const isAuthorized = currentUser ? canAccessFacultyPortal(currentUser) : false;

  // Subtabs within faculty portal
  const [facultyTab, setFacultyTab] = useState<'applications' | 'attendance' | 'my-calls'>('applications');
  const [selectedCallId, setSelectedCallId] = useState<string>('ALL');

  // If student or unauthenticated: show professional Access Restricted Screen
  if (!isAuthorized || !currentUser) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-[var(--color-text-main)]">
            Faculty Portal Access Restricted
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-md mx-auto">
            {currentUser ? (
              <>
                You are authenticated as <strong>{currentUser.full_name}</strong> ({currentUser.role}).
                Official research calls, applicant screening, and On-Duty (OD) authorization workflows are strictly restricted to verified faculty coordinators and lab leads.
              </>
            ) : (
              'Please sign in with a verified faculty account to access coordinator features.'
            )}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-left space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Institutional Role Policy
          </div>
          <p className="text-[var(--color-text-muted)] text-[11px] leading-relaxed">
            Faculty privileges are governed by backend PostgreSQL Row Level Security (RLS) policies and require administrative verification. Ordinary accounts cannot promote themselves.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setActiveTab('events')}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-md"
          >
            <span>Return to Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Calls hosted by this faculty member
  const facultyCalls = posts.filter(p => p.host_id === currentUser.id);
  const facultyCallIds = facultyCalls.map(c => c.id);

  const relevantApplications = applications.filter(a => {
    if (selectedCallId !== 'ALL' && a.post_id !== selectedCallId) return false;
    return facultyCallIds.includes(a.post_id);
  });

  const pendingApplications = relevantApplications.filter(a => a.status === 'PENDING');
  const acceptedApplications = relevantApplications.filter(a => a.status === 'ACCEPTED');

  return (
    <div className="space-y-6">
      
      {/* Faculty Portal Banner */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <UserAvatar name={currentUser.full_name} role={currentUser.role} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)] tracking-tight">
                Faculty Governance Portal
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase">
                Coordinator Mode
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {currentUser.full_name} • {currentUser.designation || 'Faculty Coordinator'} • {currentUser.department}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreatePostModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Official Call / Workshop</span>
        </button>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3 text-xs">
        <button
          onClick={() => setFacultyTab('applications')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            facultyTab === 'applications'
              ? 'bg-[var(--color-surface-hover)] text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-border)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <span>Candidate Applications</span>
          {pendingApplications.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {pendingApplications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setFacultyTab('attendance')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            facultyTab === 'attendance'
              ? 'bg-[var(--color-surface-hover)] text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-border)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <span>Attendance & On-Duty (OD) Slips</span>
          <span className="text-[var(--color-text-muted)] text-[11px]">({acceptedApplications.length})</span>
        </button>

        <button
          onClick={() => setFacultyTab('my-calls')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            facultyTab === 'my-calls'
              ? 'bg-[var(--color-surface-hover)] text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-border)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <span>My Official Listings</span>
          <span className="text-[var(--color-text-muted)] text-[11px]">({facultyCalls.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: CANDIDATE APPLICATIONS */}
      {facultyTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-text-main)]">
              Pending Candidate Review ({pendingApplications.length})
            </h2>

            {facultyCalls.length > 1 && (
              <select
                value={selectedCallId}
                onChange={(e) => setSelectedCallId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs"
              >
                <option value="ALL">All Hosted Events</option>
                {facultyCalls.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}
          </div>

          {pendingApplications.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="No pending student applications"
                description="When students apply for your research calls or workshops, their submissions will appear here for screening."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map(app => {
                const post = posts.find(p => p.id === app.post_id);
                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <UserAvatar name={app.applicant_name} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[var(--color-text-main)]">{app.applicant_name}</h3>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[var(--color-surface)] text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-border)]">
                              {app.applicant_roll || 'Student'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {app.applicant_dept} {app.applicant_year ? `• Batch ${app.applicant_year}` : ''}
                          </p>
                          <p className="text-xs text-[var(--color-burgundy)] dark:text-[#E5DED2] font-medium mt-1">
                            Applied for: <span className="font-bold text-[var(--color-text-main)]">{post?.title || 'Event'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => reviewApplication(app.id, 'ACCEPTED')}
                          className="px-3.5 py-1.5 rounded-lg bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => reviewApplication(app.id, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>

                    {app.message && (
                      <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] leading-relaxed">
                        <span className="font-bold text-[var(--color-text-main)] block mb-0.5">Applicant Statement:</span>
                        "{app.message}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: ATTENDANCE & OD SLIP DISPATCH */}
      {facultyTab === 'attendance' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-main)]">
              Attendance Roster & Verified On-Duty (OD) Certificate Dispatch
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Confirm participant presence and generate cryptographically verified OD certificates.
            </p>
          </div>

          {acceptedApplications.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="No confirmed participants yet"
                description="Once students are approved into your events, you can take attendance and dispatch official OD slips here."
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[var(--color-text-muted)]">
                  <thead className="bg-[var(--color-surface)] text-[11px] uppercase tracking-wider text-[var(--color-text-main)] border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Student Name & Roll</th>
                      <th className="px-4 py-3 font-semibold">Event</th>
                      <th className="px-4 py-3 font-semibold">Attendance</th>
                      <th className="px-5 py-3 font-semibold text-right">OD Certificate Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {acceptedApplications.map(app => {
                      const post = posts.find(p => p.id === app.post_id);
                      const issuedSlip = odSlips.find(s => s.application_id === app.id);

                      return (
                        <tr key={app.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-[var(--color-text-main)]">{app.applicant_name}</div>
                            <div className="text-[11px] font-mono text-[var(--color-burgundy)] dark:text-[#E5DED2]">{app.applicant_roll || 'Student'}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="max-w-xs truncate text-[var(--color-text-main)]">{post?.title}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={app.attended}
                                onChange={(e) => markAttendance(app.id, e.target.checked)}
                                className="rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-burgundy)]"
                              />
                              <span className={app.attended ? 'text-[var(--color-burgundy)] dark:text-[#E5DED2] font-semibold' : 'text-[var(--color-text-muted)]'}>
                                {app.attended ? 'Present' : 'Absent'}
                              </span>
                            </label>
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            {issuedSlip ? (
                              <button
                                onClick={() => setSelectedODSlipForView(issuedSlip)}
                                className="px-3 py-1.5 rounded-lg bg-[var(--color-burgundy)]/15 text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-burgundy)]/30 font-semibold text-xs hover:bg-[var(--color-burgundy)]/25 transition-colors cursor-pointer"
                              >
                                View Slip ({issuedSlip.od_hours}h)
                              </button>
                            ) : post?.od_available ? (
                              <button
                                onClick={() => generateODSlip(app.id)}
                                disabled={!app.attended}
                                className="px-3 py-1.5 rounded-lg bg-[var(--color-burgundy)] disabled:opacity-40 text-[#E5DED2] font-bold text-xs hover:bg-[#5F1023] transition-colors cursor-pointer shadow-sm"
                              >
                                Issue Verified OD
                              </button>
                            ) : (
                              <span className="text-[var(--color-text-muted)] text-[11px]">No OD Eligible</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: MY OFFICIAL LISTINGS */}
      {facultyTab === 'my-calls' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[var(--color-text-main)]">
            My Hosted Events ({facultyCalls.length})
          </h2>

          {facultyCalls.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="No events created yet"
                description="Publish an official departmental workshop, research assistantship call, or technical seminar."
                actionLabel="Create Event"
                onAction={() => setIsCreatePostModalOpen(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultyCalls.map(call => (
                <div key={call.id} className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-surface)] text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-border)]">
                      {call.category}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">
                      {call.filled_slots}/{call.total_slots} Filled
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--color-text-main)]">{call.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{call.description}</p>

                  <div className="text-[11px] text-[var(--color-text-muted)] space-y-1">
                    <div>Venue: <span className="text-[var(--color-text-main)]">{call.venue_name}</span></div>
                    <div>Date: <span className="text-[var(--color-text-main)]">{new Date(call.start_time).toLocaleDateString()}</span></div>
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
