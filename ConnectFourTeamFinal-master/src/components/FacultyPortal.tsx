import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  Award, 
  Users, 
  GraduationCap, 
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Printer
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

export const FacultyPortal: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    allUsers, 
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

  const isFaculty = currentUser.role === 'FACULTY';

  // Subtabs within faculty portal
  const [facultyTab, setFacultyTab] = useState<'applications' | 'attendance' | 'my-calls'>('applications');
  const [selectedCallId, setSelectedCallId] = useState<string>('ALL');

  // If student: show professional Access Restricted Screen
  if (!isFaculty) {
    const facultyUser = allUsers.find(u => u.role === 'FACULTY') || allUsers[4];
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#0D1017] rounded-2xl border border-[#1E2433] p-8 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-950/40 text-amber-400 flex items-center justify-center mx-auto border border-amber-800/60">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">
            Faculty Governance Portal Restricted
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            You are currently authenticated with student credentials (<strong>{currentUser.full_name}</strong> • {currentUser.roll_number}). Official opportunity authorization, attendance registers, and OD certificate dispatch require verified Faculty Coordinator credentials.
          </p>
        </div>

        {/* Demo Switcher explanation banner */}
        <div className="p-4 rounded-xl bg-[#07090E] border border-[#1E2433] text-xs text-left space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Evaluator Simulation Mode:
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            For academic evaluation, you can immediately simulate a Faculty Coordinator persona to audit research applicant reviews, take session attendance, and generate verified On-Duty (OD) slips.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveTab('feed')}
          >
            Return to Feed
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setCurrentUser(facultyUser)}
            leftIcon={<GraduationCap className="w-4 h-4" />}
          >
            Switch to {facultyUser.full_name} (Faculty Mode)
          </Button>
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

  // KPIs
  const totalCallsCount = facultyCalls.length;
  const pendingCount = applications.filter(a => facultyCallIds.includes(a.post_id) && a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => facultyCallIds.includes(a.post_id) && a.status === 'ACCEPTED').length;
  const totalOdHoursDispatched = odSlips
    .filter(s => facultyCallIds.includes(s.event_id))
    .reduce((acc, curr) => acc + curr.od_hours, 0);

  return (
    <div className="space-y-6">
      
      {/* Faculty Hero Banner */}
      <div className="bg-gradient-to-r from-[#0D1017] via-[#111622] to-[#0D1017] text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#1E2433]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-950/40 text-green-400 text-xs font-semibold border border-green-800/40">
              <Award className="w-3.5 h-3.5" />
              Faculty Coordinator & Academic Registry
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {currentUser.designation || 'Faculty Coordinator'} • {currentUser.department}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreatePostModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Publish Official Call / Workshop
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#1E2433]">
          <div className="p-3.5 rounded-xl bg-[#07090E] border border-[#1E2433]">
            <div className="text-xs text-slate-400 font-semibold">Active Official Calls</div>
            <div className="text-2xl font-black text-white mt-0.5">{totalCallsCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#07090E] border border-[#1E2433]">
            <div className="text-xs text-slate-400 font-semibold">Pending Applicant Reviews</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{pendingCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#07090E] border border-[#1E2433]">
            <div className="text-xs text-slate-400 font-semibold">Approved Scholars</div>
            <div className="text-2xl font-black text-green-400 mt-0.5">{approvedCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#07090E] border border-[#1E2433]">
            <div className="text-xs text-slate-400 font-semibold">Total Verified OD Hours</div>
            <div className="text-2xl font-black text-[#22C55E] mt-0.5">{totalOdHoursDispatched}h</div>
          </div>
        </div>
      </div>

      {/* Subtabs & Call Filter Toolbar */}
      <div className="bg-[#0D1017] p-4 rounded-2xl border border-[#1E2433] shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Navigation Subtabs - Haveloc Capsule Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold" role="tablist">
          <button
            onClick={() => setFacultyTab('applications')}
            role="tab"
            aria-selected={facultyTab === 'applications'}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              facultyTab === 'applications'
                ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 font-bold shadow-xs'
                : 'border border-[#222634] text-slate-400 hover:text-white bg-[#0A0D14]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Applicant Reviews ({pendingApplications.length})
          </button>

          <button
            onClick={() => setFacultyTab('attendance')}
            role="tab"
            aria-selected={facultyTab === 'attendance'}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              facultyTab === 'attendance'
                ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 font-bold shadow-xs'
                : 'border border-[#222634] text-slate-400 hover:text-white bg-[#0A0D14]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Attendance & OD Slips ({acceptedApplications.length})
          </button>

          <button
            onClick={() => setFacultyTab('my-calls')}
            role="tab"
            aria-selected={facultyTab === 'my-calls'}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              facultyTab === 'my-calls'
                ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 font-bold shadow-xs'
                : 'border border-[#222634] text-slate-400 hover:text-white bg-[#0A0D14]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            My Active Calls ({facultyCalls.length})
          </button>
        </div>

        {/* Filter by Call Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Filter Call:</span>
          <select
            value={selectedCallId}
            onChange={(e) => setSelectedCallId(e.target.value)}
            aria-label="Filter by call"
            className="px-3 py-1.5 rounded-xl border border-[#1E2433] bg-[#07090E] text-xs text-slate-200 max-w-[220px] truncate cursor-pointer"
          >
            <option value="ALL">All Active Calls</option>
            {facultyCalls.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

      </div>

      {/* SUBTAB 1: Applicant Reviews */}
      {facultyTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Pending Student Applications
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {pendingApplications.length} candidate{pendingApplications.length === 1 ? '' : 's'} awaiting evaluation
            </span>
          </div>

          {pendingApplications.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
              title="All caught up! No pending applications"
              description="Student requests to join your lab research initiatives or workshops will be queued here for approval."
            />
          ) : (
            <div className="space-y-3">
              {pendingApplications.map((app) => {
                const post = posts.find(p => p.id === app.post_id);

                return (
                    <article
                    key={app.id}
                    className="p-5 rounded-2xl bg-[#0D1017] border border-[#1E2433] shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Candidate Identity */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#1A202C] border border-[#2D3748] text-green-400 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                          {app.applicant_avatar ? (
                            <img src={app.applicant_avatar} alt={app.applicant_name} className="w-full h-full object-cover" />
                          ) : (
                            app.applicant_name.charAt(0)
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">
                              {app.applicant_name}
                            </h4>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#141A26] text-green-400 border border-[#232B3B]">
                              {app.applicant_roll || 'Student'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 mt-0.5">
                            {app.applicant_dept} {app.applicant_year ? `• Batch ${app.applicant_year}` : ''}
                          </p>

                          <div className="mt-1 text-xs text-green-400 font-semibold">
                            Role Requested: <strong>{app.assigned_role || 'General Contributor'}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Targeted Call */}
                      <div className="sm:text-right text-xs text-slate-400">
                        <span className="font-semibold block text-slate-200">
                          {post?.title}
                        </span>
                        <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Application Statement */}
                    {app.message && (
                      <div className="p-3.5 rounded-xl bg-[#07090E] border border-[#1E2433] text-xs text-slate-300 leading-relaxed">
                        <span className="font-bold text-slate-400 block mb-1">Student Statement / Experience:</span>
                        "{app.message}"
                      </div>
                    )}

                    {/* Candidate Verified Skills */}
                    {app.applicant_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[11px] font-semibold text-slate-400">Candidate Skills:</span>
                        {app.applicant_skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#141824] text-slate-300 border border-[#222738]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#1E2433] flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reviewApplication(app.id, 'REJECTED', 'Capacity reached or schedule mismatch.')}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Decline
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => reviewApplication(app.id, 'ACCEPTED')}
                        leftIcon={<CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />}
                      >
                        Approve & Grant Team Chat Access
                      </Button>
                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: Attendance Tracker & Prototype OD Generation */}
      {facultyTab === 'attendance' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Attendance Roster & On-Duty (OD) Certificate Generator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify student completion and dispatch authenticated On-Duty slips with departmental hashes.
            </p>
          </div>

          {acceptedApplications.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6 text-slate-400" />}
              title="No confirmed participants found for this call"
              description="Approve applicants under the Applicant Reviews tab to populate your session attendance roster."
            />
          ) : (
            <div className="bg-[#0D1017] rounded-2xl border border-[#1E2433] shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" aria-label="Attendance Roster">
                  <thead className="bg-[#07090E] border-b border-[#1E2433] font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th scope="col" className="py-3 px-4">Student & Roll No</th>
                      <th scope="col" className="py-3 px-4">Opportunity & Role</th>
                      <th scope="col" className="py-3 px-4 text-center">Attendance</th>
                      <th scope="col" className="py-3 px-4 text-center">OD Sanctioned</th>
                      <th scope="col" className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161B26]">
                    {acceptedApplications.map((app) => {
                      const post = posts.find(p => p.id === app.post_id);
                      const existingSlip = odSlips.find(s => s.application_id === app.id);

                      return (
                        <tr key={app.id} className="hover:bg-[#111520] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">
                              {app.applicant_name}
                            </div>
                            <div className="font-mono text-[11px] text-green-400">
                              {app.applicant_roll || 'Student'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {app.applicant_dept}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-200 truncate">
                              {post?.title}
                            </div>
                            <div className="text-[11px] text-amber-400 font-medium">
                              Role: {app.assigned_role || 'General'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={app.attended}
                                onChange={(e) => markAttendance(app.id, e.target.checked)}
                                className="w-4 h-4 rounded text-green-500 focus:ring-green-400"
                              />
                              <span className={`text-[11px] font-semibold ${app.attended ? 'text-green-400' : 'text-slate-400'}`}>
                                {app.attended ? 'Present' : 'Not Marked'}
                              </span>
                            </label>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <Badge variant="warning" size="sm">
                              {post?.od_hours || 8} Hours OD
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {existingSlip ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedODSlipForView(existingSlip)}
                                leftIcon={<Printer className="w-3.5 h-3.5 text-green-400" />}
                              >
                                View / Print OD Slip
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  markAttendance(app.id, true);
                                  const slip = generateODSlip(app.id);
                                  if (slip) setSelectedODSlipForView(slip);
                                }}
                                leftIcon={<Award className="w-3.5 h-3.5" />}
                              >
                                Issue Prototype OD Slip
                              </Button>
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

      {/* SUBTAB 3: My Active Calls */}
      {facultyTab === 'my-calls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              My Active Calls & Workshops
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facultyCalls.map(post => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="warning" size="sm">
                    {post.category.replace('_', ' ')}
                  </Badge>
                  <span className="font-mono text-xs text-slate-500 font-semibold">
                    {post.filled_slots}/{post.total_slots} Slots
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {post.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {post.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Venue: {post.venue_name}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {post.od_hours}h Verified OD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
