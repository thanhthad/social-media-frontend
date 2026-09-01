import axiosClient from '../api/axiosClient';

const storyService = {
  // Tạo story mới (file đa phương tiện, caption, visibility, musicUrl, duration)
  createStory: (formData) =>
    axiosClient.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Lấy danh sách feed story của bạn bè / công khai
  getFeed: () => axiosClient.get('/stories/feed'),

  // Lấy danh sách story của chính mình
  getMyStories: () => axiosClient.get('/stories/me'),

  // Lấy danh sách story của một người dùng cụ thể
  getUserStories: (userId) => axiosClient.get(`/stories/user/${userId}`),

  // Lấy danh sách story của người dùng trước khi hết hạn
  getUserStoriesBeforeExpire: (userId) =>
    axiosClient.get(`/stories/user/${userId}/before-expire`),

  // Cập nhật quyền riêng tư của story
  updateVisibility: (storyId, visibility) =>
    axiosClient.patch(`/stories/${storyId}/visibility`, { visibility }),

  // Xoá story
  deleteStory: (storyId) => axiosClient.delete(`/stories/${storyId}`),

  // Thả cảm xúc vào story
  reactToStory: (storyId, type = 'LOVE') =>
    axiosClient.post(`/stories/${storyId}/reaction`, { type }),

  // Gỡ cảm xúc khỏi story
  removeReaction: (storyId) => axiosClient.delete(`/stories/${storyId}/reaction`),

  // Đếm số cảm xúc trên story
  getReactionCount: (storyId) =>
    axiosClient.get(`/stories/${storyId}/reactions/count`),

  // Đánh dấu đã xem story
  viewStory: (storyId) => axiosClient.post(`/stories/${storyId}/view`),

  // Lấy danh sách người đã xem story
  getViewers: (storyId) => axiosClient.get(`/stories/${storyId}/viewers`),
};

export default storyService;
