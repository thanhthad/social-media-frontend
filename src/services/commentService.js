import axiosClient from '../api/axiosClient';

const commentService = {
  createComment: (postId, content, parentId = null) =>
    axiosClient.post('/comments', { postId, content, parentId }),

  updateComment: (commentId, content) =>
    axiosClient.patch(`/comments/${commentId}`, { content }),

  deleteComment: (commentId) => axiosClient.delete(`/comments/${commentId}`),

  getRootComments: (postId, page = 0, size = 10) =>
    axiosClient.get(`/comments/post/${postId}`, { params: { page, size } }),

  getReplies: (commentId, page = 0, size = 10) =>
    axiosClient.get(`/comments/${commentId}/replies`, { params: { page, size } }),
};

export default commentService;
