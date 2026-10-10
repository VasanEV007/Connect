import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile } from '../types';
import { RollNumberParserWidget } from './RollNumberParserWidget';
import { X, GraduationCap, Building2, Sparkles, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { allUsers, currentUser, setCurrentUser, registerUser } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP');

  // Sign up fields
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [rollNumber, setRollNumber] = useState('CB.EN.U4ARE24001');
  const [department, setDepartment] = useState('Automation and Robotics Engineering');
  const [joiningYear, setJoiningYear] = useState<number>(2024);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Prefer not to say');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [skillsStr, setSkillsStr] = useState('ROS2, Python, OpenCV');
  const [interestsStr, setInterestsStr] = useState('Robotics, Hackathons, Open Source');

  // Faculty specific
  const [designation, setDesignation] = useState('Assistant Professor');


  if (!isOpen) return null;

  const handleRollParsed = (deptName: string, year: number) => {
    if (deptName && deptName !== 'Unknown Department') {
      setDepartment(deptName);
    }
    if (year) {
      setJoiningYear(year);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const interests = interestsStr.split(',').map(s => s.trim()).filter(Boolean);

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      full_name: fullName.trim(),
      email: email.trim(),
      role,
      roll_number: role === 'STUDENT' ? rollNumber.trim().toUpperCase() : undefined,
      department,
      joining_year: role === 'STUDENT' ? Number(joiningYear) : undefined,
      gender,
      bio,
      portfolio_url: portfolioUrl || undefined,
      github_url: githubUrl || undefined,
      linkedin_url: linkedinUrl || undefined,
      skills: skills.length > 0 ? skills : ['General Collaboration'],
      interests: interests.length > 0 ? interests : ['Campus Activities'],
      designation: role === 'FACULTY' ? designation : undefined,
      // cabin_or_lab field removed as cabinOrLab was undefined
    };

    registerUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D1017] rounded-2xl shadow-2xl border border-[#1E2433] flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2433] bg-[#0A0D14]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#22C55E]" />
              Amrita Identity & Collaboration Access
            </h2>
            <p className="text-xs text-slate-400">
              Sign up with automated Amrita roll-number token parsing, or select an existing persona.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#131722] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#1E2433] bg-[#0A0D14]">
          <button
            onClick={() => setMode('SIGNUP')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              mode === 'SIGNUP'
                ? 'border-[#22C55E] text-[#22C55E] bg-[#0D1017]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            New Registration (With Roll-Number Parser)
          </button>

          <button
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              mode === 'LOGIN'
                ? 'border-[#22C55E] text-[#22C55E] bg-[#0D1017]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Quick Persona Switcher (6 Pre-configured)
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {mode === 'SIGNUP' ? (
            <form onSubmit={handleSignUpSubmit} className="space-y-5 text-xs">
              
              {/* Role Toggle */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select User Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`py-2.5 px-4 rounded-full font-bold flex items-center justify-center gap-2 border transition-all ${
                      role === 'STUDENT'
                        ? 'bg-[#22C55E] text-black border-[#22C55E] shadow-sm'
                        : 'bg-[#131722] border-[#232B3C] text-slate-300 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Student
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('FACULTY')}
                    className={`py-2.5 px-4 rounded-full font-bold flex items-center justify-center gap-2 border transition-all ${
                      role === 'FACULTY'
                        ? 'bg-[#22C55E] text-black border-[#22C55E] shadow-sm'
                        : 'bg-[#131722] border-[#232B3C] text-slate-300 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Faculty Coordinator
                  </button>
                </div>
              </div>

              {/* Student Roll Number Parser (Automated) */}
              {role === 'STUDENT' ? (
                <div className="p-4 rounded-xl bg-[#0A0D14] border border-[#1E2433] space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-[#22C55E]">
                    <Sparkles className="w-4 h-4 text-[#22C55E]" />
                    Amrita Roll-Number Auto-Parser Engine
                  </div>
                  
                  <RollNumberParserWidget
                    rollNumber={rollNumber}
                    onChange={setRollNumber}
                    onParsed={handleRollParsed}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Pre-filled Department (Editable override)
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Joining Year (Batch)
                      </label>
                      <input
                        type="number"
                        value={joiningYear}
                        onChange={(e) => setJoiningYear(parseInt(e.target.value) || 2024)}
                        className="w-full px-3 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Faculty Fields */
                <div className="p-4 rounded-xl bg-[#0A0D14] border border-[#1E2433] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Faculty Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Professor & Robotics Lab Lead"
                      className="w-full px-3 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science and Engineering"
                      className="w-full px-3 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aditi Krishnan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    College Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aditi.k@cb.students.amrita.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              {/* Bio & Links */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Bio / Focus Areas
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell peers what you build, specialize in, or hope to learn..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              {/* Skills & Interests Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Technical Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    placeholder="e.g. React, ROS2, OpenCV, DaVinci"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Interests / Hobbies (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={interestsStr}
                    onChange={(e) => setInterestsStr(e.target.value)}
                    placeholder="e.g. Hackathons, Badminton, Films"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              {/* External Portfolio Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Portfolio Website</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://myportfolio.dev"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              {/* Gender Preference (Optional, for Carpool) */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Gender (Optional, private by default, used only when filtering travel listings)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white focus:outline-none focus:border-[#22C55E]"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm shadow-md shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Registration & Enter Platform
                </button>
              </div>

            </form>
          ) : (
            /* Quick Switcher */
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Click any of the pre-loaded profiles to immediately simulate that user's view, applications, chat access, and permissions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        isCurrent
                          ? 'border-[#22C55E] bg-[#22C55E]/10 ring-1 ring-[#22C55E]/30'
                          : 'border-[#1E2433] hover:border-[#22C55E]/50 bg-[#07090E]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#131722] border border-[#232B3C] text-[#22C55E] font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                          user.full_name.charAt(0)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white truncate">
                            {user.full_name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            user.role === 'FACULTY' 
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                              : 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]'
                          }`}>
                            {user.role}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 truncate font-mono">
                          {user.roll_number || user.designation || user.department}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
