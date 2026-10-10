import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCategory, JoinMode } from '../types';
import { 
  X, 
  Plus, 
  MapPin, 
  ShieldCheck, 
  Car, 
  Lock, 
  Unlock,
  Users,
  Compass,
  Sparkles,
  Palette,
  GraduationCap
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

  // Common Core Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [joinMode, setJoinMode] = useState<JoinMode>('UNLOCKED');
  const [totalSlots, setTotalSlots] = useState<number>(4);
  const [venueName, setVenueName] = useState(landmarks[0]?.name || 'Academic Block 1 (AB1)');

  // Dates & Times
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');

  // Skills / Activity Tags
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Eligibility
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['ANY']);
  const [selectedYears, setSelectedYears] = useState<number[]>([2023, 2024]);

  // Faculty Specifics
  const [odAvailable, setOdAvailable] = useState<boolean>(isFaculty);
  const [odHours, setOdHours] = useState<number>(8);
  const [odDetails, setOdDetails] = useState('Sanctioned departmental On-Duty (OD) regularized by Faculty In-Charge.');
  const [researchPerks, setResearchPerks] = useState('IEEE Conference Co-Authorship & Research Lab Mentorship');
  const [weeklyCommitmentHours, setWeeklyCommitmentHours] = useState<number>(8);

  // Carpool / Travel Specifics
  const [carpoolOrigin, setCarpoolOrigin] = useState('Campus Main Gate Bus Bay');
  const [carpoolDestination, setCarpoolDestination] = useState('Coimbatore Junction Railway Station');
  const [carpoolCostSplit, setCarpoolCostSplit] = useState('');
  const [carpoolGenderPref, setCarpoolGenderPref] = useState<'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY'>('ANY');

  // Validation errors & submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Category switch handler: clears stale category-specific fields safely
  const handleCategoryChange = (newCategory: PostCategory) => {
    if (newCategory === category) return;
    setCategory(newCategory);
    setErrors({});

    if (newCategory === 'CARPOOL') {
      // Clear skills & OD for travel
      setSkills([]);
      setOdAvailable(false);
      setJoinMode('UNLOCKED');
      setTotalSlots(3);
    } else if (category === 'CARPOOL') {
      // Switching away from carpool
      setCarpoolOrigin('Campus Main Gate Bus Bay');
      setCarpoolDestination('Coimbatore Junction Railway Station');
      setCarpoolCostSplit('');
      setSkills([]);
      setTotalSlots(4);
    }

    if (newCategory === 'FACULTY_RESEARCH') {
      setJoinMode('LOCKED');
      setOdAvailable(true);
    } else if (newCategory === 'FACULTY_WORKSHOP' || newCategory === 'FACULTY_VOLUNTEER') {
      setOdAvailable(isFaculty);
    } else {
      setOdAvailable(false);
    }
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isTravel = category === 'CARPOOL';

    // Run client-side validation
    const validationErrors = validatePostForm({
      title,
      description,
      category,
      startDate,
      startTime,
      endTime,
      totalSlots,
      venueName: isTravel ? (carpoolOrigin || 'Campus Pickup') : venueName,
      odAvailable: !isTravel && isFaculty ? odAvailable : false,
      odHours: !isTravel && odAvailable ? odHours : undefined,
      carpoolOrigin: isTravel ? carpoolOrigin : undefined,
      carpoolDestination: isTravel ? carpoolDestination : undefined,
      carpoolCostSplit: isTravel ? carpoolCostSplit : undefined,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endIso = endTime ? new Date(`${startDate}T${endTime}:00`).toISOString() : startIso;
      const isResearch = category === 'FACULTY_RESEARCH';
      const isFacultyCategory = isFaculty || category === 'FACULTY_WORKSHOP' || category === 'FACULTY_RESEARCH' || category === 'FACULTY_VOLUNTEER';

      createPost({
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim() || undefined,
        category,
        join_mode: joinMode,
        total_slots: Number(totalSlots),
        venue_name: isTravel ? carpoolOrigin.trim() : venueName,
        start_time: startIso,
        end_time: endIso,
        required_skills: isTravel ? [] : skills,
        eligible_departments: isTravel ? ['ANY'] : selectedDepts,
        eligible_years: isTravel ? [] : selectedYears,
        target_roles: undefined, // Role breakdown permanently removed from new creation
        od_available: (!isTravel && isFacultyCategory) ? odAvailable : false,
        od_hours: (!isTravel && isFacultyCategory && odAvailable) ? Number(odHours) : 0,
        od_details: (!isTravel && isFacultyCategory && odAvailable) ? odDetails : undefined,
        research_perks: isResearch ? researchPerks : undefined,
        weekly_commitment_hours: isResearch ? Number(weeklyCommitmentHours) : undefined,
        carpool_origin: isTravel ? carpoolOrigin.trim() : undefined,
        carpool_destination: isTravel ? carpoolDestination.trim() : undefined,
        carpool_cost_split: (isTravel && carpoolCostSplit.trim()) ? carpoolCostSplit.trim() : undefined,
        carpool_gender_pref: isTravel ? carpoolGenderPref : 'ANY',
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category-specific placeholder texts
  const getTitlePlaceholder = () => {
    switch (category) {
      case 'CARPOOL':
        return 'Weekend ride from campus to Coimbatore Junction';
      case 'STUDENT_CASUAL':
        return 'Casual badminton doubles match';
      case 'STUDENT_CREATIVE':
        return 'Short film collaboration for the campus festival';
      case 'FACULTY_RESEARCH':
        return 'Autonomous Drone Swarm Navigation Research Assistantship';
      case 'FACULTY_WORKSHOP':
        return 'Hands-on Workshop: ROS2 and Embedded Robotics on Jetson';
      case 'FACULTY_VOLUNTEER':
        return 'Student Volunteer Desk: National Robotics Symposium 2026';
      default:
        return 'Opportunity Title';
    }
  };

  const getDescriptionPlaceholder = () => {
    switch (category) {
      case 'CARPOOL':
        return 'Share your departure time, destination, travel plan, and any details other students should know before joining.';
      case 'STUDENT_CASUAL':
        return 'Looking for players for a friendly badminton match. Mention the experience level, preferred format, and any useful details.';
      case 'STUDENT_CREATIVE':
        return 'Describe the creative idea, the kind of collaboration needed, and any relevant project details.';
      case 'FACULTY_RESEARCH':
        return 'Detail the research objective, methodology, and expected contributions from student researchers.';
      case 'FACULTY_WORKSHOP':
        return 'Overview of workshop syllabus, key topics covered, and practical learning outcomes for attendees.';
      case 'FACULTY_VOLUNTEER':
        return 'Volunteer responsibilities, event coordination tasks, and shift schedules for this campus activity.';
      default:
        return 'Provide a clear description of the opportunity...';
    }
  };

  const getInstructionsPlaceholder = () => {
    switch (category) {
      case 'CARPOOL':
        return 'Example: Meet at the pickup point 10 minutes before departure.';
      case 'STUDENT_CASUAL':
        return 'Example: Bring your badminton racket if you have one.';
      case 'STUDENT_CREATIVE':
        return 'Example: Bring your DSLR camera or sample portfolio links.';
      case 'FACULTY_RESEARCH':
        return 'Example: Submit CV and GitHub repository links with previous projects.';
      case 'FACULTY_WORKSHOP':
        return 'Example: Install Docker and bring your laptop fully charged.';
      default:
        return 'Optional participant instructions or prerequisites.';
    }
  };

  const getSkillsConfig = () => {
    switch (category) {
      case 'STUDENT_CASUAL':
        return {
          label: 'Activity Tags (Optional)',
          placeholder: 'e.g. Badminton, Football, Chess, Fitness (press Enter)',
          helper: 'Optional sport or game tags to help peers discover this activity. No technical skills required.',
        };
      case 'STUDENT_CREATIVE':
        return {
          label: 'Creative Skills / Media Tags (Optional)',
          placeholder: 'Example: Photography, video editing, scriptwriting, music (press Enter)',
          helper: 'Optional creative interests to match with relevant student artists and media creators.',
        };
      case 'FACULTY_RESEARCH':
        return {
          label: 'Required Technical Skills & Tooling',
          placeholder: 'e.g. ROS2, Python, OpenCV, MATLAB (press Enter)',
          helper: 'Specify required technical prerequisites for student researchers.',
        };
      case 'FACULTY_WORKSHOP':
        return {
          label: 'Recommended Prerequisites / Topics (Optional)',
          placeholder: 'e.g. Linux Basics, C++, Python (press Enter)',
          helper: 'Recommended background knowledge for attendees.',
        };
      default:
        return {
          label: 'Tags / Topics (Optional)',
          placeholder: 'Type tag and press Enter',
          helper: 'Optional tags to categorize this opportunity.',
        };
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
        
        {/* SECTION 1: Opportunity Category Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AAB8]">
            Select Opportunity Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {isFaculty ? (
              <>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('FACULTY_WORKSHOP')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    category === 'FACULTY_WORKSHOP'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/40'
                      : 'border-[#27303D] bg-[#11151B] hover:bg-[#171C24] text-[#A1AAB8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#22C55E]" />
                    Official Workshop
                  </div>
                  <div className="text-[11px] font-normal text-[#A1AAB8]">Departmental Talks & Masterclasses</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('FACULTY_RESEARCH')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    category === 'FACULTY_RESEARCH'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/40'
                      : 'border-[#27303D] bg-[#11151B] hover:bg-[#171C24] text-[#A1AAB8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                    Research Call
                  </div>
                  <div className="text-[11px] font-normal text-[#A1AAB8]">Funded Projects & IEEE Papers</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('FACULTY_VOLUNTEER')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    category === 'FACULTY_VOLUNTEER'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/40'
                      : 'border-[#27303D] bg-[#11151B] hover:bg-[#171C24] text-[#A1AAB8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <Users className="w-3.5 h-3.5 text-[#22C55E]" />
                    Volunteer Desk
                  </div>
                  <div className="text-[11px] font-normal text-[#A1AAB8]">Anokha & Conference Desks</div>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('STUDENT_CASUAL')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    category === 'STUDENT_CASUAL'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/40'
                      : 'border-[#27303D] bg-[#11151B] hover:bg-[#171C24] text-[#A1AAB8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <Compass className="w-3.5 h-3.5 text-[#22C55E]" />
                    Casual & Sports
                  </div>
                  <div className="text-[11px] font-normal text-[#A1AAB8]">Badminton, Football, Gaming & Casual Meetups</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('STUDENT_CREATIVE')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    category === 'STUDENT_CREATIVE'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/40'
                      : 'border-[#27303D] bg-[#11151B] hover:bg-[#171C24] text-[#A1AAB8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <Palette className="w-3.5 h-3.5 text-[#22C55E]" />
                    Creative & Media
                  </div>
                  <div className="text-[11px] font-normal text-[#A1AAB8]">Short Films, Photography, Music, Design</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('CARPOOL')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    category === 'CARPOOL'
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-[#22C55E]/40'
                      : 'border-[#27303D] bg-[#11151B] hover:bg-[#171C24] text-[#A1AAB8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <Car className="w-3.5 h-3.5 text-[#22C55E]" />
                    Carpool & Travel
                  </div>
                  <div className="text-[11px] font-normal text-[#A1AAB8]">Railway, Airport & City Rides</div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: Common Title & Description with Category-specific labels & placeholders */}
        <div className="space-y-4">
          <Input
            label={category === 'CARPOOL' ? 'Travel Opportunity Title *' : 'Opportunity Title *'}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder={getTitlePlaceholder()}
          />

          <Textarea
            label={category === 'CARPOOL' ? 'Travel Plan & Details *' : 'Description & Scope *'}
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            placeholder={getDescriptionPlaceholder()}
          />

          <Input
            label={category === 'CARPOOL' ? 'Meeting or Pickup Instructions (Optional)' : 'Participant Instructions (Optional)'}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={getInstructionsPlaceholder()}
          />
        </div>

        {/* SECTION 3: Category-Specific Carpool & Transit Logistics */}
        {category === 'CARPOOL' && (
          <div className="p-4 rounded-xl border border-[#27303D] bg-[#11151B] space-y-4">
            <div className="font-bold text-xs text-[#22C55E] flex items-center gap-2">
              <Car className="w-4 h-4 text-[#22C55E]" />
              <span>Carpool & Transit Logistics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Pickup Point *"
                required
                value={carpoolOrigin}
                onChange={(e) => setCarpoolOrigin(e.target.value)}
                error={errors.carpoolOrigin}
                placeholder="Campus Main Gate Bus Bay"
              />

              <Input
                label="Destination *"
                required
                value={carpoolDestination}
                onChange={(e) => setCarpoolDestination(e.target.value)}
                error={errors.carpoolDestination}
                placeholder="Coimbatore Junction Railway Station"
              />

              <Input
                label="Estimated Fare Splitting (Optional)"
                value={carpoolCostSplit}
                onChange={(e) => setCarpoolCostSplit(e.target.value)}
                error={errors.carpoolCostSplit}
                placeholder="Estimated total fare in ₹, or leave blank if not applicable"
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

        {/* SECTION 4: Schedule, Capacity & Joining Mode */}
        <div className="p-4 rounded-xl border border-[#27303D] bg-[#11151B] space-y-4">
          <div className="font-bold text-xs text-white">
            {category === 'CARPOOL' ? 'Travel Schedule & Available Seats' : 'Schedule & Capacity'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label={category === 'CARPOOL' ? 'Departure Date *' : 'Event Date *'}
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.startDate}
            />

            <Input
              label={category === 'CARPOOL' ? 'Departure Time *' : 'Start Time *'}
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={errors.startTime}
            />

            <Input
              label={category === 'CARPOOL' ? 'Estimated Arrival Time' : 'End Time *'}
              type="time"
              required={category !== 'CARPOOL'}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              error={errors.endTime}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#27303D]">
            <div>
              <label className="block text-xs font-semibold text-[#A1AAB8] mb-1.5">
                Joining Preference
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setJoinMode('UNLOCKED')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    joinMode === 'UNLOCKED'
                      ? 'bg-[#22C55E] text-black font-bold shadow-xs'
                      : 'bg-[#171C24] text-[#A1AAB8] border border-[#27303D] hover:text-white'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Instant (FCFS)
                </button>
                <button
                  type="button"
                  onClick={() => setJoinMode('LOCKED')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    joinMode === 'LOCKED'
                      ? 'bg-[#22C55E] text-black font-bold shadow-xs'
                      : 'bg-[#171C24] text-[#A1AAB8] border border-[#27303D] hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Approval Required
                </button>
              </div>
            </div>

            <div>
              <Input
                label={category === 'CARPOOL' ? 'Available Passenger Seats *' : 'Total Participant Slots *'}
                type="number"
                min={1}
                max={category === 'CARPOOL' ? 10 : 500}
                required
                value={totalSlots}
                onChange={(e) => setTotalSlots(parseInt(e.target.value) || 1)}
                error={errors.totalSlots}
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Venue (Shown for all NON-carpool opportunities) */}
        {category !== 'CARPOOL' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#A1AAB8]">
                Campus Landmark / Venue *
              </label>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="text-xs text-[#22C55E] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
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
          </div>
        )}

        {/* SECTION 6: Category-Specific Tags / Skills (NOT shown for Carpool) */}
        {category !== 'CARPOOL' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#A1AAB8]">
              {getSkillsConfig().label}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                placeholder={getSkillsConfig().placeholder}
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#27303D] bg-[#0E121A] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#22C55E]"
              />
              <Button variant="secondary" size="sm" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            <p className="text-[11px] text-[#A1AAB8]">{getSkillsConfig().helper}</p>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold flex items-center gap-1 border border-[#22C55E]/30"
                  >
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-rose-400 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 7: Faculty OD & Research Perks (Only for Official Faculty postings) */}
        {isFaculty && category !== 'CARPOOL' && (
          <div className="p-4 rounded-xl border border-[#27303D] bg-[#11151B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#22C55E] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                Institutional On-Duty (OD) Regularization
              </span>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-[#A1AAB8] hover:text-white">
                <input
                  type="checkbox"
                  checked={odAvailable}
                  onChange={(e) => setOdAvailable(e.target.checked)}
                  className="rounded text-[#22C55E] focus:ring-[#22C55E] bg-[#0E121A] border-[#27303D]"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#27303D]">
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

        {/* SECTION 8: Department & Batch Whitelist (Only for non-travel opportunities) */}
        {category !== 'CARPOOL' && (
          <div className="space-y-3 p-4 rounded-xl border border-[#27303D] bg-[#11151B]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#A1AAB8]">
                  Department Eligibility Whitelist
                </label>
                <span className="text-[11px] text-[#64748B]">
                  {selectedDepts.includes('ANY') ? 'Open to all departments' : `${selectedDepts.length} selected`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
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
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      selectedDepts.includes(dept)
                        ? 'bg-[#22C55E]/15 border border-[#22C55E] text-[#22C55E]'
                        : 'bg-[#171C24] hover:bg-[#202733] text-[#A1AAB8] hover:text-white border border-[#27303D]'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#27303D]">
              <label className="block text-xs font-semibold text-[#A1AAB8]">
                Eligible Joining Batches
              </label>
              <div className="flex flex-wrap gap-1.5 text-xs">
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
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      selectedYears.includes(yr)
                        ? 'bg-[#22C55E]/15 border border-[#22C55E] text-[#22C55E]'
                        : 'bg-[#171C24] hover:bg-[#202733] text-[#A1AAB8] hover:text-white border border-[#27303D]'
                    }`}
                  >
                    {yr} Batch
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Submit Footer */}
        <div className="pt-4 border-t border-[#27303D] flex items-center justify-end gap-2">
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
