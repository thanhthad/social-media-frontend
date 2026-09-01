import axiosClient from '../api/axiosClient';

const reactionService = {
  reactToPost: (postId, type = 'LIKE') =>
    axiosClient.post(`/posts/${postId}/reaction`, { type }),

  removeReaction: (postId) => axiosClient.delete(`/posts/${postId}/reaction`),

  getReactionCount: (postId) => axiosClient.get(`/posts/${postId}/reactions/count`),

  getUsersReacted: (postId, type = null, page = 0, size = 50) =>
    axiosClient.get(`/posts/${postId}/reactions`, {
      params: { ...(type ? { type } : {}), page, size },
    }),
};

export default reactionService;
