import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './ui/UserAvatar';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { 
  Search, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Car,
  Plus
} from 'lucide-react';
import { PostCategory } from '../types';

export const EventFeed: React.FC = () => {
  const { 
    posts, 
    currentUser, 
    setSelectedPostForDetail, 
    setIsCreatePostModalOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    checkScheduleClash,
    selectedCategoryFilter,
    setSelectedCategoryFilter
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [odOnlyFilter, setOdOnlyFilter] = useState(false);
  const [joinModeFilter, setJoinModeFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<'SOONEST' | 'NEWEST' | 'CLOSING_SOON'>('SOONEST');
  
  // Layout mode: Cards or Table
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Pagination
  const pageSize = 9;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Category filter definitions
  const categories: { key: string; label: string; icon?: React.ReactNode }[] = [
    { key: 'ALL', label: 'All Opportunities' },
    { key: 'FACULTY_RESEARCH', label: 'Research' },
    { key: 'FACULTY_WORKSHOP', label: 'Workshops' },
    { key: 'STUDENT_CASUAL', label: 'Hackathons & Tech' },
    { key: 'STUDENT_CREATIVE', label: 'Creative & Media' },
    { key: 'FACULTY_VOLUNTEER', label: 'Volunteering' },
    { key: 'CARPOOL', label: 'Carpool & Travel', icon: <Car className="w-3.5 h-3.5" /> },
  ];

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
        const matchSkill = post.required_skills?.some(s => s.toLowerCase().includes(q));
        const matchOrigin = post.carpool_origin?.toLowerCase().includes(q);
        const matchDest = post.carpool_destination?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchVenue && !matchHost && !matchSkill && !matchOrigin && !matchDest) {
          return false;
        }
      }

      // Category filter (including Carpool)
      if (selectedCategoryFilter !== 'ALL' && post.category !== selectedCategoryFilter) {
        return false;
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

      return true;
    });
  }, [posts, searchQuery, selectedCategoryFilter, odOnlyFilter, joinModeFilter, deptFilter]);

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
    setSelectedCategoryFilter('ALL');
    setOdOnlyFilter(false);
    setJoinModeFilter('ALL');
    setDeptFilter('ALL');
    setSortMode('SOONEST');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || 
    selectedCategoryFilter !== 'ALL' || 
    odOnlyFilter || 
    joinModeFilter !== 'ALL' || 
    deptFilter !== 'ALL';

  const formatCategoryBadge = (cat: PostCategory) => {
    switch (cat) {
      case 'FACULTY_RESEARCH':
        return <Badge variant="warning">Research Call</Badge>;
      case 'FACULTY_WORKSHOP':
        return <Badge variant="primary">Workshop</Badge>;
      case 'FACULTY_VOLUNTEER':
        return <Badge variant="default">Volunteering</Badge>;
      case 'CARPOOL':
        return <Badge variant="default">Carpool & Travel</Badge>;
      case 'STUDENT_CREATIVE':
        return <Badge variant="default">Creative & Media</Badge>;
      default:
        return <Badge variant="default">Campus Activity</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Opportunities & Collaboration
          </h1>
          <p className="text-xs sm:text-sm text-[#A1AAB8] mt-1">
            Discover faculty research calls, technical workshops, student hackathons, and campus ride-shares.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              setAuthModalMode('LOGIN');
              setIsAuthModalOpen(true);
            } else {
              setIsCreatePostModalOpen(true);
            }
          }}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-xs shadow-md shadow-green-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Opportunity</span>
        </button>
      </div>

      {/* Search and Category Filter Rail */}
      <div className="p-4 rounded-2xl bg-[#11151B] border border-[#27303D] space-y-4">
        
        {/* Search input + view toggles */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A1AAB8] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, skills, venue, organizer, or destination..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#27303D] bg-[#0E121A] text-[#F8FAFC] placeholder:text-[#64748B] text-xs focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-[#27303D] bg-[#0E121A] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#22C55E]"
            >
              <option value="SOONEST">Date: Earliest First</option>
              <option value="NEWEST">Recently Posted</option>
              <option value="CLOSING_SOON">Fewest Slots Left</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl border border-[#27303D] bg-[#0E121A]">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-[#171C24] text-[#22C55E]' : 'text-[#A1AAB8] hover:text-white'
                }`}
                title="Cards View"
                aria-label="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#171C24] text-[#22C55E]' : 'text-[#A1AAB8] hover:text-white'
                }`}
                title="List View"
                aria-label="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Pill Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategoryFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategoryFilter(cat.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#22C55E] text-black shadow-xs font-bold'
                    : 'bg-[#171C24] text-[#A1AAB8] hover:text-white hover:bg-[#202733] border border-[#27303D]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E2433] text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Join Mode Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#A1AAB8] text-[11px]">Join Mode:</span>
              <select
                value={joinModeFilter}
                onChange={(e) => setJoinModeFilter(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-[#27303D] bg-[#0E121A] text-[#F8FAFC] text-[11px]"
              >
                <option value="ALL">All Modes</option>
                <option value="UNLOCKED">Instant Join</option>
                <option value="LOCKED">Requires Host Approval</option>
              </select>
            </div>

            {/* OD Available Checkbox */}
            <label className="flex items-center gap-1.5 text-[11px] text-[#A1AAB8] cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={odOnlyFilter}
                onChange={(e) => setOdOnlyFilter(e.target.checked)}
                className="rounded border-[#27303D] bg-[#0E121A] text-[#22C55E] focus:ring-0"
              />
              <span>Sanctioned OD Only</span>
            </label>
          </div>

          {/* Results count & reset */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#A1AAB8]">
              Showing <span className="font-bold text-white">{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'opportunity' : 'opportunities'}
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[#22C55E] hover:underline flex items-center gap-1 font-semibold cursor-pointer text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Main Results Container */}
      {paginatedPosts.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title={hasActiveFilters ? "No matching opportunities" : "No opportunities yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your search criteria or resetting filters to see more results."
                : "Be the first to create an opportunity for student research, tech workshops, hackathons, or campus carpools."
            }
            actionLabel="Create Opportunity"
            onAction={() => {
              if (!currentUser) {
                setAuthModalMode('LOGIN');
                setIsAuthModalOpen(true);
              } else {
                setIsCreatePostModalOpen(true);
              }
            }}
          />
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPosts.map(post => {
            const isFull = post.filled_slots >= post.total_slots;
            const remainingSlots = Math.max(0, post.total_slots - post.filled_slots);
            const isCarpool = post.category === 'CARPOOL';

            // Check clash
            const clash = currentUser ? checkScheduleClash(post.start_time, post.end_time, post.id) : { hasClash: false, conflictingEvents: [] };

            return (
              <div
                key={post.id}
                className="rounded-2xl bg-[#11151B] border border-[#27303D] p-5 flex flex-col justify-between hover:border-[#384355] transition-all shadow-xs group"
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {formatCategoryBadge(post.category)}

                    <div className="flex items-center gap-1.5">
                      {post.od_available && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                          {post.od_hours ? `${post.od_hours}h OD` : 'OD Eligible'}
                        </span>
                      )}

                      {isFull ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                          Full
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[#A1AAB8]">
                          <strong className="text-white">{remainingSlots}</strong> left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => setSelectedPostForDetail(post)}
                    className="font-bold text-base text-[#F8FAFC] group-hover:text-[#22C55E] transition-colors cursor-pointer line-clamp-2"
                  >
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#A1AAB8] mt-2 line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>

                  {/* Carpool specific details */}
                  {isCarpool && (post.carpool_origin || post.carpool_destination) && (
                    <div className="mt-3.5 p-3 rounded-xl bg-[#0E121A] border border-[#27303D] space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <Car className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                        <span className="truncate">{post.carpool_origin || 'Campus'}</span>
                        <ArrowRight className="w-3 h-3 text-[#A1AAB8] shrink-0" />
                        <span className="truncate text-[#22C55E]">{post.carpool_destination || 'Destination'}</span>
                      </div>
                      {post.carpool_cost_split && (
                        <div className="text-[11px] text-[#A1AAB8]">
                          Fare split: <span className="text-white font-mono">{post.carpool_cost_split}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timing & Venue */}
                  <div className="mt-4 space-y-1.5 text-xs text-[#A1AAB8]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      <span>{new Date(post.start_time).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-[#64748B]">•</span>
                      <span>{new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      <span className="truncate">{post.venue_name}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {post.required_skills && post.required_skills.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1">
                      {post.required_skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#171C24] text-[#A1AAB8] border border-[#27303D]">
                          {skill}
                        </span>
                      ))}
                      {post.required_skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-[#64748B]">
                          +{post.required_skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Clash Warning */}
                  {clash.hasClash && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span className="truncate">Schedule clash detected</span>
                    </div>
                  )}
                </div>

                {/* Footer: Organizer Identity & Action */}
                <div className="mt-5 pt-4 border-t border-[#27303D] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar name={post.host_name} role={post.host_role} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{post.host_name}</p>
                      <p className="text-[10px] text-[#A1AAB8] font-mono truncate">{post.host_role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPostForDetail(post)}
                    className="px-3 py-1.5 rounded-lg bg-[#171C24] hover:bg-[#22C55E] hover:text-black text-white text-xs font-semibold border border-[#27303D] hover:border-[#22C55E] transition-all cursor-pointer shrink-0"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="rounded-2xl bg-[#11151B] border border-[#27303D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A1AAB8]">
              <thead className="bg-[#0E121A] text-[11px] uppercase tracking-wider text-[#F8FAFC] border-b border-[#27303D]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Opportunity</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Host</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold">Slots</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2433]">
                {paginatedPosts.map(post => {
                  const remaining = Math.max(0, post.total_slots - post.filled_slots);
                  return (
                    <tr 
                      key={post.id} 
                      className="hover:bg-[#171C24]/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPostForDetail(post)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white max-w-sm truncate">{post.title}</div>
                        <div className="text-[11px] text-[#64748B] truncate">{post.venue_name}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {formatCategoryBadge(post.category)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={post.host_name} role={post.host_role} size="xs" />
                          <span className="font-medium text-slate-200">{post.host_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                        {new Date(post.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                        {remaining} / {post.total_slots}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="text-[#22C55E] font-semibold hover:underline">
                          Inspect &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#27303D] pt-4 text-xs text-[#A1AAB8]">
          <div>
            Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#27303D] bg-[#11151B] hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#27303D] bg-[#11151B] hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
