import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Send,
  Trash2,
  Edit3,
  Flag,
  CornerDownRight,
  Smile,
  X,
  ShieldAlert,
  Image as ImageIcon,
  Plus,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import reactionService from '../../services/reactionService';
import commentService from '../../services/commentService';
import commentReactionService from '../../services/commentReactionService';
import savedPostService from '../../services/savedPostService';
import postService from '../../services/postService';
import reportService from '../../services/reportService';
import ReactionPicker, { REACTION_ICONS } from './ReactionPicker';
import ReactedUsersModal from './ReactedUsersModal';
import LoginPromptModal from '../common/LoginPromptModal';
import ReactionParticles from '../common/ReactionParticles';
import HeartBurst from '../common/HeartBurst';
import HolographicCard from '../common/HolographicCard';
import soundFX from '../../utils/soundEffects';

export const PostCard = ({ post, onPostDeleted, initialShowComments = false }) => {
  const { currentUserId } = useUser();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [particleTriggerKey, setParticleTriggerKey] = useState(0);
  const postId = post.id || post.postId;

  // Normalized author & media
  const authorName = post.username || post.author?.name || `Người dùng #${post.userId || ''}`;
  const authorAvatar = post.authorAvatar || post.avatarUrl || post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const authorId = post.userId || post.author?.id;
  const isOwner = currentUserId && String(currentUserId) === String(authorId);

  // Post Data States (Mutable on edit)
  const [content, setContent] = useState(post.content || '');
  const [visibility, setVisibility] = useState(post.visibility || 'PUBLIC');
  const [mediaItems, setMediaItems] = useState(
    post.postMediaResponses || (post.images ? post.images.map((url, i) => ({ postMediaId: `img-${i}`, url })) : [])
  );

  // Interaction States
  const [isLiked, setIsLiked] = useState(Boolean(post.reacted || post.isLiked));
  const [reactionType, setReactionType] = useState(post.myReactionType || (isLiked ? 'LOVE' : null));
  const [reactionCount, setReactionCount] = useState(Number(post.reactionCount || post.likesCount || 0));
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [showReactedModal, setShowReactedModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Comments
  const [showComments, setShowComments] = useState(initialShowComments);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, authorName }
  const [totalComments, setTotalComments] = useState(Number(post.commentCount || post.commentsCount || 0));

  // Comment Editing States
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  // Edit Post Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editVisibility, setEditVisibility] = useState(post.visibility || 'PUBLIC');
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const fileInputRef = useRef(null);

  // Report Modal
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Check saved status on mount
  useEffect(() => {
    if (postId && isAuthenticated) {
      savedPostService
        .checkSavedStatus(postId)
        .then((res) => {
          if (res.data?.data !== undefined) {
            setIsSaved(Boolean(res.data.data));
          }
        })
        .catch(() => {});
    }
  }, [postId, isAuthenticated]);

  // Load root comments when opened
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoadingComments(true);
    try {
      const res = await commentService.getRootComments(postId, 0, 50);
      const data = res.data?.data?.content || res.data?.data || [];
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Failed to load comments', e?.message);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments, fetchComments, comments.length]);

  // Double-tap on media or post to Like with heart explosion
  const handleDoubleClickMedia = (e) => {
    e.preventDefault();
    soundFX.playHeartBurst();
    setShowHeartBurst(true);
    setParticleTriggerKey((k) => k + 1);
    if (!isLiked) {
      handleSelectReaction('LOVE');
    }
  };

  // Reaction handling
  const handleSelectReaction = async (type) => {
    setShowReactionBar(false);
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await reactionService.reactToPost(postId, type);
      const data = res.data?.data;
      if (data?.isReacted) {
        soundFX.playPop();
        setParticleTriggerKey((k) => k + 1);
        setIsLiked(true);
        setReactionType(data.reactionType || type);
        setReactionCount((prev) => (isLiked ? prev : prev + 1));
        toast.success(`Đã bày tỏ ${REACTION_ICONS[type]?.label || type}`);
      } else {
        soundFX.playToggle(false);
        // Toggled off
        setIsLiked(false);
        setReactionType(null);
        setReactionCount((prev) => Math.max(0, prev - 1));
        toast('Đã gỡ cảm xúc');
      }
    } catch (e) {
      toast.error('Lỗi khi bày tỏ cảm xúc');
    }
  };

  const handleQuickLike = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (isLiked) {
      handleSelectReaction(reactionType || 'LIKE');
    } else {
      handleSelectReaction('LIKE');
    }
  };

  // Save handling
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      soundFX.playPop();
      if (isSaved) {
        await savedPostService.unsavePost(postId);
        setIsSaved(false);
        toast.success('Đã bỏ lưu bài viết');
      } else {
        await savedPostService.savePost(postId);
        setIsSaved(true);
        toast.success('Đã lưu vào bộ sưu tập');
      }
    } catch (e) {
      toast.error('Lỗi lưu bài viết');
    }
  };

  // Comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!commentText.trim()) return;
    try {
      soundFX.playPop();
      await commentService.createComment(postId, commentText.trim(), replyTo?.id || null);
      setCommentText('');
      setReplyTo(null);
      setTotalComments((c) => c + 1);
      toast.success('Đã gửi bình luận');
      fetchComments();
    } catch (e) {
      toast.error('Không thể đăng bình luận');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => (c.id || c.commentId) !== commentId));
      setTotalComments((c) => Math.max(0, c - 1));
      toast.success('Đã xóa bình luận');
    } catch (e) {
      toast.error('Không thể xóa bình luận');
    }
  };

  const handleSaveCommentEdit = async (commentId) => {
    if (!editingCommentText.trim()) return;
    setIsUpdatingComment(true);
    try {
      await commentService.updateComment(commentId, editingCommentText.trim());
      setComments((prev) =>
        prev.map((c) => {
          const id = c.id || c.commentId;
          if (id === commentId) {
            return { ...c, content: editingCommentText.trim() };
          }
          return c;
        })
      );
      setEditingCommentId(null);
      setEditingCommentText('');
      toast.success('Đã cập nhật bình luận!');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không thể cập nhật bình luận');
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleReactComment = async (commentId, type = 'LIKE') => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      await commentReactionService.reactToComment(commentId, type);
      fetchComments();
    } catch (e) {
      toast.error('Lỗi thả cảm xúc bình luận');
    }
  };

  // Post Actions
  const handleOpenEditModal = () => {
    setEditContent(content);
    setEditVisibility(visibility);
    setNewFiles([]);
    setNewPreviews([]);
    setIsEditing(true);
    setShowMoreMenu(false);
  };

  const handleDeleteExistingMedia = async (mediaId) => {
    if (!mediaId || String(mediaId).startsWith('img-')) {
      setMediaItems((prev) => prev.filter((m) => m.postMediaId !== mediaId));
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này khỏi bài viết?')) return;
    try {
      await postService.deletePostMedia(mediaId);
      setMediaItems((prev) => prev.filter((m) => m.postMediaId !== mediaId));
      toast.success('Đã xóa ảnh khỏi bài viết');
    } catch (e) {
      toast.error('Không thể xóa ảnh');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    setIsSavingPost(true);
    try {
      if (editContent !== content) {
        await postService.updatePostContent(postId, { content: editContent });
        setContent(editContent);
        post.content = editContent;
      }
      if (editVisibility !== visibility) {
        await postService.updatePostVisibility(postId, editVisibility);
        setVisibility(editVisibility);
        post.visibility = editVisibility;
      }
      if (newFiles.length > 0) {
        await postService.addPostMedia(postId, newFiles);
        try {
          const res = await postService.getPostById(postId);
          const freshMedia = res.data?.data?.postMediaResponses;
          if (Array.isArray(freshMedia)) {
            setMediaItems(freshMedia);
            post.postMediaResponses = freshMedia;
          }
        } catch (_) {}
      }
      setIsEditing(false);
      setNewFiles([]);
      setNewPreviews([]);
      toast.success('Đã cập nhật bài viết thành công!');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không thể cập nhật bài viết');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await postService.deletePost(postId);
      toast.success('Đã xóa bài viết');
      if (onPostDeleted) onPostDeleted();
    } catch (e) {
      toast.error('Không thể xóa bài viết');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim() || reportReason.trim().length < 5) {
      toast.error('Vui lòng nhập lý do tối thiểu 5 ký tự');
      return;
    }
    try {
      await reportService.createReport(postId, reportReason.trim());
      setIsReporting(false);
      setReportReason('');
      toast.success('Đã gửi báo cáo vi phạm');
    } catch (e) {
      toast.error('Không thể gửi báo cáo');
    }
  };

  const activeReactionInfo = reactionType ? REACTION_ICONS[reactionType] : null;

  return (
    <HolographicCard maxTilt={2.5} className="mb-5">
      <article className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-slate-300/80 dark:hover:border-slate-700/80 transition-all duration-300">
        {/* 1. Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <Link to={`/profile/${authorId || ''}`} className="flex items-center gap-3 group min-w-0">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-600/40 transition"
          />
          <div className="min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate block group-hover:text-indigo-600 transition">
              {authorName}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
              <span>•</span>
              {visibility === 'FRIEND' ? (
                <Users className="w-3 h-3 text-slate-400" title="Bạn bè" />
              ) : visibility === 'PRIVATE' ? (
                <Lock className="w-3 h-3 text-slate-400" title="Chỉ mình tôi" />
              ) : (
                <Globe className="w-3 h-3 text-slate-400" title="Công khai" />
              )}
            </div>
          </div>
        </Link>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-dropdown p-1.5 z-30 animate-scale-in">
              <button
                type="button"
                onClick={() => {
                  handleToggleSave();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-left"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText?.(window.location.origin + `/posts/${postId}`);
                  toast.success('Đã sao chép liên kết');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-left"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Sao chép liên kết</span>
              </button>

              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa bài viết</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDeletePost();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa bài viết</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    if (!isAuthenticated) {
                      setShowLoginModal(true);
                      return;
                    }
                    setIsReporting(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-left"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Báo cáo bài viết</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Heart Burst Overlay (Instagram / TikTok style) */}
      <HeartBurst
        show={showHeartBurst}
        onComplete={() => setShowHeartBurst(false)}
      />

      {/* 2. Text Content (double-click to like) */}
      <div
        onDoubleClick={handleDoubleClickMedia}
        className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-3.5 whitespace-pre-line cursor-pointer select-text"
        title="Nhấp đúp chuột để thả tim ❤️"
      >
        {content}
      </div>

      {/* 3. Media Grid (double-click to like) */}
      {mediaItems.length > 0 && (
        <div
          onDoubleClick={handleDoubleClickMedia}
          className="relative mb-4 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer select-none group"
          title="Nhấp đúp chuột để thả tim ❤️"
        >
          {mediaItems.length === 1 ? (
            <img
              src={mediaItems[0].url || mediaItems[0]}
              alt="Media"
              className="w-full max-h-[500px] object-cover transition duration-300 group-hover:scale-[1.01]"
            />
          ) : (
            <div className={`grid gap-1 ${mediaItems.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {mediaItems.map((m, i) => (
                <img
                  key={m.postMediaId || i}
                  src={m.url || m}
                  alt={`Media ${i}`}
                  className="w-full h-48 object-cover hover:brightness-95 transition"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Reaction Statistics Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
        <button
          type="button"
          onClick={() => setShowReactedModal(true)}
          className="flex items-center gap-1.5 hover:underline text-slate-700 dark:text-slate-300 font-semibold"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px]">
            ❤️
          </span>
          <span>{reactionCount} lượt cảm xúc</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="hover:underline hover:text-slate-700 dark:text-slate-400"
        >
          {totalComments} bình luận
        </button>
      </div>

      {/* 5. Action Row */}
      <div className="relative flex items-center justify-between pt-1">
        {/* Floating Reaction Picker */}
        <AnimatePresence>
          {showReactionBar && (
            <ReactionPicker
              onSelect={handleSelectReaction}
              onClose={() => setShowReactionBar(false)}
            />
          )}
        </AnimatePresence>

        {/* Reaction Trigger Button with Particle Burst */}
        <div
          className="relative"
          onMouseEnter={() => {
            hoverTimeoutRef.current = setTimeout(() => setShowReactionBar(true), 300);
          }}
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
        >
          <ReactionParticles triggerKey={particleTriggerKey} />
          <button
            type="button"
            onClick={handleQuickLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
              isLiked
                ? activeReactionInfo?.color || 'text-rose-600 bg-rose-50 dark:bg-rose-950/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {activeReactionInfo ? (
              <span className="text-sm leading-none">{activeReactionInfo.emoji}</span>
            ) : (
              <Heart className="w-4 h-4 stroke-[1.8]" />
            )}
            <span>{activeReactionInfo ? activeReactionInfo.label : 'Thích'}</span>
          </button>
        </div>

        {/* Comment Toggle */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <MessageCircle className="w-4 h-4 stroke-[1.8]" />
          <span>Bình luận</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText?.(window.location.origin + `/posts/${postId}`);
            toast.success('Đã sao chép liên kết');
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Share2 className="w-4 h-4 stroke-[1.8]" />
          <span>Chia sẻ</span>
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleToggleSave}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            isSaved
              ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : 'stroke-[1.8]'}`} />
          <span className="hidden sm:inline">{isSaved ? 'Đã lưu' : 'Lưu'}</span>
        </button>
      </div>

      {/* 6. Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
          {/* Reply Context Banner */}
          {replyTo && (
            <div className="flex items-center justify-between text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl">
              <span>Đang trả lời: <strong>{replyTo.authorName}</strong></span>
              <button onClick={() => setReplyTo(null)} className="hover:text-indigo-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Comment Input */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2.5">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyTo ? `Trả lời @${replyTo.authorName}...` : 'Viết bình luận công khai...'}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/80 rounded-full pl-3.5 pr-10 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-1.5 p-1.5 text-indigo-600 hover:text-indigo-700 disabled:opacity-40 transition"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              </div>
            </form>
          ) : (
            <div
              onClick={() => setShowLoginModal(true)}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer transition select-none"
            >
              <span>Đăng nhập để tham gia bình luận cùng mọi người...</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                Đăng nhập
              </span>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <p className="text-xs text-slate-400 text-center py-2">Đang tải bình luận...</p>
          ) : comments.length > 0 ? (
            <div className="space-y-3 pt-1">
              {comments.map((comment) => {
                const cId = comment.id || comment.commentId;
                const cAuthorName = comment.username || comment.author?.name || `User #${comment.userId}`;
                const cAvatar = comment.avatarUrl || comment.author?.avatar || 'https://via.placeholder.com/40';
                const isCommentOwner = currentUserId && String(currentUserId) === String(comment.userId || comment.author?.id);

                return (
                  <div key={cId} className="flex items-start gap-2.5 group">
                    <img
                      src={cAvatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      {editingCommentId === cId ? (
                        <div className="bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-2.5 max-w-full space-y-2">
                          <input
                            type="text"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-indigo-400 dark:border-indigo-600 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveCommentEdit(cId);
                              } else if (e.key === 'Escape') {
                                setEditingCommentId(null);
                                setEditingCommentText('');
                              }
                            }}
                          />
                          <div className="flex items-center justify-end gap-2 text-[11px]">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentText('');
                              }}
                              className="px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              disabled={isUpdatingComment || !editingCommentText.trim()}
                              onClick={() => handleSaveCommentEdit(cId)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold disabled:opacity-50 transition"
                            >
                              {isUpdatingComment ? 'Đang lưu...' : 'Lưu'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-3.5 py-2 inline-block max-w-full">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {cAuthorName}
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 break-words">
                            {comment.content}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 ml-2">
                        <button
                          type="button"
                          onClick={() => handleReactComment(cId, 'LIKE')}
                          className="hover:text-indigo-600 font-semibold flex items-center gap-1"
                        >
                          <span>👍 Thích</span>
                          {comment.reactionCount > 0 && <span>({comment.reactionCount})</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              setShowLoginModal(true);
                              return;
                            }
                            setReplyTo({ id: cId, authorName: cAuthorName });
                          }}
                          className="hover:text-indigo-600 font-semibold"
                        >
                          Trả lời
                        </button>
                        {isCommentOwner && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (editingCommentId === cId) {
                                  setEditingCommentId(null);
                                  setEditingCommentText('');
                                } else {
                                  setEditingCommentId(cId);
                                  setEditingCommentText(comment.content || '');
                                }
                              }}
                              className="hover:text-indigo-600 font-medium"
                            >
                              {editingCommentId === cId ? 'Hủy sửa' : 'Chỉnh sửa'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(cId)}
                              className="hover:text-red-500 font-medium"
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">Chưa có bình luận nào.</p>
          )}
        </div>
      )}

      {/* Reacted Users Modal */}
      {showReactedModal && (
        <ReactedUsersModal
          targetId={postId}
          targetType="POST"
          onClose={() => setShowReactedModal(false)}
        />
      )}

      {/* Edit Post Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Chỉnh sửa bài viết</span>
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewFiles([]);
                  setNewPreviews([]);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePost} className="space-y-4">
              {/* Content textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nội dung bài viết</label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:border-indigo-600 resize-none text-slate-900 dark:text-white"
                  placeholder="Bạn đang nghĩ gì?..."
                  required
                />
              </div>

              {/* Visibility Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Quyền riêng tư</label>
                <select
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="PUBLIC">🌐 Công khai (Mọi người đều thấy)</option>
                  <option value="FRIEND">👥 Bạn bè (Chỉ bạn bè mới thấy)</option>
                  <option value="PRIVATE">🔒 Chỉ mình tôi (Riêng tư)</option>
                </select>
              </div>

              {/* Existing Media Manager */}
              {mediaItems.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    Hình ảnh hiện có ({mediaItems.length})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {mediaItems.map((item, idx) => (
                      <div key={item.postMediaId || idx} className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <img
                          src={item.url || item}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingMedia(item.postMediaId)}
                          className="absolute top-1 right-1 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg backdrop-blur-xs opacity-90 transition shadow-xs"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Media Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Thêm hình ảnh / video mới</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Chọn tệp</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                />

                {newPreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 p-2 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40">
                    {newPreviews.map((previewUrl, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-slate-200 dark:bg-slate-800">
                        <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(i)}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition"
                          title="Bỏ chọn"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-600"
                  >
                    <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                    <span className="text-xs font-medium">Nhấn để thêm ảnh hoặc video vào bài viết</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewFiles([]);
                    setNewPreviews([]);
                  }}
                  disabled={isSavingPost}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingPost}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-60"
                >
                  {isSavingPost && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingPost ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Báo cáo bài viết</span>
              </div>
              <button onClick={() => setIsReporting(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Vui lòng cung cấp lý do báo cáo bài viết vi phạm tiêu chuẩn cộng đồng.
              </p>
              <textarea
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Lý do báo cáo vi phạm..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:border-rose-500 resize-none text-slate-900 dark:text-white"
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Tương tác với bài viết"
        message={`Đăng nhập để thả cảm xúc, bình luận hoặc lưu bài viết của ${authorName}.`}
      />
      </article>
    </HolographicCard>
  );
};

export default PostCard;
