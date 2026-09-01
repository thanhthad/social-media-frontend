import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import reactionService from '../../services/reactionService';
import postService from '../../services/postService';
import savedPostService from '../../services/savedPostService';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';
import {
  Bookmark,
  MoreHorizontal,
  Flag,
  MessageCircle,
  Share2,
  Trash2,
  Edit3,
  Globe,
  Users,
  Lock,
  Heart,
} from 'lucide-react';
import CommentSection from './CommentSection';
import ReactionPicker, { REACTION_ICONS } from './ReactionPicker';
import ReactedUsersModal from './ReactedUsersModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function PostCard({ post, onPostDeleted, onPostUpdated }) {
  const { user: currentUser, currentUserId } = useUser();
  // Use currentUserId from context (already normalised there)
  const postUid = post.userId ?? post.authorId ?? post.user?.id;
  const isOwner = !!(currentUserId && postUid && Number(currentUserId) === Number(postUid));

  const [myReaction, setMyReaction] = useState(
    post.myReactionType || post.myReaction || (post.reacted ? 'LIKE' : null)
  );
  const [totalReactions, setTotalReactions] = useState(
    Number(post.reactionCount ?? post.totalReactions ?? 0)
  );
  const [totalComments, setTotalComments] = useState(
    Number(post.commentCount ?? post.totalComments ?? 0)
  );
  const [showComments, setShowComments] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showReactedModal, setShowReactedModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [postVisibility, setPostVisibility] = useState(post.visibility || 'PUBLIC');

  const menuRef = useRef(null);
  const pickerTimerRef = useRef(null);

  // Sync state with post response fields
  useEffect(() => {
    setTotalReactions(Number(post.reactionCount ?? post.totalReactions ?? 0));
    setTotalComments(Number(post.commentCount ?? post.totalComments ?? 0));
    setMyReaction(post.myReactionType || post.myReaction || (post.reacted ? 'LIKE' : null));
  }, [post.id, post.reactionCount, post.commentCount, post.myReactionType, post.myReaction, post.reacted]);

  // Only check saved status for posts that are NOT ours
  useEffect(() => {
    if (post?.id && !isOwner) {
      savedPostService
        .checkSavedStatus(post.id)
        .then((res) => setIsSaved(!!(res.data?.data ?? res.data)))
        .catch(() => {});
    }
  }, [post?.id, isOwner]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await savedPostService.unsavePost(post.id);
        setIsSaved(false);
        toast.success('Đã bỏ lưu bài viết');
      } else {
        await savedPostService.savePost(post.id);
        setIsSaved(true);
        toast.success('Đã lưu bài viết');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu bài viết');
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    setShowMenu(false);
    const reason = window.prompt('Nhập lý do báo cáo bài viết vi phạm:');
    if (reason && reason.trim()) {
      try {
        await reportService.reportPost(post.id, reason.trim());
        toast.success('Đã gửi báo cáo vi phạm tới ban quản trị!');
      } catch (error) {
        toast.error('Lỗi khi gửi báo cáo');
      }
    }
  };

  const handleSelectReaction = async (type) => {
    setShowPicker(false);
    const wasReacted = !!myReaction;
    const isRemoving = myReaction === type;

    // Optimistic UI (+1 / -1)
    if (isRemoving) {
      setMyReaction(null);
      setTotalReactions((prev) => Math.max(0, prev - 1));
    } else {
      setMyReaction(type);
      if (!wasReacted) {
        setTotalReactions((prev) => prev + 1);
      }
    }

    try {
      const res = await reactionService.reactToPost(post.id, type);
      const serverCount = res.data?.data?.reactionCount;
      if (serverCount !== undefined && serverCount !== null) {
        setTotalReactions(Number(serverCount));
      }
    } catch (error) {
      console.error('Failed to react to post', error);
      // Revert if error
      if (isRemoving) {
        setMyReaction(type);
        setTotalReactions((prev) => prev + 1);
      } else {
        setMyReaction(wasReacted ? myReaction : null);
        if (!wasReacted) {
          setTotalReactions((prev) => Math.max(0, prev - 1));
        }
      }
    }
  };

  const handleDoubleClickMedia = (e) => {
    if (e) e.stopPropagation();
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
    if (myReaction !== 'LOVE') {
      handleSelectReaction('LOVE');
    }
  };

  const renderReactionIcon = () => {
    if (!myReaction) {
      return <Heart size={24} className="hover:text-gray-500 transition active:scale-90" />;
    }
    if (myReaction === 'LOVE') {
      return <Heart size={24} className="fill-rose-500 text-rose-500 active:scale-90 animate-bounce" />;
    }
    const info = REACTION_ICONS[myReaction];
    if (info?.iconUrl) {
      return (
        <img
          src={info.iconUrl}
          alt={info.label}
          className="w-6 h-6 object-contain active:scale-90 drop-shadow-xs"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return <span className="text-xl leading-none">{info?.emoji || '👍'}</span>;
  };

  const handleMainButtonClick = () => {
    if (myReaction) {
      handleSelectReaction(myReaction);
    } else {
      handleSelectReaction('LIKE');
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      try {
        await postService.deletePost(post.id);
        toast.success('Đã xóa bài viết');
        if (onPostDeleted) onPostDeleted(post.id);
      } catch (error) {
        toast.error('Lỗi khi xóa bài viết');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      await postService.updatePostContent(post.id, { content: editContent.trim() });
      post.content = editContent.trim();
      setIsEditing(false);
      toast.success('Đã cập nhật bài viết');
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast.error('Không thể cập nhật bài viết');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleChangeVisibility = async (newVis) => {
    try {
      await postService.updatePostVisibility(post.id, newVis);
      setPostVisibility(newVis);
      post.visibility = newVis;
      toast.success('Đã đổi quyền riêng tư');
      setShowMenu(false);
    } catch (err) {
      toast.error('Không thể thay đổi quyền riêng tư');
    }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (diffInSeconds < 60) return 'Vừa xong';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getVisibilityBadge = (vis) => {
    switch (vis) {
      case 'PUBLIC':
        return <Globe size={13} className="text-gray-400" title="Công khai" />;
      case 'FRIEND':
      case 'FRIENDS':
      case 'FOLLOWERS_ONLY':
        return <Users size={13} className="text-gray-400" title="Bạn bè" />;
      case 'PRIVATE':
        return <Lock size={13} className="text-gray-400" title="Chỉ mình tôi" />;
      default:
        return <Globe size={13} className="text-gray-400" />;
    }
  };

  const renderContentWithHashtags = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[^\s#]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#') && part.length > 1) {
        return (
          <Link
            key={i}
            to={`/search?q=${encodeURIComponent(part.substring(1))}&type=tag`}
            className="text-blue-600 font-semibold hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const mediaList = post.postMediaResponses || post.medias || [];
  const currentReactionInfo = myReaction ? REACTION_ICONS[myReaction] : null;

  // Build emoji summary for reaction count display
  // Use top reactions from post data if available, otherwise show generic icons
  const topReactionEmojis = (() => {
    const reactionData = post.reactionCounts || post.reactions || {};
    const types = Object.entries(reactionData)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => REACTION_ICONS[type]?.emoji)
      .filter(Boolean);
    return types.length > 0 ? types : totalReactions > 0 ? ['👍'] : [];
  })();

  return (
    <div className="bg-white rounded-3xl mb-4 overflow-hidden border border-gray-200/80 shadow-xs transition-all">
      {/* 1. Instagram Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/users/${post.userId || post.authorId}`} className="relative group select-none">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
              <div className="p-[1.5px] bg-white rounded-full">
                <img
                  src={post.avatarUrl || 'https://via.placeholder.com/40'}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
              </div>
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link
                to={`/users/${post.userId || post.authorId}`}
                className="font-bold text-gray-900 text-xs sm:text-sm hover:opacity-80 transition"
              >
                {post.authorName || post.username || 'user'}
              </Link>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-xs text-gray-500 font-normal">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* 3-dot Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl py-1.5 border border-gray-100 z-30 text-xs">
              {!isOwner && (
                <button
                  onClick={handleToggleSave}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium transition cursor-pointer"
                >
                  <Bookmark
                    size={16}
                    className={isSaved ? 'fill-black text-black' : 'text-gray-400'}
                  />
                  {isSaved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                </button>
              )}

              <button
                onClick={handleReport}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium transition cursor-pointer"
              >
                <Flag size={16} className="text-gray-400" />
                Báo cáo bài viết
              </button>

              {isOwner && (
                <>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium transition cursor-pointer"
                  >
                    <Edit3 size={16} className="text-gray-400" />
                    Chỉnh sửa
                  </button>

                  <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase">
                    Quyền riêng tư
                  </div>
                  {['PUBLIC', 'FRIEND', 'PRIVATE'].map((vis) => (
                    <button
                      key={vis}
                      onClick={() => handleChangeVisibility(vis)}
                      className={`w-full text-left px-4 py-1.5 hover:bg-gray-50 flex items-center gap-2 cursor-pointer ${
                        postVisibility === vis ? 'text-blue-600 font-bold' : 'text-gray-600'
                      }`}
                    >
                      {getVisibilityBadge(vis)}
                      <span>
                        {vis === 'PUBLIC'
                          ? 'Công khai'
                          : vis === 'FRIEND'
                          ? 'Bạn bè'
                          : 'Chỉ mình tôi'}
                      </span>
                    </button>
                  ))}

                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2.5 text-red-600 font-medium transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                    Xóa bài viết
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Instagram Media Container */}
      {mediaList.length > 0 && (
        <div
          onDoubleClick={handleDoubleClickMedia}
          className={`relative grid gap-0.5 bg-black overflow-hidden select-none cursor-pointer ${
            mediaList.length === 1
              ? 'grid-cols-1 max-h-[600px]'
              : mediaList.length === 2
              ? 'grid-cols-2 max-h-[450px]'
              : 'grid-cols-2 max-h-[500px]'
          }`}
        >
          {/* Double-tap Floating Heart Animation */}
          <AnimatePresence>
            {showHeartPop && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.35, 1, 1.1, 0], opacity: [0, 1, 1, 0.9, 0] }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <Heart size={105} className="fill-rose-500 text-rose-500 drop-shadow-[0_10px_30px_rgba(244,63,94,0.7)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Media Stats Pill */}
          <div className="absolute bottom-2.5 right-2.5 z-20 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-bold flex items-center gap-2.5 shadow-md pointer-events-none select-none">
            <span className="flex items-center gap-1">
              <Heart size={12} className="fill-rose-500 text-rose-500" />
              <span>{totalReactions}</span>
            </span>
            <span className="w-0.5 h-2.5 bg-white/30 rounded" />
            <span className="flex items-center gap-1">
              <MessageCircle size={12} className="fill-white/80" />
              <span>{totalComments}</span>
            </span>
          </div>

          {mediaList.map((media, idx) => {
            const url = media.mediaUrl || media.url;
            const isVideo = media.mediaType === 'VIDEO';
            return (
              <div key={media.id || idx} className="relative w-full h-full min-h-[260px] overflow-hidden bg-black flex items-center justify-center">
                {isVideo ? (
                  <video src={url} controls className="w-full h-full object-contain max-h-[580px]" />
                ) : (
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                    onClick={(e) => {
                      // Allow single click to open, double click to heart
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Instagram / Facebook Action Bar (Heart, Comment, Share, Bookmark) */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Heart / Like Button */}
          <div
            className="relative"
            onMouseEnter={() => {
              pickerTimerRef.current = setTimeout(() => setShowPicker(true), 300);
            }}
            onMouseLeave={() => {
              if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current);
              setShowPicker(false);
            }}
          >
            <AnimatePresence>
              {showPicker && (
                <ReactionPicker
                  onSelect={handleSelectReaction}
                  onClose={() => setShowPicker(false)}
                />
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleMainButtonClick}
              className="text-gray-900 hover:opacity-80 transition cursor-pointer px-1.5 py-1 rounded-xl hover:bg-gray-100/80 flex items-center gap-1.5 select-none"
              title="Bày tỏ cảm xúc"
            >
              {renderReactionIcon()}
              <span className="font-extrabold text-sm text-gray-900 leading-none">
                {Number(totalReactions ?? 0).toLocaleString()}
              </span>
            </button>
          </div>

          {/* Comment Icon with Count */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="text-gray-900 hover:opacity-80 transition cursor-pointer px-1.5 py-1 rounded-xl hover:bg-gray-100/80 flex items-center gap-1.5 select-none"
            title="Bình luận"
          >
            <MessageCircle size={24} className="hover:text-gray-600 transition" />
            <span className="font-extrabold text-sm text-gray-900 leading-none">
              {Number(totalComments ?? 0).toLocaleString()}
            </span>
          </button>

          {/* Share / Copy Link Icon */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
              toast.success('Đã sao chép liên kết!');
            }}
            className="text-gray-900 hover:opacity-60 transition cursor-pointer p-0.5"
            title="Chia sẻ"
          >
            <Share2 size={24} />
          </button>
        </div>

        {/* Bookmark / Save Icon */}
        <button
          type="button"
          onClick={handleToggleSave}
          className="text-gray-900 hover:opacity-60 transition cursor-pointer p-0.5"
          title={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}
        >
          <Bookmark
            size={24}
            className={isSaved ? 'fill-black text-black' : 'hover:text-gray-500'}
          />
        </button>
      </div>

      {/* 4. Instagram Likes & Comments Summary */}
      <div className="px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {totalReactions > 0 && (
            <div
              className="flex -space-x-1 items-center select-none cursor-pointer"
              onClick={() => setShowReactedModal(true)}
              title="Xem danh sách người bày tỏ cảm xúc"
            >
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center ring-1.5 ring-white shadow-xs">
                ❤️
              </span>
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center ring-1.5 ring-white shadow-xs">
                👍
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowReactedModal(true)}
            className="font-bold text-xs sm:text-sm text-gray-900 hover:underline cursor-pointer"
          >
            {totalReactions > 0 ? `${totalReactions.toLocaleString()} lượt thích` : 'Hãy là người đầu tiên thích bài viết'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="text-gray-500 hover:text-gray-900 font-medium hover:underline cursor-pointer"
        >
          {totalComments > 0 ? `${totalComments.toLocaleString()} bình luận` : '0 bình luận'}
        </button>
      </div>

      {/* 5. Instagram Caption & Content */}
      <div className="px-4 py-1 text-xs sm:text-sm leading-relaxed text-gray-900">
        {isEditing ? (
          <div className="space-y-2 py-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none h-20"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editContent.trim()}
                className="px-4 py-1 text-xs bg-blue-600 text-white font-bold rounded-lg cursor-pointer"
              >
                {isSavingEdit ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        ) : (
          <p>
            <Link
              to={`/users/${post.userId || post.authorId}`}
              className="font-bold mr-2 hover:underline"
            >
              {post.authorName || post.username}
            </Link>
            <span>{renderContentWithHashtags(post.content)}</span>
          </p>
        )}
      </div>

      {/* 6. Instagram View Comments link */}
      <div className="px-4 py-0.5">
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-gray-500 hover:text-gray-800 transition cursor-pointer font-normal"
        >
          {showComments
            ? 'Ẩn bình luận'
            : totalComments > 0
            ? `Xem tất cả ${totalComments.toLocaleString()} bình luận`
            : 'Thêm bình luận...'}
        </button>
      </div>

      {/* Comments Drawer / Section */}
      {showComments && (
        <div className="p-4 bg-gray-50/60 border-t border-gray-100 mt-2">
          <CommentSection
            postId={post.id}
            postAuthorId={postUid}
            onCommentCountChange={(updater) => setTotalComments(updater)}
          />
        </div>
      )}

      {/* Reacted Users Modal */}
      {showReactedModal && (
        <ReactedUsersModal
          targetId={post.id}
          targetType="POST"
          onClose={() => setShowReactedModal(false)}
        />
      )}
    </div>
  );
}
