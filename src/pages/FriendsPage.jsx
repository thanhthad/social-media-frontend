import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Users, UserCheck, MessageCircle, X, Shield, RefreshCw } from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import friendshipService from '../services/friendshipService';
import blockService from '../services/blockService';
import { useUser } from '../contexts/UserContext';
import MutualFriendsModal from '../components/friend/MutualFriendsModal';

export const FriendsPage = () => {
  const { currentUserId } = useUser();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Mutual friends modal
  const [mutualModalUser, setMutualModalUser] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (currentUserId) {
        const friendsRes = await friendshipService.getFriends(currentUserId, 0, 100);
        const fData = friendsRes.data?.data?.content || friendsRes.data?.data || [];
        setFriends(Array.isArray(fData) ? fData : []);
      }

      const [reqRes, suggRes] = await Promise.allSettled([
        friendshipService.getPendingRequests(0, 50),
        friendshipService.getFriendSuggestions(),
      ]);

      if (reqRes.status === 'fulfilled') {
        const rData = reqRes.value.data?.data?.content || reqRes.value.data?.data || [];
        setRequests(Array.isArray(rData) ? rData : []);
      }
      if (suggRes.status === 'fulfilled') {
        const sData = suggRes.value.data?.data || [];
        setSuggestions(Array.isArray(sData) ? sData : []);
      }
    } catch (e) {
      console.warn('FriendsPage load error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabs = [
    { id: 'all', label: 'Tất cả bạn bè', icon: Users, badge: friends.length },
    { id: 'requests', label: 'Lời mời kết bạn', icon: UserCheck, badge: requests.length },
    { id: 'suggestions', label: 'Gợi ý kết bạn', icon: UserPlus, badge: suggestions.length },
  ];

  const handleAccept = async (userId, name) => {
    try {
      await friendshipService.acceptFriendRequest(userId);
      toast.success(`Đã chấp nhận lời mời từ ${name}!`);
      setRequests((prev) => prev.filter((r) => (r.userId || r.id) !== userId));
      loadData();
    } catch (e) {
      toast.error('Không thể chấp nhận kết bạn');
    }
  };

  const handleReject = async (userId) => {
    try {
      await friendshipService.rejectFriendRequest(userId);
      toast('Đã gỡ lời mời kết bạn');
      setRequests((prev) => prev.filter((r) => (r.userId || r.id) !== userId));
    } catch (e) {
      toast.error('Không thể từ chối lời mời');
    }
  };

  const handleSendRequest = async (userId, name) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      toast.success(`Đã gửi lời mời kết bạn đến ${name}!`);
      setSuggestions((prev) => prev.filter((s) => (s.userId || s.id) !== userId));
    } catch (e) {
      toast.error('Không thể gửi lời mời');
    }
  };

  const handleUnfriend = async (userId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${name}?`)) return;
    try {
      await friendshipService.cancelFriendRequest(userId);
      toast.success(`Đã hủy kết bạn với ${name}`);
      setFriends((prev) => prev.filter((f) => (f.userId || f.id) !== userId));
    } catch (e) {
      toast.error('Không thể hủy kết bạn');
    }
  };

  const handleBlock = async (userId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn chặn ${name}?`)) return;
    try {
      await blockService.blockUser(userId);
      toast.success(`Đã chặn ${name}`);
      setFriends((prev) => prev.filter((f) => (f.userId || f.id) !== userId));
      setSuggestions((prev) => prev.filter((s) => (s.userId || s.id) !== userId));
      setRequests((prev) => prev.filter((r) => (r.userId || r.id) !== userId));
    } catch (e) {
      toast.error('Không thể chặn người dùng');
    }
  };

  // Filter friends
  const filteredFriends = friends.filter((f) => {
    const name = f.fullName || f.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Bạn bè & Kết nối
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý danh sách kết nối xã hội của bạn trên SocialDB
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2 text-slate-400 hover:text-indigo-600 self-end sm:self-center transition"
            title="Tải lại"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên bạn bè..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600"
          />
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Đang tải dữ liệu bạn bè...</p>
        </div>
      ) : activeTab === 'all' ? (
        filteredFriends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFriends.map((f) => {
              const uId = f.userId || f.id;
              const name = f.fullName || f.username || `User #${uId}`;
              const avatar = f.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

              return (
                <div
                  key={uId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition"
                >
                  <Link to={`/profile/${uId}`} className="flex items-center gap-3 min-w-0 group">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition">
                        {name}
                      </p>
                      <p className="text-[11px] text-slate-400">@{f.username || `user${uId}`}</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMutualModalUser({ id: uId, name })}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                      title="Xem bạn chung"
                    >
                      Bạn chung
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnfriend(uId, name)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="Hủy kết bạn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBlock(uId, name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Chặn người này"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có bạn bè nào</p>
            <p className="text-xs text-slate-400 mt-1">Hãy xem tab &quot;Gợi ý kết bạn&quot; để tìm thêm người quen!</p>
          </div>
        )
      ) : activeTab === 'requests' ? (
        requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((r) => {
              const uId = r.userId || r.id;
              const name = r.fullName || r.username || `User #${uId}`;
              const avatar = r.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

              return (
                <div
                  key={uId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
                >
                  <Link to={`/profile/${uId}`} className="flex items-center gap-3 min-w-0 group">
                    <img
                      src={avatar}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition">
                        {name}
                      </p>
                      <p className="text-[11px] text-slate-400">Đã gửi cho bạn lời mời kết bạn</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAccept(uId, name)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                    >
                      Chấp nhận
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(uId)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không có lời mời kết bạn nào</p>
          </div>
        )
      ) : (
        /* Suggestions tab */
        suggestions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map((s) => {
              const uId = s.userId || s.id;
              const name = s.fullName || s.name || s.userName || `User #${uId}`;
              const avatar = s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
              const reason = s.mutualFriendsCount
                ? `${s.mutualFriendsCount} bạn chung`
                : s.reason || 'Gợi ý kết bạn';

              return (
                <div
                  key={uId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
                >
                  <Link to={`/profile/${uId}`} className="flex items-center gap-3 min-w-0 group">
                    <img
                      src={avatar}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition">
                        {name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{reason}</p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSendRequest(uId, name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold transition shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Kết bạn</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không có gợi ý mới</p>
          </div>
        )
      )}

      {/* Mutual Friends Modal */}
      {mutualModalUser && (
        <MutualFriendsModal
          isOpen={Boolean(mutualModalUser)}
          targetUserId={mutualModalUser.id}
          targetUserName={mutualModalUser.name}
          onClose={() => setMutualModalUser(null)}
        />
      )}
    </div>
  );
};

export default FriendsPage;
