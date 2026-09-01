import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reactionService from '../../services/reactionService';
import commentReactionService from '../../services/commentReactionService';
import { REACTION_ICONS, REACTION_TYPES } from './ReactionPicker';
import { X, Heart, Clock } from 'lucide-react';

export default function ReactedUsersModal({ targetId, targetType = 'POST', onClose }) {
  const [activeTab, setActiveTab] = useState(null); // null = All
  const [reactionCounts, setReactionCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch reaction counts breakdown
  useEffect(() => {
    if (!targetId) return;

    const fetchCounts = async () => {
      try {
        const res =
          targetType === 'POST'
            ? await reactionService.getReactionCount(targetId)
            : await commentReactionService.getReactionsCount(targetId);

        // API returns: { counts: { LIKE: 3, LOVE: 1, ... } }
        const counts = res.data?.data?.counts || res.data?.data || res.data || {};
        setReactionCounts(counts);

        const total = Object.values(counts).reduce((acc, c) => acc + (Number(c) || 0), 0);
        setTotalCount(total);
      } catch (err) {
        console.error('Failed to load reaction counts', err);
      }
    };

    fetchCounts();
  }, [targetId, targetType]);

  // 2. Fetch reacted users for the selected reaction type (or all)
  useEffect(() => {
    if (!targetId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res =
          targetType === 'POST'
            ? await reactionService.getUsersReacted(targetId, activeTab, 0, 50)
            : await commentReactionService.getUsersReacted(targetId, activeTab, 0, 50);

        const data = res.data?.data?.content || res.data?.data || [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch reacted users', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [targetId, targetType, activeTab]);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const diffInSeconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
      if (diffInSeconds < 60) return 'Vừa xong';
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} ngày trước`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  // Each user's specific reaction info
  const getReactionInfo = (u) => {
    const type = activeTab || u.reactionType || u.type;
    if (type && REACTION_ICONS[type]) {
      return REACTION_ICONS[type];
    }
    return REACTION_ICONS.LIKE;
  };

  // Derive display name
  const getDisplayName = (u) => {
    if (u.fullName) return u.fullName;
    if (u.username) return u.username;
    if (u.email) return u.email.split('@')[0];
    return 'Người dùng';
  };

  const getHandleName = (u) => {
    if (u.username) return `@${u.username}`;
    if (u.email) return u.email;
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart size={16} className="fill-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Người đã thả cảm xúc</h3>
              <p className="text-xs text-gray-400">
                {totalCount > 0 ? `${totalCount} lượt bày tỏ cảm xúc` : 'Danh sách cảm xúc'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Reaction Filter Tabs with Counts */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto scrollbar-none bg-gray-50/30">
          {/* "Tất cả" Tab */}
          <button
            onClick={() => setActiveTab(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === null
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Tất cả</span>
            <span className="text-[11px] opacity-80">{totalCount}</span>
          </button>

          {/* Individual Reaction Tabs */}
          {REACTION_TYPES.map((type) => {
            const count = reactionCounts[type] || 0;
            if (count === 0) return null; // Don't show tabs with 0 count
            const item = REACTION_ICONS[type];
            const isActive = activeTab === type;

            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length > 0 ? (
            users.map((u, idx) => {
              const uId = u.id || u.userId;
              const displayName = getDisplayName(u);
              const handleName = getHandleName(u);
              const reactionInfo = getReactionInfo(u);

              return (
                <div
                  key={uId || idx}
                  className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 hover:border-rose-100 transition group bg-white"
                >
                  <Link
                    to={`/users/${uId}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 min-w-0 flex-1"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={u.avatarUrl || 'https://via.placeholder.com/48'}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      {/* Reaction badge for each user */}
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs ring-1 ring-gray-100 p-0.5">
                        {reactionInfo.iconUrl ? (
                          <img
                            src={reactionInfo.iconUrl}
                            alt=""
                            className="w-3.5 h-3.5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'inline';
                              }
                            }}
                          />
                        ) : null}
                        <span className={`text-xs leading-none ${reactionInfo.iconUrl ? 'hidden' : ''}`}>
                          {reactionInfo.emoji}
                        </span>
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate group-hover:text-rose-600 transition-colors">
                        {displayName}
                      </p>
                      {handleName && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{handleName}</p>
                      )}
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                    {/* Reaction type label */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${reactionInfo.bg} ${reactionInfo.color}`}>
                      {reactionInfo.label}
                    </span>

                    {u.createdAt && (
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={11} className="text-gray-300" />
                        <span>{timeAgo(u.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <Heart size={32} className="mx-auto text-gray-300 mb-1" />
              <p className="text-sm font-semibold text-gray-600">Chưa có ai thả cảm xúc này</p>
              <p className="text-xs text-gray-400">Hãy là người đầu tiên tương tác với bài viết!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
