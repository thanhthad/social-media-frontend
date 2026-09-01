import axiosClient from '../api/axiosClient';
const datingPreferenceService = {
  getPreferences: () => axiosClient.get('/dating/me/preferences').then(res => res.data?.data || res.data),
  updatePreferences: (prefs) => axiosClient.put('/dating/me/preferences', prefs).then(res => res.data?.data || res.data),
  createPreferences: (prefs) => axiosClient.post('/dating/me/preferences', prefs).then(res => res.data?.data || res.data)
};
export default datingPreferenceService;
