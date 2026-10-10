import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { UserAvatar } from './ui/UserAvatar';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';
import { 
  Search, 
  Mail, 
  Code, 
  Check, 
  Send
} from 'lucide-react';

export const FindPeopleDirectory: React.FC = () => {
  const { allUsers, currentUser, posts, inviteUserToPost, setIsAuthModalOpen, setAuthModalMode } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Candidate detail modal state
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  // Invite modal state
  const [invitingUser, setInvitingUser] = useState<UserProfile | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [inviteNote, setInviteNote] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // My open hosted posts that I can invite people into
  const myHostedPosts = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter(p => p.host_id === currentUser.id && p.status === 'OPEN');
  }, [posts, currentUser]);

  // Filter candidates (excluding self)
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      if (currentUser && user.id === currentUser.id) return false;

      // Multi-term search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.full_name.toLowerCase().includes(q);
        const matchRoll = user.roll_number?.toLowerCase().includes(q) || false;
        const matchBio = user.bio?.toLowerCase().includes(q) || false;
        const matchSkill = user.skills?.some(s => s.toLowerCase().includes(q));
        const matchInterest = user.interests?.some(i => i.toLowerCase().includes(q));
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

      return true;
    });
  }, [allUsers, currentUser, searchQuery, selectedDept, selectedYear]);

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

  const handleInviteClick = (user: UserProfile) => {
    if (!currentUser) {
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
      return;
    }
    setInvitingUser(user);
    if (myHostedPosts.length > 0) {
      setSelectedPostId(myHostedPosts[0].id);
    }
  };

  const departments = [
    'ALL',
    'COMPUTER SCIENCE',
    'AUTOMATION AND ROBOTICS',
    'ELECTRONICS',
    'ELECTRICAL',
    'MECHANICAL',
    'AI & DATA SCIENCE',
    'CYBER SECURITY'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-main)]">
          Find People & Collaborators
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
          Connect with Amrita students and faculty researchers by technical skills, department, and project interests.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll number, department, or technical skill..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
            >
              <option value="ALL">All Departments</option>
              {departments.filter(d => d !== 'ALL').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
            >
              <option value="ALL">All Batches</option>
              <option value="2021">Batch 2021</option>
              <option value="2022">Batch 2022</option>
              <option value="2023">Batch 2023</option>
              <option value="2024">Batch 2024</option>
              <option value="2025">Batch 2025</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-1">
          <span>
            Found <strong className="text-[var(--color-text-main)]">{filteredUsers.length}</strong> {filteredUsers.length === 1 ? 'collaborator' : 'collaborators'}
          </span>
          {(searchQuery || selectedDept !== 'ALL' || selectedYear !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('ALL');
                setSelectedYear('ALL');
              }}
              className="text-[var(--color-burgundy)] dark:text-[#E5DED2] font-semibold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Cards Grid */}
      {filteredUsers.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title={allUsers.length === 0 ? "No collaborators registered yet" : "No matching people found"}
            description={
              allUsers.length === 0
                ? "The directory updates automatically when students and faculty create their Connect profiles."
                : "Try clearing your search terms or expanding department filters."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 flex flex-col justify-between hover:border-[var(--color-blue-grey)] transition-all shadow-sm"
            >
              <div className="space-y-3">
                
                {/* Header: UserAvatar, Name, Roll */}
                <div className="flex items-start gap-3">
                  <UserAvatar name={user.full_name} role={user.role} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 
                        onClick={() => setViewingProfile(user)}
                        className="font-bold text-sm text-[var(--color-text-main)] truncate cursor-pointer hover:text-[var(--color-burgundy)] dark:hover:text-[#FFFFFF] transition-colors"
                      >
                        {user.full_name}
                      </h3>
                      <Badge variant={user.role === 'FACULTY' ? 'warning' : 'default'}>
                        {user.role}
                      </Badge>
                    </div>

                    <p className="text-[11px] font-mono text-[var(--color-text-main)] font-semibold truncate mt-0.5">
                      {user.roll_number || user.designation || user.department}
                    </p>

                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                      {user.department} {user.joining_year ? `• Batch ${user.joining_year}` : ''}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block">
                      Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)]"
                        >
                          {skill}
                        </span>
                      ))}
                      {user.skills.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-[var(--color-text-muted)]">
                          +{user.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs">
                  {user.github_url && (
                    <a href={user.github_url} target="_blank" rel="noreferrer" className="hover:text-[var(--color-text-main)] transition-colors" title="GitHub">
                      <Code className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {user.linkedin_url && (
                    <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-[var(--color-text-main)] transition-colors" title="LinkedIn">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingProfile(user)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-main)] text-xs font-semibold cursor-pointer"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => handleInviteClick(user)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Mail className="w-3 h-3" />
                    Invite
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Profile Modal */}
      {viewingProfile && (
        <Modal
          isOpen={Boolean(viewingProfile)}
          onClose={() => setViewingProfile(null)}
          title="Collaborator Profile"
          maxWidth="lg"
        >
          <div className="p-6 space-y-5 text-xs sm:text-sm">
            <div className="flex items-start gap-4">
              <UserAvatar name={viewingProfile.full_name} role={viewingProfile.role} size="lg" />

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[var(--color-text-main)]">
                    {viewingProfile.full_name}
                  </h3>
                  <Badge variant={viewingProfile.role === 'FACULTY' ? 'warning' : 'default'}>
                    {viewingProfile.role}
                  </Badge>
                </div>

                <p className="text-xs text-[var(--color-text-main)] font-mono mt-0.5">
                  {viewingProfile.roll_number || viewingProfile.designation}
                </p>

                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {viewingProfile.department}
                </p>
              </div>
            </div>

            {viewingProfile.bio && (
              <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h4 className="font-bold text-[var(--color-text-main)] text-xs mb-1">About</h4>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {viewingProfile.bio}
                </p>
              </div>
            )}

            {viewingProfile.skills && viewingProfile.skills.length > 0 && (
              <div>
                <h4 className="font-bold text-[var(--color-text-main)] text-xs mb-2">Technical Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProfile.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)] text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewingProfile.interests && viewingProfile.interests.length > 0 && (
              <div>
                <h4 className="font-bold text-[var(--color-text-main)] text-xs mb-2">Interests & Activities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProfile.interests.map((it, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)] text-xs">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  const userToInvite = viewingProfile;
                  setViewingProfile(null);
                  handleInviteClick(userToInvite);
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Mail className="w-4 h-4" />
                Invite to Event
              </button>
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
          description="Send an invitation to join one of your hosted events."
          maxWidth="md"
        >
          <form onSubmit={handleSendInvite} className="p-6 space-y-4 text-xs">
            {inviteSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-center space-y-2">
                <Check className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400" />
                <p className="font-bold text-sm">Invitation Sent!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {invitingUser.full_name} has received an in-app collaboration notification.
                </p>
              </div>
            ) : myHostedPosts.length === 0 ? (
              <div className="space-y-4">
                <p className="text-[var(--color-text-muted)]">
                  You do not currently have any open events to invite {invitingUser.full_name} into.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInvitingUser(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[var(--color-burgundy)] text-[#E5DED2] font-bold cursor-pointer"
                >
                  Create Event First
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                    Select Event *
                  </label>
                  <select
                    value={selectedPostId}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                  >
                    {myHostedPosts.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                    Personalized Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={inviteNote}
                    onChange={(e) => setInviteNote(e.target.value)}
                    placeholder="e.g. Would love to have your collaboration on this project..."
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Direct Invitation
                  </button>
                </div>
              </>
            )}
          </form>
        </Modal>
      )}

    </div>
  );
};
