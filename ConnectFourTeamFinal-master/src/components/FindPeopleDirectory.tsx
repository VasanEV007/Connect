import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { 
  Search, 
  Mail, 
  Globe, 
  Code, 
  Check, 
  Send, 
  Info 
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';

export const FindPeopleDirectory: React.FC = () => {
  const { allUsers, currentUser, posts, inviteUserToPost } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');

  // Candidate detail modal state
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  // Invite modal state
  const [invitingUser, setInvitingUser] = useState<UserProfile | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [inviteNote, setInviteNote] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // My open hosted posts that I can invite people into
  const myHostedPosts = useMemo(() => {
    return posts.filter(p => p.host_id === currentUser.id && p.status === 'OPEN');
  }, [posts, currentUser.id]);

  // Filter candidates (excluding self)
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      if (user.id === currentUser.id) return false;

      // Multi-term search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.full_name.toLowerCase().includes(q);
        const matchRoll = user.roll_number?.toLowerCase().includes(q) || false;
        const matchBio = user.bio?.toLowerCase().includes(q) || false;
        const matchSkill = user.skills.some(s => s.toLowerCase().includes(q));
        const matchInterest = user.interests.some(i => i.toLowerCase().includes(q));
        if (!matchName && !matchRoll && !matchBio && !matchSkill && !matchInterest) {
          return false;
        }
      }

      // Department filter
      if (selectedDept !== 'ALL') {
        if (!user.department || !user.department.toUpperCase().includes(selectedDept)) {
          return false;
        }
      }

      // Year filter
      if (selectedYear !== 'ALL') {
        if (user.joining_year !== parseInt(selectedYear)) {
          return false;
        }
      }

      // Skill filter
      if (selectedSkillFilter !== 'ALL') {
        if (!user.skills.some(s => s.toLowerCase() === selectedSkillFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [allUsers, currentUser.id, searchQuery, selectedDept, selectedYear, selectedSkillFilter]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitingUser || !selectedPostId) return;

    inviteUserToPost(invitingUser.id, selectedPostId, inviteNote);
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setInvitingUser(null);
      setSelectedPostId('');
      setInviteNote('');
    }, 1200);
  };

  const popularSkills = ['React', 'ROS2', 'OpenCV', 'DaVinci Resolve', 'Python', 'IoT', 'PyTorch', 'UI/UX Design'];

  return (
    <div className="space-y-6">
      
      {/* Directory Header */}
      <div className="bg-[#0D1017] p-6 rounded-2xl border border-[#1E2433] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Find Collaborators & Peers
              </h1>
              <Badge variant="primary" size="sm">
                Manual Discovery Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Search students by verified skills, technical tools, and academic batch. Direct peer-to-peer invitation without algorithmic black boxes.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-[#07090E] border border-[#1E2433] text-xs text-slate-300 max-w-sm">
            <Info className="w-4 h-4 text-green-400 shrink-0" />
            <span>Exact skill and keyword querying — discover candidates who match your exact project stack.</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by skill (e.g. DaVinci, OpenCV, ROS2, React), name, or roll number..."
            aria-label="Search candidates"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1E2433] bg-[#07090E] text-xs sm:text-sm text-white focus:outline-none focus:border-[#22C55E] transition-all shadow-xs"
          />
        </div>

        {/* Quick Skill Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-400">Popular Skills:</span>
          {popularSkills.map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkillFilter(selectedSkillFilter === skill ? 'ALL' : skill)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedSkillFilter === skill
                  ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E] font-bold shadow-xs'
                  : 'bg-[#141824] hover:bg-[#1A2030] text-slate-300 border border-[#232B3B]'
              }`}
            >
              {skill}
            </button>
          ))}
          {selectedSkillFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedSkillFilter('ALL')}
              className="text-xs text-rose-400 hover:underline font-semibold ml-2 cursor-pointer"
            >
              Clear Skill Filter
            </button>
          )}
        </div>

        {/* Dropdown Filters (Dept, Batch) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-[#1E2433] text-xs">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Department Whitelist
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by department"
              className="w-full px-3 py-1.5 rounded-xl border border-[#1E2433] bg-[#07090E] text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="COMPUTER SCIENCE">Computer Science (CSE)</option>
              <option value="ROBOTICS">Robotics & Automation (ARE)</option>
              <option value="ARTIFICIAL INTELLIGENCE">Artificial Intelligence (AI/AIE)</option>
              <option value="ELECTRONICS">Electronics & Comm (ECE)</option>
              <option value="MECHANICAL">Mechanical (ME)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Academic Batch / Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Filter by academic batch"
              className="w-full px-3 py-1.5 rounded-xl border border-[#1E2433] bg-[#07090E] text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Batches</option>
              <option value="2024">2024 (2nd Year)</option>
              <option value="2023">2023 (3rd Year)</option>
              <option value="2022">2022 (4th Year)</option>
              <option value="2025">2025 (1st Year)</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-xs text-slate-400 pb-1.5">
              Showing <strong>{filteredUsers.length}</strong> available student & faculty profiles
            </div>
          </div>
        </div>

      </div>

      {/* Candidate Profile Cards Grid */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6 text-slate-400" />}
          title="No profiles match your manual query"
          description="Try broadening your skill keywords or clearing department and batch filters."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('ALL');
                setSelectedYear('ALL');
                setSelectedSkillFilter('ALL');
              }}
            >
              Reset Search & Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="p-5 rounded-2xl bg-[#0D1017] border border-[#1E2433] shadow-xl hover:border-[#2D3748] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Header: Avatar, Name, Roll */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1A202C] border border-[#2D3748] text-green-400 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name.charAt(0)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 
                        onClick={() => setViewingProfile(user)}
                        className="font-bold text-sm text-white truncate cursor-pointer hover:text-[#22C55E] transition-colors"
                      >
                        {user.full_name}
                      </h3>
                      <Badge variant={user.role === 'FACULTY' ? 'warning' : 'default'} size="sm">
                        {user.role}
                      </Badge>
                    </div>

                    <p className="text-[11px] font-mono text-green-400 truncate mt-0.5">
                      {user.roll_number || user.department}
                    </p>

                    <p className="text-[11px] text-slate-400 truncate">
                      {user.department} {user.joining_year ? `• Batch ${user.joining_year}` : ''}
                    </p>
                  </div>
                </div>

                {/* Bio Snippet */}
                {user.bio && (
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Skills Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Competencies & Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.slice(0, 4).map((skill, i) => {
                      const isHighlighted = searchQuery && skill.toLowerCase().includes(searchQuery.toLowerCase().trim());
                      return (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            isHighlighted
                              ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500'
                              : 'bg-[#141824] text-slate-300 border border-[#222738]'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                    {user.skills.length > 4 && (
                      <button
                        onClick={() => setViewingProfile(user)}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium self-center hover:underline"
                      >
                        +{user.skills.length - 4} more
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  {user.github_url && (
                    <a href={user.github_url} target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 font-medium" title="GitHub">
                      <Code className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {user.portfolio_url && (
                    <a href={user.portfolio_url} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium" title="Portfolio">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Web</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingProfile(user)}
                  >
                    Profile
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setInvitingUser(user);
                      if (myHostedPosts.length > 0) {
                        setSelectedPostId(myHostedPosts[0].id);
                      }
                    }}
                    leftIcon={<Mail className="w-3.5 h-3.5" />}
                  >
                    Invite
                  </Button>
                </div>
              </div>

            </article>
          ))}
        </div>
      )}

      {/* Profile Detail Modal */}
      {viewingProfile && (
        <Modal
          isOpen={Boolean(viewingProfile)}
          onClose={() => setViewingProfile(null)}
          title="Candidate Profile Details"
          maxWidth="lg"
        >
          <div className="p-6 space-y-5 text-xs sm:text-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden">
                {viewingProfile.avatar_url ? (
                  <img src={viewingProfile.avatar_url} alt={viewingProfile.full_name} className="w-full h-full object-cover" />
                ) : (
                  viewingProfile.full_name.charAt(0)
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {viewingProfile.full_name}
                  </h3>
                  <Badge variant={viewingProfile.role === 'FACULTY' ? 'warning' : 'primary'} size="sm">
                    {viewingProfile.role}
                  </Badge>
                </div>

                <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {viewingProfile.roll_number || viewingProfile.designation}
                </p>

                <p className="text-xs text-slate-500 mt-0.5">
                  {viewingProfile.department} {viewingProfile.joining_year ? `• Joining Year ${viewingProfile.joining_year}` : ''}
                </p>
              </div>
            </div>

            {viewingProfile.bio && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Bio / Focus
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {viewingProfile.bio}
                </p>
              </div>
            )}

            {/* Complete Skills List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Technical Skills & Tools
              </span>
              <div className="flex flex-wrap gap-1.5">
                {viewingProfile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            {viewingProfile.interests.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Interests & Domains
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProfile.interests.map((int, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                    >
                      {int}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                {viewingProfile.github_url && (
                  <a href={viewingProfile.github_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
                    <Code className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                )}
                {viewingProfile.portfolio_url && (
                  <a href={viewingProfile.portfolio_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
                    <Globe className="w-3.5 h-3.5" />
                    Portfolio
                  </a>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setInvitingUser(viewingProfile);
                  setViewingProfile(null);
                  if (myHostedPosts.length > 0) {
                    setSelectedPostId(myHostedPosts[0].id);
                  }
                }}
                leftIcon={<Mail className="w-3.5 h-3.5" />}
              >
                Invite to Activity
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invite Modal */}
      {invitingUser && (
        <Modal
          isOpen={Boolean(invitingUser)}
          onClose={() => setInvitingUser(null)}
          title={`Invite ${invitingUser.full_name}`}
          description={`Invite to join one of your active open opportunities.`}
          maxWidth="md"
        >
          <div className="p-6">
            {myHostedPosts.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <p className="font-bold">No active hosted opportunities available</p>
                <p>You must publish an activity, hackathon, or workshop before you can invite peer collaborators.</p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Your Opportunity *
                  </label>
                  <select
                    value={selectedPostId}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                    required
                    aria-label="Select opportunity"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    {myHostedPosts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.filled_slots}/{p.total_slots} filled)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Personalized Invitation Note
                  </label>
                  <textarea
                    rows={3}
                    value={inviteNote}
                    onChange={(e) => setInviteNote(e.target.value)}
                    placeholder="We loved your robotics/computer vision work and would like to invite you to our team..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                {inviteSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Invitation dispatched successfully!
                  </div>
                ) : (
                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInvitingUser(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send Invitation
                    </Button>
                  </div>
                )}
              </form>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};
