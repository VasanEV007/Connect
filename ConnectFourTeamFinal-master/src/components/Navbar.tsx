import React, { useState, useEffect, useRef } from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import { 
  MapPin, 
  Bell, 
  Plus, 
  Users, 
  Calendar, 
  Car, 
  FolderCheck, 
  GraduationCap, 
  Sparkles,
  ChevronDown,
  UserCheck,
  Menu,
  X,
  RotateCcw
} from 'lucide-react';

interface Props {
  onOpenNotifications: () => void;
  onOpenResetConfirm: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenNotifications, onOpenResetConfirm }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    allUsers, 
    activeTab, 
    setActiveTab, 
    notifications, 
    applications,
    posts,
    setIsCreatePostModalOpen, 
    setIsMapModalOpen, 
    setIsAuthModalOpen 
  } = useApp();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const personaMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPersonaMenuOpen(false);
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
  const unreadCount = notifications.filter(n => n.user_id === currentUser.id && !n.read).length;

  // Pending faculty reviews if faculty
  const facultyCallIds = posts.filter(p => p.host_id === currentUser.id).map(p => p.id);
  const pendingFacultyCount = applications.filter(a => facultyCallIds.includes(a.post_id) && a.status === 'PENDING').length;

  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'feed', label: 'Events Feed', icon: <Sparkles className="w-4 h-4" /> },
    { tab: 'find-people', label: 'Find People', icon: <Users className="w-4 h-4" /> },
    { tab: 'calendar', label: 'Calendar & Clash', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'carpool', label: 'Carpool Travel', icon: <Car className="w-4 h-4" /> },
    { 
      tab: 'faculty-portal', 
      label: 'Faculty Portal', 
      icon: <GraduationCap className="w-4 h-4" />,
      badge: currentUser.role === 'FACULTY' && pendingFacultyCount > 0 ? pendingFacultyCount : undefined,
    },
    { tab: 'my-activities', label: 'My Activities', icon: <FolderCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-[#1A1F2C] transition-colors">
      
      {/* Institutional Top Rail */}
      <div className="bg-[#05070A] text-slate-300 px-4 py-1.5 text-xs font-sans flex items-center justify-between border-b border-[#161B26]">
        <div className="flex items-center gap-2 max-w-xl truncate">
          <span className="font-serif font-black text-green-400 text-sm">ॐ</span>
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Amrita Vishwa Vidyapeetham
          </span>
          <span className="text-slate-400 hidden sm:inline">• Ettimadai Campus, Coimbatore</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors font-medium cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            Campus Navigator
          </button>
          <span className="text-[#1E2433]">|</span>
          <span className="text-green-400/90 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-green-950/40 border border-green-800/40">
            Haveloc Portal View
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo - Haveloc Style */}
          <div 
            onClick={() => { setActiveTab('feed'); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('feed'); }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-black flex items-center justify-center font-bold shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-lg tracking-tighter">h</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Campus<span className="text-green-400">Connect</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-green-950/60 text-green-400 border border-green-800/50">
                  Amrita
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Unified Student & Faculty Collaboration
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links - Haveloc Capsule Pills */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all relative ${
                    isActive
                      ? 'bg-[#131722] text-white font-semibold border border-[#2D3548] shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-[#0D1017]'
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

          {/* Right Action Icons & Persona Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Create Post Button - Haveloc Green Accent */}
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-bold shadow-md shadow-green-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Post Opportunity</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-lg border border-[#1E2433] bg-[#0D1017] hover:border-[#2D3748] hover:text-white text-slate-300 relative transition-colors cursor-pointer"
              title="Notifications"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500 ring-2 ring-black"></span>
              )}
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative" ref={personaMenuRef}>
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                aria-expanded={isPersonaMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-[#1E2433] bg-[#0D1017] hover:border-[#2D3748] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-[#1A202C] border border-[#2D3748] text-green-400 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.full_name.charAt(0)
                  )}
                </div>

                <div className="text-left hidden md:block max-w-[120px]">
                  <div className="font-semibold text-xs text-white truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {currentUser.role === 'FACULTY' ? 'Faculty Lead' : currentUser.roll_number?.slice(0, 14)}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Switcher Menu */}
              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0D1017] rounded-xl shadow-2xl border border-[#1E2433] p-2 z-50 text-xs animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-[#1E2433]">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block">
                      Active User Persona
                    </span>
                    <p className="font-bold text-white mt-0.5">
                      {currentUser.full_name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser.department}
                    </p>
                  </div>

                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Demo Persona
                    </div>
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setIsPersonaMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-[#151B26] text-green-400 font-semibold border border-green-500/20'
                            : 'hover:bg-[#151B26] text-slate-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate font-semibold">{u.full_name}</div>
                          <div className="text-[10px] text-slate-400 truncate font-mono">
                            {u.roll_number || u.designation}
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          u.role === 'FACULTY'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-green-950/80 text-green-300 border border-green-800/60'
                        }`}>
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-[#1E2433] space-y-1">
                    <button
                      onClick={() => {
                        setIsPersonaMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-lg hover:bg-[#151B26] text-slate-200 font-semibold text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-green-400" />
                      Register New Amrita Identity
                    </button>

                    <button
                      onClick={() => {
                        setIsPersonaMenuOpen(false);
                        onOpenResetConfirm();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg hover:bg-rose-950/30 text-rose-400 font-medium text-center flex items-center justify-center gap-1.5 text-[11px] cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Demo Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[#1E2433] bg-[#0D1017] text-slate-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-3 border-t border-[#1E2433] space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#151B26] text-green-400 font-bold border border-green-500/20'
                      : 'text-slate-300 hover:bg-[#151B26]'
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
                  setIsCreatePostModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-lg bg-[#22C55E] text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Post Opportunity
              </button>
              <button
                onClick={() => {
                  setIsMapModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 px-4 rounded-lg border border-[#1E2433] bg-[#0D1017] text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Map
              </button>
            </div>
          </nav>
        )}

      </div>
    </header>
  );
};
