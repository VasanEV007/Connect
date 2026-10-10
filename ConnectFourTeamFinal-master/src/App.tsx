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
    <div className="min-h-screen flex flex-col bg-[#090B0F] text-[#F8FAFC] transition-colors selection:bg-[#22C55E] selection:text-black">
      
      {/* Top Navbar */}
      <Navbar 
        onOpenNotifications={() => setIsNotificationsOpen(true)} 
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {(activeTab === 'opportunities' || activeTab === 'feed' || activeTab === 'carpool') && <EventFeed />}
        {activeTab === 'find-people' && <FindPeopleDirectory />}
        {activeTab === 'calendar' && <CalendarModule />}
        {activeTab === 'my-activities' && <MyActivitiesModule />}
        {activeTab === 'faculty-portal' && <FacultyPortal />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#27303D] bg-[#0E121A] py-8 px-4 sm:px-6 text-xs text-[#A1AAB8] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showWordmark={false} />
            <div>
              <p className="font-bold text-white flex items-center gap-2">
                Connect • Amrita Vishwa Vidyapeetham
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-green-950/80 text-green-400 border border-green-800/60">
                  Ettimadai Campus
                </span>
              </p>
              <p className="text-[11px] text-[#A1AAB8]">
                Connect with people. Discover opportunities. Build together.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="text-[#A1AAB8] hover:text-[#22C55E] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
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
