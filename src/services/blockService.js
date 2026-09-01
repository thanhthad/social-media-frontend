import axiosClient from '../api/axiosClient';

const blockService = {
  blockUser: (blockedId) => axiosClient.post('/blocks', { blockedId }),

  unblockUser: (blockedId) => axiosClient.delete(`/blocks/${blockedId}`),

  checkBlocked: (userId) => axiosClient.get(`/blocks/check/${userId}`),

  getBlockedUsers: (page = 0, size = 10) =>
    axiosClient.get('/blocks/me', { params: { page, size } }),
};

export default blockService;
