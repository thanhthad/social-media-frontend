import { motion, AnimatePresence } from 'framer-motion';
import { Image, Film, PlusCircle, X, Sparkles } from 'lucide-react';

export default function CreateChoiceModal({
  isOpen,
  onClose,
  onOpenCreatePost,
  onOpenCreateReel,
  onOpenCreateStory,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <span>Tạo nội dung mới</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Options */}
          <div className="p-3 space-y-2">
            {/* Post */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCreatePost) onOpenCreatePost();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-indigo-50/70 text-left transition group border border-transparent hover:border-indigo-100 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition">
                <Image size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  Bài viết mới
                </p>
                <p className="text-xs text-slate-400">Chia sẻ hình ảnh, bài viết lên bảng tin</p>
              </div>
            </button>

            {/* Reel */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCreateReel) onOpenCreateReel();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-fuchsia-50/70 text-left transition group border border-transparent hover:border-fuchsia-100 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-fuchsia-500/25 group-hover:scale-105 transition">
                <Film size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-fuchsia-600 transition">
                  Reel video ngắn
                </p>
                <p className="text-xs text-slate-400">Video ngắn bắt trend, âm nhạc sống động</p>
              </div>
            </button>

            {/* Story */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCreateStory) onOpenCreateStory();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-rose-50/70 text-left transition group border border-transparent hover:border-rose-100 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-105 transition">
                <PlusCircle size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition">
                  Tin 24 giờ (Story)
                </p>
                <p className="text-xs text-slate-400">Khoảnh khắc biến mất sau 24h</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
