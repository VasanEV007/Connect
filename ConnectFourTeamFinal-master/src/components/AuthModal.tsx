import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile } from '../types';
import { Logo } from './ui/Logo';
import { validateCollegeEmail } from '../utils/validation';
import { RollNumberParserWidget } from './RollNumberParserWidget';
import { 
  X, 
  GraduationCap, 
  Building2, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Info
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialMode = 'LOGIN' }) => {
  const { registerNewAccount, loginExistingAccount } = useApp();

  // Mode: LOGIN, REGISTER (Step 1: email/pass), VERIFICATION_NOTICE (Step 2), PROFILE_ONBOARDING (Step 3)
  const [authStep, setAuthStep] = useState<'LOGIN' | 'REGISTER' | 'VERIFY_NOTICE' | 'ONBOARDING'>(
    initialMode === 'REGISTER' ? 'REGISTER' : 'LOGIN'
  );

  // Step 1: Account credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & error states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 3: Onboarding fields
  const [createdUserId, setCreatedUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [joiningYear, setJoiningYear] = useState<number>(2024);
  const [designation, setDesignation] = useState('Assistant Professor');
  const [skillsStr, setSkillsStr] = useState('');
  const [interestsStr, setInterestsStr] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  if (!isOpen) return null;

  // Handle Step 1 Registration (College Email + Password)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validate College Email
    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.message || 'Invalid college email domain.');
      return;
    }

    // 2. Validate Password
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerNewAccount(emailValidation.normalizedEmail, password);
      if (!result.success || !result.userId) {
        setErrorMsg(result.message || 'Failed to create account. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      setCreatedUserId(result.userId);
      // Advance to verification notice or directly to onboarding
      setAuthStep('ONBOARDING');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your college email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginExistingAccount(email.trim().toLowerCase(), password);
      if (!result.success) {
        setErrorMsg(result.message || 'Invalid college email or password.');
        setIsLoading(false);
        return;
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Sign in error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 3 Onboarding Submit
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (userRole === 'STUDENT' && !department.trim()) {
      setErrorMsg('Please select or specify your academic department.');
      return;
    }

    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const interests = interestsStr.split(',').map(s => s.trim()).filter(Boolean);

    // New signups default to student role unless verified by university
    const newProfile: UserProfile = {
      id: createdUserId || `user-${Date.now()}`,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: userRole,
      roll_number: userRole === 'STUDENT' ? rollNumber.trim().toUpperCase() : undefined,
      department: department.trim(),
      joining_year: userRole === 'STUDENT' ? Number(joiningYear) : undefined,
      designation: userRole === 'FACULTY' ? designation.trim() : undefined,
      bio: bio.trim(),
      skills: skills.length > 0 ? skills : ['Collaboration'],
      interests: interests.length > 0 ? interests : ['Campus Activities'],
      github_url: githubUrl.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      is_verified: userRole === 'STUDENT', // Faculty accounts require administrative verification
      created_at: new Date().toISOString(),
    };

    const { completeProfileOnboarding } = (window as unknown as { completeProfileOnboarding?: (p: UserProfile) => void });
    // Save profile into AppContext
    registerNewAccount(email, password, newProfile);
    if (completeProfileOnboarding) {
      completeProfileOnboarding(newProfile);
    }

    onClose();
  };

  const handleRollParsed = (deptName: string, year: number) => {
    if (deptName && deptName !== 'Unknown Department') {
      setDepartment(deptName);
    }
    if (year) {
      setJoiningYear(year);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-xl bg-[var(--color-surface-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[92vh] overflow-hidden text-[var(--color-text-main)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <Logo size="sm" showCampusTag={true} />

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: INITIAL REGISTRATION SCREEN */}
          {authStep === 'REGISTER' && (
            <div>
              <div className="mb-6">
                <h2 id="auth-modal-title" className="text-xl font-bold text-[var(--color-text-main)] tracking-tight">
                  Create your Connect account
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Enter your official university email to join the Amrita campus collaboration network.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* College Email */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    College Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@cb.students.amrita.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-burgundy)] focus:ring-1 focus:ring-[var(--color-burgundy)]"
                    />
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-[var(--color-burgundy)]" />
                    Approved domains: @cb.students.amrita.edu, @cb.amrita.edu, @amrita.edu
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-burgundy)] focus:ring-1 focus:ring-[var(--color-burgundy)]"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-burgundy)] focus:ring-1 focus:ring-[var(--color-burgundy)]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
                Already have an account?{' '}
                <button
                  onClick={() => { setAuthStep('LOGIN'); setErrorMsg(null); }}
                  className="text-[var(--color-burgundy)] dark:text-[#E5DED2] font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* SIGN IN SCREEN */}
          {authStep === 'LOGIN' && (
            <div>
              <div className="mb-6">
                <h2 id="auth-modal-title" className="text-xl font-bold text-[var(--color-text-main)] tracking-tight">
                  Sign in to Connect
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Welcome back. Sign in with your registered college email and password.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* College Email */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    College Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@cb.students.amrita.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-burgundy)] focus:ring-1 focus:ring-[var(--color-burgundy)]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-burgundy)] focus:ring-1 focus:ring-[var(--color-burgundy)]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
                New to Connect?{' '}
                <button
                  onClick={() => { setAuthStep('REGISTER'); setErrorMsg(null); }}
                  className="text-[var(--color-burgundy)] dark:text-[#E5DED2] font-semibold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: POST-REGISTRATION PROFILE ONBOARDING */}
          {authStep === 'ONBOARDING' && (
            <div>
              <div className="mb-5">
                <span className="text-[10px] uppercase font-mono font-bold text-[var(--color-burgundy)] dark:text-[#E5DED2] tracking-wider block mb-1">
                  Step 2 of 2 • Profile Onboarding
                </span>
                <h2 id="auth-modal-title" className="text-xl font-bold text-[var(--color-text-main)] tracking-tight">
                  Complete your campus profile
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Set up your academic details. No profile pictures or photos required.
                </p>
              </div>

              <form onSubmit={handleOnboardingSubmit} className="space-y-4 text-xs">
                {/* Account Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserRole('STUDENT')}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        userRole === 'STUDENT'
                          ? 'bg-[var(--color-burgundy)] text-[#E5DED2] border-[var(--color-burgundy)]'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      Student
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserRole('FACULTY')}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        userRole === 'FACULTY'
                          ? 'bg-[var(--color-burgundy)] text-[#E5DED2] border-[var(--color-burgundy)]'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Faculty
                    </button>
                  </div>
                  {userRole === 'FACULTY' && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Note: Faculty permissions require administrative verification before issuance rights are unlocked.
                    </p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aditi Krishnan"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                    />
                  </div>
                </div>

                {/* Student Roll Number & Department Auto-Parser */}
                {userRole === 'STUDENT' ? (
                  <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--color-burgundy)] dark:text-[#E5DED2] text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--color-burgundy)]" />
                      Amrita Roll-Number Auto Parser
                    </div>

                    <RollNumberParserWidget
                      rollNumber={rollNumber}
                      onChange={setRollNumber}
                      onParsed={handleRollParsed}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                          Academic Department *
                        </label>
                        <input
                          type="text"
                          required
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                          Joining Year (Batch) *
                        </label>
                        <input
                          type="number"
                          required
                          value={joiningYear}
                          onChange={(e) => setJoiningYear(parseInt(e.target.value) || 2024)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Faculty Details */
                  <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                        Faculty Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Assistant Professor"
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                        Department *
                      </label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science and Engineering"
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                      />
                    </div>
                  </div>
                )}

                {/* Skills & Interests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      value={skillsStr}
                      onChange={(e) => setSkillsStr(e.target.value)}
                      placeholder="e.g. React, Python, ROS2, ML"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                      Interests / Focus (comma separated)
                    </label>
                    <input
                      type="text"
                      value={interestsStr}
                      onChange={(e) => setInterestsStr(e.target.value)}
                      placeholder="e.g. Robotics, Hackathons, Carpooling"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                    />
                  </div>
                </div>

                {/* Short Bio */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                    Short Bio (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe what you build or want to collaborate on..."
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                  />
                </div>

                {/* External links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">GitHub URL (Optional)</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">LinkedIn URL (Optional)</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[var(--color-burgundy)]"
                    />
                  </div>
                </div>

                {/* Submit Onboarding */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-[var(--color-burgundy)] hover:bg-[#5F1023] text-[#E5DED2] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Setup & Enter Connect
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
