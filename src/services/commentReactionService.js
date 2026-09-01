import axiosClient from '../api/axiosClient';

const commentReactionService = {
  reactToComment: (commentId, type = 'LIKE') =>
    axiosClient.post(`/comments/${commentId}/reaction`, { type }),

  removeReaction: (commentId) =>
    axiosClient.delete(`/comments/${commentId}/reaction`),

  getMyReaction: (commentId) =>
    axiosClient.get(`/comments/${commentId}/reaction/me`),

  getReactionsCount: (commentId) =>
    axiosClient.get(`/comments/${commentId}/reactions/count`),

  getUsersReacted: (commentId, type = null, page = 0, size = 10) =>
    axiosClient.get(`/comments/${commentId}/reactions`, {
      params: { ...(type ? { type } : {}), page, size },
    }),
};

export default commentReactionService;
