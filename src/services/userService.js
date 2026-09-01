import axiosClient from '../api/axiosClient';

const userService = {
  // ============= SELF PROFILE =============
  getMe: () => axiosClient.get('/users/me'),

  updateBasicProfile: (data) => {
    const payload = {
      ...data,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth : null,
    };
    return axiosClient.put('/users/me/profile/basic', payload);
  },

  updateContact: (data) => {
    const payload = {
      phone: data.phone?.trim() ? data.phone.trim() : null,
      website: data.website?.trim() ? data.website.trim() : null,
      country: data.country?.trim() ? data.country.trim() : null,
      city: data.city?.trim() ? data.city.trim() : null,
      district: data.district?.trim() ? data.district.trim() : null,
    };
    return axiosClient.put('/users/me/profile/contact', payload);
  },

  updateCareer: (data) => {
    const payload = {
      occupation: data.occupation?.trim() ? data.occupation.trim() : null,
      company: data.company?.trim() ? data.company.trim() : null,
      education: data.education?.trim() ? data.education.trim() : null,
    };
    return axiosClient.put('/users/me/profile/career', payload);
  },

  updateSocialLinks: (data) => axiosClient.put('/users/me/profile/social-links', data),

  updateVisibility: (data) => {
    const visibility = data.visibility || data.profileVisibility || 'PUBLIC';
    return axiosClient.put('/users/me/profile/visibility', { visibility });
  },

  updateUsername: (data) =>
    axiosClient.put('/users/me/username', { userName: data.username || data.userName }),

  changePassword: (data) => axiosClient.put('/users/me/password', data),

  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateCover: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/users/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ============= PUBLIC PROFILE =============
  getUserById: (id) => axiosClient.get(`/users/${id}`),

  getUserStats: (id) => axiosClient.get(`/users/${id}/stats`),

  searchUsers: (username, page = 0, size = 10) =>
    axiosClient.get('/users/search', { params: { username, page, size } }),
};

export default userService;
