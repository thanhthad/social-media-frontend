import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MoreVertical,
  Music,
  Trash2,
  Flag,
  Globe,
  Users,
  Lock,
  Plus,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../../contexts/UserContext';
import reelService from '../../services/reelService';
import savedPostService from '../../services/savedPostService';
import followService from '../../services/followService';
import reportService from '../../services/reportService';
import ReelCommentDrawer from './ReelCommentDrawer';
import ReelShareModal from './ReelShareModal';

export default function ReelPlayer({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onReelDeleted,
}) {
  const { user: currentUser, currentUserId } = useUser();
  const isOwner = currentUserId && reel.userId && Number(currentUserId) === Number(reel.userId);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const lastTapRef = useRef(0);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoved, setIsLoved] = useState(reel.reacted || false);
  const [reactionCount, setReactionCount] = useState(reel.reactionCount || 0);
  const [commentCount, setCommentCount] = useState(reel.commentCount || 0);
  const [shareCount, setShareCount] = useState(reel.shareCount || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isExpandedText, setIsExpandedText] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  // Check saved status
  useEffect(() => {
    if (reel?.id && !isOwner) {
      savedPostService
        .checkSavedStatus(reel.id)
        .then((res) => setIsSaved(!!(res.data?.data ?? res.data)))
        .catch(() => {});
    }
  }, [reel?.id, isOwner]);

  // Sync active state with video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay prevented', err);
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle video progress & view tracking
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const current = video.currentTime;
    const dur = video.duration;
    setProgress((current / dur) * 100);

    // Trigger startView after 1.5s of watching
    if (current >= 1.5 && !viewTracked) {
      setViewTracked(true);
      reelService.startView(reel.id).catch(() => {});
    }
  };

  // Handle video loop/ended
  const handleVideoEnded = () => {
    if (videoRef.current) {
      const durMs = Math.round(videoRef.current.duration * 1000);
      reelService.updateProgress(reel.id, durMs, true).catch(() => {});
      reelService.replay(reel.id).catch(() => {});
    }
  };

  // Toggle Play / Pause on Single Tap
  const handleVideoClick = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap -> trigger Like
      handleDoubleTap(e);
    } else {
      // Single tap -> toggle Play/Pause
      togglePlayPause();
    }
    lastTapRef.current = now;
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setShowPlayPauseIcon(true);
    setTimeout(() => setShowPlayPauseIcon(false), 800);
  };

  // Double tap to Love
  const handleDoubleTap = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHeartPos({ x, y });

    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);

    if (!isLoved) {
      handleToggleLove();
    }
  };

  // Toggle Love
  const handleToggleLove = async () => {
    // Optimistic UI
    const prevLoved = isLoved;
    const prevCount = reactionCount;
    setIsLoved(!prevLoved);
    setReactionCount(prevLoved ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await reelService.loveReel(reel.id);
    } catch (err) {
      setIsLoved(prevLoved);
      setReactionCount(prevCount);
      toast.error('Không thể thực hiện hành động này');
    }
  };

  // Toggle Save
  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await savedPostService.unsavePost(reel.id);
        setIsSaved(false);
        toast.success('Đã bỏ lưu Reel');
      } else {
        await savedPostService.savePost(reel.id);
        setIsSaved(true);
        toast.success('Đã lưu Reel');
      }
    } catch (err) {
      toast.error('Lỗi khi lưu Reel');
    }
  };

  // Handle Follow
  const handleToggleFollow = async () => {
    if (!reel.userId || isOwner) return;
    try {
      if (isFollowing) {
        await followService.unfollow(reel.userId);
        setIsFollowing(false);
        toast.success(`Đã hủy theo dõi @${reel.username}`);
      } else {
        await followService.follow(reel.userId);
        setIsFollowing(true);
        toast.success(`Đã theo dõi @${reel.username}`);
      }
    } catch (err) {
      toast.error('Lỗi khi theo dõi người dùng');
    }
  };

  // Delete Reel
  const handleDeleteReel = async () => {
    setShowMenu(false);
    if (!window.confirm('Bạn có chắc chắn muốn xóa video Reel này không?')) return;
    try {
      await reelService.deleteReel(reel.id);
      toast.success('Đã xóa Reel');
      if (onReelDeleted) onReelDeleted(reel.id);
    } catch (err) {
      toast.error('Không thể xóa Reel');
    }
  };

  // Report Reel
  const handleReportReel = async () => {
    setShowMenu(false);
    const reason = window.prompt('Nhập lý do báo cáo video này:');
    if (reason && reason.trim()) {
      try {
        await reportService.reportPost(reel.id, reason.trim());
        toast.success('Đã gửi báo cáo vi phạm tới quản trị viên');
      } catch (err) {
        toast.error('Không thể gửi báo cáo');
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full max-w-[420px] mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl select-none flex items-center justify-center snap-start"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoClick}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Floating Center Play / Pause Indicator */}
      <AnimatePresence>
        {showPlayPauseIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white pointer-events-none z-30"
          >
            {isPlaying ? <Play size={28} className="ml-1" /> : <Pause size={28} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double Tap Heart Burst Animation */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1.4 }}
            exit={{ opacity: 0, scale: 1.8, y: -40 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              left: `${heartPos.x - 40}px`,
              top: `${heartPos.y - 40}px`,
            }}
            className="absolute z-40 pointer-events-none text-rose-500 drop-shadow-[0_10px_20px_rgba(244,63,94,0.6)]"
          >
            <Heart size={80} fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 via-black/30 to-transparent z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {reel.visibility === 'PUBLIC' && <Globe size={14} className="text-white/80" />}
          {reel.visibility === 'FRIEND' && <Users size={14} className="text-white/80" />}
          {reel.visibility === 'PRIVATE' && <Lock size={14} className="text-white/80" />}
          <span className="text-xs font-semibold text-white/90 drop-shadow">Reel</span>
        </div>

        {/* Sound toggle & Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition active:scale-90"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition active:scale-90"
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-10 w-44 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl py-2 z-50 border border-gray-100 text-gray-800 animate-in fade-in zoom-in-95 duration-150">
                {isOwner ? (
                  <button
                    onClick={handleDeleteReel}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                  >
                    <Trash2 size={16} />
                    <span>Xóa Reel này</span>
                  </button>
                ) : (
                  <button
                    onClick={handleReportReel}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
                  >
                    <Flag size={16} />
                    <span>Báo cáo vi phạm</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowShare(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
                >
                  <Share2 size={16} />
                  <span>Chia sẻ liên kết</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Action Column */}
      <div className="absolute right-3 bottom-16 z-30 flex flex-col items-center gap-5 pointer-events-auto">
        {/* Author Avatar with Follow button */}
        <div className="relative mb-1">
          <Link
            to={reel.userId ? `/users/${reel.userId}` : '#'}
            onClick={(e) => e.stopPropagation()}
            className="block w-12 h-12 rounded-full ring-2 ring-white/90 overflow-hidden shadow-lg transform hover:scale-105 transition"
          >
            {reel.avatarUrl ? (
              <img src={reel.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm">
                {reel.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </Link>
          {!isOwner && !isFollowing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFollow();
              }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center shadow-md transition transform hover:scale-110 active:scale-95"
            >
              <Plus size={13} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Love / Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleLove();
          }}
          className="flex flex-col items-center gap-1 group transition active:scale-90"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-md ${
              isLoved
                ? 'bg-rose-500/90 text-white'
                : 'bg-black/40 hover:bg-black/60 text-white'
            }`}
          >
            <Heart
              size={24}
              className={`transition transform ${isLoved ? 'scale-110' : 'group-hover:scale-110'}`}
              fill={isLoved ? 'currentColor' : 'none'}
            />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {reactionCount > 0 ? reactionCount : 'Thích'}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
          className="flex flex-col items-center gap-1 group transition active:scale-90"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition shadow-md group-hover:scale-110">
            <MessageCircle size={24} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {commentCount > 0 ? commentCount : 'Bình luận'}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowShare(true);
          }}
          className="flex flex-col items-center gap-1 group transition active:scale-90"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition shadow-md group-hover:scale-110">
            <Share2 size={22} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {shareCount > 0 ? shareCount : 'Chia sẻ'}
          </span>
        </button>

        {/* Bookmark / Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleSave();
          }}
          className="flex flex-col items-center gap-1 group transition active:scale-90"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-md ${
              isSaved
                ? 'bg-amber-500/90 text-white'
                : 'bg-black/40 hover:bg-black/60 text-white'
            }`}
          >
            <Bookmark
              size={22}
              className="transition transform group-hover:scale-110"
              fill={isSaved ? 'currentColor' : 'none'}
            />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {isSaved ? 'Đã lưu' : 'Lưu'}
          </span>
        </button>

        {/* Music Disc spinning graphic */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 border-2 border-white/80 flex items-center justify-center shadow-lg animate-spin-slow">
          <Music size={14} className="text-pink-400" />
        </div>
      </div>

      {/* Bottom Left Info Overlay */}
      <div className="absolute left-0 bottom-0 right-16 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 pointer-events-auto space-y-2">
        {/* Username + Author Info */}
        <div className="flex items-center gap-2">
          <Link
            to={reel.userId ? `/users/${reel.userId}` : '#'}
            onClick={(e) => e.stopPropagation()}
            className="font-black text-white text-sm hover:underline drop-shadow flex items-center gap-1.5"
          >
            @{reel.username || 'user'}
          </Link>
          <span className="text-white/60 text-xs">•</span>
          <span className="text-white/70 text-[11px] font-medium">Reel</span>
        </div>

        {/* Caption */}
        {reel.content && (
          <div className="text-xs text-white/95 leading-relaxed drop-shadow">
            <p className={!isExpandedText ? 'line-clamp-2' : ''}>
              {reel.content}
            </p>
            {reel.content.length > 80 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpandedText(!isExpandedText);
                }}
                className="text-[11px] font-bold text-white/80 hover:text-white mt-0.5"
              >
                {isExpandedText ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}

        {/* Sound tag */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full w-fit">
          <Music size={12} className="animate-pulse text-pink-400" />
          <span className="truncate max-w-[180px]">Âm thanh gốc - @{reel.username}</span>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Comment Drawer Modal */}
      <ReelCommentDrawer
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        reelId={reel.id}
        commentCount={commentCount}
        onCommentCountChange={(newCount) => setCommentCount(newCount)}
      />

      {/* Share Modal */}
      <ReelShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        reel={reel}
        onShareSuccess={() => setShareCount((prev) => prev + 1)}
      />
    </div>
  );
}
