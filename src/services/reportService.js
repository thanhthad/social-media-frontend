import axiosClient from '../api/axiosClient';

const reportService = {
  createReport: (postId, reason) =>
    axiosClient.post('/reports', { postId, reason }),

  reportPost: (postId, reason) =>
    axiosClient.post('/reports', { postId, reason }),

  reportComment: (commentId, reason) =>
    axiosClient.post('/reports', { postId: commentId, reason }),

  reportUser: (userId, reason) =>
    axiosClient.post('/dating/reports', { targetUserId: userId, reasonId: 1, description: reason }),
};

export default reportService;
