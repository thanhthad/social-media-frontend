import axiosClient from '../api/axiosClient';

const friendshipService = {
  // Gửi lời mời kết bạn
  sendFriendRequest: (userId) => axiosClient.post(`/friends/${userId}`),

  // Hủy lời mời kết bạn đã gửi
  cancelFriendRequest: (userId) => axiosClient.delete(`/friends/${userId}`),

  // Chấp nhận lời mời kết bạn
  acceptFriendRequest: (userId) => axiosClient.post(`/friends/${userId}/accept`),

  // Từ chối lời mời kết bạn (hoặc hủy kết bạn)
  rejectFriendRequest: (userId) => axiosClient.post(`/friends/${userId}/reject`),

  // Lấy danh sách lời mời kết bạn đang chờ (Pending) của user hiện tại
  getPendingFriendRequests: (page = 0, size = 10) =>
    axiosClient.get('/friends/requests', { params: { page, size } }),

  // Lấy danh sách gợi ý kết bạn
  getFriendSuggestions: () => axiosClient.get('/friends/suggestions'),

  // Lấy danh sách bạn chung với một người dùng
  getMutualFriends: (userId) => axiosClient.get(`/friends/${userId}/mutual-friends`),

  // Lấy danh sách bạn bè của một người dùng (phân trang)
  getFriends: (userId, page = 0, size = 10) =>
    axiosClient.get(`/friends/${userId}`, { params: { page, size } }),
};

export default friendshipService;
