import axiosClient from '../api/axiosClient';
const savedPostService = {
  savePost: (postId) => axiosClient.post(`/saved-posts/${postId}`),
  unsavePost: (postId) => axiosClient.delete(`/saved-posts/${postId}`),
  checkSavedStatus: (postId) => axiosClient.get(`/saved-posts/${postId}/status`),
  getSavedPosts: (page = 0, size = 10) => axiosClient.get(`/posts/savedPost`, { params: { page, size } })
};
export default savedPostService;
