import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Award, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  ArrowRight, 
  MessageSquare, 
  RotateCcw,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

export const EventFeed: React.FC = () => {
  const { 
    posts, 
    currentUser, 
    setSelectedPostForDetail, 
    setSelectedPostForChat, 
    applications, 
    checkScheduleClash
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<string>('ALL');
  const [selectedPillTab, setSelectedPillTab] = useState<'ALL' | 'ELIGIBLE' | 'APPLIED' | 'FACULTY' | 'CARPOOL'>('ALL');
  const [odOnlyFilter, setOdOnlyFilter] = useState(false);
  const [joinModeFilter, setJoinModeFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<'SOONEST' | 'NEWEST' | 'CLOSING_SOON'>('SOONEST');
  const [prevEventsToggle, setPrevEventsToggle] = useState(false);
  
  // Layout mode: Table (Haveloc style) or Cards
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered Opportunities
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchDesc = post.description.toLowerCase().includes(q);
        const matchVenue = post.venue_name.toLowerCase().includes(q);
        const matchHost = post.host_name.toLowerCase().includes(q);
        const matchSkill = post.required_skills.some(s => s.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchVenue && !matchHost && !matchSkill) {
          return false;
        }
      }

      // Search category dropdown
      if (searchCategory !== 'ALL' && post.category !== searchCategory) {
        return false;
      }

      // Secondary Haveloc pill tabs
      if (selectedPillTab === 'ELIGIBLE') {
        const deptOk = post.eligible_departments.includes('ANY') || 
          (currentUser.department && post.eligible_departments.some(d => currentUser.department?.toUpperCase().includes(d.toUpperCase())));
        const yearOk = post.eligible_years.length === 0 || 
          (currentUser.joining_year && post.eligible_years.includes(currentUser.joining_year));
        if (!deptOk || !yearOk) return false;
      } else if (selectedPillTab === 'APPLIED') {
        const hasApp = applications.some(a => a.post_id === post.id && a.applicant_id === currentUser.id);
        if (!hasApp) return false;
      } else if (selectedPillTab === 'FACULTY') {
        if (post.host_role !== 'FACULTY') return false;
      } else if (selectedPillTab === 'CARPOOL') {
        if (post.category !== 'CARPOOL') return false;
      }

      // OD filter
      if (odOnlyFilter && !post.od_available) return false;

      // Join mode filter
      if (joinModeFilter !== 'ALL' && post.join_mode !== joinModeFilter) return false;

      // Department filter
      if (deptFilter !== 'ALL') {
        const eligible = post.eligible_departments.includes('ANY') || 
          post.eligible_departments.some(d => d.toUpperCase().includes(deptFilter));
        if (!eligible) return false;
      }

      // Previous events toggle (filter out completed or full if false)
      if (!prevEventsToggle) {
        // Show current and upcoming
      }

      return true;
    });
  }, [posts, searchQuery, searchCategory, selectedPillTab, odOnlyFilter, joinModeFilter, deptFilter, prevEventsToggle, currentUser, applications]);

  // Sorting
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (sortMode === 'SOONEST') {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      }
      if (sortMode === 'NEWEST') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortMode === 'CLOSING_SOON') {
        return (a.total_slots - a.filled_slots) - (b.total_slots - b.filled_slots);
      }
      return 0;
    });
  }, [filteredPosts, sortMode]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / pageSize));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPosts.slice(start, start + pageSize);
  }, [sortedPosts, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchCategory('ALL');
    setSelectedPillTab('ALL');
    setOdOnlyFilter(false);
    setJoinModeFilter('ALL');
    setDeptFilter('ALL');
    setSortMode('SOONEST');
    setPrevEventsToggle(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || 
    searchCategory !== 'ALL' || 
    selectedPillTab !== 'ALL' || 
    odOnlyFilter || 
    joinModeFilter !== 'ALL' || 
    deptFilter !== 'ALL' || 
    prevEventsToggle;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* HEADER SECTION: Title + Count (Haveloc Style) + Dual Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Opportunities
          </h1>
          <p className="text-sm font-semibold text-[#22C55E] mt-1">
            {filteredPosts.length} Opportunities Listed
          </p>
        </div>

        {/* Dual Search Input with green search action */}
        <div className="flex items-center w-full lg:w-auto shadow-xl">
          <div className="relative">
            <select
              value={searchCategory}
              onChange={(e) => { setSearchCategory(e.target.value); setCurrentPage(1); }}
              aria-label="Search filter category"
              className="bg-[#1A202C] text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-l-lg border-y border-l border-[#2D3748] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="FACULTY_WORKSHOP">Workshops</option>
              <option value="FACULTY_RESEARCH">Research</option>
              <option value="CARPOOL">Carpool & Travel</option>
              <option value="STUDENT_CASUAL">Hackathons</option>
              <option value="FACULTY_VOLUNTEER">Volunteering</option>
            </select>
          </div>

          <div className="relative flex-1 lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search here..."
              aria-label="Search opportunities"
              className="w-full bg-[#0D0F15] text-white placeholder-slate-500 text-xs px-3.5 py-2.5 border-y border-[#2D3748] focus:outline-none focus:border-[#22C55E] transition-colors"
            />
          </div>

          <button
            onClick={() => setCurrentPage(1)}
            aria-label="Execute search"
            className="bg-[#22C55E] hover:bg-[#16A34A] text-black px-3.5 py-2.5 rounded-r-lg font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS ROW 1: Dropdown Pills + Prev Events Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort By Dropdown Pill */}
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/60 rounded-lg px-3 py-1.5 font-semibold focus:outline-none cursor-pointer appearance-none pr-7"
            >
              <option value="SOONEST" className="bg-[#0D1017] text-white">Apply By (Soonest)</option>
              <option value="NEWEST" className="bg-[#0D1017] text-white">Apply By (Newest)</option>
              <option value="CLOSING_SOON" className="bg-[#0D1017] text-white">Closing Soon</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-2.5 text-[#22C55E] text-[10px]">▼</span>
          </div>

          {/* Joining Mode Dropdown Pill */}
          <div className="relative">
            <select
              value={joinModeFilter}
              onChange={(e) => { setJoinModeFilter(e.target.value as any); setCurrentPage(1); }}
              className="bg-[#0D1017] text-slate-300 border border-[#222736] hover:border-[#383F52] rounded-lg px-3 py-1.5 font-medium focus:outline-none cursor-pointer appearance-none pr-7"
            >
              <option value="ALL">Opportunity Mode: All</option>
              <option value="UNLOCKED">Instant Join (FCFS)</option>
              <option value="LOCKED">Approval Required</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400 text-[10px]">▼</span>
          </div>

          {/* Department Filter Pill */}
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="bg-[#0D1017] text-slate-300 border border-[#222736] hover:border-[#383F52] rounded-lg px-3 py-1.5 font-medium focus:outline-none cursor-pointer appearance-none pr-7"
            >
              <option value="ALL">Department: All</option>
              <option value="CSE">CSE (Computer Science)</option>
              <option value="ARE">ARE (Robotics & Automation)</option>
              <option value="AIE">AIE (Artificial Intelligence)</option>
              <option value="ECE">ECE (Electronics)</option>
              <option value="ME">ME (Mechanical)</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400 text-[10px]">▼</span>
          </div>

          {/* OD Filter Pill */}
          <button
            onClick={() => { setOdOnlyFilter(!odOnlyFilter); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              odOnlyFilter
                ? 'bg-[#382A0E] text-[#FBBF24] border-[#F59E0B]/50'
                : 'bg-[#0D1017] text-slate-300 border-[#222736] hover:border-[#383F52]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Verified OD
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold ml-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Right side: Prev Events toggle + Layout View Mode */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 font-medium">
            <span>Past Events</span>
            <input
              type="checkbox"
              checked={prevEventsToggle}
              onChange={(e) => setPrevEventsToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-[#1E2433] peer-checked:bg-[#22C55E] rounded-full peer relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
          </label>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0D1017] border border-[#222736] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-[#1E2433] text-[#22C55E]' : 'text-slate-400 hover:text-white'}`}
              title="Table View (Haveloc Style)"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'cards' ? 'bg-[#1E2433] text-[#22C55E]' : 'text-slate-400 hover:text-white'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* FILTER CONTROLS ROW 2: Capsule Pill Tabs (Exact Haveloc Style) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-[#1A1F2C] pb-4">
        {[
          { id: 'ALL', label: 'All Opportunities' },
          { id: 'ELIGIBLE', label: 'Eligible Opportunities' },
          { id: 'APPLIED', label: 'Applied' },
          { id: 'FACULTY', label: 'Official Faculty Calls' },
          { id: 'CARPOOL', label: 'Carpool & Travel' },
        ].map((tab) => {
          const isActive = selectedPillTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setSelectedPillTab(tab.id as any); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 font-bold shadow-xs'
                  : 'border border-[#222634] text-slate-400 hover:text-white hover:border-[#383F52] bg-[#0A0D14]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {paginatedPosts.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6 text-slate-400" />}
          title="No opportunities found"
          description="No campus listings match your current filters. Try resetting filters or switching the opportunity tab."
          action={
            <button 
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-[#22C55E] text-black font-bold text-xs"
            >
              Clear All Filters
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        
        /* ================= HAVELOC STRUCTURED TABLE VIEW ================= */
        <div className="overflow-x-auto rounded-xl border border-[#1A1F2C] bg-[#0A0D14] shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1A1F2C] bg-[#07090E] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Title & Details</th>
                <th className="py-3.5 px-3">Role / Category</th>
                <th className="py-3.5 px-3">Slots / Capacity</th>
                <th className="py-3.5 px-3">Apply Before</th>
                <th className="py-3.5 px-3">Date Of Event</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Batch / Dept</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B26]">
              {paginatedPosts.map((post) => {
                const isFull = post.filled_slots >= post.total_slots;
                const remaining = post.total_slots - post.filled_slots;
                const isHost = post.host_id === currentUser.id;
                
                const existingApp = applications.find(a => a.post_id === post.id && a.applicant_id === currentUser.id);
                const isAccepted = existingApp?.status === 'ACCEPTED';
                const isPending = existingApp?.status === 'PENDING';
                const clash = checkScheduleClash(post.start_time, post.end_time);

                return (
                  <tr 
                    key={post.id}
                    className="hover:bg-[#111520] transition-colors group cursor-pointer"
                    onClick={() => setSelectedPostForDetail(post)}
                  >
                    {/* Title */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-bold text-white text-sm group-hover:text-[#22C55E] transition-colors truncate">
                        {post.title}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate mt-0.5">
                        {post.description}
                      </div>
                      {clash.hasClash && !isAccepted && !isHost && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium mt-1">
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">Schedule Clash: {clash.conflictTitle}</span>
                        </div>
                      )}
                    </td>

                    {/* Role / Category */}
                    <td className="py-4 px-3 text-slate-300">
                      <div className="font-semibold text-white">
                        {post.category === 'FACULTY_RESEARCH' ? 'Research Call' :
                         post.category === 'FACULTY_WORKSHOP' ? 'Workshop' :
                         post.category === 'CARPOOL' ? 'Ride Share' : 'Collaboration'}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Host: {post.host_name}
                      </div>
                    </td>

                    {/* Slots / Capacity */}
                    <td className="py-4 px-3">
                      <div className="font-bold text-white">
                        {post.filled_slots} / {post.total_slots} Slots
                      </div>
                      <div className="text-[10px]">
                        {post.od_available ? (
                          <span className="text-amber-400 font-semibold">{post.od_hours}h Verified OD</span>
                        ) : (
                          <span className="text-slate-400">{remaining} spots left</span>
                        )}
                      </div>
                    </td>

                    {/* Apply Before */}
                    <td className="py-4 px-3 text-slate-300">
                      <div>
                        {new Date(post.start_time).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Date Of Event */}
                    <td className="py-4 px-3 text-slate-300">
                      <div>
                        {new Date(post.start_time).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {post.venue_name}
                      </div>
                    </td>

                    {/* Status Pill (Exact Haveloc Styling with dots) */}
                    <td className="py-4 px-3">
                      {isFull ? (
                        <Badge variant="error" size="sm" dot>
                          Closed For Applic...
                        </Badge>
                      ) : isPending ? (
                        <Badge variant="warning" size="sm" dot>
                          In Progress
                        </Badge>
                      ) : isAccepted ? (
                        <Badge variant="success" size="sm" dot>
                          Accepted
                        </Badge>
                      ) : (
                        <Badge variant="primary" size="sm" dot>
                          Open For Joining
                        </Badge>
                      )}
                    </td>

                    {/* Batch / Dept */}
                    <td className="py-4 px-3 text-slate-400 font-mono text-[11px]">
                      {post.eligible_departments.includes('ANY') ? 'All Depts' : post.eligible_departments.slice(0, 2).join(', ')}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {isHost ? (
                        <button
                          onClick={() => setSelectedPostForChat(post)}
                          className="px-3 py-1.5 rounded-lg bg-[#141A26] border border-[#232B3B] text-green-400 hover:text-white hover:bg-[#1E2536] text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </button>
                      ) : isAccepted ? (
                        <button
                          onClick={() => setSelectedPostForChat(post)}
                          className="px-3 py-1.5 rounded-lg bg-[#0D331B] border border-green-500/40 text-green-300 hover:bg-[#124223] text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Team Chat
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedPostForDetail(post)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-bold transition-all shadow-md shadow-green-500/10 ml-auto cursor-pointer"
                        >
                          View & Join
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : (

        /* ================= CARDS GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPosts.map((post) => {
            const isFull = post.filled_slots >= post.total_slots;
            const remaining = post.total_slots - post.filled_slots;
            const isHost = post.host_id === currentUser.id;
            
            const existingApp = applications.find(a => a.post_id === post.id && a.applicant_id === currentUser.id);
            const isAccepted = existingApp?.status === 'ACCEPTED';
            const isPending = existingApp?.status === 'PENDING';
            const clash = checkScheduleClash(post.start_time, post.end_time);

            return (
              <article
                key={post.id}
                className="p-5 rounded-xl bg-[#0D1017] border border-[#1E2433] hover:border-[#2D3748] transition-all flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-1.5">
                    <Badge variant={post.host_role === 'FACULTY' ? 'primary' : 'default'} size="sm">
                      {post.category.replace('_', ' ')}
                    </Badge>

                    {isFull ? (
                      <Badge variant="error" size="sm" dot>Closed</Badge>
                    ) : isPending ? (
                      <Badge variant="warning" size="sm" dot>In Progress</Badge>
                    ) : (
                      <Badge variant="success" size="sm" dot>Open</Badge>
                    )}
                  </div>

                  <h3 
                    onClick={() => setSelectedPostForDetail(post)}
                    className="font-bold text-sm text-white line-clamp-2 hover:text-[#22C55E] cursor-pointer transition-colors"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>

                  {clash.hasClash && !isAccepted && !isHost && (
                    <div className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-[10px] font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">Clash: {clash.conflictTitle}</span>
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-[#1E2433]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      <span className="truncate">
                        {new Date(post.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      <span className="truncate">{post.venue_name}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-400">
                        {post.filled_slots} of {post.total_slots} Filled
                      </span>
                      <span className={isFull ? 'text-rose-400 font-bold' : 'text-[#22C55E]'}>
                        {isFull ? 'FULL' : `${remaining} spots remaining`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1A202C] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${isFull ? 'bg-rose-500' : 'bg-[#22C55E]'}`}
                        style={{ width: `${Math.min(100, (post.filled_slots / post.total_slots) * 100)}%` }}
                      />
                    </div>
                  </div>

                </div>

                <div className="pt-3 border-t border-[#1E2433] flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {post.host_name}
                  </span>

                  <button
                    onClick={() => setSelectedPostForDetail(post)}
                    className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* BOTTOM PAGINATION BAR (Exact Haveloc Placement Portal Style) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1A1F2C] text-xs text-slate-400">
        
        {/* Left: Show [ 10 ] Per page */}
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-[#0D1017] text-white border border-[#222736] rounded-md px-2.5 py-1 font-bold focus:outline-none cursor-pointer"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>Per page</span>
        </div>

        {/* Right: << < [ 1 ] > >> */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            className="p-1.5 rounded-md border border-[#222736] bg-[#0D1017] hover:border-[#383F52] disabled:opacity-30 disabled:pointer-events-none text-slate-300 cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-1.5 rounded-md border border-[#222736] bg-[#0D1017] hover:border-[#383F52] disabled:opacity-30 disabled:pointer-events-none text-slate-300 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                currentPage === page
                  ? 'bg-[#22C55E] text-black shadow-md shadow-green-500/20'
                  : 'bg-[#0D1017] text-slate-300 border border-[#222736] hover:border-[#383F52]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="p-1.5 rounded-md border border-[#222736] bg-[#0D1017] hover:border-[#383F52] disabled:opacity-30 disabled:pointer-events-none text-slate-300 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
            className="p-1.5 rounded-md border border-[#222736] bg-[#0D1017] hover:border-[#383F52] disabled:opacity-30 disabled:pointer-events-none text-slate-300 cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
