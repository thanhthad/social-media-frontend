import axiosClient from '../api/axiosClient';

const adminService = {
  // ================= USERS MANAGEMENT =================
  getAllUsers: (status = null, page = 0, size = 10) =>
    axiosClient.get('/admin/users', {
      params: { ...(status ? { status } : {}), page, size },
    }),

  searchUsers: (username, page = 0, size = 10) =>
    axiosClient.get('/admin/users/search', {
      params: { username, page, size },
    }),

  updateUserStatus: (userId, status) =>
    axiosClient.patch(`/admin/users/${userId}/status`, { status }),

  // ================= ROLES MANAGEMENT =================
  assignRole: (userId, roleName) =>
    axiosClient.post(`/admin/user-roles/${userId}/${roleName}`),

  removeRole: (userId, roleName) =>
    axiosClient.delete(`/admin/user-roles/${userId}/${roleName}`),

  getUserRoles: (userId) =>
    axiosClient.get(`/admin/user-roles/${userId}`),

  getMyRoles: () =>
    axiosClient.get('/admin/user-roles/me'),

  checkUserRole: (userId, roleName) =>
    axiosClient.get(`/admin/user-roles/check/${userId}/${roleName}`),

  // ================= REPORTS MODERATION =================
  getAllReports: (page = 0, size = 10) =>
    axiosClient.get('/reports', { params: { page, size } }),

  getReportsByStatus: (status, page = 0, size = 10) =>
    axiosClient.get('/reports/status', { params: { status, page, size } }),

  reviewReport: (reportId, status) => {
    // Map 'RESOLVED' or 'APPROVED' to 'APPROVED'
    const reportStatus = status === 'RESOLVED' || status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    return axiosClient.patch(`/reports/${reportId}`, { reportStatus });
  },
};

export default adminService;
