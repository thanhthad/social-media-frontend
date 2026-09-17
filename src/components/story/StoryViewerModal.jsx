import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import storyService from '../../services/storyService';
import { useUser } from '../../contexts/UserContext';
import { useSocial } from '../../contexts/MockSocialContext';

export const StoryViewerModal = ({ story, onClose }) => {
  const { currentUserId } = useUser();
  const { refreshData } = useSocial();
  const [isPaused, setIsPaused] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [currentVisibility, setCurrentVisibility] = useState(story?.visibility || 'PUBLIC');
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const storyId = story?.storyId || story?.id;
  const authorId = story?.userId || story?.user?.id;
  const isOwner = currentUserId && String(currentUserId) === String(authorId);
  const authorName = story?.username || story?.user?.name || `Người dùng #${authorId || ''}`;
  const authorAvatar = story?.avatarUrl || story?.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const mediaUrl = story?.url || story?.items?.[0]?.mediaUrl || authorAvatar;
  const isVideo = story?.mediaType === 'VIDEO' || mediaUrl.endsWith('.mp4');

  // Record view on mount
  useEffect(() => {
    if (storyId) {
      storyService.viewStory(storyId).catch(() => {});
      storyService.getReactionCount(storyId).then((res) => {
        setReactionCount(res.data?.data || 0);
      }).catch(() => {});
    }
  }, [storyId]);

  // Load viewers if owner
  const handleLoadViewers = async () => {
    try {
      const res = await storyService.getViewers(storyId);
      const data = res.data?.data || [];
      setViewers(Array.isArray(data) ? data : []);
      setShowViewersModal(true);
    } catch (e) {
      toast.error('Không thể tải danh sách người xem');
    }
  };

  const handleSendReaction = async (type = 'LOVE') => {
    try {
      await storyService.reactToStory(storyId, type);
      setReactionCount((prev) => prev + 1);
      toast.success(`Đã thả cảm xúc vào tin!`);
    } catch (e) {
      toast.error('Lỗi khi thả cảm xúc');
    }
  };

  const handleUpdateVisibility = async (newVisibility) => {
    setUpdatingVisibility(true);
    try {
      await storyService.updateVisibility(storyId, newVisibility);
      setCurrentVisibility(newVisibility);
      if (story) story.visibility = newVisibility;
      const label = newVisibility === 'PUBLIC' ? 'Công khai' : newVisibility === 'FRIEND' ? 'Bạn bè' : 'Chỉ mình tôi';
      toast.success(`Đã cập nhật quyền riêng tư tin: ${label}`);
      if (refreshData) refreshData();
    } catch (e) {
      toast.error('Không thể cập nhật quyền riêng tư tin');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tin này không?')) return;
    try {
      await storyService.deleteStory(storyId);
      toast.success('Đã xóa tin');
      onClose();
      if (refreshData) refreshData();
    } catch (e) {
      toast.error('Không thể xóa tin');
    }
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Close button top right */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
        aria-label="Đóng tin"
      >
        <X className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Main 9:16 Story Frame */}
      <div
        className="relative w-full max-w-sm h-full sm:h-[820px] max-h-screen bg-slate-900 sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Image / Video */}
        {isVideo ? (
          <video
            src={mediaUrl}
            autoPlay
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Nội dung tin"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-20 p-4 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-9 h-9 rounded-full object-cover border-2 border-white/80 shadow-xs"
              />
              <div>
                <span className="text-xs font-bold text-white block drop-shadow-sm">
                  {authorName}
                </span>
                <span className="text-[10px] text-white/70">
                  {story.createdAt ? new Date(story.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '24h Story'}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-1.5">
                <select
                  value={currentVisibility}
                  onChange={(e) => handleUpdateVisibility(e.target.value)}
                  disabled={updatingVisibility}
                  className="bg-black/50 hover:bg-black/70 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 outline-none transition cursor-pointer"
                  title="Thay đổi quyền riêng tư của tin"
                >
                  <option value="PUBLIC" className="bg-slate-900 text-white">🌐 Công khai</option>
                  <option value="FRIEND" className="bg-slate-900 text-white">👥 Bạn bè</option>
                  <option value="PRIVATE" className="bg-slate-900 text-white">🔒 Chỉ mình tôi</option>
                </select>

                <button
                  type="button"
                  onClick={handleDeleteStory}
                  className="p-1.5 bg-black/40 hover:bg-red-600/80 text-white rounded-full transition"
                  title="Xóa story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {story.content && (
            <div className="bg-black/40 backdrop-blur-xs p-2.5 rounded-xl text-xs text-white">
              {story.content}
            </div>
          )}
        </div>

        {/* Bottom Interaction Bar */}
        <div className="relative z-20 p-4 pb-6 flex items-center justify-between gap-3">
          {isOwner ? (
            <button
              type="button"
              onClick={handleLoadViewers}
              className="w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 transition"
            >
              <Eye className="w-4 h-4" />
              <span>Xem người đã xem tin</span>
            </button>
          ) : (
            <>
              <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-xs text-white/80">
                Nhấn ❤️ để bày tỏ cảm xúc
              </div>
              <button
                type="button"
                onClick={() => handleSendReaction('LOVE')}
                className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition active:scale-90"
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Viewers Modal */}
      {showViewersModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Người đã xem ({viewers.length})</span>
              </h4>
              <button onClick={() => setShowViewersModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2.5">
              {viewers.length > 0 ? (
                viewers.map((v, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                    <img
                      src={v.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {v.username || `User #${v.userId}`}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {v.viewedAt ? new Date(v.viewedAt).toLocaleTimeString('vi-VN') : 'Đã xem'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Chưa có ai xem tin này</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewerModal;
