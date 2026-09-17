import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Sparkles, Heart, MessageSquare, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function LoginPromptModal({
  isOpen,
  onClose,
  title = 'Tham gia cùng cộng đồng SocialDB',
  message = 'Bạn cần đăng nhập để thực hiện hành động này (bày tỏ cảm xúc, bình luận, lưu bài viết, kết bạn hoặc tham gia hẹn hò).',
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 select-none overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          {/* Header Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Yêu cầu đăng nhập
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
            {message}
          </p>

          {/* Value props list */}
          <div className="space-y-2.5 mb-6 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Thả cảm xúc và bình luận bài viết, video ngắn Reels</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Trò chuyện trực tiếp và tạo nhóm trò chuyện miễn phí</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Khám phá tính năng Hẹn hò (Dating) thông minh và bảo mật</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <Link
              to="/login"
              onClick={onClose}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập vào tài khoản</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tạo tài khoản mới miễn phí</span>
            </Link>

            <button
              onClick={onClose}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition"
            >
              Để sau, tôi muốn tiếp tục xem
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
