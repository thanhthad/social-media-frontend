import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import storyService from '../../services/storyService';
import toast from 'react-hot-toast';
import { X, ChevronLeft, ChevronRight, Trash2, Eye, Users } from 'lucide-react';
import { REACTION_ICONS } from '../post/ReactionPicker';

const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryViewerModal({ stories = [], initialIndex = 0, currentUserId, onClose, onStoryDeleted }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStorySubIndex, setActiveStorySubIndex] = useState(0);
  const [showViewersList, setShowViewersList] = useState(false);
  const [realtimeViewers, setRealtimeViewers] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const elapsedRef = useRef(0);

  const currentStoryUser = stories[currentIndex];

  // Fetch full stories of target user
  const fetchUserStories = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      let res;
      if (userId === currentUserId) {
        res = await storyService.getMyStories();
      } else {
        res = await storyService.getUserStories(userId);
      }
      const data = res.data?.data || [];
      setUserStories(Array.isArray(data) ? data : [data]);
      setProgress(0);
      elapsedRef.current = 0;
      startTimeRef.current = Date.now();
    } catch (err) {
      console.error('Failed to load user stories', err);
      toast.error('Không thể tải tin của người dùng này.');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [currentUserId, onClose]);

  useEffect(() => {
    if (currentStoryUser?.userId) {
      fetchUserStories(currentStoryUser.userId);
    }
  }, [currentStoryUser, fetchUserStories]);

  const currentSubStory = userStories[activeStorySubIndex] || currentStoryUser;
  const isMyStory = (currentSubStory?.userId || currentStoryUser?.userId) === currentUserId;

  // Fetch viewers when viewing own story
  useEffect(() => {
    const sId = currentSubStory?.storyId || currentSubStory?.id;
    if (isMyStory && sId) {
      setLoadingViewers(true);
      storyService.getViewers(sId)
        .then((res) => {
          const list = res.data?.data;
          if (Array.isArray(list)) setRealtimeViewers(list);
        })
        .catch(() => {})
        .finally(() => setLoadingViewers(false));
    }
  }, [isMyStory, currentSubStory]);

  // Mark viewed
  useEffect(() => {
    const sId = currentSubStory?.storyId || currentSubStory?.id;
    if (sId) {
      storyService.viewStory(sId).catch(() => {});
    }
  }, [currentSubStory]);

  const goToNextStory = useCallback(() => {
    if (activeStorySubIndex < userStories.length - 1) {
      setActiveStorySubIndex((prev) => prev + 1);
      setProgress(0);
      elapsedRef.current = 0;
      startTimeRef.current = Date.now();
    } else if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setActiveStorySubIndex(0);
      setProgress(0);
      elapsedRef.current = 0;
      startTimeRef.current = Date.now();
    } else {
      onClose();
    }
  }, [activeStorySubIndex, userStories.length, currentIndex, stories.length, onClose]);

  const goToPrevStory = useCallback(() => {
    if (activeStorySubIndex > 0) {
      setActiveStorySubIndex((prev) => prev - 1);
      setProgress(0);
      elapsedRef.current = 0;
      startTimeRef.current = Date.now();
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setActiveStorySubIndex(0);
      setProgress(0);
      elapsedRef.current = 0;
      startTimeRef.current = Date.now();
    }
  }, [activeStorySubIndex, currentIndex]);

  // Story Progress Timer
  useEffect(() => {
    if (isPaused || loading || !currentSubStory) return;

    startTimeRef.current = Date.now() - elapsedRef.current;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      elapsedRef.current = elapsed;
      const pct = Math.min(100, (elapsed / STORY_DURATION) * 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        goToNextStory();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, loading, currentSubStory, goToNextStory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNextStory();
      if (e.key === 'ArrowLeft') goToPrevStory();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextStory, goToPrevStory, onClose]);

  const handleReact = async (type) => {
    const sId = currentSubStory?.storyId || currentSubStory?.id;
    if (!sId) return;
    try {
      await storyService.reactToStory(sId, type);
      toast(`Đã gửi cảm xúc!`, { icon: REACTION_ICONS[type]?.emoji || '❤️' });
    } catch (err) {
      console.error('Failed to react to story', err);
    }
  };

  const handleDeleteStory = async () => {
    const sId = currentSubStory?.storyId || currentSubStory?.id;
    if (!sId) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa tin này không?')) {
      try {
        await storyService.deleteStory(sId);
        toast.success('Đã xóa tin.');
        if (onStoryDeleted) onStoryDeleted(sId);
        goToNextStory();
      } catch (err) {
        toast.error('Không thể xóa tin.');
      }
    }
  };

  if (!currentStoryUser) return null;

  // Viewers / interactions from API or MyStoryResponse
  const viewers = realtimeViewers.length > 0
    ? realtimeViewers
    : (currentSubStory?.interactions || currentSubStory?.viewers || []);
  const viewCount = Math.max(viewers.length, currentSubStory?.viewCount || 0);

  // Reactions summary from MyStoryResponse
  const reactions = currentSubStory?.reactions || [];
  const reactionCount = currentSubStory?.reactionCount ?? reactions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fade-in select-none">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 p-2.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full backdrop-blur-md transition shadow-lg"
      >
        <X size={24} />
      </button>

      {/* Prev button */}
      <button
        onClick={goToPrevStory}
        disabled={currentIndex === 0 && activeStorySubIndex === 0}
        className="absolute left-4 sm:left-10 z-40 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/60 rounded-full backdrop-blur-md transition disabled:opacity-20 disabled:pointer-events-none hidden sm:block"
      >
        <ChevronLeft size={28} />
      </button>

      {/* Next button */}
      <button
        onClick={goToNextStory}
        className="absolute right-4 sm:right-10 z-40 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/60 rounded-full backdrop-blur-md transition hidden sm:block"
      >
        <ChevronRight size={28} />
      </button>

      {/* Main Story Container (9:16 ratio) */}
      <div
        className="relative w-full max-w-sm h-[88vh] max-h-[780px] bg-gray-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
          {userStories.length > 0 ? (
            userStories.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{
                    width:
                      idx < activeStorySubIndex
                        ? '100%'
                        : idx === activeStorySubIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))
          ) : (
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Story Header */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <img
              src={currentSubStory?.avatarUrl || currentStoryUser.avatarUrl || 'https://via.placeholder.com/40'}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/80 shadow-md"
            />
            <div>
              <p className="text-white font-bold text-sm leading-tight drop-shadow">
                {currentSubStory?.username || currentStoryUser.username || 'Người dùng'}
              </p>
              <p className="text-white/70 text-xs drop-shadow">
                {currentSubStory?.createdAt
                  ? new Date(currentSubStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Vừa xong'}
              </p>
            </div>
          </div>

          {/* Delete action if my story */}
          {isMyStory && (
            <button
              onClick={handleDeleteStory}
              className="p-2 text-white/80 hover:text-red-400 hover:bg-black/30 rounded-full transition backdrop-blur-sm"
              title="Xoá tin"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Story Media (Image or Video) */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black">
          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : currentSubStory?.mediaType === 'VIDEO' ? (
            <video
              src={currentSubStory.url}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentSubStory?.url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}

          {/* Touch navigation zones */}
          <div
            onClick={goToPrevStory}
            className="absolute left-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={goToNextStory}
            className="absolute right-0 top-16 bottom-20 w-2/3 z-20 cursor-pointer"
          />
        </div>

        {/* Bottom Bar — Caption + Actions */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-3">
          {/* Caption */}
          {currentSubStory?.content && (
            <p className="text-white text-sm font-medium leading-relaxed drop-shadow px-1">
              {currentSubStory.content}
            </p>
          )}

          {isMyStory ? (
            /* === MY STORY: View count + Viewers list + Reaction summary === */
            <div className="space-y-2">
              {/* Stats row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowViewersList((v) => !v)}
                  className="flex items-center gap-2 text-white/90 text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-md hover:bg-white/20 transition"
                >
                  <Eye size={14} />
                  <span>{viewCount} người đã xem</span>
                </button>
                {reactionCount > 0 && (
                  <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-md">
                    <span>❤️</span>
                    <span>{reactionCount} cảm xúc</span>
                  </div>
                )}
              </div>

              {/* Viewers list (expandable) */}
              {showViewersList && viewers.length > 0 && (
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 max-h-40 overflow-y-auto space-y-2">
                  <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-1">
                    Người đã xem
                  </p>
                  {viewers.map((v, idx) => {
                    const vId = v.userId || v.id;
                    const vReaction = v.reactionType && REACTION_ICONS[v.reactionType]
                      ? REACTION_ICONS[v.reactionType].emoji
                      : null;
                    return (
                      <Link
                        key={vId || idx}
                        to={`/users/${vId}`}
                        onClick={onClose}
                        className="flex items-center gap-2.5 group"
                      >
                        <img
                          src={v.avatarUrl || 'https://via.placeholder.com/32'}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate group-hover:text-blue-300 transition">
                            {v.fullName || v.username || (v.email ? v.email.split('@')[0] : 'Người dùng')}
                          </p>
                          {v.username && (
                            <p className="text-white/50 text-[10px] truncate">@{v.username}</p>
                          )}
                        </div>
                        {vReaction && (
                          <span className="text-base flex-shrink-0">{vReaction}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* === OTHER'S STORY: Quick Reaction Buttons === */
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
              {['LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'].map((type) => {
                const item = REACTION_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleReact(type)}
                    className="p-2 hover:scale-125 transition-transform text-2xl"
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
