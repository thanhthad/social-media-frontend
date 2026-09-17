import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCheck,
  Trash2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import notificationService from '../services/notificationService';
import useWebSocketStore from '../stores/useWebSocketStore';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.allSettled([
        notificationService.getNotifications(0, 50, activeFilter === 'unread'),
        notificationService.getUnreadCount(),
      ]);

      if (listRes.status === 'fulfilled') {
        const raw = listRes.value.data?.data?.content || listRes.value.data?.data || [];
        setNotifications(Array.isArray(raw) ? raw : []);
      }
      if (countRes.status === 'fulfilled') {
        setUnreadCount(countRes.value.data?.data || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to real-time incoming notifications from STOMP broker
  useEffect(() => {
    const unsub = useWebSocketStore.getState().addNotificationListener((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => unsub();
  }, []);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'unread', label: 'Chưa đọc', badge: unreadCount },
    { id: 'reactions', label: 'Cảm xúc' },
    { id: 'comments', label: 'Bình luận' },
    { id: 'friends', label: 'Bạn bè' },
  ];

  const filteredNotifs = notifications.filter((n) => {
    const type = n.type || '';
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'reactions') {
      return type.includes('REACTION');
    }
    if (activeFilter === 'comments') {
      return type.includes('COMMENT');
    }
    if (activeFilter === 'friends') {
      return type.includes('FRIEND') || type === 'FOLLOW';
    }
    return true;
  });

  const getNotifIcon = (type = '') => {
    if (type.includes('REACTION')) {
      return <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />;
    }
    if (type.includes('COMMENT')) {
      return <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />;
    }
    if (type.includes('FRIEND') || type === 'FOLLOW') {
      return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (e) {
      toast.error('Không thể đánh dấu đọc tất cả');
    }
  };

  const handleItemClick = async (notif) => {
    const nId = notif.notificationId || notif.id;
    if (!notif.isRead && nId) {
      try {
        await notificationService.markAsRead(nId);
        setNotifications((prev) =>
          prev.map((n) =>
            (n.notificationId || n.id) === nId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }

    // Navigate to targetUrl or entity
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    } else if (notif.entityType === 'POST' && notif.entityId) {
      navigate(`/posts/${notif.entityId}`);
    } else if (notif.senderId) {
      navigate(`/profile/${notif.senderId}`);
    }
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notifId);
      setNotifications((prev) =>
        prev.filter((n) => (n.notificationId || n.id) !== notifId)
      );
      toast.success('Đã xóa thông báo');
    } catch (e) {
      toast.error('Không thể xóa thông báo');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs mb-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Thông báo
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cập nhật hoạt động mới nhất liên quan đến bạn
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={CheckCheck}
              onClick={handleMarkAll}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeFilter}
          onChange={setActiveFilter}
          variant="pills"
        />
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Đang tải thông báo...
          </div>
        ) : filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => {
            const notifId = notif.notificationId || notif.id;
            const senderName =
              notif.senderFullName || notif.senderUsername || 'Người dùng';
            const avatar =
              notif.senderAvatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
            const content = notif.message || 'Bạn có thông báo mới';
            const timeStr = notif.createdAt
              ? new Date(notif.createdAt).toLocaleString('vi-VN', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })
              : '';

            return (
              <div
                key={notifId}
                onClick={() => handleItemClick(notif)}
                className={`flex items-center justify-between gap-4 p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group ${
                  !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Avatar with type badge */}
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      src={avatar}
                      alt={senderName}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
                      {getNotifIcon(notif.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {senderName}
                      </span>{' '}
                      {content}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {timeStr}
                    </span>
                  </div>
                </div>

                {/* Right side actions & unread dot */}
                <div className="flex items-center gap-2 shrink-0">
                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, notifId)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    title="Xóa thông báo này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 stroke-[1.5] text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Không có thông báo nào
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Bạn đã xem hết tất cả thông báo
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
