import axiosClient from '../api/axiosClient';

const conversationService = {
  // Create private conversation with target user
  createPrivate: (targetUserId) =>
    axiosClient.post(`/conversations/private/${targetUserId}`),

  // Create group conversation with members and optional avatar file
  createGroup: (name, memberIds = [], avatarFile = null) => {
    const formData = new FormData();
    formData.append('name', String(name).trim());
    if (Array.isArray(memberIds)) {
      memberIds.forEach((id) => formData.append('memberIds', id));
    }
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    return axiosClient.post('/conversations/group', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 1. Get all regular/group/private conversations
  getMyConversations: () => axiosClient.get('/conversations'),
  getList: () => axiosClient.get('/conversations'),

  // 2. Get all dating conversations
  getMyDatingConversations: () => axiosClient.get('/conversations/dating'),

  // 3. Get single conversation detail by ID
  getConversationDetail: (conversationId) =>
    axiosClient.get(`/conversations/${conversationId}`),

  // Update group avatar
  updateGroupAvatar: (conversationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.put(`/conversations/${conversationId}/avatar`, formData);
  },

  // Update group name
  updateGroupName: (conversationId, name) =>
    axiosClient.put(`/conversations/${conversationId}/name`, { name: String(name).trim() }),

  // Delete conversation
  deleteConversation: (conversationId) =>
    axiosClient.delete(`/conversations/${conversationId}`),
};

export default conversationService;

