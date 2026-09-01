import axiosClient from '../api/axiosClient';

const notificationService = {
  getNotifications: (page = 0, size = 10) =>
    axiosClient.get('/notifications', { params: { page, size } }),

  getUnreadCount: () => axiosClient.get('/notifications/unread-count'),

  markAsRead: (notificationId) =>
    axiosClient.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: () => axiosClient.patch('/notifications/read-all'),

  deleteNotification: (notificationId) =>
    axiosClient.delete(`/notifications/${notificationId}`),
};

export default notificationService;
