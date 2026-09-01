import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import friendshipService from '../../services/friendshipService';
import toast from 'react-hot-toast';
import { UserPlus, UserCheck, UserX, Sparkles } from 'lucide-react';

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
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Gợi ý kết bạn
        </h3>
        <Link
          to="/friends"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {loading
          ? [1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))
          : suggestions.map((user) => {
              const uId = user.userId || user.id;
              const isSent = sentRequests[uId];
              return (
                <div
                  key={uId}
                  className="flex items-center justify-between gap-3 group"
                >
                  <Link
                    to={`/users/${uId}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <img
                      src={user.avatarUrl || 'https://via.placeholder.com/40'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {(user.mutualCount || user.mutualFriendsCount)
                          ? `${user.mutualCount || user.mutualFriendsCount} bạn chung`
                          : `@${user.username}`}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => (isSent ? handleCancelRequest(uId) : handleSendRequest(uId))}
                    className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 ${
                      isSent
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 shadow-xs'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm'
                    }`}
                    title={isSent ? 'Nhấn để hủy lời mời đã gửi' : 'Kết bạn'}
                  >
                    {isSent ? <UserX size={15} /> : <UserPlus size={15} />}
                  </button>
                </div>
              );
            })}
      </div>
    </div>
  );
}
