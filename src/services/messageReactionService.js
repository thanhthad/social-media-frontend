import axiosClient from '../api/axiosClient';

const messageReactionService = {
  reactToMessage: (messageId, type = 'LIKE') =>
    axiosClient.post(`/messages/reactions/${messageId}`, null, { params: { type } }),

  removeReaction: (messageId) =>
    axiosClient.delete(`/messages/reactions/${messageId}`),

  getUsersReacted: (messageId) =>
    axiosClient.get(`/messages/reactions/${messageId}/users`),
};

export default messageReactionService;
