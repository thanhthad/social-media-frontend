import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import useWebSocketStore from '../../stores/useWebSocketStore';
import { timeAgo } from '../../lib/utils';
import { getNotifIcon, getNotifBgColor } from './notificationHelpers';

const AUTO_DISMISS_MS = 5000;

/**
 * NotificationBanner — real-time popup at top-right corner (like Facebook).
 * Mounts globally inside AppContent. Stacks up to 3 banners.
 */
export default function NotificationBanner() {
  const [banners, setBanners] = useState([]);
  const addNotificationListener = useWebSocketStore((s) => s.addNotificationListener);
  const navigate = useNavigate();

  const dismiss = useCallback((id) => {
    setBanners((prev) => prev.filter((b) => b._bannerId !== id));
  }, []);

  useEffect(() => {
    let counter = 0;
    const unsubscribe = addNotificationListener((notif) => {
      const bannerId = ++counter;
      const banner = { ...notif, _bannerId: bannerId };

      setBanners((prev) => [...prev.slice(-2), banner]); // max 3 stacked

      // Auto-dismiss
      const timer = setTimeout(() => dismiss(bannerId), AUTO_DISMISS_MS);
      // Store timer ref on banner object — handled via cleanup
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, [addNotificationListener, dismiss]);

  const handleClick = (banner) => {
    dismiss(banner._bannerId);
    const url = banner.targetUrl || (banner.senderId ? `/users/${banner.senderId}` : '/');
    navigate(url);
  };

  return (
    <div className="fixed top-[60px] right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {banners.map((banner) => {
          const notifId = banner.notificationId || banner.id;
          const name = banner.senderFullName || banner.senderUsername || 'Ai đó';
          const icon = getNotifIcon(banner.type);
          const bgAccent = getNotifBgColor(banner.type);

          return (
            <motion.div
              key={banner._bannerId}
              layout
              initial={{ opacity: 0, x: 64, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 64, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto w-[340px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden cursor-pointer select-none"
              onClick={() => handleClick(banner)}
            >
              {/* Accent line at top */}
              <div className={`h-[3px] w-full ${bgAccent}`} />

              <div className="flex items-start gap-3 p-3.5 pr-10 relative">
                {/* Avatar + type icon */}
                <div className="relative flex-shrink-0">
                  {banner.senderAvatar ? (
                    <img
                      src={banner.senderAvatar}
                      alt={name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                      {name[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 text-base">{icon}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-800 leading-snug font-medium">
                    {banner.message || `${name} đã tương tác với bạn.`}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {timeAgo(banner.createdAt)} · Vừa xong
                  </p>
                </div>

                {/* Dismiss */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); dismiss(banner._bannerId); }}
                  className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  aria-label="Đóng"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Progress bar */}
              <motion.div
                className={`h-[2px] ${bgAccent} opacity-40`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
