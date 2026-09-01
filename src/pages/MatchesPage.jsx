import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  ArrowLeft,
  Search,
  RotateCcw,
  MessageCircle,
  Flame,
  ShieldCheck,
  MapPin,
  X,
  Star,
  Eye,
  Users,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import datingService from '../services/datingService';
import conversationService from '../services/conversationService';
import DatingProfileDetailModal from '../components/dating/DatingProfileDetailModal';
import MatchModal from '../components/dating/MatchModal';

export default function MatchesPage() {
  const navigate = useNavigate();
  const [likes, setLikes] = useState([]);
  const [mySwipes, setMySwipes] = useState([]);
  const [enrichedLikes, setEnrichedLikes] = useState([]);
  const [enrichedSwipes, setEnrichedSwipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('likes'); // 'likes' | 'matched' | 'sent'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [matchedProfile, setMatchedProfile] = useState(null);

  // Helper: Fetch public profiles for list of swipe items
  const enrichSwipeList = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return [];

    const enriched = await Promise.all(
      items.map(async (item) => {
        const uId = item.targetUserId || item.targetId || item.userId || item.id;
        if (!uId) return item;

        try {
          const profileRes = await datingService.getPublicProfile(uId);
          const p = profileRes?.data?.data || profileRes?.data;
          if (p) {
            return {
              ...item,
              userId: uId,
              targetUserId: uId,
              displayName: p.displayName || p.username || `Người dùng #${uId}`,
              username: p.username,
              avatarUrl: p.avatarUrl || p.photos?.[0]?.url || null,
              coverUrl: p.coverUrl,
              age: p.age,
              city: p.city || p.country || '',
              district: p.district || '',
              bio: p.bio || '',
              occupation: p.occupation || '',
              education: p.education || '',
              height: p.height,
              distanceKm: p.distanceKm,
              compatibilityScore: p.compatibilityScore ?? Math.floor(Math.random() * 15 + 80),
              photos: p.photos || [],
              interests: p.interests || [],
            };
          }
        } catch (e) {
          // Fallback if profile fetch fails
        }
        return {
          ...item,
          userId: uId,
          targetUserId: uId,
          displayName: item.targetDisplayName || item.displayName || `Người dùng #${uId}`,
          avatarUrl: item.targetAvatarUrl || item.avatarUrl || null,
          compatibilityScore: 82,
        };
      })
    );
    return enriched;
  };

  const [dbMatches, setDbMatches] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [likesRes, swipesRes, matchesRes] = await Promise.all([
        datingService.getUsersWhoLikedMe().catch(() => null),
        datingService.getMySwipes().catch(() => null),
        datingService.getMyMatches().catch(() => null),
      ]);

      const rawLikes =
        likesRes?.data?.data?.content ||
        likesRes?.data?.data ||
        likesRes?.data?.content ||
        likesRes?.data ||
        [];
      const likesList = Array.isArray(rawLikes) ? rawLikes : [];
      setLikes(likesList);

      const rawSwipes =
        swipesRes?.data?.data?.content ||
        swipesRes?.data?.data ||
        swipesRes?.data?.content ||
        swipesRes?.data ||
        [];
      const swipesList = Array.isArray(rawSwipes) ? rawSwipes : [];
      setMySwipes(swipesList);

      const rawDbMatches = matchesRes?.data?.data || matchesRes?.data || [];
      const dbMatchesList = Array.isArray(rawDbMatches) ? rawDbMatches : [];

      // Enrich likes, swipes, and matches in parallel
      const [fullLikes, fullSwipes, fullDbMatches] = await Promise.all([
        enrichSwipeList(likesList),
        enrichSwipeList(swipesList),
        enrichSwipeList(dbMatchesList),
      ]);

      setEnrichedLikes(fullLikes);
      setEnrichedSwipes(fullSwipes);
      setDbMatches(fullDbMatches);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách tương hợp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Like Back -> Trigger Match
  const handleLikeBack = async (targetUser) => {
    const targetUserId = targetUser.userId || targetUser.targetUserId || targetUser.id;
    try {
      await datingService.swipe(targetUserId, 'LIKE');
      setEnrichedLikes((prev) =>
        prev.filter((u) => (u.userId || u.targetUserId || u.id) !== targetUserId)
      );
      setMatchedProfile(targetUser);
      toast.success('🎉 Tương hợp thành công!');
    } catch (err) {
      toast.error('Không thể gửi lượt thích');
    }
  };

  // Pass an admirer
  const handlePassAdmirer = (targetUserId) => {
    setEnrichedLikes((prev) =>
      prev.filter((u) => (u.userId || u.targetUserId || u.id) !== targetUserId)
    );
    toast('Đã bỏ qua', { icon: '👋' });
  };

  // Undo a swipe
  const handleUndoSwipe = async (targetUserId) => {
    try {
      await datingService.undoSwipe(targetUserId);
      setEnrichedSwipes((prev) =>
        prev.filter((s) => (s.targetUserId || s.targetId || s.userId) !== targetUserId)
      );
      toast.success('Đã hoàn tác lượt quẹt!');
    } catch (error) {
      toast.error('Không thể hoàn tác lượt quẹt');
    }
  };

  // Start private chat with matched user
  const handleStartChat = async (userId) => {
    if (!userId) return;
    try {
      const res = await conversationService.createPrivate(userId);
      const conv = res.data?.data || res.data;
      navigate('/messages', {
        state: {
          conversation: conv,
          conversationId: conv?.conversation_id || conv?.id,
          targetUserId: userId,
        },
      });
    } catch (err) {
      navigate('/messages');
    }
  };

  // Filter list by search query
  const filterByQuery = (list) =>
    list.filter((u) => {
      const name = u.displayName || u.username || '';
      const loc = u.city || u.location || '';
      const bio = u.bio || '';
      const q = searchQuery.toLowerCase();
      return (
        name.toLowerCase().includes(q) ||
        loc.toLowerCase().includes(q) ||
        bio.toLowerCase().includes(q)
      );
    });

  const filteredLikes = filterByQuery(enrichedLikes);

  // Mutual matches = Database matches + Mutual swipe matches
  const likedByMeIds = new Set(
    enrichedSwipes
      .filter((s) => s.action === 'LIKE' || s.action === 'SUPER_LIKE')
      .map((s) => s.targetUserId || s.targetId || s.userId)
  );

  const mutualMatches = (() => {
    const map = new Map();
    dbMatches.forEach((m) => {
      const id = m.matchedUserId || m.userId || m.id;
      if (id) map.set(id, { ...m, userId: id, targetUserId: id, displayName: m.name || m.username || m.displayName });
    });
    enrichedLikes.forEach((u) => {
      const id = u.userId || u.targetUserId || u.id;
      if (id && likedByMeIds.has(id) && !map.has(id)) {
        map.set(id, u);
      }
    });
    return Array.from(map.values());
  })();

  const filteredMatches = filterByQuery(mutualMatches);
  const filteredSwipes = filterByQuery(enrichedSwipes);

  const likeSwipes = enrichedSwipes.filter(
    (s) => s.action === 'LIKE' || s.action === 'SUPER_LIKE'
  );
  const dislikeSwipes = enrichedSwipes.filter((s) => s.action === 'DISLIKE');

  const TABS = [
    {
      key: 'likes',
      label: 'Đã thích bạn',
      icon: Flame,
      count: enrichedLikes.length,
      color: 'from-pink-500 to-rose-600',
    },
    {
      key: 'matched',
      label: 'Tương hợp',
      icon: CheckCheck,
      count: mutualMatches.length,
      color: 'from-purple-500 to-pink-500',
    },
    {
      key: 'sent',
      label: 'Lịch sử quẹt',
      icon: RotateCcw,
      count: enrichedSwipes.length,
      color: 'from-sky-500 to-blue-600',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dating"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 mb-2 transition group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang quẹt thẻ</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black gradient-dating-text flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-pink-500 fill-pink-500" />
            Tương Hợp & Lượt Thích
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Xem những người đã có ấn tượng với bạn và bắt đầu trò chuyện.
          </p>
        </div>

        {/* Search Input & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, địa điểm..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-pink-400 focus:bg-white outline-none transition"
            />
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl border border-gray-200 transition"
            title="Tải lại danh sách"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 gap-1.5">
        {TABS.map(({ key, label, icon: Icon, count, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === key
                ? `bg-gradient-to-r ${color} text-white shadow-md shadow-pink-500/20`
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <div className="w-9 h-9 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-semibold">Đang tải dữ liệu hồ sơ...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ─── TAB 1: Đã thích bạn ─── */}
            {activeTab === 'likes' && (
              <div className="space-y-4">
                {filteredLikes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredLikes.map((u) => {
                      const uId = u.userId || u.targetUserId || u.id;
                      const name = u.displayName || u.username || 'Người dùng';
                      const avatar =
                        u.avatarUrl ||
                        u.photos?.[0]?.url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
                      const compatibility = u.compatibilityScore ?? 85;

                      return (
                        <motion.div
                          key={uId}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 bg-slate-950 aspect-[3/4] flex flex-col justify-end"
                        >
                          <img
                            src={avatar}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 inset-x-3 flex justify-between items-center z-10">
                            <span className="px-3 py-1 bg-pink-600/90 text-white rounded-full text-[11px] font-black backdrop-blur-md shadow-md flex items-center gap-1">
                              <Flame size={12} className="fill-current" />
                              {compatibility}% Hợp
                            </span>
                            <button
                              onClick={() => setSelectedProfile(u)}
                              className="w-9 h-9 bg-black/40 hover:bg-black/70 rounded-full text-white/90 hover:text-white flex items-center justify-center backdrop-blur-md transition shadow-md border border-white/10"
                              title="Xem chi tiết hồ sơ"
                            >
                              <Eye size={16} />
                            </button>
                          </div>

                          {/* Bottom Info */}
                          <div className="relative z-10 p-5 text-white space-y-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-xl font-black drop-shadow-md truncate">{name}</h3>
                                {u.age && <span className="text-lg font-light opacity-90">{u.age}</span>}
                                <ShieldCheck size={16} className="text-sky-400 flex-shrink-0" />
                              </div>
                              {(u.city || u.location) && (
                                <p className="text-xs text-pink-200 flex items-center gap-1 mt-0.5 font-medium">
                                  <MapPin size={11} className="text-pink-400" />
                                  {u.city || u.location}
                                  {u.distanceKm !== undefined && u.distanceKm !== null && ` • ${Number(u.distanceKm).toFixed(1)} km`}
                                </p>
                              )}
                              {u.bio && (
                                <p className="text-[11px] text-gray-300 mt-1 line-clamp-1 opacity-90">
                                  {u.bio}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handlePassAdmirer(uId)}
                                className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                <X size={14} />
                                Bỏ qua
                              </button>
                              <button
                                onClick={() => handleLikeBack(u)}
                                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-lg shadow-pink-500/40 transition flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                <Heart size={14} className="fill-current" />
                                Thích lại
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 space-y-4">
                    <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <Heart size={36} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Chưa có ai thích bạn gần đây</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Hãy làm đẹp thêm hồ sơ, tải ảnh chất lượng và tiếp tục quẹt thẻ để tăng cơ hội kết đôi!
                    </p>
                    <Link
                      to="/dating"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition transform active:scale-95"
                    >
                      <Sparkles size={15} />
                      Bắt đầu khám phá ngay
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: Tương hợp (Mutual Matches) ─── */}
            {activeTab === 'matched' && (
              <div className="space-y-4">
                {filteredMatches.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredMatches.map((u) => {
                      const uId = u.userId || u.targetUserId || u.id;
                      const name = u.displayName || u.username || 'Người dùng';
                      const avatar =
                        u.avatarUrl ||
                        u.photos?.[0]?.url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

                      return (
                        <motion.div
                          key={uId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-950 aspect-[3/4] flex flex-col justify-end"
                        >
                          <img
                            src={avatar}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                          {/* Match Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-[11px] font-black backdrop-blur-md shadow-md flex items-center gap-1">
                              <Heart size={11} className="fill-current" />
                              Đã tương hợp
                            </span>
                          </div>

                          <div className="relative z-10 p-5 text-white space-y-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-xl font-black drop-shadow-md truncate">{name}</h3>
                                {u.age && <span className="text-lg font-light opacity-90">{u.age}</span>}
                              </div>
                              {(u.city || u.location) && (
                                <p className="text-xs text-pink-200 flex items-center gap-1 mt-0.5">
                                  <MapPin size={11} className="text-pink-400" />
                                  {u.city || u.location}
                                </p>
                              )}
                            </div>

                            {/* Chat Action */}
                            <button
                              onClick={() => handleStartChat(uId)}
                              className="w-full py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-lg shadow-pink-500/30 transition flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <MessageCircle size={14} />
                              Nhắn tin ngay
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-tr from-pink-50 to-purple-50 text-pink-500 rounded-3xl flex items-center justify-center mx-auto">
                      <Users size={36} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Chưa có tương hợp nào</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Khi bạn và ai đó cùng thích nhau, họ sẽ xuất hiện tại đây. Hãy tiếp tục quẹt thẻ để tìm bạn nhé!
                    </p>
                    <Link
                      to="/dating"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md transition active:scale-95"
                    >
                      <Flame size={15} className="fill-current" />
                      Tiếp tục khám phá
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: Lịch sử đã quẹt ─── */}
            {activeTab === 'sent' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredSwipes.length > 0 ? (
                  <>
                    {/* Summary stats */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                      <div className="p-4 text-center">
                        <p className="text-xl font-black text-gray-900">{filteredSwipes.length}</p>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Tổng quẹt</p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xl font-black text-pink-600">{likeSwipes.length}</p>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Đã thích</p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xl font-black text-rose-600">{dislikeSwipes.length}</p>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Đã bỏ qua</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto p-4">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="pb-3 px-2">Đối tượng</th>
                            <th className="pb-3 px-2">Hành động</th>
                            <th className="pb-3 px-2">Thời gian</th>
                            <th className="pb-3 px-2 text-right">Hoàn tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredSwipes.map((swipe) => {
                            const sId = swipe.targetUserId || swipe.targetId || swipe.userId;
                            const targetName =
                              swipe.displayName || swipe.targetDisplayName || `Người dùng #${sId}`;
                            const targetAvatar = swipe.avatarUrl || swipe.targetAvatarUrl || null;

                            return (
                              <tr key={sId} className="hover:bg-gray-50/50 transition group">
                                <td className="py-3.5 px-2">
                                  <div className="flex items-center gap-3">
                                    {targetAvatar ? (
                                      <img
                                        src={targetAvatar}
                                        alt=""
                                        className="w-10 h-10 rounded-2xl object-cover border border-gray-100"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-100 to-rose-200 text-pink-700 font-black flex items-center justify-center shadow-sm text-xs">
                                        #{sId}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-gray-900">{targetName}</p>
                                      {swipe.city && (
                                        <p className="text-[10px] text-gray-400">{swipe.city}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                      swipe.action === 'LIKE'
                                        ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                        : swipe.action === 'SUPER_LIKE'
                                        ? 'bg-sky-100 text-sky-700 border border-sky-200'
                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}
                                  >
                                    {swipe.action === 'LIKE' && <Heart size={12} className="fill-current" />}
                                    {swipe.action === 'SUPER_LIKE' && <Star size={12} className="fill-current" />}
                                    {swipe.action === 'LIKE'
                                      ? 'Đã thích'
                                      : swipe.action === 'SUPER_LIKE'
                                      ? 'Siêu thích'
                                      : 'Bỏ qua'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-2 text-gray-400">
                                  {swipe.createdAt
                                    ? new Date(swipe.createdAt).toLocaleDateString('vi-VN')
                                    : 'Gần đây'}
                                </td>

                                <td className="py-3.5 px-2 text-right">
                                  <button
                                    onClick={() => handleUndoSwipe(sId)}
                                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition inline-flex items-center gap-1 active:scale-95"
                                  >
                                    <RotateCcw size={13} />
                                    Thu hồi
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center space-y-2 text-gray-400 p-6">
                    <p className="font-semibold text-gray-700 text-sm">Chưa có lịch sử quẹt nào.</p>
                    <p className="text-xs">Khi bạn thích hoặc bỏ qua hồ sơ, lịch sử sẽ xuất hiện tại đây.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modals */}
      <DatingProfileDetailModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        profile={selectedProfile}
        onAction={(action) => {
          if (action === 'LIKE' || action === 'SUPER_LIKE') {
            handleLikeBack(selectedProfile);
          } else {
            handlePassAdmirer(selectedProfile.userId || selectedProfile.targetUserId || selectedProfile.id);
          }
          setSelectedProfile(null);
        }}
      />

      <MatchModal
        isOpen={!!matchedProfile}
        onClose={() => setMatchedProfile(null)}
        matchProfile={matchedProfile}
      />
    </div>
  );
}

