import React, { useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSocial } from '../../contexts/MockSocialContext';

export const StorySection = ({ onOpenCreateStory }) => {
  const { currentUser, stories = [], setActiveStory } = useSocial();
  const scrollContainerRef = useRef(null);
  const userAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const storyList = Array.isArray(stories) ? stories : [];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-6 select-none">
      {/* Scroll left button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition"
        aria-label="Cuộn sang trái"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Story list horizontal scroll */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
      >
        {/* 1. Add Story Card */}
        <div
          onClick={onOpenCreateStory}
          className="relative shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 group cursor-pointer shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="h-32 sm:h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
            <img
              src={userAvatar}
              alt="Tạo tin"
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300" />
          </div>
          <div className="absolute top-[108px] sm:top-[122px] left-1/2 -translate-x-1/2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 border-2 border-white dark:border-slate-900 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-110 group-hover:bg-indigo-700 transition">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="p-2 pt-4 text-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
              Tạo tin mới
            </span>
          </div>
        </div>

        {/* 2. Friend Stories */}
        {storyList.map((story) => {
          const firstMedia = story.items[0]?.mediaUrl || story.user.avatar;
          return (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="relative shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 bg-slate-900 group cursor-pointer shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              {/* Story Background Image */}
              <img
                src={firstMedia}
                alt={story.user.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

              {/* Author Avatar with dynamic glowing gradient ring */}
              <div className="absolute top-2.5 left-2.5">
                <div
                  className={`w-9 h-9 rounded-full p-0.5 ${
                    story.hasUnseen
                      ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 shadow-sm shadow-purple-500/20'
                      : 'bg-slate-400/60'
                  }`}
                >
                  <img
                    src={story.user.avatar}
                    alt={story.user.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900"
                  />
                </div>
              </div>

              {/* Author Name */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="text-xs font-semibold text-white drop-shadow-sm line-clamp-1 group-hover:text-indigo-200 transition">
                  {story.user.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll right button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition"
        aria-label="Cuộn sang phải"
      >
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};

export default StorySection;
