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
  const [deptFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<'SOONEST' | 'NEWEST' | 'CLOSING_SOON'>('SOONEST');
  
  // Layout mode: Cards or Table
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Pagination
  const pageSize = 9;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Category filter definitions
  const categories: { key: string; label: string; icon?: React.ReactNode }[] = [
    { key: 'ALL', label: 'All Events' },
    { key: 'FACULTY_RESEARCH', label: 'Research' },
    { key: 'FACULTY_WORKSHOP', label: 'Workshops' },
    { key: 'STUDENT_CASUAL', label: 'Casual & Sports' },
    { key: 'STUDENT_CREATIVE', label: 'Creative & Media' },
    { key: 'FACULTY_VOLUNTEER', label: 'Volunteering' },
    { key: 'CARPOOL', label: 'Carpool & Travel', icon: <Car className="w-3.5 h-3.5" /> },
  ];

  // Filtered Events
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

      // Category
      if (selectedCategoryFilter !== 'ALL' && post.category !== selectedCategoryFilter) {
        return false;
      }

      // Join mode
      if (joinModeFilter !== 'ALL' && post.join_mode !== joinModeFilter) {
        return false;
      }

      // OD only
      if (odOnlyFilter && !post.od_available) {
        return false;
      }

      // Department filter
      if (deptFilter !== 'ALL') {
        const hasDept = post.eligible_departments.includes('ANY') || 
          post.eligible_departments.some(d => d.toUpperCase() === deptFilter.toUpperCase());
        if (!hasDept) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortMode === 'SOONEST') {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      }
      if (sortMode === 'NEWEST') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortMode === 'CLOSING_SOON') {
        const remA = a.total_slots - a.filled_slots;
        const remB = b.total_slots - b.filled_slots;
        return remA - remB;
      }
      return 0;
    });
  }, [posts, searchQuery, selectedCategoryFilter, joinModeFilter, odOnlyFilter, deptFilter, sortMode]);

  // Pagination slice
  const totalPages = Math.ceil(filteredPosts.length / pageSize) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage, pageSize]);

  const hasActiveFilters = searchQuery.trim() !== '' || 
    selectedCategoryFilter !== 'ALL' || 
    joinModeFilter !== 'ALL' || 
    odOnlyFilter || 
    deptFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('ALL');
    setJoinModeFilter('ALL');
    setOdOnlyFilter(false);
    setCurrentPage(1);
  };

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
      case 'STUDENT_CASUAL':
        return <Badge variant="default">Casual & Sports</Badge>;
      case 'STUDENT_CREATIVE':
        return <Badge variant="default">Creative & Media</Badge>;
      default:
        return <Badge variant="default">Campus Event</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-main)]">
            Events & Collaborations
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Discover campus events, technical workshops, student research, sports, and transit rides.
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
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] font-bold text-xs border border-[#798DA6]/40 shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Search and Category Filter Rail */}
      <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
        
        {/* Search input + view toggles */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, skills, venue, organizer, or destination..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-subtle)] text-xs focus:outline-none focus:border-[#490B1A] focus:ring-1 focus:ring-[var(--color-blue-grey)]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-main)] text-xs focus:outline-none focus:border-[#490B1A]"
            >
              <option value="SOONEST">Date: Earliest First</option>
              <option value="NEWEST">Recently Posted</option>
              <option value="CLOSING_SOON">Fewest Slots Left</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' 
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
                title="Cards View"
                aria-label="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
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
                    ? 'bg-[#490B1A] text-[#E5DED2] border border-[#798DA6]/40 shadow-xs font-bold'
                    : 'bg-[var(--color-surface-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--color-border)] text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Join Mode Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--color-text-muted)] text-[11px]">Join Mode:</span>
              <select
                value={joinModeFilter}
                onChange={(e) => setJoinModeFilter(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-main)] text-[11px]"
              >
                <option value="ALL">All Modes</option>
                <option value="UNLOCKED">Instant Join</option>
                <option value="LOCKED">Requires Host Approval</option>
              </select>
            </div>

            {/* OD Available Checkbox */}
            <label className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-main)]">
              <input
                type="checkbox"
                checked={odOnlyFilter}
                onChange={(e) => setOdOnlyFilter(e.target.checked)}
                className="rounded border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-primary)] focus:ring-0"
              />
              <span>Sanctioned OD Only</span>
            </label>
          </div>

          {/* Results count & reset */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--color-text-muted)]">
              Showing <span className="font-bold text-[var(--color-text-main)]">{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'event' : 'events'}
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[var(--color-primary)] hover:underline flex items-center gap-1 font-semibold cursor-pointer text-xs"
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
            title={hasActiveFilters ? "No matching events" : "No events yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your search criteria or resetting filters to see more results."
                : "Be the first to create an event for student research, tech workshops, hackathons, or campus carpools."
            }
            actionLabel="Create Event"
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
                className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 flex flex-col justify-between hover:border-[var(--color-blue-grey)] transition-all shadow-xs group"
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {formatCategoryBadge(post.category)}

                    <div className="flex items-center gap-1.5">
                      {post.od_available && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#490B1A]/15 text-[#490B1A] dark:text-[#E5DED2] border border-[#490B1A]/30">
                          {post.od_hours ? `${post.od_hours}h OD` : 'OD Eligible'}
                        </span>
                      )}

                      {isFull ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-800/40">
                          Full
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                          <strong className="text-[var(--color-text-main)]">{remainingSlots}</strong> left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => setSelectedPostForDetail(post)}
                    className="font-bold text-base text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[#FFFFFF] transition-colors cursor-pointer line-clamp-2"
                  >
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[var(--color-text-muted)] mt-2 line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>

                  {/* Carpool specific details */}
                  {isCarpool && (post.carpool_origin || post.carpool_destination) && (
                    <div className="mt-3.5 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-[var(--color-text-main)] font-semibold">
                        <Car className="w-3.5 h-3.5 text-[var(--color-primary)] dark:text-[#E5DED2] shrink-0" />
                        <span className="truncate">{post.carpool_origin || 'Campus'}</span>
                        <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
                        <span className="truncate text-[var(--color-primary)] dark:text-[#E5DED2] font-bold">{post.carpool_destination || 'Destination'}</span>
                      </div>
                      {post.carpool_cost_split && (
                        <div className="text-[11px] text-[var(--color-text-muted)]">
                          Fare split: <span className="text-[var(--color-text-main)] font-mono">{post.carpool_cost_split}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timing & Venue */}
                  <div className="mt-4 space-y-1.5 text-xs text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-text-subtle)] shrink-0" />
                      <span>{new Date(post.start_time).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-[var(--color-text-subtle)]">•</span>
                      <span>{new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-text-subtle)] shrink-0" />
                      <span className="truncate">{post.venue_name}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {post.required_skills && post.required_skills.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1">
                      {post.required_skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)]">
                          {skill}
                        </span>
                      ))}
                      {post.required_skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-[var(--color-text-subtle)]">
                          +{post.required_skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Clash Warning */}
                  {clash.hasClash && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span className="truncate">Schedule clash detected</span>
                    </div>
                  )}
                </div>

                {/* Footer: Organizer Identity & Action */}
                <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar name={post.host_name} role={post.host_role} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text-main)] truncate">{post.host_name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">{post.host_role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPostForDetail(post)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] border border-[#798DA6]/40 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
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
        <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--color-text-muted)]">
              <thead className="bg-[var(--color-surface)] text-[11px] uppercase tracking-wider text-[var(--color-text-main)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Host</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold">Slots</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {paginatedPosts.map(post => {
                  const remaining = Math.max(0, post.total_slots - post.filled_slots);
                  return (
                    <tr 
                      key={post.id} 
                      className="hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                      onClick={() => setSelectedPostForDetail(post)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[var(--color-text-main)] max-w-sm truncate">{post.title}</div>
                        <div className="text-[11px] text-[var(--color-text-subtle)] truncate">{post.venue_name}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {formatCategoryBadge(post.category)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={post.host_name} role={post.host_role} size="xs" />
                          <span className="font-medium text-[var(--color-text-main)]">{post.host_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                        {new Date(post.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                        {remaining} / {post.total_slots}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="text-[var(--color-primary)] font-bold hover:underline">
                          View Details &rarr;
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
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-muted)]">
          <div>
            Page <span className="font-bold text-[var(--color-text-main)]">{currentPage}</span> of <span className="font-bold text-[var(--color-text-main)]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:text-[var(--color-text-main)] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:text-[var(--color-text-main)] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
