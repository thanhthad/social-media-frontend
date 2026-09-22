import React from 'react';
import { Image, Smile, BarChart2, Sparkles } from 'lucide-react';
import { useSocial } from '../../contexts/MockSocialContext';
import soundFX from '../../utils/soundEffects';

export const CreatePostCard = ({ onOpenCreateModal }) => {
  const { currentUser } = useSocial();

  const handleOpen = () => {
    soundFX.playPop();
    if (onOpenCreateModal) onOpenCreateModal();
  };

  return (
    <div className="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 mb-6 select-none group">
      {/* Top Input Trigger */}
      <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-indigo-600/20 group-hover:ring-indigo-600/50 transition"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
        <button
          type="button"
          onClick={handleOpen}
          className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium transition cursor-pointer flex items-center justify-between"
        >
          <span>{currentUser.name} ơi, bạn đang nghĩ gì thế?</span>
          <Sparkles className="w-4 h-4 text-indigo-500 opacity-60 group-hover:opacity-100 transition" />
        </button>
      </div>

      {/* Bottom Action Pills */}
      <div className="flex items-center justify-between pt-3 px-1">
        <button
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-xs font-semibold active:scale-95 cursor-pointer"
        >
          <Image className="w-4 h-4 text-emerald-500 stroke-[2]" />
          <span>Ảnh / Video</span>
        </button>

        <button
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition text-xs font-semibold active:scale-95 cursor-pointer"
        >
          <Smile className="w-4 h-4 text-amber-500 stroke-[2]" />
          <span>Cảm xúc / Hoạt động</span>
        </button>

        <button
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-xs font-semibold hidden sm:flex active:scale-95 cursor-pointer"
        >
          <BarChart2 className="w-4 h-4 text-indigo-500 stroke-[2]" />
          <span>Thăm dò ý kiến</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePostCard;
