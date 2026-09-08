import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  X,
  Star,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Flame,
  Settings,
  Compass,
  Radio,
  RefreshCw,
  MapPin,
  AlertCircle,
  ShieldAlert,
  Navigation,
  Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import datingService from '../services/datingService';
import SwipeCard from '../components/dating/SwipeCard';
import DatingProfileDetailModal from '../components/dating/DatingProfileDetailModal';
import MatchModal from '../components/dating/MatchModal';
import DatingFilterDrawer from '../components/dating/DatingFilterDrawer';
import ReportModal from '../components/dating/ReportModal';
import EditDatingProfileModal from '../components/dating/EditDatingProfileModal';


export default function DatingPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [swipedHistory, setSwipedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [myProfile, setMyProfile] = useState(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [missingCoordinates, setMissingCoordinates] = useState(false);
  const [gpsUpdating, setGpsUpdating] = useState(false);

  // Modals & Drawers
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState(null);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reportUser, setReportUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [showEditDatingModal, setShowEditDatingModal] = useState(false);


  // GPS auto-update (silent)
  const gpsUpdatedRef = useRef(false);

  const fetchDiscovery = useCallback(async (pageNum = 0, isReset = false) => {
    setLoading(true);
    try {
      const res = await datingService.getDiscovery({ page: pageNum, size: 15 });
      const rawData = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];

      if (isReset) {
        setCandidates(list);
      } else {
        setCandidates((prev) => {
          const existingIds = new Set(prev.map((c) => c.userId || c.id));
          const newOnes = list.filter((c) => !existingIds.has(c.userId || c.id));
          return [...prev, ...newOnes];
        });
      }
      setPage(pageNum);
      setMissingCoordinates(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || '';
      console.warn('Discovery API error:', errorMsg);

      if (
        errorMsg.toLowerCase().includes('coordinate') ||
        errorMsg.toLowerCase().includes('latitude') ||
        err.response?.status === 400
      ) {
        setMissingCoordinates(true);
      } else {
        toast.error('Không thể tải danh sách gợi ý kết đôi');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Update GPS handler
  const handleUpdateGPS = useCallback(async (customLat = null, customLng = null) => {
    setGpsUpdating(true);

    if (customLat !== null && customLng !== null) {
      try {
        await datingService.updateCoordinates(customLat, customLng);
        setMissingCoordinates(false);
        toast.success('Đã cập nhật vị trí thành công!');
        fetchDiscovery(0, true);
      } catch (err) {
        toast.error('Không thể lưu tọa độ');
      } finally {
        setGpsUpdating(false);
      }
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị GPS');
      setGpsUpdating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await datingService.updateCoordinates(pos.coords.latitude, pos.coords.longitude);
          setMissingCoordinates(false);
          toast.success('Đã cập nhật GPS chính xác!');
          fetchDiscovery(0, true);
        } catch (err) {
          toast.error('Lỗi khi cập nhật GPS lên máy chủ');
        } finally {
          setGpsUpdating(false);
        }
      },
      () => {
        toast.error('Không thể lấy vị trí GPS từ thiết bị. Bạn có thể chọn vị trí mặc định.');
        setGpsUpdating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [fetchDiscovery]);

  // Initial load: check profile & preferences
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const profileRes = await datingService.getMe();
        const profileData = profileRes.data?.data || profileRes.data;

        if (!isMounted) return;

        if (!profileData || !profileData.displayName) {
          setSetupRequired(true);
          setLoading(false);
          return;
        }

        setMyProfile(profileData);

        // Fetch preferences
        datingService
          .getMyPreference()
          .then((res) => {
            if (isMounted) setPreferences(res.data?.data || res.data);
          })
          .catch(() => {});

        // Fetch discovery
        fetchDiscovery(0, true);
      } catch (err) {
        if (!isMounted) return;
        setSetupRequired(true);
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [fetchDiscovery]);

  // Handle Swipe Action
  const handleSwipe = async (action, targetUserId) => {
    if (!targetUserId || candidates.length === 0) return;

    const currentTop = candidates[0];
    setCandidates((prev) => prev.slice(1));
    setSwipedHistory((prev) => [currentTop, ...prev]);

    try {
      const res = await datingService.swipe(targetUserId, action);
      const swipeResult = res.data?.data || res.data;

      if (action === 'LIKE' || action === 'SUPER_LIKE') {
        const isMatch = swipeResult?.matched === true || swipeResult?.isMatch === true;
        if (isMatch) {
          setMatchedProfile(currentTop);
        }
      }
    } catch (err) {
      console.error('Error swiping user:', err);
      toast.error('Có lỗi xảy ra khi thực hiện lượt quẹt');
    }

    // Auto fetch next page when running low
    if (candidates.length <= 3) {
      fetchDiscovery(page + 1, false);
    }
  };

  // Undo Last Swipe
  const handleUndo = async () => {
    if (swipedHistory.length === 0) {
      toast('Không có lượt quẹt nào trước đó!', { icon: 'ℹ️' });
      return;
    }

    const lastSwiped = swipedHistory[0];
    const targetUserId = lastSwiped.userId || lastSwiped.id;

    try {
      await datingService.undoSwipe(targetUserId);
      setSwipedHistory((prev) => prev.slice(1));
      setCandidates((prev) => [lastSwiped, ...prev]);
      toast.success('Đã hoàn tác lượt quẹt!');
    } catch (err) {
      console.error(err);
      toast.error('Không thể hoàn tác lượt quẹt');
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedProfileForDetail || matchedProfile || isFilterOpen || reportUser) return;
      if (candidates.length === 0) return;

      const topUser = candidates[0];
      const topUserId = topUser.userId || topUser.id;

      if (e.key === 'ArrowLeft') handleSwipe('DISLIKE', topUserId);
      else if (e.key === 'ArrowRight') handleSwipe('LIKE', topUserId);
      else if (e.key === 'ArrowUp') handleSwipe('SUPER_LIKE', topUserId);
      else if (e.key === ' ') {
        e.preventDefault();
        setSelectedProfileForDetail(topUser);
      } else if (e.key === 'Backspace' || e.key === 'z') {
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [candidates, swipedHistory, selectedProfileForDetail, matchedProfile, isFilterOpen, reportUser]);

  const topUser = candidates[0];

  // ── Setup Required Screen ─────────────────────────────────────
  if (setupRequired) {
    return (
      <div className="min-h-[calc(100vh-120px)] max-w-lg mx-auto flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-[36px] p-8 sm:p-10 shadow-xl border border-gray-100 text-center space-y-6 w-full">
          {/* Icon */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-pink-500/30">
            <Flame size={48} className="fill-current animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Chào mừng bạn đến với Hẹn Hò!
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Bạn chưa thiết lập hồ sơ hẹn hò. Hãy dành 2 phút để hoàn thiện hồ sơ và bắt đầu gặp gỡ những người thú vị xung quanh!
            </p>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '💫', label: 'Quẹt thẻ', desc: 'Thích & Bỏ qua' },
              { icon: '❤️', label: 'Tương hợp', desc: 'Match tức thì' },
              { icon: '💬', label: 'Nhắn tin', desc: 'Trò chuyện ngay' },
            ].map((f, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-xs font-bold text-gray-800">{f.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dating/setup')}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl font-black shadow-lg shadow-pink-500/35 hover:shadow-xl transition transform active:scale-95 text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Thiết lập hồ sơ hẹn hò ngay
            </button>
            <p className="text-[11px] text-gray-400">Hoàn toàn miễn phí và bảo mật</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full max-w-sm sm:max-w-md mx-auto py-1 sm:py-2 px-2 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient Lighting Background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-pink-500/20 via-rose-500/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      {/* Top Header */}
      <div className="flex items-center justify-between py-1 px-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-pink-500/30">
            <Flame size={20} className="fill-current animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black gradient-dating-text leading-none tracking-tight">
              Hẹn Hò & Kết Đôi
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] font-semibold text-gray-400">
                {preferences?.maxDistance ? (
                  <span className="flex items-center gap-1">
                    <MapPin size={9} className="text-pink-400" />
                    {preferences.maxDistance} km xung quanh
                  </span>
                ) : (
                  'Khám phá đối tượng hòa hợp'
                )}
              </p>
              {candidates.length > 0 && (
                <span className="px-1.5 py-0.5 bg-pink-100 text-pink-700 text-[9px] font-bold rounded-full">
                  {candidates.length} hồ sơ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5">
          <Link
            to="/dating/matches"
            className="relative p-2 bg-white rounded-2xl shadow-xs border border-gray-100 text-gray-700 hover:text-pink-600 hover:border-pink-200 transition transform hover:scale-105 active:scale-95"
            title="Lượt thích & Tương hợp"
          >
            <Sparkles size={16} className="text-pink-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white" />
          </Link>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="p-2 bg-white rounded-2xl shadow-xs border border-gray-100 text-gray-700 hover:text-pink-600 hover:border-pink-200 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Bộ lọc tìm kiếm"
          >
            <SlidersHorizontal size={16} />
          </button>

          <button
            type="button"
            onClick={() => setShowEditDatingModal(true)}
            className="p-2 bg-white rounded-2xl shadow-xs border border-gray-100 text-gray-700 hover:text-pink-600 hover:border-pink-200 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Chỉnh sửa hồ sơ hẹn hò"
          >
            <Pencil size={16} />
          </button>

          <Link
            to="/dating/settings"
            className="p-2 bg-white rounded-2xl shadow-xs border border-gray-100 text-gray-700 hover:text-gray-900 transition transform hover:scale-105 active:scale-95"
            title="Cài đặt hồ sơ hẹn hò"
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>


      {/* MISSING COORDINATES BANNER (Auto Recovery) */}
      {missingCoordinates && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 p-3 bg-gradient-to-r from-amber-50 to-pink-50 border border-pink-200 rounded-2xl text-xs space-y-2 shadow-xs flex-shrink-0"
        >
          <div className="flex items-start gap-2">
            <Navigation size={16} className="text-pink-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 text-xs">Chưa có vị trí GPS để quét đối tượng</p>
              <p className="text-gray-600 text-[10px]">
                Hệ thống cần tọa độ của bạn để tìm người ở gần bạn nhất.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleUpdateGPS()}
              disabled={gpsUpdating}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              {gpsUpdating ? 'Đang định vị...' : '📍 Kích hoạt GPS'}
            </button>
            <button
              type="button"
              onClick={() => handleUpdateGPS(21.0285, 105.8542)}
              className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-[11px] font-semibold transition cursor-pointer"
            >
              Hà Nội
            </button>
            <button
              type="button"
              onClick={() => handleUpdateGPS(10.8231, 106.6297)}
              className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-[11px] font-semibold transition cursor-pointer"
            >
              TP.HCM
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Swipe Deck Viewport - Uses flex-1 min-h-0 to fit 100% of available height */}
      <div className="relative w-full flex-1 min-h-0 my-1 sm:my-2 flex items-center justify-center">
        {loading && candidates.length === 0 ? (
          /* Radar Scanning Animation */
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <span className="absolute w-full h-full rounded-full border-2 border-pink-400/40 animate-ping" />
              <span className="absolute w-20 h-20 rounded-full border border-pink-500/30 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/40">
                <Radio size={28} className="animate-spin text-white/90" style={{ animationDuration: '4s' }} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Đang quét tìm quanh bạn...</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tìm kiếm những hồ sơ hòa hợp nhất với bạn.
              </p>
            </div>
          </div>
        ) : candidates.length > 0 ? (
          <div className="relative w-full h-full">
            <AnimatePresence>
              {candidates
                .slice(0, 3)
                .reverse()
                .map((candidate, idx) => {
                  const isTop = idx === Math.min(candidates.length, 3) - 1;
                  return (
                    <SwipeCard
                      key={candidate.userId || candidate.id}
                      profile={candidate}
                      isTop={isTop}
                      onSwipe={handleSwipe}
                      onOpenDetail={(p) => setSelectedProfileForDetail(p)}
                      onReport={(p) => setReportUser(p)}
                    />
                  );
                })}
            </AnimatePresence>
          </div>
        ) : (
          /* No more cards empty state */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-white rounded-3xl p-6 text-center shadow-lg border border-gray-100 space-y-4 max-w-xs mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto shadow-inner">
              <Compass size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Bạn đã khám phá hết hồ sơ!</h3>
              <p className="text-[11px] text-gray-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
                Hãy mở rộng bán kính khoảng cách hoặc độ tuổi trong bộ lọc để tiếp tục gặp gỡ thêm bạn mới.
              </p>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold shadow-xs hover:shadow-md transition transform active:scale-95 text-xs cursor-pointer"
              >
                Mở rộng bộ lọc tìm kiếm
              </button>
              <button
                type="button"
                onClick={() => fetchDiscovery(0, true)}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                Làm mới danh sách
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Action Controls Bar - Compact height */}
      {candidates.length > 0 && topUser && (
        <div className="py-1 flex items-center justify-center gap-3 sm:gap-5 flex-shrink-0 z-20">
          {/* Rewind Button */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={swipedHistory.length === 0}
            className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 text-amber-500 hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Hoàn tác lượt quẹt (Z)"
          >
            <RotateCcw size={16} />
          </button>

          {/* Dislike / Pass Button */}
          <button
            type="button"
            onClick={() => handleSwipe('DISLIKE', topUser.userId || topUser.id)}
            className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-rose-500 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Bỏ qua (Phím Mũi tên Trái)"
          >
            <X size={26} strokeWidth={3} />
          </button>

          {/* Super Like Button */}
          <button
            type="button"
            onClick={() => handleSwipe('SUPER_LIKE', topUser.userId || topUser.id)}
            className="w-12 h-12 rounded-full bg-white shadow-md border-2 border-sky-400 text-sky-500 hover:bg-sky-50 flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Siêu Thích (Phím Mũi tên Lên)"
          >
            <Star size={18} className="fill-current" />
          </button>

          {/* Like Button */}
          <button
            type="button"
            onClick={() => handleSwipe('LIKE', topUser.userId || topUser.id)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-lg shadow-pink-500/40 text-white hover:from-pink-600 hover:to-rose-700 flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Thích (Phím Mũi tên Phải)"
          >
            <Heart size={26} className="fill-current" />
          </button>

          {/* Info Button */}
          <button
            type="button"
            onClick={() => setSelectedProfileForDetail(topUser)}
            className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 text-purple-600 hover:bg-purple-50 flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Xem chi tiết (Phím Space)"
          >
            <Sparkles size={16} />
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="hidden sm:flex items-center justify-center gap-3 text-[10px] text-gray-400 font-medium py-0.5 flex-shrink-0">
        <span>← Bỏ qua</span>
        <span>•</span>
        <span>↑ Siêu thích</span>
        <span>•</span>
        <span>→ Thích</span>
        <span>•</span>
        <span>Space: Xem chi tiết</span>
      </div>

      {/* Modals */}
      <DatingProfileDetailModal
        isOpen={!!selectedProfileForDetail}
        onClose={() => setSelectedProfileForDetail(null)}
        profile={selectedProfileForDetail}
        onAction={(action, id) => {
          setSelectedProfileForDetail(null);
          handleSwipe(action, id);
        }}
        onReport={(p) => setReportUser(p)}
      />

      <MatchModal
        isOpen={!!matchedProfile}
        onClose={() => setMatchedProfile(null)}
        matchProfile={matchedProfile}
      />

      <DatingFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialPreferences={preferences}
        onPreferencesUpdated={(newPref) => {
          setPreferences(newPref);
          fetchDiscovery(0, true);
        }}
      />

      <ReportModal
        isOpen={!!reportUser}
        onClose={() => setReportUser(null)}
        targetUserId={reportUser?.userId || reportUser?.id}
        targetUserName={reportUser?.displayName || reportUser?.username}
      />

      {/* ── Facebook-style Edit Dating Profile Modal ── */}
      <EditDatingProfileModal
        isOpen={showEditDatingModal}
        onClose={() => setShowEditDatingModal(false)}
        datingProfile={myProfile}
        onProfileUpdated={(updatedFields) => {
          setMyProfile((prev) => ({ ...prev, ...updatedFields }));
        }}
      />
    </div>
  );
}


