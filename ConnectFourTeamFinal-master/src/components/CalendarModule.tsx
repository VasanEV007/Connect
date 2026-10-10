import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  List
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export const CalendarModule: React.FC = () => {
  const { 
    currentUser, 
    calendarItems, 
    posts, 
    applications, 
    setSelectedPostForDetail
  } = useApp();

  // Current view month (defaulting to October 2026 for academic semester context)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Oct 2026
  const [selectedDay, setSelectedDay] = useState<number>(18); // Default 18th Oct
  const [mobileViewMode, setMobileViewMode] = useState<'grid' | 'agenda'>('grid');

  // Registered post IDs for active user
  const joinedPostIds = useMemo(() => {
    if (!currentUser) return [];
    return applications
      .filter(a => a.applicant_id === currentUser.id && a.status === 'ACCEPTED')
      .map(a => a.post_id);
  }, [applications, currentUser]);

  const joinedPosts = useMemo(() => {
    return posts.filter(p => joinedPostIds.includes(p.id));
  }, [posts, joinedPostIds]);

  const hostedPosts = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter(p => p.host_id === currentUser.id);
  }, [posts, currentUser]);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date(2026, 9, 1));
    setSelectedDay(18);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to extract events for a specific day
  const getDayEvents = (dayNumber: number) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const dateStr = `${year}-${pad(month + 1)}-${pad(dayNumber)}`;

    // Calendar institutional items
    const instEvents = calendarItems.filter(item => {
      if (!item.end_date) return item.event_date === dateStr;
      return dateStr >= item.event_date && dateStr <= item.end_date;
    });

    // Registered posts
    const registered = joinedPosts.filter(p => p.start_time.startsWith(dateStr));

    // Hosted posts
    const hosted = hostedPosts.filter(p => p.start_time.startsWith(dateStr));

    return {
      instEvents,
      registered,
      hosted,
      total: instEvents.length + registered.length + hosted.length,
    };
  };

  const selectedDayData = getDayEvents(selectedDay);

  // Clash check for selected day
  const dayHasExam = selectedDayData.instEvents.some(e => e.event_type === 'EXAM');
  const dayHasActivities = selectedDayData.registered.length > 0 || selectedDayData.hosted.length > 0;
  const hasExamClash = dayHasExam && dayHasActivities;

  return (
    <div className="space-y-6">
      
      {/* Calendar Header */}
      <div className="bg-[#0D1017] p-6 rounded-2xl border border-[#1E2433] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Academic & Activities Calendar
              </h1>
              <Badge variant="primary" size="sm">
                Interval Clash Detector
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized timetable connecting official Amrita semester exams, university holidays, and your joined workshops & carpools.
            </p>
          </div>

          {/* Month Stepper & Mode Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Mobile View Toggle */}
            <div className="sm:hidden flex items-center bg-[#07090E] p-1 rounded-xl border border-[#1E2433]">
              <button
                onClick={() => setMobileViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  mobileViewMode === 'grid'
                    ? 'bg-[#1E2433] text-[#22C55E]'
                    : 'text-slate-400'
                }`}
                aria-label="Grid view"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Grid
              </button>
              <button
                onClick={() => setMobileViewMode('agenda')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  mobileViewMode === 'agenda'
                    ? 'bg-[#1E2433] text-[#22C55E]'
                    : 'text-slate-400'
                }`}
                aria-label="Agenda view"
              >
                <List className="w-3.5 h-3.5" />
                Agenda
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>

            <div className="flex items-center bg-[#07090E] rounded-xl border border-[#1E2433] p-1">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg hover:bg-[#1E2433] text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono px-3 text-white min-w-[130px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg hover:bg-[#1E2433] text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Semantic Color Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#1E2433] text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Legend:</span>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Exams & Deadlines</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>University Holidays</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
            <span>Joined Activities</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Hosted by You</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Institutional Fests</span>
          </div>
        </div>
      </div>

      {/* Main Calendar + Daily Agenda Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols on lg) */}
        <div className={`lg:col-span-2 bg-[#0D1017] p-4 sm:p-5 rounded-2xl border border-[#1E2433] shadow-xl ${
          mobileViewMode === 'agenda' ? 'hidden sm:block' : 'block'
        }`}>
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase tracking-wider text-slate-400 pb-3 border-b border-[#1E2433]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-3">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 sm:h-24 rounded-xl bg-[#07090E]/50 border border-transparent"></div>
            ))}

            {/* Days in current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = selectedDay === dayNum;
              const { instEvents, registered, hosted } = getDayEvents(dayNum);
              const dayExamClash = instEvents.some(e => e.event_type === 'EXAM') && (registered.length > 0 || hosted.length > 0);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => {
                    setSelectedDay(dayNum);
                    if (window.innerWidth < 640) {
                      setMobileViewMode('agenda');
                    }
                  }}
                  aria-label={`${monthNames[month]} ${dayNum}, ${instEvents.length + registered.length + hosted.length} events`}
                  aria-pressed={isSelected}
                  className={`h-16 sm:h-24 p-1 sm:p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'border-[#22C55E] bg-[#22C55E]/10 ring-2 ring-[#22C55E]/30 z-10 shadow-xs'
                      : 'border-[#1E2433] bg-[#0A0D14] hover:border-[#2D3748]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[11px] sm:text-xs font-bold font-mono ${
                      isSelected
                        ? 'text-[#22C55E] font-black'
                        : 'text-slate-300'
                    }`}>
                      {dayNum}
                    </span>

                    {dayExamClash && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Schedule clash on this date" />
                    )}
                  </div>

                  {/* Badges container inside cell */}
                  <div className="space-y-0.5 sm:space-y-1 w-full overflow-hidden">
                    {instEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[8px] sm:text-[9px] font-semibold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded truncate ${
                          ev.event_type === 'EXAM'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : ev.event_type === 'HOLIDAY'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}

                    {registered.slice(0, 1).map(p => (
                      <div
                        key={p.id}
                        className="text-[8px] sm:text-[9px] font-semibold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-[#0D331B] text-[#4ADE80] border border-green-500/30 truncate"
                      >
                        {p.title}
                      </div>
                    ))}

                    {hosted.slice(0, 1).map(p => (
                      <div
                        key={p.id}
                        className="text-[8px] sm:text-[9px] font-semibold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 truncate"
                      >
                        ★ {p.title}
                      </div>
                    ))}
                  </div>

                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Agenda Panel (Right side) */}
        <div className={`bg-[#0D1017] p-5 rounded-2xl border border-[#1E2433] shadow-xl flex flex-col justify-between space-y-4 ${
          mobileViewMode === 'grid' ? 'hidden sm:flex' : 'flex'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-[#1E2433] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Daily Agenda
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {monthNames[month]} {selectedDay}, {year}
                </h2>
              </div>

              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileViewMode('grid')}
                className="sm:hidden text-xs text-green-400 font-semibold cursor-pointer"
              >
                Back to Grid
              </button>
            </div>

            {/* Clash Warning for selected date */}
            {hasExamClash && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-300">Schedule Clash Detected</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed text-slate-300">
                    You have confirmed activities scheduled on the same date as mandatory university theory examinations. Continuous assessment attendance is mandatory.
                  </p>
                </div>
              </div>
            )}

            {/* Events List for this date */}
            <div className="mt-4 space-y-3">
              {selectedDayData.total === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No scheduled university exams, holidays, or joined activities on this date.
                </div>
              ) : (
                <>
                  {/* Institutional events */}
                  {selectedDayData.instEvents.map(ev => (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl border text-xs ${
                        ev.event_type === 'EXAM'
                          ? 'border-rose-900 bg-rose-950/30 text-rose-200'
                          : ev.event_type === 'HOLIDAY'
                            ? 'border-emerald-900 bg-emerald-950/30 text-emerald-200'
                            : 'border-purple-900 bg-purple-950/30 text-purple-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="uppercase text-[10px] tracking-wider text-slate-400">
                          {ev.event_type}
                        </span>
                        {ev.end_date && (
                          <span className="font-mono text-[10px] text-slate-400">
                            Until {ev.end_date}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-white mt-1">
                        {ev.title}
                      </div>
                      {ev.description && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Registered events */}
                  {selectedDayData.registered.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPostForDetail(p)}
                      className="p-3 rounded-xl border border-green-500/30 bg-[#0D331B]/30 hover:border-[#22C55E] cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-[#4ADE80]">
                        <span className="uppercase text-[10px] tracking-wider">
                          REGISTERED ACTIVITY
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3" />
                          {new Date(p.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-bold text-white mt-1">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                        <span className="truncate">{p.venue_name}</span>
                      </div>
                    </div>
                  ))}

                  {/* Hosted events */}
                  {selectedDayData.hosted.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPostForDetail(p)}
                      className="p-3 rounded-xl border border-amber-900 bg-amber-950/30 hover:border-amber-400 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-amber-400">
                        <span className="uppercase text-[10px] tracking-wider">
                          HOSTED BY YOU
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3" />
                          {new Date(p.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-bold text-white mt-1">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{p.venue_name}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090E] border border-[#1E2433] text-[11px] text-slate-400">
            Registered sessions synchronize automatically with your academic timetable.
          </div>
        </div>

      </div>

    </div>
  );
};
