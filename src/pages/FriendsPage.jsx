import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import friendshipService from '../services/friendshipService';
import { useUser } from '../contexts/UserContext';
import PendingFriendRequests from '../components/friend/PendingFriendRequests';
import toast from 'react-hot-toast';
import { Users, UserPlus, UserCheck, Sparkles, Search, UserMinus, Clock, UserX } from 'lucide-react';

export default function FriendsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests' | 'suggestions'
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [friendsRes, suggRes] = await Promise.all([
        friendshipService.getFriends(user.id, 0, 50).catch(() => ({ data: { data: [] } })),
        friendshipService.getFriendSuggestions().catch(() => ({ data: { data: [] } })),
      ]);

      const fList = friendsRes.data?.data?.content || friendsRes.data?.data || [];
      const sList = suggRes.data?.data || [];
      setFriends(Array.isArray(fList) ? fList : []);
      setSuggestions(Array.isArray(sList) ? sList : []);
    } catch (err) {
      console.error('Failed to load friends data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (targetId) => {
    try {
      await friendshipService.sendFriendRequest(targetId);
      setSentRequests((prev) => ({ ...prev, [targetId]: true }));
      toast.success('Đã gửi lời mời kết bạn!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi lời mời kết bạn');
    }
  };

  const handleCancelRequest = async (targetId) => {
    try {
      await friendshipService.cancelFriendRequest(targetId);
      setSentRequests((prev) => ({ ...prev, [targetId]: false }));
      toast.success('Đã hủy lời mời kết bạn');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy lời mời');
    }
  };

  const handleUnfriend = async (targetId) => {
    if (window.confirm('Bạn có chắc muốn hủy kết bạn với người này?')) {
      try {
        await friendshipService.rejectFriendRequest(targetId);
        setFriends((prev) => prev.filter((f) => (f.userId || f.id) !== targetId));
        toast.success('Đã hủy kết bạn');
      } catch (err) {
        toast.error('Không thể hủy kết bạn');
      }
    }
  };

  const filteredFriends = friends.filter((f) =>
    (f.fullName || f.username || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            Bạn bè & Kết nối
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Quản lý danh sách bạn bè và khám phá những người bạn mới.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100/80 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'friends'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bạn bè ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock size={14} className="text-indigo-600" />
            Lời mời kết bạn
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'suggestions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles size={14} className="text-amber-500" />
            Gợi ý ({suggestions.length})
          </button>
        </div>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm trong danh sách bạn bè..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
            />
          </div>

          {/* List */}
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredFriends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFriends.map((f) => {
                const fId = f.userId || f.id;
                return (
                  <div
                    key={fId}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition bg-white group"
                  >
                    <Link
                      to={`/users/${fId}`}
                      className="flex items-center gap-3.5 min-w-0 flex-1"
                    >
                      <img
                        src={f.avatarUrl || 'https://via.placeholder.com/48'}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition">
                          {f.fullName || f.username}
                        </p>
                        <p className="text-xs text-gray-400 truncate">@{f.username}</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleUnfriend(fId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Hủy kết bạn"
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <p className="font-semibold text-gray-600 text-sm">Chưa có bạn bè nào trong danh sách.</p>
              <p className="text-xs">Chuyển sang tab Gợi ý để kết nối với những người bạn quen biết!</p>
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Lời mời kết bạn đã nhận
            </h3>
            <span className="text-xs text-gray-400">Yêu cầu đang chờ xác nhận</span>
          </div>

          <PendingFriendRequests onActionSuccess={() => fetchData()} />
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">
            Những người bạn có thể biết
          </h3>

          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((s) => {
                const sId = s.userId || s.id;
                const isSent = sentRequests[sId];
                return (
                  <div
                    key={sId}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:shadow-md transition flex flex-col items-center text-center space-y-3"
                  >
                    <img
                      src={s.avatarUrl || 'https://via.placeholder.com/64'}
                      alt=""
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className="w-full">
                      <Link
                        to={`/users/${sId}`}
                        className="font-bold text-gray-900 text-sm hover:text-blue-600 truncate block"
                      >
                        {s.fullName || s.username}
                      </Link>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {(s.mutualCount || s.mutualFriendsCount)
                          ? `${s.mutualCount || s.mutualFriendsCount} bạn chung`
                          : `@${s.username}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => (isSent ? handleCancelRequest(sId) : handleSendRequest(sId))}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                        isSent
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                      title={isSent ? 'Nhấn để hủy lời mời đã gửi' : 'Gửi lời mời kết bạn'}
                    >
                      {isSent ? (
                        <>
                          <UserX size={14} />
                          <span>Hủy lời mời</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          <span>Kết bạn</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-12 text-center text-xs text-gray-400">
              Hiện chưa có thêm gợi ý kết bạn nào.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
