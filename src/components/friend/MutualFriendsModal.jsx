import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import friendshipService from '../../services/friendshipService';
import { X, Users } from 'lucide-react';

export default function MutualFriendsModal({ isOpen, onClose, targetUserId, targetUserName }) {
  const [mutualFriends, setMutualFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && targetUserId) {
      fetchMutualFriends();
    } else {
      setMutualFriends([]);
      setError(null);
    }
  }, [isOpen, targetUserId]);

  const fetchMutualFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await friendshipService.getMutualFriends(targetUserId);
      const data = res.data?.data || res.data || [];
      setMutualFriends(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load mutual friends:', err);
      setError('Không thể tải danh sách bạn chung');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Bạn chung</h3>
              <p className="text-xs text-gray-500">
                {targetUserName ? `Bạn chung với ${targetUserName}` : 'Danh sách bạn chung'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Đang tải danh sách bạn chung...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchMutualFriends}
                className="mt-2 text-blue-600 font-semibold hover:underline"
              >
                Thử lại
              </button>
            </div>
          ) : mutualFriends.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Tổng cộng <span className="text-blue-600 font-bold">{mutualFriends.length}</span> người bạn chung
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mutualFriends.map((friend) => {
                  const fId = friend.userId || friend.id;
                  return (
                    <Link
                      key={fId}
                      to={`/users/${fId}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm transition group"
                    >
                      <img
                        src={friend.avatarUrl || 'https://via.placeholder.com/48'}
                        alt={friend.username}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-xs truncate group-hover:text-blue-600 transition-colors">
                          {friend.fullName || friend.username}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">@{friend.username}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 space-y-1">
              <Users size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-600 text-sm">Chưa có bạn chung nào</p>
              <p className="text-xs">Hai bạn hiện tại chưa có bạn bè chung nào trong hệ thống.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
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
