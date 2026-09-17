import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Compass,
  Film,
  User,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import reelService from '../services/reelService';
import ReelPlayer from '../components/reel/ReelPlayer';
import CreateReelModal from '../components/reel/CreateReelModal';
import LoginPromptModal from '../components/common/LoginPromptModal';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';

// High quality vertical sample reels for guests/testing when database has no reels
const FALLBACK_PUBLIC_REELS = [
  {
    id: 99901,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-neon-lit-city-street-at-night-42898-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600',
    username: 'city_vibes',
    fullName: 'Neon Explorer',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
    content: 'Đêm thành phố lung linh ánh đèn neon rực rỡ 🌃✨ Cảm giác bình yên giữa phố thị tấp nập. #city #nightlife #vibes',
    reactionCount: 1248,
    commentCount: 86,
    shareCount: 42,
    visibility: 'PUBLIC',
    reacted: false,
  },
  {
    id: 99902,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    username: 'ocean_breeze',
    fullName: 'Hoàng Hôn Biển',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    content: 'Tiếng sóng vỗ rì rào xoa dịu tâm hồn 🌊🏖️ Cuối tuần cùng chill bên bãi biển nhé cả nhà! #beach #chill #nature',
    reactionCount: 3410,
    commentCount: 215,
    shareCount: 120,
    visibility: 'PUBLIC',
    reacted: false,
  },
  {
    id: 99903,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-skater-performing-a-trick-41584-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=600',
    username: 'skater_girl',
    fullName: 'Linh Skate',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
    content: 'Thử thách cú lượn ván mới sau 2 tuần luyện tập liên tục 🛹🔥 Never give up! #skate #lifestyle #energy',
    reactionCount: 892,
    commentCount: 54,
    shareCount: 29,
    visibility: 'PUBLIC',
    reacted: false,
  },
  {
    id: 99904,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-42900-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
    username: 'code_craft',
    fullName: 'Dev Life',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120',
    content: 'Một ngày làm việc điển hình của lập trình viên Fullstack 💻⚡ Cà phê và những dòng code. #developer #coding #tech',
    reactionCount: 2150,
    commentCount: 142,
    shareCount: 78,
    visibility: 'PUBLIC',
    reacted: false,
  },
  {
    id: 99905,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cute-cat-lying-on-a-bed-41566-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    username: 'meo_cute',
    fullName: 'Mèo Béo',
    avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120',
    content: 'Khi bạn vừa thức dậy nhưng nhận ra hôm nay là Chủ Nhật 🐱💤 Ngủ tiếp thôi nào! #catlover #cute #relax',
    reactionCount: 4520,
    commentCount: 310,
    shareCount: 230,
    visibility: 'PUBLIC',
    reacted: false,
  },
];

export const ReelsPage = () => {
  const { user } = useUser();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('feed'); // 'feed' | 'explore' | 'my'
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const touchStartY = useRef(0);

  // Fetch reels based on tab
  const fetchReels = useCallback(async (reset = false) => {
    setLoading(true);
    const targetPage = reset ? 0 : page;
    try {
      let res;
      if (tab === 'feed') {
        res = isAuthenticated
          ? await reelService.getReelFeed(targetPage, 10)
          : await reelService.getPublicReelFeed(targetPage, 10);
      } else if (tab === 'explore') {
        res = isAuthenticated
          ? await reelService.getReelExplore(targetPage, 10)
          : await reelService.getPublicReelFeed(targetPage, 10);
      } else {
        if (!isAuthenticated) {
          setShowLoginPrompt(true);
          setTab('feed');
          return;
        }
        res = await reelService.getMyReels(targetPage, 10);
      }

      const content = res.data?.data?.content || res.data?.data || [];
      const list = Array.isArray(content) ? content : [];

      if (reset) {
        setReels(list);
        setCurrentIndex(0);
        setPage(0);
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      } else {
        setReels((prev) => [...prev, ...list]);
      }

      setHasMore(list.length >= 10);
    } catch (err) {
      console.warn('Failed to load reels from API, using fallback reels if needed:', err?.message);
      if (reset) setReels([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, isAuthenticated]);

  useEffect(() => {
    fetchReels(true);
  }, [tab]);

  // Combined list: database reels or rich sample reels
  const displayedReels = reels.length > 0 ? reels : FALLBACK_PUBLIC_REELS;

  // Scroll to index
  const scrollToIndex = useCallback((index) => {
    if (!containerRef.current) return;
    const targetIdx = Math.max(0, Math.min(index, displayedReels.length - 1));
    setCurrentIndex(targetIdx);
    const itemHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: targetIdx * itemHeight,
      behavior: 'smooth',
    });
  }, [displayedReels.length]);

  const handleNext = () => {
    if (currentIndex < displayedReels.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  // Wheel scroll snapping
  const handleWheel = (e) => {
    if (wheelTimeoutRef.current) return;
    if (Math.abs(e.deltaY) > 25) {
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 350);
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Touch swipe gestures
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 40) {
      if (deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Native scroll sync
  const handleScroll = () => {
    if (!containerRef.current) return;
    const itemHeight = containerRef.current.clientHeight;
    if (itemHeight === 0) return;
    const newIdx = Math.round(containerRef.current.scrollTop / itemHeight);
    if (newIdx !== currentIndex && newIdx >= 0 && newIdx < displayedReels.length) {
      setCurrentIndex(newIdx);
    }
  };

  // Keyboard navigation (ArrowUp, ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowDown', 'PageDown', 'j'].includes(e.key)) {
        e.preventDefault();
        handleNext();
      } else if (['ArrowUp', 'PageUp', 'k'].includes(e.key)) {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, displayedReels.length, hasMore, loading]);

  const handleReelDeleted = (deletedReelId) => {
    setReels((prev) => prev.filter((r) => (r.id || r.reelId) !== deletedReelId));
    if (currentIndex >= displayedReels.length - 1 && currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleReelUpdated = (updatedReel) => {
    setReels((prev) =>
      prev.map((r) => ((r.id || r.reelId) === (updatedReel.id || updatedReel.reelId) ? { ...r, ...updatedReel } : r))
    );
  };

  return (
    <div className="w-full flex flex-col items-center py-2 relative min-h-[calc(100vh-7rem)]">
      {/* Guest Notice Badge */}
      {!isAuthenticated && (
        <div className="w-full max-w-xl mb-3 px-2">
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-rose-500/10 border border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl text-xs shadow-xs">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Đang xem Reels công khai • Cuộn chuột hoặc lướt lên/xuống như TikTok
            </span>
            <Link
              to="/login"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập
            </Link>
          </div>
        </div>
      )}

      {/* Top Controls: Tabs & Create Reel Button */}
      <div className="w-full max-w-xl flex items-center justify-between gap-3 mb-4 px-2">
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 rounded-2xl shadow-xs text-xs font-semibold">
          <button
            onClick={() => setTab('feed')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              tab === 'feed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            {isAuthenticated ? 'Theo dõi' : 'Phổ biến'}
          </button>
          <button
            onClick={() => setTab('explore')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              tab === 'explore'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Khám phá
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setShowLoginPrompt(true);
                return;
              }
              setTab('my');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              tab === 'my'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {isAuthenticated ? 'Của tôi' : 'Của tôi 🔒'}
          </button>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              setShowLoginPrompt(true);
              return;
            }
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Reel</span>
        </button>
      </div>

      {/* Real Vertical Snap-Scrolling Reel Feed */}
      <div className="relative flex items-center gap-4">
        {loading && reels.length === 0 ? (
          <div className="w-[340px] sm:w-[380px] h-[640px] sm:h-[700px] bg-slate-100 dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm font-semibold">Đang tải Reels...</p>
          </div>
        ) : (
          <>
            {/* Scrollable Container with CSS Snap */}
            <div
              ref={containerRef}
              onScroll={handleScroll}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="w-[340px] sm:w-[380px] h-[640px] sm:h-[700px] overflow-y-scroll snap-y snap-mandatory no-scrollbar rounded-3xl shadow-2xl bg-black border border-slate-200/50 dark:border-slate-800/80"
            >
              {displayedReels.map((reel, index) => (
                <div
                  key={reel.id || reel.reelId || index}
                  data-index={index}
                  className="w-full h-full snap-start snap-always shrink-0 relative flex items-center justify-center"
                >
                  <ReelPlayer
                    reel={reel}
                    isActive={index === currentIndex}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted(!isMuted)}
                    onReelDeleted={handleReelDeleted}
                    onReelUpdated={handleReelUpdated}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Chevron Buttons on the right */}
            <div className="hidden md:flex flex-col gap-3 ml-2 select-none">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-md active:scale-95"
                title="Reel trước (Phím Mũi tên lên)"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="text-[11px] font-bold text-center text-slate-400">
                {currentIndex + 1}/{displayedReels.length}
              </div>
              <button
                onClick={handleNext}
                disabled={currentIndex >= displayedReels.length - 1 && !hasMore}
                className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-md active:scale-95"
                title="Reel kế tiếp (Phím Mũi tên xuống)"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Reel Modal */}
      {showCreateModal && (
        <CreateReelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onReelCreated={() => {
            setShowCreateModal(false);
            fetchReels(true);
          }}
        />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Trải nghiệm video ngắn Reels"
        message="Đăng nhập để thả tim, bình luận, chia sẻ và sáng tạo những video ngắn Reels độc đáo của riêng bạn!"
      />
    </div>
  );
};

export default ReelsPage;

