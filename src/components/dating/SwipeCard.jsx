import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart,
  X,
  Star,
  Info,
  MapPin,
  Flame,
  ShieldCheck,
  Flag,
  Sparkles,
} from 'lucide-react';

export default function SwipeCard({
  profile,
  onSwipe,
  isTop,
  onOpenDetail,
  onReport,
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const isDraggingRef = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Dynamic rotation based on horizontal drag
  const rotate = useTransform(x, [-260, 260], [-20, 20]);

  // Stamp Opacities based on swipe direction & distance
  const likeOpacity = useTransform(x, [40, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-40, -130], [0, 1]);
  const superLikeOpacity = useTransform(y, [-40, -110], [0, 1]);

  if (!profile) return null;

  const targetId = profile.userId || profile.id;
  const name =
    profile.displayName || profile.user?.username || profile.username || 'Người dùng';
  const age = profile.age;

  // Build photo array
  const buildPhotos = () => {
    if (Array.isArray(profile.photos) && profile.photos.length > 0) {
      const sorted = [...profile.photos].sort((a, b) =>
        b.isPrimary ? 1 : a.isPrimary ? -1 : 0
      );
      return sorted
        .map((p) => p.url || p.mediaUrl)
        .filter(Boolean);
    }
    const fallbacks = [profile.avatarUrl, profile.coverUrl].filter(Boolean);
    return fallbacks.length > 0
      ? fallbacks
      : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'];
  };

  const photos = buildPhotos();
  const currentPhoto = photos[photoIndex] || photos[0];
  const compatibility = profile.compatibilityScore ?? 85;

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = (_, info) => {
    // Reset drag flag after small timeout to prevent accidental photo switch click
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);

    const offsetX = info.offset.x;
    const offsetY = info.offset.y;
    const velX = info.velocity.x;
    const velY = info.velocity.y;

    if (offsetY < -110 || velY < -500) {
      onSwipe('SUPER_LIKE', targetId);
    } else if (offsetX > 110 || velX > 450) {
      onSwipe('LIKE', targetId);
    } else if (offsetX < -110 || velX < -450) {
      onSwipe('DISLIKE', targetId);
    }
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    if (photos.length > 1) {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    if (photos.length > 1) {
      setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.75}
      onDragStart={isTop ? handleDragStart : undefined}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className={`absolute inset-0 w-full h-full rounded-[36px] overflow-hidden select-none bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-white/20 origin-bottom ${
        isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none opacity-90 scale-[0.97] -translate-y-2'
      }`}
    >
      {/* Main Image */}
      <img
        src={currentPhoto}
        alt={name}
        className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-500"
      />

      {/* Dark Ambient Bottom Gradient Overlay */}
      <div className="absolute inset-0 glass-dark-overlay pointer-events-none" />

      {/* Multi-Photo Pagination Bars */}
      {photos.length > 1 && (
        <div className="absolute top-3.5 inset-x-4 flex gap-1.5 z-20 pointer-events-none">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === photoIndex
                  ? 'bg-white shadow-md shadow-white/40'
                  : 'bg-white/35 backdrop-blur-sm'
              }`}
            />
          ))}
        </div>
      )}

      {/* Left/Right Click Areas for Image Carousel */}
      {photos.length > 1 && isTop && (
        <>
          <div
            onClick={prevPhoto}
            className="absolute left-0 top-0 bottom-40 w-1/2 z-10 cursor-pointer"
            title="Ảnh trước"
          />
          <div
            onClick={nextPhoto}
            className="absolute right-0 top-0 bottom-40 w-1/2 z-10 cursor-pointer"
            title="Ảnh tiếp theo"
          />
        </>
      )}

      {/* STAMP: THÍCH (LIKE) */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-14 left-8 border-4 border-emerald-400 text-emerald-400 bg-emerald-950/70 backdrop-blur-md rounded-2xl px-5 py-1.5 font-black text-3xl sm:text-4xl uppercase tracking-wider transform -rotate-12 pointer-events-none z-30 shadow-xl shadow-emerald-500/30 flex items-center gap-2"
      >
        <Heart size={28} className="fill-current" />
        THÍCH
      </motion.div>

      {/* STAMP: BỎ QUA (NOPE) */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-14 right-8 border-4 border-rose-500 text-rose-500 bg-rose-950/70 backdrop-blur-md rounded-2xl px-5 py-1.5 font-black text-3xl sm:text-4xl uppercase tracking-wider transform rotate-12 pointer-events-none z-30 shadow-xl shadow-rose-500/30 flex items-center gap-2"
      >
        <X size={32} strokeWidth={3} />
        BỎ QUA
      </motion.div>

      {/* STAMP: SIÊU THÍCH (SUPER LIKE) */}
      <motion.div
        style={{ opacity: superLikeOpacity }}
        className="absolute bottom-40 inset-x-0 mx-auto w-fit border-4 border-sky-400 text-sky-400 bg-sky-950/80 backdrop-blur-md rounded-2xl px-6 py-2 font-black text-2xl sm:text-3xl uppercase tracking-wider pointer-events-none z-30 shadow-2xl shadow-sky-500/50 flex items-center gap-2"
      >
        <Star size={26} className="fill-current" />
        SIÊU THÍCH
      </motion.div>

      {/* Top Right Actions (Report Button) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onReport) onReport(profile);
          }}
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center transition shadow-md border border-white/10"
          title="Báo cáo tài khoản"
        >
          <Flag size={15} />
        </button>
      </div>

      {/* Bottom Profile Details */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 text-white pointer-events-none flex flex-col justify-end">
        {/* Compatibility Pill & Location */}
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs shadow-md shadow-pink-500/40 border border-white/20">
            <Flame size={13} className="fill-current animate-pulse" />
            {compatibility}% Hòa Hợp
          </span>

          {(profile.city || profile.location) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-pink-200 text-xs font-semibold border border-white/10">
              <MapPin size={12} className="text-pink-400" />
              {profile.city || profile.location}
              {profile.distanceKm !== undefined && profile.distanceKm !== null ? ` • ${Number(profile.distanceKm).toFixed(1)} km` : ''}
            </span>
          )}
        </div>

        {/* Name and Age with Info Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md truncate">
              {name}
            </h2>
            {age && (
              <span className="text-xl sm:text-2xl font-light opacity-90 drop-shadow-md">
                {age}
              </span>
            )}
            <ShieldCheck size={20} className="text-sky-400 flex-shrink-0" />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenDetail) onOpenDetail(profile);
            }}
            className="w-10 h-10 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition pointer-events-auto transform hover:scale-105 active:scale-95 flex-shrink-0 shadow-lg border border-white/30"
            title="Xem hồ sơ chi tiết"
          >
            <Info size={19} />
          </button>
        </div>

        {/* Bio snippet */}
        {profile.bio && (
          <p className="text-xs sm:text-sm text-gray-200 mt-2 line-clamp-2 leading-relaxed drop-shadow">
            {profile.bio}
          </p>
        )}

        {/* Interest tags */}
        {((profile.interests && profile.interests.length > 0) ||
          (profile.hobbies && profile.hobbies.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 mt-3 pointer-events-none">
            {(profile.interests || profile.hobbies || []).slice(0, 4).map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold"
              >
                {typeof item === 'object' ? item.name : item}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

