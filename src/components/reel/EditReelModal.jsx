import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Globe, Users, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import reelService from '../../services/reelService';

export default function EditReelModal({ isOpen, onClose, reel, onReelUpdated }) {
  const [content, setContent] = useState(reel?.content || '');
  const [visibility, setVisibility] = useState(reel?.visibility || 'PUBLIC');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !reel) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Đang cập nhật video Reel...');
    try {
      await reelService.updateReel(reel.id, {
        content: content.trim(),
        visibility,
      });

      toast.success('Đã cập nhật Reel thành công!', { id: toastId });
      if (onReelUpdated) {
        onReelUpdated({
          ...reel,
          content: content.trim(),
          visibility,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to update reel:', err);
      toast.error(err?.response?.data?.message || 'Không thể cập nhật Reel', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Chỉnh sửa video Reel
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Caption / Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Mô tả video
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập tiêu đề hoặc mô tả cho video Reel (#hashtag, @tag bạn bè)..."
                maxLength={1000}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white resize-none"
              />
              <div className="text-right text-[11px] text-slate-400 mt-1">
                {content.length}/1000 ký tự
              </div>
            </div>

            {/* Visibility Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Quyền riêng tư
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('PUBLIC')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition ${
                    visibility === 'PUBLIC'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Công khai</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('FRIEND')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition ${
                    visibility === 'FRIEND'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Bạn bè</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('PRIVATE')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition ${
                    visibility === 'PRIVATE'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Chỉ mình tôi</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
