import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Users,
  Plus,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Video,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import reelService from '../services/reelService';
import ReelPlayer from '../components/reel/ReelPlayer';
import CreateReelModal from '../components/reel/CreateReelModal';

export default function ReelsPage() {
  const [searchParams] = useSearchParams();
  const targetReelId = searchParams.get('reelId');

  // Active Tab: 'explore' (Khám phá) | 'feed' (Bạn bè)
  const [activeTab, setActiveTab] = useState('explore');
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  // Fetch reels based on tab
  const fetchReels = useCallback(
    async (pageNum = 0, isReset = false) => {
      setLoading(true);
      try {
        let content = [];

        // If targetReelId is provided in URL, fetch it first
        if (targetReelId && isReset && pageNum === 0) {
          try {
            const specificRes = await reelService.getReelById(Number(targetReelId));
            const specificReel = specificRes.data?.data || specificRes.data;
            if (specificReel) {
              content.push(specificReel);
            }
          } catch (e) {
            console.log('Could not fetch specific reel', e);
          }
        }

        const res =
          activeTab === 'explore'
            ? await reelService.getReelExplore(pageNum, 10)
            : await reelService.getReelFeed(pageNum, 10);

        const fetchedData = res.data?.data?.content || res.data?.data || [];

        // Filter out duplicate if specific reel was prepended
        const filtered = fetchedData.filter(
          (r) => !content.some((existing) => existing.id === r.id)
        );

        // Merge specific reel (if any) with fetched reels
        const merged = [...content, ...filtered];

        if (isReset) {
          setReels(merged);
        } else {
          setReels((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const unique = filtered.filter((r) => !existingIds.has(r.id));
            return [...prev, ...unique];
          });
        }

        setPage(pageNum);
        setHasMore(fetchedData.length === 10);
      } catch (err) {
        console.error('Failed to fetch reels:', err);
        toast.error('Không thể tải danh sách Reel');
      } finally {
        setLoading(false);
      }
    },
    [activeTab, targetReelId]
  );

  // Switch tab or targetReelId trigger
  useEffect(() => {
    fetchReels(0, true);
    setActiveIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, targetReelId]);

  // Set up IntersectionObserver to detect which reel is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
              // Trigger prefetch when near end
              if (index >= reels.length - 2 && hasMore && !loading) {
                fetchReels(page + 1, false);
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.65,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reels, hasMore, loading, page, fetchReels]);

  // Keyboard navigation (Arrow Up / Down)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyK'].includes(e.code)) {
        e.preventDefault();
        scrollToIndex(Math.max(0, activeIndex - 1));
      } else if (['ArrowDown', 'KeyJ'].includes(e.code)) {
        e.preventDefault();
        scrollToIndex(Math.min(reels.length - 1, activeIndex + 1));
      } else if (e.code === 'KeyM') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reels.length]);

  const scrollToIndex = (index) => {
    const targetEl = itemRefs.current[index];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReelDeleted = (deletedReelId) => {
    setReels((prev) => prev.filter((r) => r.id !== deletedReelId));
  };

  const handleReelCreated = () => {
    fetchReels(0, true);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto h-full flex flex-col items-center select-none overflow-hidden py-1">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-[420px] flex items-center justify-between py-1 px-3 z-30 mb-1 flex-shrink-0">
        {/* Tab switch */}
        <div className="flex bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 p-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Compass size={15} />
            <span>Khám phá</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={15} />
            <span>Bạn bè</span>
          </button>
        </div>

        {/* Create Reel Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition transform active:scale-95 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Tạo Reel</span>
        </button>
      </div>

      {/* Main Snap Scroll Container */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 min-h-0 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar rounded-3xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reels.map((reel, idx) => (
          <div
            key={reel.id || idx}
            ref={(el) => (itemRefs.current[idx] = el)}
            data-index={idx}
            className="w-full h-full snap-center flex items-center justify-center p-1 md:p-2"
          >
            <ReelPlayer
              reel={reel}
              isActive={idx === activeIndex}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              onReelDeleted={handleReelDeleted}
            />
          </div>
        ))}

        {/* Loading Spinner */}
        {loading && (
          <div className="w-full h-full snap-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin" />
            <p className="text-xs font-bold text-gray-500">Đang tải Reels...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && reels.length === 0 && (
          <div className="w-full h-full snap-center flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto shadow-inner">
                <Video size={32} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-base">Chưa có video Reel nào</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">
                  {activeTab === 'feed'
                    ? 'Bạn bè của bạn chưa đăng Reel nào. Hãy qua tab Khám phá hoặc tạo Reel đầu tiên!'
                    : 'Hãy là người đầu tiên chia sẻ khoảnh khắc Reel thú vị!'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition"
              >
                + Đăng Reel ngay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Desktop Up / Down Controls */}
      <div className="hidden lg:flex flex-col gap-2 absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className="p-3 bg-white/90 hover:bg-white text-gray-700 disabled:opacity-40 backdrop-blur-md rounded-full shadow-lg transition active:scale-95"
          title="Reel trước (Phím Mũi tên lên)"
        >
          <ChevronUp size={22} />
        </button>
        <button
          onClick={() => scrollToIndex(Math.min(reels.length - 1, activeIndex + 1))}
          disabled={activeIndex === reels.length - 1}
          className="p-3 bg-white/90 hover:bg-white text-gray-700 disabled:opacity-40 backdrop-blur-md rounded-full shadow-lg transition active:scale-95"
          title="Reel tiếp theo (Phím Mũi tên xuống)"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      {/* Create Reel Modal */}
      <CreateReelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onReelCreated={handleReelCreated}
      />
    </div>
  );
}
