import { useState, useEffect, useRef } from 'react';
import commentService from '../../services/commentService';
import commentReactionService from '../../services/commentReactionService';
import { useUser } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Send,
  CornerDownRight,
  Trash2,
  Edit3,
  Heart,
  Smile,
  X,
  ShieldCheck,
} from 'lucide-react';
import ReactionPicker, { REACTION_ICONS } from './ReactionPicker';
import ReactedUsersModal from './ReactedUsersModal';
import { AnimatePresence, motion } from 'framer-motion';

const QUICK_EMOJIS = ['❤️', '🙌', '🔥', '👏', '😍', '😂', '😮', '💯'];

function SingleComment({
  comment,
  postId,
  postAuthorId,
  onCommentDeleted,
  onReplyClick,
}) {
  const { user } = useUser();
  const commentId = comment.commentId || comment.id;
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [myReaction, setMyReaction] = useState(comment.myReaction || null);
  const [reactionCount, setReactionCount] = useState(
    comment.totalReactions ?? comment.reactionCount ?? 0
  );
  const [showPicker, setShowPicker] = useState(false);
  const [showReactedModal, setShowReactedModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || '');
  const pickerTimerRef = useRef(null);

  const currentUid = user?.id || user?.userId;
  const commentUid = comment.userId || comment.authorId;
  const isOwner = !!(user && currentUid && commentUid && Number(currentUid) === Number(commentUid));
  const isPostAuthor = !!(postAuthorId && commentUid && Number(postAuthorId) === Number(commentUid));

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await commentService.getReplies(commentId, 0, 20);
      const data = res.data?.data?.content || res.data?.data || [];
      setReplies(Array.isArray(data) ? data : []);
      setShowReplies(true);
    } catch (err) {
      console.error('Failed to load replies', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSelectReaction = async (type) => {
    setShowPicker(false);
    try {
      if (myReaction === type) {
        await commentReactionService.removeReaction(commentId);
        setMyReaction(null);
        setReactionCount((prev) => Math.max(0, prev - 1));
      } else {
        await commentReactionService.reactToComment(commentId, type);
        if (!myReaction) setReactionCount((prev) => prev + 1);
        setMyReaction(type);
      }
    } catch (err) {
      console.error('Failed to react to comment', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        await commentService.deleteComment(commentId);
        toast.success('Đã xóa bình luận');
        if (onCommentDeleted) onCommentDeleted(commentId);
      } catch (err) {
        toast.error('Không thể xóa bình luận');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await commentService.updateComment(commentId, editText.trim());
      comment.content = editText.trim();
      setIsEditing(false);
      toast.success('Đã sửa bình luận');
    } catch (err) {
      toast.error('Không thể sửa bình luận');
    }
  };

  const reactionInfo = myReaction ? REACTION_ICONS[myReaction] : null;
  const replyCount = comment.totalReplies ?? comment.replyCount ?? 0;

  // Format time (e.g. 5m, 2h, 1d)
  const formatCommentTime = (dateStr) => {
    if (!dateStr) return 'Vừa xong';
    try {
      const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
      if (diff < 60) return 'Vừa xong';
      const m = Math.floor(diff / 60);
      if (m < 60) return `${m} phút`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} giờ`;
      const d = Math.floor(h / 24);
      if (d < 7) return `${d} ngày`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex gap-2.5 text-xs group/comment select-text">
      {/* Author Avatar */}
      <Link to={`/users/${comment.userId || comment.authorId}`} className="flex-shrink-0">
        <img
          src={comment.avatarUrl || 'https://via.placeholder.com/36'}
          alt=""
          className="w-8 h-8 rounded-full object-cover shadow-xs border border-gray-100 mt-0.5 hover:opacity-90 transition"
        />
      </Link>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Comment Bubble (Instagram / Facebook Style) */}
        <div className="inline-block bg-gray-100 hover:bg-gray-200/60 transition px-3.5 py-2 rounded-2xl relative max-w-full group/bubble">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Link
              to={`/users/${comment.userId || comment.authorId}`}
              className="font-bold text-gray-900 hover:underline truncate text-xs"
            >
              {comment.username || comment.authorName || 'Người dùng'}
            </Link>

            {isPostAuthor && (
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                Tác giả
              </span>
            )}

            {isOwner && (
              <div className="opacity-0 group-hover/bubble:opacity-100 transition flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded transition cursor-pointer"
                  title="Sửa bình luận"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                  title="Xóa bình luận"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-1.5 mt-1 min-w-[220px]">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-0.5 text-[11px] text-gray-500 hover:bg-gray-200 rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-0.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 text-xs leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Reaction Badge on Corner */}
          {reactionCount > 0 && (
            <button
              type="button"
              onClick={() => setShowReactedModal(true)}
              className="absolute -bottom-2 right-2 bg-white px-1.5 py-0.5 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1 text-[10px] text-gray-600 hover:scale-105 transition cursor-pointer"
              title="Xem danh sách cảm xúc"
            >
              <span>{reactionInfo?.emoji || '❤️'}</span>
              <span className="font-bold">{reactionCount}</span>
            </button>
          )}
        </div>

        {/* Comment Action Sub-bar */}
        <div className="flex items-center gap-4 px-2 text-[11px] text-gray-500 font-semibold relative select-none">
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
              onClick={() => handleSelectReaction(myReaction ? myReaction : 'LIKE')}
              className={`hover:underline cursor-pointer transition ${
                reactionInfo ? reactionInfo.color : 'hover:text-gray-900'
              }`}
            >
              {reactionInfo ? reactionInfo.label : 'Thích'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onReplyClick && onReplyClick(comment)}
            className="hover:underline hover:text-gray-900 cursor-pointer"
          >
            Phản hồi
          </button>

          <span className="text-gray-400 font-normal">{formatCommentTime(comment.createdAt)}</span>
        </div>

        {/* View Replies Toggle */}
        {(replyCount > 0 || replies.length > 0) && (
          <div className="pt-1 pl-2">
            {!showReplies ? (
              <button
                type="button"
                onClick={fetchReplies}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-[11px] font-bold cursor-pointer transition"
              >
                <div className="w-4 h-0.5 bg-gray-300 rounded" />
                <span>Xem {replyCount || replies.length} câu trả lời</span>
              </button>
            ) : (
              <div className="space-y-3 pt-2 pl-3 border-l-2 border-gray-200">
                {loadingReplies ? (
                  <div className="py-2 text-[11px] text-gray-400">Đang tải phản hồi...</div>
                ) : (
                  replies.map((reply) => {
                    const rId = reply.commentId || reply.id;
                    return (
                      <SingleComment
                        key={rId}
                        comment={reply}
                        postId={postId}
                        postAuthorId={postAuthorId}
                        onCommentDeleted={(delId) =>
                          setReplies((prev) =>
                            prev.filter((r) => (r.commentId || r.id) !== delId)
                          )
                        }
                        onReplyClick={onReplyClick}
                      />
                    );
                  })
                )}

                <button
                  type="button"
                  onClick={() => setShowReplies(false)}
                  className="text-gray-400 hover:text-gray-600 text-[10px] font-semibold cursor-pointer"
                >
                  Ẩn phản hồi
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reacted Users Modal for Comment */}
      {showReactedModal && (
        <ReactedUsersModal
          targetId={commentId}
          targetType="COMMENT"
          onClose={() => setShowReactedModal(false)}
        />
      )}
    </div>
  );
}

export default function CommentSection({ postId, postAuthorId, onCommentCountChange }) {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await commentService.getRootComments(postId, 0, 40);
      const data = res.data?.data?.content || res.data?.data || [];
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyClick = (targetComment) => {
    setReplyTarget(targetComment);
    const targetUsername = targetComment.username || targetComment.authorName || '';
    setNewComment(`@${targetUsername} `);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAddEmoji = (emoji) => {
    setNewComment((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCreateComment = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    const parentId = replyTarget ? (replyTarget.commentId || replyTarget.id) : null;
    const contentToSend = newComment.trim();

    try {
      const res = await commentService.createComment(postId, contentToSend, parentId);
      const created = res.data?.data;
      if (created) {
        if (!parentId) {
          setComments((prev) => [created, ...prev]);
        } else {
          fetchComments();
        }
      } else {
        fetchComments();
      }
      if (onCommentCountChange) {
        onCommentCountChange((prev) => prev + 1);
      }
      setNewComment('');
      setReplyTarget(null);
      toast.success('Đã gửi bình luận');
    } catch (err) {
      toast.error('Không thể gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* ── Comment List ── */}
      <div className="space-y-3 pt-1">
        {loading ? (
          <div className="py-6 flex justify-center">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const cId = comment.commentId || comment.id;
            return (
              <SingleComment
                key={cId}
                comment={comment}
                postId={postId}
                postAuthorId={postAuthorId}
                onCommentDeleted={(delId) => {
                  setComments((prev) =>
                    prev.filter((c) => (c.commentId || c.id) !== delId)
                  );
                  if (onCommentCountChange) {
                    onCommentCountChange((prev) => Math.max(0, prev - 1));
                  }
                }}
                onReplyClick={handleReplyClick}
              />
            );
          })
        ) : (
          <p className="text-center text-xs text-gray-400 py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận! 💬
          </p>
        )}
      </div>

      {/* ── Instagram Quick Emoji Bar ── */}
      <div className="flex items-center gap-2 px-1 overflow-x-auto no-scrollbar select-none pt-2 border-t border-gray-100">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleAddEmoji(emoji)}
            className="text-base hover:scale-125 active:scale-95 transition-transform cursor-pointer p-0.5"
            title={`Thêm ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* ── Reply Target Banner ── */}
      {replyTarget && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/80 rounded-xl text-xs text-blue-800">
          <span>
            Đang trả lời <strong>@{replyTarget.username || replyTarget.authorName}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setReplyTarget(null);
              setNewComment('');
            }}
            className="p-1 text-blue-600 hover:text-blue-800 rounded cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Sticky Input Box (Instagram Style) ── */}
      <form onSubmit={handleCreateComment} className="flex items-center gap-2.5">
        <img
          src={user?.avatarUrl || 'https://via.placeholder.com/36'}
          alt=""
          className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-xs flex-shrink-0"
        />
        <div className="flex-1 relative flex items-center bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-400 border border-transparent rounded-2xl transition">
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              replyTarget
                ? `Trả lời @${replyTarget.username || 'người dùng'}...`
                : 'Thêm bình luận...'
            }
            className="w-full pl-3.5 pr-14 py-2.5 text-xs outline-none bg-transparent text-gray-900 placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-2.5 px-2 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 disabled:opacity-30 disabled:hover:text-rose-600 transition cursor-pointer"
          >
            {submitting ? '...' : 'Đăng'}
          </button>
        </div>
      </form>
    </div>
  );
}
