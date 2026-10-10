import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCategory, JoinMode, TargetRoleSlot } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  MapPin, 
  ShieldCheck, 
  Car, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Modal } from './ui/Modal';
import { validatePostForm } from '../utils/validation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: PostCategory;
}

export const CreatePostModal: React.FC<Props> = ({ isOpen, onClose, initialCategory }) => {
  const { currentUser, createPost, landmarks, setIsMapModalOpen } = useApp();

  const isFaculty = currentUser ? currentUser.role === 'FACULTY' : false;

  const [category, setCategory] = useState<PostCategory>(
    initialCategory || (isFaculty ? 'FACULTY_WORKSHOP' : 'STUDENT_CASUAL')
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [joinMode, setJoinMode] = useState<JoinMode>('UNLOCKED');
  const [totalSlots, setTotalSlots] = useState<number>(4);
  const [venueName, setVenueName] = useState(landmarks[0]?.name || 'Academic Block 1 (AB1)');

  // Dates
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');

  // Skills
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'Python']);

  // Eligibility
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['ANY']);
  const [selectedYears, setSelectedYears] = useState<number[]>([2023, 2024]);

  // Target Roles breakdown
  const [targetRoles, setTargetRoles] = useState<TargetRoleSlot[]>([
    { role: 'Core Contributor', slots: 2, filled: 0 },
    { role: 'Technical Assistant', slots: 2, filled: 0 },
  ]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleSlots, setNewRoleSlots] = useState(2);

  // Faculty specifics
  const [odAvailable, setOdAvailable] = useState<boolean>(isFaculty);
  const [odHours, setOdHours] = useState<number>(8);
  const [odDetails, setOdDetails] = useState('Sanctioned departmental On-Duty (OD) regularized by Faculty In-Charge.');
  const [researchPerks, setResearchPerks] = useState('IEEE Conference Co-Authorship & Research Lab Mentorship');
  const [weeklyCommitmentHours, setWeeklyCommitmentHours] = useState<number>(8);

  // Carpool specifics
  const [carpoolOrigin, setCarpoolOrigin] = useState('Campus Main Gate Bus Bay');
  const [carpoolDestination, setCarpoolDestination] = useState('Coimbatore Junction Railway Station (CBE)');
  const [carpoolCostSplit, setCarpoolCostSplit] = useState('₹600 total (~₹150 per head for cab)');
  const [carpoolGenderPref, setCarpoolGenderPref] = useState<'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY'>('ANY');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddRoleSlot = () => {
    if (newRoleName.trim()) {
      setTargetRoles(prev => [...prev, { role: newRoleName.trim(), slots: Number(newRoleSlots), filled: 0 }]);
      setNewRoleName('');
    }
  };

  const handleRemoveRoleSlot = (idx: number) => {
    setTargetRoles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Run client-side validation
    const validationErrors = validatePostForm({
      title,
      description,
      category,
      startDate,
      startTime,
      endTime,
      totalSlots,
      venueName,
      targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
      odAvailable,
      odHours: odAvailable ? odHours : undefined,
      carpoolOrigin: category === 'CARPOOL' ? carpoolOrigin : undefined,
      carpoolDestination: category === 'CARPOOL' ? carpoolDestination : undefined,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endIso = new Date(`${startDate}T${endTime}:00`).toISOString();

      createPost({
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim() || undefined,
        category,
        join_mode: joinMode,
        total_slots: Number(totalSlots),
        venue_name: venueName,
        start_time: startIso,
        end_time: endIso,
        required_skills: skills,
        eligible_departments: selectedDepts,
        eligible_years: selectedYears,
        target_roles: targetRoles.length > 0 ? targetRoles : undefined,
        od_available: odAvailable,
        od_hours: odAvailable ? Number(odHours) : 0,
        od_details: odAvailable ? odDetails : undefined,
        research_perks: category === 'FACULTY_RESEARCH' ? researchPerks : undefined,
        weekly_commitment_hours: category === 'FACULTY_RESEARCH' ? Number(weeklyCommitmentHours) : undefined,
        carpool_origin: category === 'CARPOOL' ? carpoolOrigin : undefined,
        carpool_destination: category === 'CARPOOL' ? carpoolDestination : undefined,
        carpool_cost_split: category === 'CARPOOL' ? carpoolCostSplit : undefined,
        carpool_gender_pref: category === 'CARPOOL' ? carpoolGenderPref : 'ANY',
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Opportunity"
      description={`Posting as: ${currentUser?.full_name || 'Campus Member'} (${currentUser?.role === 'FACULTY' ? 'Official Faculty' : 'Student Organizer'})`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs sm:text-sm">
        
        {/* SECTION 1: Opportunity Category */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Opportunity Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {isFaculty ? (
              <>
                <button
                  type="button"
                  onClick={() => { setCategory('FACULTY_WORKSHOP'); setOdAvailable(true); setJoinMode('UNLOCKED'); }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    category === 'FACULTY_WORKSHOP'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/30'
                      : 'border-[#1E2433] bg-[#0A0D14] hover:bg-[#131722] text-slate-300'
                  }`}
                >
                  <div className="font-bold">Official Workshop</div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5">Departmental Talks & Masterclasses</div>
                </button>

                <button
                  type="button"
                  onClick={() => { setCategory('FACULTY_RESEARCH'); setOdAvailable(true); setJoinMode('LOCKED'); }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    category === 'FACULTY_RESEARCH'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/30'
                      : 'border-[#1E2433] bg-[#0A0D14] hover:bg-[#131722] text-slate-300'
                  }`}
                >
                  <div className="font-bold">Research Assistantship</div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5">Funded Projects & IEEE Papers</div>
                </button>

                <button
                  type="button"
                  onClick={() => { setCategory('FACULTY_VOLUNTEER'); setOdAvailable(true); setJoinMode('LOCKED'); }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    category === 'FACULTY_VOLUNTEER'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/30'
                      : 'border-[#1E2433] bg-[#0A0D14] hover:bg-[#131722] text-slate-300'
                  }`}
                >
                  <div className="font-bold">Fest / Volunteer Desk</div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5">Anokha & Conference Desks</div>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setCategory('STUDENT_CASUAL'); setOdAvailable(false); }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    category === 'STUDENT_CASUAL'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/30'
                      : 'border-[#1E2433] bg-[#0A0D14] hover:bg-[#131722] text-slate-300'
                  }`}
                >
                  <div className="font-bold">Casual & Sports</div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5">Badminton, Gaming & Jamming</div>
                </button>

                <button
                  type="button"
                  onClick={() => { setCategory('STUDENT_CREATIVE'); setOdAvailable(false); }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    category === 'STUDENT_CREATIVE'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/30'
                      : 'border-[#1E2433] bg-[#0A0D14] hover:bg-[#131722] text-slate-300'
                  }`}
                >
                  <div className="font-bold">Creative & Media</div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5">Short Films, Photography, Music</div>
                </button>

                <button
                  type="button"
                  onClick={() => { setCategory('CARPOOL'); setOdAvailable(false); setJoinMode('UNLOCKED'); }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    category === 'CARPOOL'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/30'
                      : 'border-[#1E2433] bg-[#0A0D14] hover:bg-[#131722] text-slate-300'
                  }`}
                >
                  <div className="font-bold">Carpool & Travel</div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5">Railway, Airport, Town Cabs</div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: Title & Description */}
        <div className="space-y-4">
          <Input
            label="Opportunity Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder={
              category === 'CARPOOL' 
                ? 'e.g. Weekend Carpool: Campus to Coimbatore Junction (CBE) - Train #12678'
                : isFaculty
                  ? 'e.g. Research Assistantship: Autonomous Drone Swarm Navigation'
                  : 'e.g. SIH 2026: Team AmritaCyber — Need OpenCV & React Developer'
            }
          />

          <Textarea
            label="Description & Scope"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            placeholder="Detail the technical objectives, expected contributions, and prerequisites for applicants..."
          />

          <Input
            label="Participant Instructions (Optional)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Bring laptop with Ubuntu 22.04 LTS; meet at Main Gate Bus Bay by 12:45 PM"
          />
        </div>

        {/* SECTION 3: Joining Mode & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-[#1E2433] bg-[#0A0D14]">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Joining Mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJoinMode('UNLOCKED')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  joinMode === 'UNLOCKED'
                    ? 'bg-[#22C55E] text-black font-bold shadow-xs'
                    : 'bg-[#131722] text-slate-300 border border-[#232B3C] hover:text-white'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                Instant (FCFS)
              </button>
              <button
                type="button"
                onClick={() => setJoinMode('LOCKED')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  joinMode === 'LOCKED'
                    ? 'bg-[#22C55E] text-black font-bold shadow-xs'
                    : 'bg-[#131722] text-slate-300 border border-[#232B3C] hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Approval Required
              </button>
            </div>
          </div>

          <div>
            <Input
              label="Total Participant Slots"
              type="number"
              min={1}
              max={500}
              required
              value={totalSlots}
              onChange={(e) => setTotalSlots(parseInt(e.target.value) || 1)}
              error={errors.totalSlots}
            />
          </div>
        </div>

        {/* SECTION 4: Carpool Specialized Fields */}
        {category === 'CARPOOL' && (
          <div className="p-4 rounded-xl border border-[#1E2433] bg-[#0A0D14] space-y-3">
            <div className="font-bold text-xs text-[#22C55E] flex items-center gap-1.5">
              <Car className="w-4 h-4 text-[#22C55E]" />
              Carpool & Transit Logistics
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Pickup Spot"
                value={carpoolOrigin}
                onChange={(e) => setCarpoolOrigin(e.target.value)}
              />

              <Input
                label="Drop-off Destination"
                value={carpoolDestination}
                onChange={(e) => setCarpoolDestination(e.target.value)}
              />

              <Input
                label="Estimated Fare Splitting"
                value={carpoolCostSplit}
                onChange={(e) => setCarpoolCostSplit(e.target.value)}
              />

              <Select
                label="Safety & Companion Preference"
                value={carpoolGenderPref}
                onChange={(e) => setCarpoolGenderPref(e.target.value as any)}
              >
                <option value="ANY">Open to All Students</option>
                <option value="FEMALE_ONLY">Female Co-travelers Only</option>
                <option value="MALE_ONLY">Male Co-travelers Only</option>
              </Select>
            </div>
          </div>
        )}

        {/* SECTION 5: Faculty OD & Research Perks */}
        {isFaculty && (
          <div className="p-4 rounded-xl border border-[#1E2433] bg-[#0A0D14] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#22C55E] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                Institutional On-Duty (OD) Regularization
              </span>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={odAvailable}
                  onChange={(e) => setOdAvailable(e.target.checked)}
                  className="rounded text-[#22C55E] focus:ring-[#22C55E] bg-[#07090E] border-[#1E2433]"
                />
                <span>Sanction Official OD</span>
              </label>
            </div>

            {odAvailable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label="Sanctioned OD Hours"
                  type="number"
                  min={1}
                  max={40}
                  value={odHours}
                  onChange={(e) => setOdHours(parseInt(e.target.value) || 8)}
                  error={errors.odHours}
                />

                <Input
                  label="OD Certificate Authorization Reference"
                  value={odDetails}
                  onChange={(e) => setOdDetails(e.target.value)}
                />
              </div>
            )}

            {category === 'FACULTY_RESEARCH' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1E2433]">
                <Input
                  label="Research Perks & Co-Authorship"
                  value={researchPerks}
                  onChange={(e) => setResearchPerks(e.target.value)}
                />

                <Input
                  label="Weekly Lab Hours Commitment"
                  type="number"
                  min={1}
                  max={40}
                  value={weeklyCommitmentHours}
                  onChange={(e) => setWeeklyCommitmentHours(parseInt(e.target.value) || 8)}
                />
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: Venue & Schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Campus Landmark / Venue *
            </label>
            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="text-xs text-[#22C55E] font-semibold flex items-center gap-1 hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              Pick Landmark from Campus Map
            </button>
          </div>

          <Select
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            error={errors.venueName}
          >
            {landmarks.map(lm => (
              <option key={lm.id} value={lm.name}>
                {lm.short_code} — {lm.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Event Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.startDate}
            />

            <Input
              label="Start Time"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={errors.startTime}
            />

            <Input
              label="End Time"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              error={errors.endTime}
            />
          </div>
        </div>

        {/* SECTION 7: Required Skills */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Required Technical Skills / Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              placeholder="Type skill (e.g. ROS2, React, OpenCV) and press Enter"
              className="flex-1 px-3.5 py-2 rounded-xl border border-[#1E2433] bg-[#07090E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#22C55E]"
            />
            <Button variant="secondary" size="sm" onClick={handleAddSkill}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold flex items-center gap-1 border border-[#22C55E]/30"
              >
                {s}
                <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* SECTION 8: Optional Target Roles Breakdown */}
        <div className="p-4 rounded-xl border border-[#1E2433] bg-[#0A0D14] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-white">
              Target Role Breakdown (Optional)
            </span>
            <span className="text-[11px] text-slate-400">
              Define sub-roles (e.g. 2 Frontend, 2 Simulation)
            </span>
          </div>

          {errors.targetRoles && (
            <p className="text-[11px] font-semibold text-rose-500">{errors.targetRoles}</p>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Role Title (e.g. Gazebo Sim Engineer)"
              className="flex-1 px-3 py-1.5 rounded-lg border border-[#1E2433] bg-[#07090E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#22C55E]"
            />
            <input
              type="number"
              min={1}
              max={50}
              value={newRoleSlots}
              onChange={(e) => setNewRoleSlots(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-1.5 rounded-lg border border-[#1E2433] bg-[#07090E] text-white text-xs font-semibold focus:outline-none focus:border-[#22C55E]"
            />
            <Button variant="secondary" size="sm" onClick={handleAddRoleSlot}>
              Add Role
            </Button>
          </div>

          <div className="space-y-1.5">
            {targetRoles.map((tr, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#07090E] border border-[#1E2433] text-xs">
                <span className="font-semibold text-slate-200">{tr.role}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">{tr.slots} slots</span>
                  <button type="button" onClick={() => handleRemoveRoleSlot(idx)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 9: Department Whitelist */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Department Eligibility Whitelist
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            {['ANY', 'CSE', 'ARE', 'AIE', 'ECE', 'ME', 'CYS'].map(dept => (
              <button
                key={dept}
                type="button"
                onClick={() => {
                  if (dept === 'ANY') {
                    setSelectedDepts(['ANY']);
                  } else {
                    const withoutAny = selectedDepts.filter(d => d !== 'ANY');
                    if (withoutAny.includes(dept)) {
                      const next = withoutAny.filter(d => d !== dept);
                      setSelectedDepts(next.length === 0 ? ['ANY'] : next);
                    } else {
                      setSelectedDepts([...withoutAny, dept]);
                    }
                  }
                }}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                  selectedDepts.includes(dept)
                    ? 'bg-[#22C55E]/10 border border-[#22C55E] text-[#22C55E]'
                    : 'bg-[#131722] hover:bg-[#1A202F] text-slate-400 hover:text-white border border-[#232B3C]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 10: Batch Year Eligibility */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Eligible Joining Batches
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            {[2022, 2023, 2024, 2025, 2026].map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => {
                  if (selectedYears.includes(yr)) {
                    if (selectedYears.length > 1) {
                      setSelectedYears(selectedYears.filter(y => y !== yr));
                    }
                  } else {
                    setSelectedYears([...selectedYears, yr]);
                  }
                }}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                  selectedYears.includes(yr)
                    ? 'bg-[#22C55E]/10 border border-[#22C55E] text-[#22C55E]'
                    : 'bg-[#131722] hover:bg-[#1A202F] text-slate-400 hover:text-white border border-[#232B3C]'
                }`}
              >
                {yr} Batch
              </button>
            ))}
          </div>
        </div>

        {/* Modal Submit Footer */}
        <div className="pt-4 border-t border-[#1E2433] flex items-center justify-end gap-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Publish Opportunity
          </Button>
        </div>

      </form>
    </Modal>
  );
};
