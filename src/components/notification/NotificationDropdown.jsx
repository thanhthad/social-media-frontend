import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, X, ChevronRight } from 'lucide-react';
import notificationService from '../../services/notificationService';
import friendshipService from '../../services/friendshipService';
import useWebSocketStore from '../../stores/useWebSocketStore';
import { timeAgo } from '../../lib/utils';
import {
  getNotifIcon,
  getNotifTextColor,
  getNotifUrl,
} from './notificationHelpers';
import toast from 'react-hot-toast';

// ── Notification Item Component ──────────────────────────────────────────────

function NotifItem({ notif, onRead, onDelete }) {
  const navigate   = useNavigate();
  const notifId    = notif.notificationId || notif.id;
  const isRead     = notif.isRead || notif.read;
  const name       = notif.senderFullName || notif.senderUsername || 'Ai đó';
  const icon       = getNotifIcon(notif.type);
  const colorClass = getNotifTextColor(notif.type);
  const isFriendReq = notif.type === 'FRIEND_REQUEST';

  const [friendAction, setFriendAction] = useState(null); // null | 'accepted' | 'declined'
  const [actionLoading, setActionLoading] = useState(false);

  const handleClick = async () => {
    await onRead(notif);
    navigate(getNotifUrl(notif));
  };

  const handleAccept = async (e) => {
    e.stopPropagation();
    if (actionLoading || friendAction) return;
    setActionLoading(true);
    try {
      await friendshipService.acceptFriendRequest(notif.senderId);
      setFriendAction('accepted');
      toast.success(`Đã chấp nhận lời mời từ ${name}`);
      await onRead(notif);
    } catch {
      toast.error('Không thể chấp nhận lời mời');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (e) => {
    e.stopPropagation();
    if (actionLoading || friendAction) return;
    setActionLoading(true);
    try {
      await friendshipService.rejectFriendRequest(notif.senderId);
      setFriendAction('declined');
      toast('Đã từ chối lời mời kết bạn', { icon: '👋' });
      await onRead(notif);
    } catch {
      toast.error('Không thể từ chối lời mời');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      onClick={!isFriendReq || friendAction ? handleClick : undefined}
      className={`flex items-start gap-3 px-4 py-3 group relative transition-colors ${
        !isRead ? 'bg-indigo-50/60 hover:bg-indigo-50' : 'hover:bg-slate-50'
      } ${(!isFriendReq || friendAction) ? 'cursor-pointer' : ''}`}
    >
      {/* Avatar + type icon badge */}
      <div className="relative flex-shrink-0">
        {notif.senderAvatar ? (
          <img
            src={notif.senderAvatar}
            alt={name}
            className="w-11 h-11 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold select-none">
            {name[0]?.toUpperCase() || '?'}
          </div>
        )}
        {/* Type icon badge */}
        <span
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] border-2 border-white ${colorClass}`}
        >
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p className={`text-xs leading-snug ${isRead ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
          {notif.message || `${name} đã tương tác với bạn.`}
        </p>
        <p className={`text-[11px] mt-0.5 font-medium ${isRead ? 'text-slate-400' : 'text-indigo-500'}`}>
          {timeAgo(notif.createdAt)}
        </p>

        {/* Inline Friend Request Actions */}
        {isFriendReq && !friendAction && (
          <div className="flex gap-2 mt-2.5">
            <button
              type="button"
              onClick={handleAccept}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {actionLoading ? '…' : 'Chấp nhận'}
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              Từ chối
            </button>
          </div>
        )}

        {/* Action feedback */}
        {isFriendReq && friendAction === 'accepted' && (
          <p className="mt-2 text-[11px] text-emerald-600 font-semibold">✅ Đã chấp nhận</p>
        )}
        {isFriendReq && friendAction === 'declined' && (
          <p className="mt-2 text-[11px] text-slate-400 font-medium">Đã từ chối</p>
        )}
      </div>

      {/* Unread dot */}
      {!isRead && (
        <span className="absolute top-4 right-9 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
      )}

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(notifId); }}
        className="absolute top-3 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        aria-label="Xoá"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── Main Dropdown ─────────────────────────────────────────────────────────────

export default function NotificationDropdown({ isSidebar = false }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]               = useState(0);
  const [hasMore, setHasMore]         = useState(true);
  const [activeTab, setActiveTab]     = useState('all'); // 'all' | 'unread'
  const dropdownRef  = useRef(null);
  const listRef      = useRef(null);
  const navigate     = useNavigate();

  const wsNotifications = useWebSocketStore((s) => s.notifications);
  const unreadCount     = useWebSocketStore((s) => s.unreadNotifCount);
  const setUnreadCount  = useWebSocketStore((s) => s.setUnreadNotifCount);
  const decrementUnread = useWebSocketStore((s) => s.decrementUnreadNotifCount);

  // Fetch unread count on mount
  useEffect(() => {
    notificationService
      .getUnreadCount()
      .then((res) => { const c = res.data?.data ?? res.data ?? 0; setUnreadCount(Number(c)); })
      .catch(() => {});
  }, [setUnreadCount]);

  // Merge new WS notifications
  useEffect(() => {
    if (!wsNotifications?.length) return;
    setNotifications((prev) => {
      const ids = new Set(prev.map((n) => n.notificationId || n.id));
      const fresh = wsNotifications.filter((n) => !ids.has(n.notificationId || n.id));
      return [...fresh, ...prev];
    });
  }, [wsNotifications]);

  // Fetch when opening
  const fetchNotifications = useCallback(async (pg = 0, tab = activeTab, reset = false) => {
    const unreadOnly = tab === 'unread';
    if (pg === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await notificationService.getNotifications(pg, 15, unreadOnly);
      const content = res.data?.data?.content || res.data?.data || [];
      if (reset || pg === 0) {
        setNotifications(content);
      } else {
        setNotifications((prev) => {
          const ids = new Set(prev.map((n) => n.notificationId || n.id));
          return [...prev, ...content.filter((n) => !ids.has(n.notificationId || n.id))];
        });
      }
      setPage(pg);
      setHasMore(content.length === 15);
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(0, activeTab, true);
    }
  }, [isOpen, activeTab, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 60 && hasMore && !loadingMore && !loading) {
      fetchNotifications(page + 1, activeTab, false);
    }
  };

  const handleRead = async (notif) => {
    const id = notif.notificationId || notif.id;
    if (!notif.isRead && id) {
      try {
        await notificationService.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId || n.id) === id ? { ...n, isRead: true } : n)
        );
        decrementUnread();
      } catch { /* silent */ }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const handleDelete = async (notifId) => {
    if (!notifId) return;
    try {
      await notificationService.deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => (n.notificationId || n.id) !== notifId));
    } catch { /* silent */ }
  };

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(0);
    setHasMore(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button / Sidebar trigger */}
      {isSidebar ? (
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition font-medium cursor-pointer ${
            isOpen
              ? 'bg-indigo-50 text-indigo-600 font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          aria-label="Thông báo"
        >
          <div className="relative flex items-center justify-center flex-shrink-0">
            <Bell size={22} className="stroke-[1.75]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className="hidden xl:block text-sm leading-none">Thông báo</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`relative w-8 h-8 flex items-center justify-center rounded-full transition ${
            isOpen
              ? 'bg-indigo-100 text-indigo-600'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          aria-label="Thông báo"
        >
          <Bell size={19} strokeWidth={1.9} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isSidebar ? 0 : 8, x: isSidebar ? -8 : 0, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: isSidebar ? 0 : 8, x: isSidebar ? -8 : 0, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={
              isSidebar
                ? 'absolute left-full top-0 ml-3 w-[360px] sm:w-[380px] bg-white rounded-2xl shadow-dropdown border border-slate-200 z-50 overflow-hidden'
                : 'fixed top-[56px] left-3 right-3 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-[380px] bg-white rounded-2xl shadow-dropdown border border-slate-200 z-50 overflow-hidden'
            }
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-base">Thông báo</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <CheckCheck size={13} />
                    Đọc tất cả
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
                {[
                  { key: 'all',    label: 'Tất cả' },
                  { key: 'unread', label: `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => switchTab(tab.key)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-[10px] transition cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification List */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar"
            >
              {loading ? (
                // Skeleton loading
                <div className="divide-y divide-slate-100">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-start gap-3 px-4 py-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-1.5 pt-1">
                        <div className="h-3 bg-slate-200 rounded w-4/5 animate-pulse" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <>
                  {notifications.map((notif, idx) => (
                    <NotifItem
                      key={notif.notificationId || notif.id || idx}
                      notif={notif}
                      onRead={handleRead}
                      onDelete={handleDelete}
                    />
                  ))}
                  {loadingMore && (
                    <div className="flex justify-center py-3">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
                    </div>
                  )}
                  {!hasMore && (
                    <p className="text-center py-4 text-[11px] text-slate-400">
                      Bạn đã xem hết thông báo
                    </p>
                  )}
                </>
              ) : (
                <div className="py-14 flex flex-col items-center gap-2 text-center px-6">
                  <span className="text-3xl">🔔</span>
                  <p className="font-semibold text-slate-700 text-sm">
                    {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {activeTab === 'unread'
                      ? 'Bạn đã đọc hết rồi!'
                      : 'Khi có người tương tác với bạn, thông báo sẽ xuất hiện ở đây.'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer link */}
            <div className="border-t border-slate-100 px-4 py-2.5">
              <button
                type="button"
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-2 rounded-xl transition cursor-pointer"
              >
                Xem tất cả thông báo
                <ChevronRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
