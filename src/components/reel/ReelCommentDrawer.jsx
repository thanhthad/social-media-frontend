import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import CommentSection from '../post/CommentSection';

export default function ReelCommentDrawer({
  isOpen,
  onClose,
  reelId,
  commentCount,
  onCommentCountChange,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end md:justify-center items-end md:items-center bg-black/60 backdrop-blur-sm transition-all duration-300">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Drawer container */}
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[80vh] border border-gray-100"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
                <MessageCircle size={18} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Bình luận
                <span className="ml-2 text-xs font-semibold text-gray-400">
                  ({commentCount || 0})
                </span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Comment list and input */}
          <div className="flex-1 overflow-y-auto px-4 py-3 overscroll-contain">
            <CommentSection
              postId={reelId}
              onCommentCountChange={onCommentCountChange}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
