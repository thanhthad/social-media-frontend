import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import CreatePostModal from '../post/CreatePostModal';
import StoryViewerModal from '../story/StoryViewerModal';
import { useSocial } from '../../contexts/MockSocialContext';

export const AppLayout = ({ children, hideRightSidebar = false }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { activeStory, setActiveStory } = useSocial();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors relative selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Ambient Lighting Mesh Glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-600/15 dark:via-purple-900/10 dark:to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-60 w-96 h-96 bg-rose-500/5 dark:bg-rose-500/10 blur-3xl rounded-full" />
      </div>

      {/* 1. Sticky Top Navigation Header */}
      <AppHeader onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* 2. Main 3-Column Content Layout */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex justify-center">
        {/* Left Navigation Sidebar */}
        <div className="hidden md:block">
          <Sidebar onOpenCreatePost={() => setIsCreateOpen(true)} />
        </div>

        {/* Center Main Stream Content */}
        <main className="flex-1 min-w-0 max-w-2xl px-3 sm:px-6 py-6 pb-24 md:pb-8">
          {children || <Outlet />}
        </main>

        {/* Right Sidebar (Hidden on tablets/mobiles or specialized pages) */}
        {!hideRightSidebar && <RightSidebar />}
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <MobileNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* 4. Global Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {activeStory && (
        <StoryViewerModal
          story={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </div>
  );
};

export default AppLayout;
