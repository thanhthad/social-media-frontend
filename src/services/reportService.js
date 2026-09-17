import axiosClient from '../api/axiosClient';

const reportService = {
  createReport: (postId, reason) =>
    axiosClient.post('/reports', { postId, reason }),

  reportPost: (postId, reason) =>
    axiosClient.post('/reports', { postId, reason }),

  reportComment: (commentId, reason) =>
    axiosClient.post('/reports', { postId: commentId, reason }),

  reportUser: (reportedUserId, reason) =>
    axiosClient.post('/dating/reports', { reportedUserId, reason }),
};

export default reportService;
