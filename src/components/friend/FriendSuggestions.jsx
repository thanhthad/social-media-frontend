import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import friendshipService from '../../services/friendshipService';
import toast from 'react-hot-toast';
import { UserPlus, UserX, Sparkles } from 'lucide-react';

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await friendshipService.getFriendSuggestions();
      const data = res.data?.data || [];
      setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (err) {
      console.error('Failed to fetch friend suggestions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      setSentRequests((prev) => ({ ...prev, [userId]: true }));
      toast.success('Đã gửi lời mời kết bạn!');
    } catch (err) {
      console.error('Failed to send friend request', err);
      toast.error(err.response?.data?.message || 'Không thể gửi lời mời kết bạn');
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await friendshipService.cancelFriendRequest(userId);
      setSentRequests((prev) => ({ ...prev, [userId]: false }));
      toast.success('Đã hủy lời mời kết bạn');
    } catch (err) {
      console.error('Failed to cancel friend request', err);
      toast.error(err.response?.data?.message || 'Không thể hủy lời mời');
    }
  };

  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Gợi ý kết bạn
        </h3>
        <Link
          to="/friends"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-2.5">
        {loading
          ? [1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))
          : suggestions.map((u) => {
              const uId = u.userId || u.id;
              const isSent = sentRequests[uId];
              return (
                <div key={uId} className="flex items-center justify-between gap-2">
                  <Link
                    to={`/users/${uId}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1 group"
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {(u.fullName || u.username || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-xs truncate group-hover:text-indigo-600 transition-colors">
                        {u.fullName || u.username}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {(u.mutualCount || u.mutualFriendsCount)
                          ? `${u.mutualCount || u.mutualFriendsCount} bạn chung`
                          : `@${u.username}`}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => (isSent ? handleCancelRequest(uId) : handleSendRequest(uId))}
                    className={`flex-shrink-0 p-1.5 rounded-xl transition active:scale-90 ${
                      isSent
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                    title={isSent ? 'Hủy lời mời' : 'Kết bạn'}
                  >
                    {isSent ? <UserX size={14} /> : <UserPlus size={14} />}
                  </button>
                </div>
              );
            })}
      </div>
    </div>
  );
}
