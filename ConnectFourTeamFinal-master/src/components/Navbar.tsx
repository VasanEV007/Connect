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
  FolderCheck, 
  GraduationCap, 
  Sparkles,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  MapPin,
  ShieldCheck
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
    setIsProfileModalOpen
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

  // Build navigation items with role-aware filtering:
  // Faculty Portal is visible ONLY to authorized faculty/admin accounts.
  const isFacultyAuthorized = currentUser ? canAccessFacultyPortal(currentUser) : false;

  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'opportunities', label: 'Opportunities', icon: <Sparkles className="w-4 h-4" /> },
    { tab: 'find-people', label: 'Find People', icon: <Users className="w-4 h-4" /> },
    { tab: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'my-activities', label: 'My Activities', icon: <FolderCheck className="w-4 h-4" /> },
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

  const handlePostOpportunityClick = () => {
    if (!currentUser) {
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreatePostModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090B0F] border-b border-[#27303D] transition-colors select-none">
      
      {/* Amrita Campus Top Rail */}
      <div className="bg-[#05070A] text-[#A1AAB8] px-4 py-1 text-xs font-sans flex items-center justify-between border-b border-[#1A1F2C]">
        <div className="flex items-center gap-2 max-w-xl truncate">
          <span className="font-serif font-black text-[#22C55E] text-xs">ॐ</span>
          <span className="font-bold text-[#F8FAFC] tracking-wider text-[11px]">
            Amrita Vishwa Vidyapeetham
          </span>
          <span className="text-[#64748B] hidden sm:inline">• Ettimadai Campus, Coimbatore</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="flex items-center gap-1.5 text-[#22C55E] hover:text-[#16A34A] transition-colors font-medium cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            Campus Navigator
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo - Connect */}
          <div 
            onClick={() => { setActiveTab('opportunities'); setIsMobileMenuOpen(false); }}
            className="cursor-pointer group shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('opportunities'); }}
          >
            <Logo size="md" showCampusTag={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab || (item.tab === 'opportunities' && activeTab === 'feed');
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[#171C24] text-[#F8FAFC] font-semibold border border-[#27303D] shadow-xs'
                      : 'text-[#A1AAB8] hover:text-white hover:bg-[#11151B]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Real User Account Menu */}
          <div className="flex items-center gap-2">
            
            {/* Create Opportunity Action */}
            <button
              onClick={handlePostOpportunityClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-bold shadow-md shadow-green-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Opportunity</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-lg border border-[#27303D] bg-[#11151B] hover:border-[#384355] hover:text-white text-[#A1AAB8] relative transition-colors cursor-pointer"
              title="Notifications"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-[#090B0F]"></span>
              )}
            </button>

            {/* Authenticated User Menu or Sign In */}
            {currentUser ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-[#27303D] bg-[#11151B] hover:border-[#384355] transition-colors cursor-pointer"
                >
                  <UserAvatar name={currentUser.full_name} role={currentUser.role} size="sm" />

                  <div className="text-left hidden md:block max-w-[130px]">
                    <div className="font-semibold text-xs text-[#F8FAFC] truncate">
                      {currentUser.full_name}
                    </div>
                    <div className="text-[10px] text-[#A1AAB8] font-mono truncate">
                      {currentUser.role === 'FACULTY' ? (currentUser.designation || 'Faculty') : (currentUser.roll_number || 'Student')}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-[#A1AAB8]" />
                </button>

                {/* Account Menu Dropdown */}
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#11151B] rounded-xl shadow-2xl border border-[#27303D] p-2 z-50 text-xs animate-in fade-in duration-100">
                    <div className="px-3 py-2.5 border-b border-[#27303D]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs truncate">
                          {currentUser.full_name}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          currentUser.role === 'FACULTY' 
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-green-950/80 text-green-300 border border-green-800/60'
                        }`}>
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A1AAB8] truncate font-mono">
                        {currentUser.email}
                      </p>
                      <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                        {currentUser.department}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 text-[#F8FAFC] hover:bg-[#171C24] transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>Edit Profile</span>
                      </button>

                      {isFacultyAuthorized && (
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            setActiveTab('faculty-portal');
                          }}
                          className="w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 text-amber-300 hover:bg-[#171C24] transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Faculty Portal</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#27303D]">
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          signOutUser();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Signed out state */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('LOGIN');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#27303D] bg-[#11151B] hover:border-[#384355] text-xs font-semibold text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('REGISTER');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-xs font-bold text-black transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[#27303D] bg-[#11151B] text-[#A1AAB8]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-3 border-t border-[#27303D] space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab || (item.tab === 'opportunities' && activeTab === 'feed');
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#171C24] text-[#22C55E] font-bold border border-[#22C55E]/20'
                      : 'text-[#A1AAB8] hover:bg-[#11151B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 px-2 flex gap-2">
              <button
                onClick={() => {
                  handlePostOpportunityClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-lg bg-[#22C55E] text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create Opportunity
              </button>
              <button
                onClick={() => {
                  setIsMapModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 px-4 rounded-lg border border-[#27303D] bg-[#11151B] text-[#A1AAB8] text-xs font-semibold cursor-pointer"
              >
                Campus Map
              </button>
            </div>
          </nav>
        )}

      </div>
    </header>
  );
};
