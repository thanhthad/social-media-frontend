import axiosClient from '../api/axiosClient';

const conversationMemberService = {
  getMembers: (conversationId) =>
    axiosClient.get(`/conversation-members/${conversationId}/members`),

  addMember: (conversationId, userId) =>
    axiosClient.post(`/conversation-members/${conversationId}/members/${userId}`),

  removeMember: (conversationId, userId) =>
    axiosClient.delete(`/conversation-members/${conversationId}/members/${userId}`),

  updateLastReadMessage: (conversationId, messageId) =>
    axiosClient.put(`/conversation-members/${conversationId}/read/${messageId}`),
};

export default conversationMemberService;
