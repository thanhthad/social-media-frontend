import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Star,
  Sparkles,
  SlidersHorizontal,
  User,
  Flame,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import datingService from '../services/datingService';
import SwipeCard from '../components/dating/SwipeCard';
import DatingFilterDrawer from '../components/dating/DatingFilterDrawer';
import DatingProfileDetailModal from '../components/dating/DatingProfileDetailModal';
import MatchModal from '../components/dating/MatchModal';
import ReportModal from '../components/dating/ReportModal';

export const DatingPage = () => {
  const navigate = useNavigate();

  // Profile check
  const [hasProfile, setHasProfile] = useState(null); // null = checking, true, false
  const [myProfile, setMyProfile] = useState(null);
  const [myPreferences, setMyPreferences] = useState(null);

  // Discovery state
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [lastSwipedUserId, setLastSwipedUserId] = useState(null);

  // Modals & Drawers
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [detailProfile, setDetailProfile] = useState(null);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [reportingUser, setReportingUser] = useState(null);

  // 1. Check if current user has a dating profile
  const checkMyProfile = useCallback(async () => {
    try {
      const res = await datingService.getMe();
      const profile = res?.data || res;
      if (profile && (profile.userId || profile.id)) {
        setMyProfile(profile);
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      setHasProfile(false);
    }
  }, []);

  useEffect(() => {
    checkMyProfile();
  }, [checkMyProfile]);

  // 2. Fetch Discovery Candidates
  const fetchDiscovery = useCallback(async () => {
    if (!hasProfile) return;
    setLoadingCandidates(true);
    try {
      const res = await datingService.getDiscovery(0, 20);
      const data = res?.data?.content || res?.data || [];
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load discovery candidates', err);
      toast.error('Không thể tải danh sách gợi ý hẹn hò');
    } finally {
      setLoadingCandidates(false);
    }
  }, [hasProfile]);

  useEffect(() => {
    if (hasProfile) {
      fetchDiscovery();
      datingService
        .getMyPreference()
        .then((res) => setMyPreferences(res?.data || res))
        .catch(() => {});
    }
  }, [hasProfile, fetchDiscovery]);

  // 3. Handle Swipe
  const handleSwipe = async (targetUserId, action) => {
    if (!targetUserId) return;

    // Optimistic remove top candidate
    const swipedCandidate = candidates.find(
      (c) => (c.userId || c.id) === targetUserId
    );
    setCandidates((prev) =>
      prev.filter((c) => (c.userId || c.id) !== targetUserId)
    );
    setLastSwipedUserId(targetUserId);

    try {
      const res = await datingService.swipe(targetUserId, action);
      const swipeData = res?.data || res;

      if (swipeData?.matched) {
        setMatchedProfile({
          ...swipedCandidate,
          matchId: swipeData.matchId,
        });
      } else if (action === 'LIKE') {
        toast('Đã thích hồ sơ', { icon: '❤️' });
      }
    } catch (err) {
      console.error('Swipe error', err);
    }
  };

  // 4. Handle Rewind / Undo
  const handleRewind = async () => {
    if (!lastSwipedUserId) {
      toast('Không có lượt quẹt nào để hoàn tác gần đây');
      return;
    }
    try {
      await datingService.undoSwipe(lastSwipedUserId);
      toast.success('Đã hoàn tác lượt quẹt gần nhất');
      setLastSwipedUserId(null);
      fetchDiscovery();
    } catch (err) {
      toast.error('Không thể hoàn tác');
    }
  };

  // If still checking profile
  if (hasProfile === null) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // If user does not have a dating profile yet
  if (hasProfile === false) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4 select-none">
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-lg ring-4 ring-white/30">
            <Heart className="w-10 h-10 fill-white text-white" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
            Social Hẹn hò
          </span>

          <h2 className="text-2xl sm:text-3xl font-black mt-4 mb-3">
            Bắt đầu hành trình tìm kiếm một nửa của bạn
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-md mx-auto leading-relaxed mb-8">
            Tạo hồ sơ hẹn hò của riêng bạn để gặp gỡ những người có cùng sở thích, phong cách sống và tư duy đồng điệu.
          </p>

          <Link
            to="/dating/setup"
            className="inline-flex items-center gap-2 bg-white text-rose-600 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:bg-rose-50 transition active:scale-95"
          >
            <span>Tạo hồ sơ ngay</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const currentCandidate = candidates[0];

  return (
    <div className="w-full max-w-4xl mx-auto py-2 select-none">
      {/* Dating Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Hẹn hò
              <span className="text-xs font-normal text-slate-400">
                ({candidates.length} gợi ý)
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Quẹt phải để thích, quẹt trái để bỏ qua
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Filter */}
        <div className="flex items-center gap-2">
          <Link
            to="/dating/matches"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Tương hợp</span>
          </Link>

          <Link
            to="/dating/settings"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>Hồ sơ của tôi</span>
          </Link>

          <button
            onClick={() => setShowFilterDrawer(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            title="Bộ lọc tìm kiếm"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipe Area */}
      <div className="relative flex flex-col items-center justify-center min-h-[580px]">
        {loadingCandidates ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin text-rose-500 mb-3" />
            <p className="text-sm font-semibold">Đang tìm kiếm đối tượng phù hợp...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center max-w-md shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Đã hết người phù hợp!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Bạn đã xem hết các gợi ý hiện có trong khu vực. Hãy thử mở rộng khoảng cách hoặc độ tuổi trong bộ lọc để khám phá thêm.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={fetchDiscovery}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tải lại
              </button>
              <button
                onClick={() => setShowFilterDrawer(true)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-500/20"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Mở rộng bộ lọc
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[360px] sm:max-w-[400px] h-[580px] flex flex-col items-center">
            {/* Cards Stack */}
            <div className="relative w-full h-[500px]">
              {candidates.slice(0, 2).map((candidate, idx) => {
                const cId = candidate.userId || candidate.id;
                return (
                  <SwipeCard
                    key={cId}
                    profile={candidate}
                    isTop={idx === 0}
                    onSwipe={handleSwipe}
                    onOpenDetail={(p) => setDetailProfile(p)}
                    onReport={(p) => setReportingUser(p)}
                  />
                );
              })}
            </div>

            {/* Bottom Action Controls */}
            {currentCandidate && (
              <div className="flex items-center justify-center gap-4 mt-4 z-20">
                {/* Rewind */}
                <button
                  type="button"
                  onClick={handleRewind}
                  disabled={!lastSwipedUserId}
                  className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition flex items-center justify-center active:scale-95"
                  title="Hoàn tác lượt quẹt"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Pass (Dislike) */}
                <button
                  type="button"
                  onClick={() =>
                    handleSwipe(
                      currentCandidate.userId || currentCandidate.id,
                      'DISLIKE'
                    )
                  }
                  className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 shadow-lg transition flex items-center justify-center active:scale-90"
                  title="Bỏ qua"
                >
                  <X className="w-7 h-7 stroke-[2.5]" />
                </button>

                {/* Like */}
                <button
                  type="button"
                  onClick={() =>
                    handleSwipe(
                      currentCandidate.userId || currentCandidate.id,
                      'LIKE'
                    )
                  }
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-90 transition flex items-center justify-center"
                  title="Thích"
                >
                  <Heart className="w-7 h-7 fill-current stroke-none" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <DatingFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        initialPreferences={myPreferences}
        onPreferencesUpdated={() => {
          fetchDiscovery();
        }}
      />

      {/* Profile Detail Modal */}
      {detailProfile && (
        <DatingProfileDetailModal
          isOpen={!!detailProfile}
          onClose={() => setDetailProfile(null)}
          profile={detailProfile}
          onSwipe={(targetId, action) => {
            setDetailProfile(null);
            handleSwipe(targetId, action);
          }}
        />
      )}

      {/* Match Modal */}
      {matchedProfile && (
        <MatchModal
          isOpen={!!matchedProfile}
          onClose={() => setMatchedProfile(null)}
          match={matchedProfile}
          onStartChat={(convId) => {
            setMatchedProfile(null);
            navigate('/messages');
          }}
        />
      )}

      {/* Report Modal */}
      {reportingUser && (
        <ReportModal
          isOpen={!!reportingUser}
          onClose={() => setReportingUser(null)}
          reportedUserId={reportingUser.userId || reportingUser.id}
          reportedUserName={reportingUser.displayName || reportingUser.username}
        />
      )}
    </div>
  );
};

export default DatingPage;
