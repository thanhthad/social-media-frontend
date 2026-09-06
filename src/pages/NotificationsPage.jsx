import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Trash2, Bell } from 'lucide-react';
import notificationService from '../services/notificationService';
import friendshipService from '../services/friendshipService';
import { useUser } from '../contexts/UserContext';
import { timeAgo } from '../lib/utils';
import {
  getNotifIcon,
  getNotifTextColor,
  getNotifUrl,
  groupNotificationsByDay,
} from '../components/notification/notificationHelpers';
import { NotificationSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

// ── Single Notification Row ───────────────────────────────────────────────────

function NotifRow({ notif, onRead, onDelete }) {
  const navigate    = useNavigate();
  const notifId     = notif.notificationId || notif.id;
  const isRead      = notif.isRead || notif.read;
  const name        = notif.senderFullName || notif.senderUsername || 'Ai đó';
  const icon        = getNotifIcon(notif.type);
  const colorClass  = getNotifTextColor(notif.type);
  const isFriendReq = notif.type === 'FRIEND_REQUEST';

  const [friendAction, setFriendAction]   = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleClick = async () => {
    if (isFriendReq && !friendAction) return;
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
    } catch { toast.error('Không thể chấp nhận lời mời'); }
    finally { setActionLoading(false); }
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
    } catch { toast.error('Không thể từ chối lời mời'); }
    finally { setActionLoading(false); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      onClick={handleClick}
      className={`flex items-start gap-3.5 px-4 py-4 sm:px-6 group relative cursor-pointer transition-colors ${
        !isRead ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'
      }`}
    >
      {/* Avatar + type badge */}
      <div className="relative flex-shrink-0">
        {notif.senderAvatar ? (
          <img
            src={notif.senderAvatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold select-none">
            {name[0]?.toUpperCase() || '?'}
          </div>
        )}
        <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-sm ${colorClass}`}>
          {icon}
        </span>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isRead ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
          {notif.message || `${name} đã tương tác với bạn.`}
        </p>
        <p className={`text-xs mt-1 font-medium ${isRead ? 'text-slate-400' : 'text-indigo-500'}`}>
          {timeAgo(notif.createdAt)}
        </p>

        {/* Inline friend request actions */}
        {isFriendReq && !friendAction && (
          <div className="flex gap-2.5 mt-3">
            <button
              type="button"
              onClick={handleAccept}
              disabled={actionLoading}
              className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition active:scale-95 disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {actionLoading ? '…' : 'Chấp nhận'}
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={actionLoading}
              className="px-5 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-300 transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              Từ chối
            </button>
          </div>
        )}

        {isFriendReq && friendAction === 'accepted' && (
          <p className="mt-2 text-xs text-emerald-600 font-semibold">✅ Đã chấp nhận lời mời</p>
        )}
        {isFriendReq && friendAction === 'declined' && (
          <p className="mt-2 text-xs text-slate-400">Đã từ chối</p>
        )}
      </div>

      {/* Unread dot */}
      {!isRead && (
        <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5" />
      )}

      {/* Delete on hover */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(notifId); }}
        className="absolute top-4 right-4 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
        aria-label="Xoá thông báo"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]           = useState(0);
  const [hasMore, setHasMore]     = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);

  const fetchNotifications = useCallback(async (pg = 0, tab = 'all', reset = false) => {
    if (pg === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await notificationService.getNotifications(pg, 20, tab === 'unread');
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
      setHasMore(content.length === 20);
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    notificationService.getUnreadCount()
      .then((res) => setUnreadCount(Number(res.data?.data ?? 0)))
      .catch(() => {});
    fetchNotifications(0, 'all', true);
  }, []); // eslint-disable-line

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchNotifications(0, activeTab, true);
  }, [activeTab]); // eslint-disable-line

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchNotifications(page + 1, activeTab, false);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, activeTab, fetchNotifications]);

  const handleRead = async (notif) => {
    const id = notif.notificationId || notif.id;
    if (!notif.isRead && id) {
      try {
        await notificationService.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId || n.id) === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch { /* silent */ }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đọc tất cả thông báo');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDelete = async (notifId) => {
    if (!notifId) return;
    try {
      await notificationService.deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => (n.notificationId || n.id) !== notifId));
    } catch { /* silent */ }
  };

  const grouped = groupNotificationsByDay(notifications);

  return (
    <div className="max-w-2xl mx-auto pt-2 pb-24 md:pb-8 px-0 sm:px-4">
      {/* Page Header */}
      <div className="bg-white rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 shadow-card overflow-hidden">
        <div className="px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Thông báo</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">{unreadCount} chưa đọc</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <CheckCheck size={14} />
              Đọc tất cả
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pb-3">
          <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
            {[
              { key: 'all',    label: 'Tất cả' },
              { key: 'unread', label: `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition cursor-pointer ${
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
        <div className="divide-y divide-slate-100">
          {loading ? (
            <>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </>
          ) : notifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {grouped.map(({ label, items }) => (
                <div key={label}>
                  {/* Day group label */}
                  <div className="px-4 sm:px-6 py-2 bg-slate-50/80 border-y border-slate-100 sticky top-[52px] md:top-0 z-10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                  </div>
                  {items.map((notif, idx) => (
                    <NotifRow
                      key={notif.notificationId || notif.id || idx}
                      notif={notif}
                      onRead={handleRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Bell size={28} className="text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1.5">
                {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
              </h3>
              <p className="text-sm text-slate-500">
                {activeTab === 'unread'
                  ? 'Bạn đã đọc hết tất cả thông báo!'
                  : 'Khi có người tương tác với bạn, thông báo sẽ hiện ở đây.'}
              </p>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={bottomRef} className="h-4" />

          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
            </div>
          )}

          {!loading && !hasMore && notifications.length > 0 && (
            <p className="text-center py-6 text-xs text-slate-400 font-medium">
              ✦ Bạn đã xem hết thông báo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
