import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './ui/UserAvatar';
import { X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useApp();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [skillsStr, setSkillsStr] = useState(currentUser?.skills?.join(', ') || '');
  const [interestsStr, setInterestsStr] = useState(currentUser?.interests?.join(', ') || '');
  const [githubUrl, setGithubUrl] = useState(currentUser?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser?.linkedin_url || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const interests = interestsStr.split(',').map(s => s.trim()).filter(Boolean);

    updateCurrentUserProfile({
      full_name: fullName.trim() || currentUser.full_name,
      department: department.trim() || currentUser.department,
      bio: bio.trim(),
      skills,
      interests,
      github_url: githubUrl.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[92vh] overflow-hidden text-[var(--color-text-main)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-card)]">
          <h2 className="text-base font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <UserAvatar name={currentUser.full_name} role={currentUser.role} size="sm" />
            My Connect Profile
          </h2>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* Identity summary */}
          <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center gap-3.5">
            <UserAvatar name={currentUser.full_name} role={currentUser.role} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[var(--color-text-main)] truncate">{currentUser.full_name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  currentUser.role === 'FACULTY'
                    ? 'bg-amber-950/40 text-amber-500 border border-amber-800/40'
                    : 'bg-burgundy/15 text-[var(--color-burgundy)] dark:text-[#E5DED2] border border-[var(--color-burgundy)]/30'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[var(--color-text-muted)] text-[11px] font-mono mt-0.5 truncate">
                {currentUser.email}
              </p>
              {currentUser.roll_number && (
                <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
                  Roll: {currentUser.roll_number}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-burgundy)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                Academic Department
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-burgundy)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                Bio / Collaboration Focus
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What projects are you working on?"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-burgundy)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-burgundy)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  Interests (comma separated)
                </label>
                <input
                  type="text"
                  value={interestsStr}
                  onChange={(e) => setInterestsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-burgundy)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-burgundy)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-burgundy)]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[var(--color-burgundy)] hover:opacity-95 text-[#E5DED2] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" /> Saved Successfully
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
