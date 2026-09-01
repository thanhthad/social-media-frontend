import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import useWebSocketStore from '../../stores/useWebSocketStore';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';

const getNotificationText = (notif) => {
  const name = notif.senderUsername || 'Một người dùng';
  switch (notif.type) {
    case 'POST_REACTION':
      return `${name} đã bày tỏ cảm xúc về bài viết của bạn.`;
    case 'POST_COMMENT':
    case 'COMMENT':
      return `${name} đã bình luận về bài viết của bạn.`;
    case 'COMMENT_REPLY':
      return `${name} đã trả lời bình luận của bạn.`;
    case 'COMMENT_REACTION':
      return `${name} đã thích bình luận của bạn.`;
    case 'FRIEND_REQUEST':
      return `${name} đã gửi lời mời kết bạn cho bạn.`;
    case 'FRIEND_ACCEPTED':
      return `${name} đã chấp nhận lời mời kết bạn.`;
    case 'FOLLOW':
      return `${name} đã bắt đầu theo dõi bạn.`;
    default:
      return notif.content || `${name} đã tương tác với bạn.`;
  }
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const wsNotifications = useWebSocketStore((state) => state.notifications);
  const unreadCount = useWebSocketStore((state) => state.unreadNotifCount);
  const setUnreadCount = useWebSocketStore((state) => state.setUnreadNotifCount);
  const decrementUnreadCount = useWebSocketStore((state) => state.decrementUnreadNotifCount);

  // Fetch unread count on mount
  useEffect(() => {
    notificationService
      .getUnreadCount()
      .then((res) => {
        const count = res.data?.data ?? res.data ?? 0;
        setUnreadCount(Number(count));
      })
      .catch((err) => console.error('Failed to fetch unread count', err));
  }, [setUnreadCount]);

  // Sync WebSocket notifications
  useEffect(() => {
    if (wsNotifications && wsNotifications.length > 0) {
      setNotifications((prev) => {
        const newOnes = wsNotifications.filter(
          (wn) => !prev.some((p) => (p.notificationId || p.id) === (wn.notificationId || wn.id))
        );
        return [...newOnes, ...prev];
      });
    }
  }, [wsNotifications]);

  // Fetch notifications list when opening dropdown
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationService
        .getNotifications(0, 20)
        .then((res) => {
          const data = res.data?.data?.content || res.data?.data || [];
          setNotifications(data);
        })
        .catch((err) => console.error('Failed to fetch notifications', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notif) => {
    const id = notif.notificationId || notif.id;
    if (!notif.isRead && id) {
      try {
        await notificationService.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) =>
            (n.notificationId || n.id) === id ? { ...n, isRead: true } : n
          )
        );
        decrementUnreadCount();
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }

    // Navigate to target
    setIsOpen(false);
    if (notif.entityType === 'POST' && notif.entityId) {
      navigate(`/posts/${notif.entityId}`);
    } else if (notif.type === 'FRIEND_REQUEST' || notif.type === 'FRIEND_ACCEPTED') {
      navigate('/friends');
    } else if (notif.senderId) {
      navigate(`/users/${notif.senderId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDeleteNotif = async (e, notifId) => {
    e.stopPropagation();
    if (!notifId) return;
    try {
      await notificationService.deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => (n.notificationId || n.id) !== notifId));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (diffInSeconds < 60) return 'Vừa xong';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-105"
        title="Thông báo"
      >
        <Bell className="w-[22px] h-[22px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <CheckCheck size={14} />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {loading && notifications.length === 0 ? (
              <div className="py-10 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif, idx) => {
                const notifId = notif.notificationId || notif.id;
                const isRead = notif.isRead || notif.read;
                return (
                  <div
                    key={notifId || idx}
                    onClick={() => handleMarkAsRead(notif)}
                    className={`flex items-start gap-3 p-3.5 hover:bg-gray-50/80 cursor-pointer transition group relative ${
                      !isRead ? 'bg-blue-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={notif.senderAvatar || 'https://via.placeholder.com/40'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                      />
                      {!isRead && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs text-gray-800 leading-snug">
                        {getNotificationText(notif)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotif(e, notifId)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded-md transition absolute top-3 right-2"
                      title="Xoá thông báo"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-xs text-gray-400">
                Chưa có thông báo nào.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
