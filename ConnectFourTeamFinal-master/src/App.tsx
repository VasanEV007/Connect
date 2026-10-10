import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { EventFeed } from './components/EventFeed';
import { FindPeopleDirectory } from './components/FindPeopleDirectory';
import { CalendarModule } from './components/CalendarModule';
import { CarpoolModule } from './components/CarpoolModule';
import { FacultyPortal } from './components/FacultyPortal';
import { MyActivitiesModule } from './components/MyActivitiesModule';
import { PostDetailModal } from './components/PostDetailModal';
import { GroupChatModal } from './components/GroupChatModal';
import { ODSlipModal } from './components/ODSlipModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CampusMapModal } from './components/CampusMapModal';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { RotateCcw, MapPin } from 'lucide-react';

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
    isMapModalOpen, 
    setIsMapModalOpen,
    resetToSampleData 
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-black text-slate-100 transition-colors selection:bg-green-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar 
        onOpenNotifications={() => setIsNotificationsOpen(true)} 
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)} 
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'feed' && <EventFeed />}
        {activeTab === 'find-people' && <FindPeopleDirectory />}
        {activeTab === 'calendar' && <CalendarModule />}
        {activeTab === 'carpool' && <CarpoolModule />}
        {activeTab === 'faculty-portal' && <FacultyPortal />}
        {activeTab === 'my-activities' && <MyActivitiesModule />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1E2433] bg-[#0A0D14] py-8 px-4 sm:px-6 text-xs text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#141A24] border border-[#232B3B] text-green-400 flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              ॐ
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-2">
                CampusConnect • Amrita Vishwa Vidyapeetham
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-green-950/80 text-green-400 border border-green-800/60">
                  Ettimadai Portal
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                Autonomous Student & Faculty Collaboration Infrastructure • Ettimadai Campus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="text-slate-300 hover:text-green-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-green-400" />
              Campus Map
            </button>
            <span className="text-[#232B3B]">•</span>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              title="Reset all localStorage to original Amrita demo data"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Data
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
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetToSampleData}
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
