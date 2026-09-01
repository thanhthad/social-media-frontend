import axiosClient from '../api/axiosClient';

const datingInterestService = {
  getAllInterests: () => axiosClient.get('/dating/interests'),
  getMyInterests: () => axiosClient.get('/dating/me/interests'),
  updateMyInterests: (interestIds) =>
    axiosClient.put('/dating/me/interests', { interestIds }),
};

export default datingInterestService;
