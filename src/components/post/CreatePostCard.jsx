import React from 'react';
import { Image, Smile, BarChart2 } from 'lucide-react';
import { useSocial } from '../../contexts/MockSocialContext';

export const CreatePostCard = ({ onOpenCreateModal }) => {
  const { currentUser } = useSocial();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs mb-6 select-none transition">
      {/* Top Input Trigger */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-indigo-600/15"
        />
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium transition cursor-pointer"
        >
          {currentUser.name} ơi, bạn đang nghĩ gì thế?
        </button>
      </div>

      {/* Bottom Action Pills */}
      <div className="flex items-center justify-between pt-3 px-1">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition text-xs font-semibold"
        >
          <Image className="w-4 h-4 text-emerald-500 stroke-[2]" />
          <span>Ảnh / Video</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition text-xs font-semibold"
        >
          <Smile className="w-4 h-4 text-amber-500 stroke-[2]" />
          <span>Cảm xúc / Hoạt động</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition text-xs font-semibold hidden sm:flex"
        >
          <BarChart2 className="w-4 h-4 text-indigo-500 stroke-[2]" />
          <span>Thăm dò ý kiến</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePostCard;
