import axiosClient from '../api/axiosClient';

const notificationService = {
  /**
   * Get paginated notifications.
   * @param {number} page
   * @param {number} size
   * @param {boolean} unreadOnly - filter to only unread notifications
   */
  getNotifications: (page = 0, size = 20, unreadOnly = false) =>
    axiosClient.get('/notifications', { params: { page, size, unreadOnly } }),

  getUnreadCount: () => axiosClient.get('/notifications/unread-count'),

  markAsRead: (notificationId) =>
    axiosClient.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: () => axiosClient.patch('/notifications/read-all'),

  deleteNotification: (notificationId) =>
    axiosClient.delete(`/notifications/${notificationId}`),
};

export default notificationService;
