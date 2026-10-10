import React, { useState, useEffect, useRef } from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import { Logo } from './ui/Logo';
import { UserAvatar } from './ui/UserAvatar';
import { canAccessFacultyPortal } from '../utils/security';
import { 
  Bell, 
  Plus, 
  Users, 
  Calendar, 
  CalendarDays,
  ClipboardList, 
  GraduationCap, 
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';

interface Props {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenNotifications }) => {
  const { 
    currentUser, 
    signOutUser,
    activeTab, 
    setActiveTab, 
    notifications, 
    applications,
    posts,
    setIsCreatePostModalOpen, 
    setIsMapModalOpen, 
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsProfileModalOpen,
    theme,
    toggleTheme
  } = useApp();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Unread notifications for current user
  const unreadCount = currentUser 
    ? notifications.filter(n => n.user_id === currentUser.id && !n.read).length 
    : 0;

  // Pending faculty reviews (if faculty or admin)
  const facultyCallIds = currentUser 
    ? posts.filter(p => p.host_id === currentUser.id).map(p => p.id) 
    : [];
  const pendingFacultyCount = applications.filter(a => facultyCallIds.includes(a.post_id) && a.status === 'PENDING').length;

  // Build navigation items in exact required order:
  // 1. Events, 2. Calendar, 3. My Activities, 4. Find People (+ Faculty Portal if authorized)
  const isFacultyAuthorized = currentUser ? canAccessFacultyPortal(currentUser) : false;

  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'events', label: 'Events', icon: <CalendarDays className="w-4 h-4" /> },
    { tab: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'my-activities', label: 'My Activities', icon: <ClipboardList className="w-4 h-4" /> },
    { tab: 'find-people', label: 'Find People', icon: <Users className="w-4 h-4" /> },
  ];

  // Strictly append Faculty Portal ONLY when authorized
  if (isFacultyAuthorized) {
    navItems.push({
      tab: 'faculty-portal',
      label: 'Faculty Portal',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: pendingFacultyCount > 0 ? pendingFacultyCount : undefined,
    });
  }

  const handlePostEventClick = () => {
    if (!currentUser) {
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreatePostModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-colors duration-150 select-none shadow-xs">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo - Connect */}
          <div 
            onClick={() => { setActiveTab('events'); setIsMobileMenuOpen(false); }}
            className="cursor-pointer group shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('events'); }}
          >
            <Logo size="md" showCampusTag={true} />
          </div>

          {/* Desktop Navigation Links: 1. Events, 2. Calendar, 3. My Activities, 4. Find People */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab || 
                (item.tab === 'events' && (activeTab === 'opportunities' || activeTab === 'feed' || activeTab === 'carpool'));
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border border-[#798DA6]/40 shadow-xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#490B1A] text-[#E5DED2] border border-[#798DA6]/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2">
            
            {/* Create Event Action */}
            <button
              onClick={handlePostEventClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] text-xs font-bold border border-[#798DA6]/40 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Event</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-blue-grey)] text-[var(--color-text-main)] transition-colors cursor-pointer"
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#E5DED2]" />
              ) : (
                <Moon className="w-4 h-4 text-[#142841]" />
              )}
            </button>

            {/* Campus Navigator Map */}
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-blue-grey)] text-[var(--color-text-main)] relative transition-colors cursor-pointer"
              title="Campus Navigator"
              aria-label="Campus Navigator"
            >
              <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-blue-grey)] text-[var(--color-text-main)] relative transition-colors cursor-pointer"
              title="Notifications"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="w-4 h-4 text-[var(--color-text-muted)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#490B1A] ring-2 ring-[var(--color-surface)]"></span>
              )}
            </button>

            {/* Authenticated User Menu or Sign In */}
            {currentUser ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-blue-grey)] transition-colors cursor-pointer"
                >
                  <UserAvatar name={currentUser.full_name} role={currentUser.role} size="sm" />

                  <div className="text-left hidden md:block max-w-[130px]">
                    <div className="font-semibold text-xs text-[var(--color-text-main)] truncate">
                      {currentUser.full_name}
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">
                      {currentUser.role === 'FACULTY' ? (currentUser.designation || 'Faculty') : (currentUser.roll_number || 'Student')}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                </button>

                {/* Account Menu Dropdown */}
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[var(--color-surface-card)] rounded-xl shadow-xl border border-[var(--color-border)] p-2 z-50 text-xs animate-in fade-in duration-100">
                    <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[var(--color-text-main)] text-xs truncate">
                          {currentUser.full_name}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          currentUser.role === 'FACULTY' 
                            ? 'bg-[var(--color-surface-hover)] text-[#A16207] border border-[var(--color-border)]'
                            : 'bg-[var(--color-surface-hover)] text-[var(--color-primary)] border border-[var(--color-border)]'
                        }`}>
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate font-mono">
                        {currentUser.email}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-subtle)] truncate mt-0.5">
                        {currentUser.department}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span>Edit Profile</span>
                      </button>

                      {isFacultyAuthorized && (
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            setActiveTab('faculty-portal');
                          }}
                          className="w-full px-3 py-2 rounded-lg text-left flex items-center justify-between text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-3.5 h-3.5 text-[#A16207]" />
                            <span>Faculty Portal</span>
                          </div>
                          {pendingFacultyCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#490B1A] text-[#E5DED2]">
                              {pendingFacultyCount}
                            </span>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsMapModalOpen(true);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <span>Campus Map</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[var(--color-border)]">
                      <button
                        onClick={async () => {
                          setIsAccountMenuOpen(false);
                          await signOutUser();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 text-rose-500 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('LOGIN');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-blue-grey)] text-xs font-semibold text-[var(--color-text-main)] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('REGISTER');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] border border-[#798DA6]/40 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-muted)] cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-3 border-t border-[var(--color-border)] space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab || 
                (item.tab === 'events' && (activeTab === 'opportunities' || activeTab === 'feed' || activeTab === 'carpool'));
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border border-[#798DA6]/40 shadow-xs'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#490B1A] text-[#E5DED2]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-[var(--color-border)] flex items-center gap-2">
              <button
                onClick={() => {
                  handlePostEventClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-text)] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>

              <button
                onClick={toggleTheme}
                className="py-2 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] text-xs font-semibold flex items-center gap-1.5 text-[var(--color-text-main)]"
                title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </nav>
        )}

      </div>
    </header>
  );
};
