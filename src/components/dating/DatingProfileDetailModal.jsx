import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Flag,
  Flame,
  Music,
  Coffee,
  Compass,
} from 'lucide-react';
import datingService from '../../services/datingService';

// Helper for zodiac sign
function getZodiacSign(dateString) {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'Bạch Dương ♈', trait: 'Nhiệt huyết' };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'Kim Ngưu ♉', trait: 'Chân thành' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return { name: 'Song Tử ♊', trait: 'Thông minh' };
    if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return { name: 'Cự Giải ♋', trait: 'Tình cảm' };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'Sư Tử ♌', trait: 'Tự tin' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'Xử Nữ ♍', trait: 'Chu đáo' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return { name: 'Thiên Bình ♎', trait: 'Hòa nhã' };
    if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return { name: 'Bọ Cạp ♏', trait: 'Bí ẩn' };
    if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return { name: 'Nhân Mã ♐', trait: 'Phóng khoáng' };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'Ma Kết ♑', trait: 'Kiên trì' };
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'Bảo Bình ♒', trait: 'Sáng tạo' };
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: 'Song Ngư ♓', trait: 'Lãng mạn' };
  } catch (e) {
    return null;
  }
  return null;
}

export default function DatingProfileDetailModal({
  isOpen,
  onClose,
  profile,
  onAction,
  onReport,
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  const targetUserId = profile?.userId || profile?.id;

  useEffect(() => {
    if (isOpen && targetUserId) {
      setActivePhotoIdx(0);
      setLoading(true);
      datingService
        .getPublicProfile(targetUserId)
        .then((res) => {
          setDetailData(res.data?.data || res.data || profile);
        })
        .catch(() => {
          setDetailData(profile);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, targetUserId, profile]);

  if (!isOpen || !profile) return null;

  const data = detailData || profile;
  const name = data.displayName || data.username || profile.displayName || 'Người dùng';
  const age = data.age || profile.age;

  // Build full photo list
  const buildPhotoList = () => {
    const list = [];
    if (Array.isArray(data.photos) && data.photos.length > 0) {
      const sorted = [...data.photos].sort((a, b) => (b.isPrimary ? 1 : a.isPrimary ? -1 : 0));
      return sorted.map((p) => p.url || p.mediaUrl).filter(Boolean);
    }
    if (Array.isArray(profile.photos) && profile.photos.length > 0) {
      const sorted = [...profile.photos].sort((a, b) => (b.isPrimary ? 1 : a.isPrimary ? -1 : 0));
      return sorted.map((p) => p.url || p.mediaUrl).filter(Boolean);
    }
    const fallbacks = [data.avatarUrl, data.coverUrl, profile.avatarUrl, profile.coverUrl].filter(Boolean);
    return fallbacks.length > 0
      ? fallbacks
      : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'];
  };

  const photoList = buildPhotoList();
  const avatar = photoList[0];
  const zodiac = getZodiacSign(data.birthday || data.dateOfBirth);
  const compatibility = profile.compatibilityScore ?? 88;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-white/20 relative text-gray-900"
        >
          {/* Floating close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition transform hover:scale-105 active:scale-95"
            title="Đóng"
          >
            <X size={20} />
          </button>

          {/* Scrollable container */}
          <div className="flex-1 overflow-y-auto dating-scrollbar pb-28">
            {/* Photo Hero Area */}
            <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden">
              <img
                src={photoList[activePhotoIdx] || avatar}
                alt={name}
                className="w-full h-full object-cover select-none"
              />

              {/* Photo Pagination Bars */}
              {photoList.length > 1 && (
                <div className="absolute top-3 inset-x-4 flex gap-1.5 z-20">
                  {photoList.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all duration-300 ${
                        idx === activePhotoIdx
                          ? 'bg-white shadow-md'
                          : 'bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Left/Right touch zones */}
              {photoList.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhotoIdx((prev) =>
                        prev > 0 ? prev - 1 : photoList.length - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 rounded-full text-white/80 transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setActivePhotoIdx((prev) =>
                        prev < photoList.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 rounded-full text-white/80 transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Gradient Bottom Banner with Name & Compatibility */}
              <div className="absolute inset-x-0 bottom-0 p-6 glass-dark-overlay text-white">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h1 className="text-3xl font-black tracking-tight">{name}</h1>
                  {age && <span className="text-2xl font-normal opacity-90">{age}</span>}
                  <span className="p-1 bg-blue-500 rounded-full text-white inline-flex" title="Đã xác thực">
                    <ShieldCheck size={14} />
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-pink-200">
                  {(data.city || data.location) && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-pink-400" />
                      {data.city || data.location}
                      {data.distanceKm !== undefined && ` (${data.distanceKm} km)`}
                    </span>
                  )}
                  {zodiac && (
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-white">
                      {zodiac.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details Content */}
            <div className="p-6 space-y-6">
              {/* Compatibility Match Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 border border-pink-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-pink-500/30">
                    <Flame size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      Độ hòa hợp: {compatibility}%
                      <Sparkles size={14} className="text-amber-500" />
                    </h4>
                    <p className="text-xs text-gray-500">
                      Hai bạn có nhiều sở thích và lối sống tương đồng!
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {data.bio && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Về bản thân
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-normal bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-line">
                    {data.bio}
                  </p>
                </div>
              )}

              {/* Lifestyle & Basics Pills */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Thông tin cơ bản
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.height && (
                    <span className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition">
                      📏 Chiều cao: <strong>{data.height} cm</strong>
                    </span>
                  )}
                  {data.occupation && (
                    <span className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition">
                      <Briefcase size={14} className="text-pink-500" />
                      {data.occupation}
                    </span>
                  )}
                  {data.education && (
                    <span className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition">
                      <GraduationCap size={14} className="text-indigo-500" />
                      {data.education}
                    </span>
                  )}
                  {zodiac && (
                    <span className="px-3.5 py-2 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      ✨ {zodiac.name} ({zodiac.trait})
                    </span>
                  )}
                </div>
              </div>

              {/* Interests & Hobbies Tags */}
              {((profile.interests && profile.interests.length > 0) ||
                (data.interests && data.interests.length > 0)) && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Sở thích & Đam mê
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(profile.interests || data.interests || []).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-pink-700 rounded-full text-xs font-bold shadow-sm"
                      >
                        {typeof item === 'object' ? item.name : item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Action Button */}
              <div className="pt-4 border-t border-gray-100 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onReport) onReport(data);
                  }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition font-semibold"
                >
                  <Flag size={13} />
                  Báo cáo tài khoản này
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-center items-center gap-6 z-30 shadow-lg">
            <button
              onClick={() => {
                onClose();
                if (onAction) onAction('DISLIKE', targetUserId);
              }}
              className="w-14 h-14 bg-white rounded-full shadow-lg border-2 border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center transition transform hover:scale-110 active:scale-95"
              title="Bỏ qua"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <button
              onClick={() => {
                onClose();
                if (onAction) onAction('SUPER_LIKE', targetUserId);
              }}
              className="w-12 h-12 bg-white rounded-full shadow-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center justify-center transition transform hover:scale-110 active:scale-95"
              title="Super Like"
            >
              <Star size={20} className="fill-current" />
            </button>

            <button
              onClick={() => {
                onClose();
                if (onAction) onAction('LIKE', targetUserId);
              }}
              className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full shadow-xl text-white hover:from-pink-600 hover:to-rose-700 flex items-center justify-center transition transform hover:scale-110 active:scale-95 shadow-pink-500/40"
              title="Thích"
            >
              <Heart size={28} className="fill-current" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
