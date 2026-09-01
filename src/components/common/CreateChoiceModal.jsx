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
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-pink-500" />
              <span>Tạo nội dung mới</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
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
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-blue-50/60 text-left transition group border border-transparent hover:border-blue-100 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <Image size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Bài viết mới
                </p>
                <p className="text-xs text-gray-400">Chia sẻ hình ảnh, video lên bảng tin</p>
              </div>
            </button>

            {/* Reel */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCreateReel) onOpenCreateReel();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-pink-50/60 text-left transition group border border-transparent hover:border-pink-100 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <Film size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-pink-600 transition">
                  Reel video ngắn
                </p>
                <p className="text-xs text-gray-400">Video ngắn bắt trend, âm nhạc sống động</p>
              </div>
            </button>

            {/* Story */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCreateStory) onOpenCreateStory();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-amber-50/60 text-left transition group border border-transparent hover:border-amber-100 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <PlusCircle size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition">
                  Tin 24 giờ (Story)
                </p>
                <p className="text-xs text-gray-400">Khoảnh khắc biến mất sau 24h</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
