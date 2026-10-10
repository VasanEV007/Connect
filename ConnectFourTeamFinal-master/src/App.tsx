import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { EventFeed } from './components/EventFeed';
import { FindPeopleDirectory } from './components/FindPeopleDirectory';
import { CalendarModule } from './components/CalendarModule';
import { FacultyPortal } from './components/FacultyPortal';
import { MyActivitiesModule } from './components/MyActivitiesModule';
import { PostDetailModal } from './components/PostDetailModal';
import { GroupChatModal } from './components/GroupChatModal';
import { ODSlipModal } from './components/ODSlipModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CampusMapModal } from './components/CampusMapModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Logo } from './components/ui/Logo';
import { MapPin } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    selectedPostForDetail, 
    setSelectedPostForDetail, 
    selectedPostForChat, 
    setSelectedPostForChat, 
    selectedODSlipForView, 
    setSelectedODSlipForView, 
    isCreatePostModalOpen, 
    setIsCreatePostModalOpen, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isMapModalOpen, 
    setIsMapModalOpen,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-page-bg)] text-[var(--color-text-main)] transition-colors duration-150 selection:bg-[#490B1A] selection:text-[#E5DED2]">
      
      {/* Top Navbar */}
      <Navbar 
        onOpenNotifications={() => setIsNotificationsOpen(true)} 
      />

      {/* Main Body View: 1. Events, 2. Calendar, 3. My Activities, 4. Find People, 5. Faculty Portal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {(activeTab === 'events' || activeTab === 'opportunities' || activeTab === 'feed' || activeTab === 'carpool') && <EventFeed />}
        {activeTab === 'calendar' && <CalendarModule />}
        {activeTab === 'my-activities' && <MyActivitiesModule />}
        {activeTab === 'find-people' && <FindPeopleDirectory />}
        {activeTab === 'faculty-portal' && <FacultyPortal />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8 px-4 sm:px-6 text-xs text-[var(--color-text-muted)] transition-colors duration-150">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showWordmark={false} />
            <div>
              <p className="font-bold text-[var(--color-text-main)] flex items-center gap-2">
                Connect • Amrita Vishwa Vidyapeetham
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-primary)] border border-[var(--color-border)]">
                  Ettimadai Campus
                </span>
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Connect with people. Discover events. Build together.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              Campus Map
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <PostDetailModal
        post={selectedPostForDetail}
        onClose={() => setSelectedPostForDetail(null)}
      />

      <GroupChatModal
        post={selectedPostForChat}
        onClose={() => setSelectedPostForChat(null)}
      />

      <ODSlipModal
        slip={selectedODSlipForView}
        onClose={() => setSelectedODSlipForView(null)}
      />

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />

      <CampusMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
