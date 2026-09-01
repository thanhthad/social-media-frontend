import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import {
  Users,
  Flag,
  Search,
  UserCheck,
  UserX,
  Shield,
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'reports'
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = userStatusFilter
        ? await adminService.getAllUsers(userStatusFilter, 0, 50)
        : await adminService.getAllUsers(null, 0, 50);
      const data = res.data?.data?.content || res.data?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admin users', err);
    } finally {
      setLoading(false);
    }
  }, [userStatusFilter]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = reportStatusFilter
        ? await adminService.getReportsByStatus(reportStatusFilter, 0, 50)
        : await adminService.getAllReports(0, 50);
      const data = res.data?.data?.content || res.data?.data || [];
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  }, [reportStatusFilter]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchReports();
    }
  }, [activeTab, fetchUsers, fetchReports]);

  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchUserQuery.trim()) {
      fetchUsers();
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.searchUsers(searchUserQuery.trim(), 0, 50);
      const data = res.data?.data?.content || res.data?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`Đã đổi trạng thái tài khoản thành ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleAssignRole = async (userId, roleName) => {
    try {
      await adminService.assignRole(userId, roleName);
      toast.success(`Đã cấp quyền ${roleName}`);
      fetchUsers();
    } catch (err) {
      toast.error('Không thể cấp quyền');
    }
  };

  const handleRemoveRole = async (userId, roleName) => {
    try {
      await adminService.removeRole(userId, roleName);
      toast.success(`Đã thu hồi quyền ${roleName}`);
      fetchUsers();
    } catch (err) {
      toast.error('Không thể thu hồi quyền');
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      await adminService.reviewReport(reportId, status);
      toast.success(`Đã xử lý báo cáo: ${status}`);
      fetchReports();
    } catch (err) {
      toast.error('Không thể xử lý báo cáo');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-950 text-white p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield size={16} />
            Hệ thống Quản trị
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Admin & Moderation Panel</h1>
          <p className="text-xs text-gray-300 mt-1">
            Quản lý tài khoản người dùng, phân quyền bảo mật và kiểm duyệt nội dung vi phạm.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-white text-gray-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            <Users size={14} />
            Người dùng
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-white text-gray-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            <Flag size={14} />
            Báo cáo vi phạm
          </button>
        </div>
      </div>

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchUser} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Tìm người dùng theo username..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs text-gray-500 font-semibold">Trạng thái:</label>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                <option value="SUSPENDED">SUSPENDED (Tạm khóa)</option>
                <option value="BANNED">BANNED (Cấm)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3.5">Người dùng</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5">Vai trò</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((u) => {
                    const uId = u.userId || u.id;
                    const isActive = u.status === 'ACTIVE' || !u.status;
                    return (
                      <tr key={uId} className="hover:bg-gray-50/50 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl || 'https://via.placeholder.com/36'}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            />
                            <div>
                              <p className="font-bold text-gray-900">{u.username}</p>
                              <p className="text-[11px] text-gray-400">{u.fullName || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-600">{u.email || '—'}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-green-100 text-green-700'
                                : u.status === 'BANNED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {u.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[10px]"
                              >
                                {r.name || r}
                              </span>
                            )) || <span className="text-gray-400">USER</span>}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isActive ? (
                              <button
                                onClick={() => handleUpdateUserStatus(uId, 'BANNED')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Khóa tài khoản"
                              >
                                <UserX size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateUserStatus(uId, 'ACTIVE')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Mở khóa tài khoản"
                              >
                                <UserCheck size={16} />
                              </button>
                            )}

                            <button
                              onClick={() => handleAssignRole(uId, 'ADMIN')}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Thăng quyền ADMIN"
                            >
                              <Shield size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Danh sách báo cáo bài viết vi phạm</h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-semibold">Bộ lọc:</label>
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ xử lý (PENDING)</option>
                <option value="APPROVED">Đã duyệt (APPROVED)</option>
                <option value="REJECTED">Đã từ chối (REJECTED)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reports.length > 0 ? (
              reports.map((rep) => {
                const repId = rep.id || rep.reportId;
                const currentStatus = rep.reportStatus || rep.status || 'PENDING';
                return (
                  <div
                    key={repId}
                    className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition space-y-2 bg-gray-50/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 font-bold text-[10px] rounded-full border border-rose-200">
                          POST #{rep.postId || rep.targetId}
                        </span>
                        <span className="text-xs text-gray-400">
                          Người báo cáo: <strong className="text-gray-700">@{rep.reporterUsername || rep.userId || 'Ẩn danh'}</strong>
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          currentStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : currentStatus === 'APPROVED' || currentStatus === 'RESOLVED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-gray-800 font-semibold">
                      Lý do: <span className="text-rose-600 font-normal">{rep.reason || 'Vi phạm chính sách'}</span>
                    </p>
                    {rep.description && (
                      <p className="text-xs text-gray-500 bg-white p-2.5 rounded-xl border border-gray-100">
                        "{rep.description}"
                      </p>
                    )}

                    {currentStatus === 'PENDING' && (
                      <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                        <button
                          onClick={() => handleReviewReport(repId, 'REJECTED')}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleReviewReport(repId, 'APPROVED')}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition"
                        >
                          Duyệt xử lý vi phạm
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="py-12 text-center text-xs text-gray-400">
                Không có báo cáo vi phạm nào.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
