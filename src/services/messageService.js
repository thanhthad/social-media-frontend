import axiosClient from '../api/axiosClient';

const messageService = {
  // Get paginated messages in a conversation
  getMessages: (conversationId, page = 0, size = 30) =>
    axiosClient.get(`/messages/conversation/${conversationId}`, {
      params: { page, size },
    }),

  // Send a message with optional media attachments and reply context
  sendMessage: (conversationId, content = '', files = [], replyToMessageId = null) => {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    if (content !== undefined && content !== null) {
      formData.append('content', String(content).trim());
    }
    if (replyToMessageId) {
      formData.append('replyToMessageId', replyToMessageId);
    }
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append('files', file));
    }

    return axiosClient.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete message
  deleteMessage: (messageId) => axiosClient.delete(`/messages/${messageId}`),

  // React to message (ReactionType: LIKE, LOVE, HAHA, WOW, SAD, ANGRY)
  reactToMessage: (messageId, type) =>
    axiosClient.post(`/messages/reactions/${messageId}`, null, { params: { type } }),

  // Remove reaction from message
  removeReaction: (messageId) =>
    axiosClient.delete(`/messages/reactions/${messageId}`),

  // Get users who reacted to message
  getUsersReacted: (messageId) =>
    axiosClient.get(`/messages/reactions/${messageId}/users`),
};

export default messageService;

