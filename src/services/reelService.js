import axiosClient from '../api/axiosClient';

const reelService = {
  // Feed (bạn bè + chính mình)
  getReelFeed: (page = 0, size = 10) =>
    axiosClient.get('/reels/feed', {
      params: { page, size },
    }),

  // Explore (khám phá xu hướng / hot score)
  getReelExplore: (page = 0, size = 10) =>
    axiosClient.get('/reels/explore', {
      params: { page, size },
    }),

  // Reels của tôi
  getMyReels: (page = 0, size = 10) =>
    axiosClient.get('/reels', {
      params: { page, size },
    }),

  // Reels của một người dùng cụ thể
  getUserReels: (userId, page = 0, size = 10) =>
    axiosClient.get(`/reels/user/${userId}`, {
      params: { page, size },
    }),

  // Lấy chi tiết 1 reel
  getReelById: (reelId) =>
    axiosClient.get(`/reels/${reelId}`),

  // Tạo reel mới (multipart/form-data: video, thumbnail, content, visibility)
  createReel: (formData, onUploadProgress) =>
    axiosClient.post('/reels', formData, {
      onUploadProgress,
    }),

  // Cập nhật nội dung reel
  updateReel: (reelId, data) =>
    axiosClient.patch(`/reels/${reelId}`, data),

  // Xóa reel
  deleteReel: (reelId) =>
    axiosClient.delete(`/reels/${reelId}`),

  // Thả tim / Bỏ tim Reel
  loveReel: (reelId) =>
    axiosClient.post(`/posts/${reelId}/reel/reaction`),

  // Theo dõi lượt xem: Bắt đầu xem
  startView: (reelId) =>
    axiosClient.post(`/reels/${reelId}/view`),

  // Theo dõi lượt xem: Cập nhật tiến độ
  updateProgress: (reelId, watchDurationMs, completed = false) =>
    axiosClient.patch(`/reels/${reelId}/view`, {
      watchDurationMs,
      completed,
    }),

  // Theo dõi lượt xem: Xem lại (Loop/Replay)
  replay: (reelId) =>
    axiosClient.post(`/reels/${reelId}/view/replay`),

  // Tăng lượt chia sẻ
  incrementShare: (reelId) =>
    axiosClient.post(`/reels/${reelId}/share`),
};

export default reelService;
