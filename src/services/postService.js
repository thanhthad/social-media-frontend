import axiosClient from '../api/axiosClient';

const postService = {
  // ================= FETCH =================
  getFeed: (page = 0, size = 10) =>
    axiosClient.get('/posts/feed', { params: { page, size } }),

  getExplore: (page = 0, size = 10) =>
    axiosClient.get('/posts/explore', { params: { page, size } }),

  searchByHashtag: (name, page = 0, size = 10) =>
    axiosClient.get('/posts/search/hashtag', { params: { name, page, size } }),

  searchByContent: (keyword, page = 0, size = 10) =>
    axiosClient.get('/posts/search', { params: { keyword, page, size } }),

  getUserPosts: (userId, page = 0, size = 10) =>
    axiosClient.get(`/posts/user/${userId}`, { params: { page, size } }),

  getMyPosts: (page = 0, size = 10) =>
    axiosClient.get('/posts', { params: { page, size } }),

  getPostById: (postId) => axiosClient.get(`/posts/${postId}`),

  getSavedPosts: (page = 0, size = 10) =>
    axiosClient.get('/posts/savedPost', { params: { page, size } }),

  // ================= MANAGE =================
  createPost: (data) =>
    axiosClient.post('/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updatePostContent: (postId, data) =>
    axiosClient.patch(`/posts/${postId}`, data),

  updatePostVisibility: (postId, visibility) =>
    axiosClient.patch(`/posts/${postId}/visibility`, { visibility }),

  addPostMedia: (postId, files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return axiosClient.post(`/posts/${postId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletePostMedia: (mediaId) =>
    axiosClient.delete(`/posts/media/${mediaId}`),

  deletePost: (postId) => axiosClient.delete(`/posts/${postId}`),
};

export default postService;
