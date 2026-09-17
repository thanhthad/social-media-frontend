import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Lock,
  Bell,
  Eye,
  Palette,
  Moon,
  Sun,
  Ban,
  Trash2,
  Check,
  RefreshCw,
  ShieldCheck,
  Save,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { useSocial } from '../contexts/RealSocialContext';
import { useUser } from '../contexts/UserContext';
import userService from '../services/userService';
import blockService from '../services/blockService';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useSocial();
  const { user, refreshUser } = useUser();
  const [activeCategory, setActiveCategory] = useState('appearance');

  // Account State
  const [username, setUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);

  // Privacy State
  const [visibility, setVisibility] = useState('PUBLIC');
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  // Security / Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Blocked Users State
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  // Notification toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  // Sync current user info
  useEffect(() => {
    if (user) {
      setUsername(user.username || user.userName || '');
      if (user.profileVisibility) {
        setVisibility(user.profileVisibility);
      }
    }
  }, [user]);

  // Fetch blocked users when tab changes to 'blocked'
  const fetchBlockedUsers = useCallback(async () => {
    setLoadingBlocked(true);
    try {
      const res = await blockService.getBlockedUsers(0, 30);
      const data = res.data?.data?.content || res.data?.data || [];
      setBlockedUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load blocked users', err);
    } finally {
      setLoadingBlocked(false);
    }
  }, []);

  useEffect(() => {
    if (activeCategory === 'blocked') {
      fetchBlockedUsers();
    }
  }, [activeCategory, fetchBlockedUsers]);

  // 1. Handle Update Username
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Tên người dùng không được để trống');
      return;
    }
    setUpdatingUsername(true);
    try {
      await userService.updateUsername({ userName: username.trim() });
      toast.success('Đã đổi tên người dùng thành công!');
      refreshUser?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đổi tên người dùng');
    } finally {
      setUpdatingUsername(false);
    }
  };

  // 2. Handle Update Profile Visibility
  const handleUpdateVisibility = async (e) => {
    e.preventDefault();
    setUpdatingVisibility(true);
    try {
      await userService.updateVisibility({ visibility });
      toast.success('Đã cập nhật quyền riêng tư thành công!');
      refreshUser?.();
    } catch (err) {
      toast.error('Không thể cập nhật quyền riêng tư');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  // 3. Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword({ oldPassword, newPassword });
      toast.success('Đã đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  // 4. Handle Unblock User
  const handleUnblock = async (blockedId) => {
    try {
      await blockService.unblockUser(blockedId);
      toast.success('Đã bỏ chặn người dùng');
      setBlockedUsers((prev) =>
        prev.filter((u) => (u.userId || u.id || u.blockedId) !== blockedId)
      );
    } catch (err) {
      toast.error('Không thể bỏ chặn');
    }
  };

  const categories = [
    { id: 'appearance', label: 'Giao diện & Theme', icon: Palette },
    { id: 'account', label: 'Tài khoản', icon: User },
    { id: 'privacy', label: 'Quyền riêng tư', icon: Eye },
    { id: 'security', label: 'Bảo mật & Mật khẩu', icon: Lock },
    { id: 'blocked', label: 'Người dùng đã chặn', icon: Ban },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-2">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Cài đặt hệ thống
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tùy chỉnh giao diện, quyền riêng tư và thông tin tài khoản của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Category Nav */}
        <div className="md:col-span-1 space-y-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3 shadow-xs h-fit">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Content Panel */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          {/* 1. APPEARANCE */}
          {activeCategory === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Chế độ hiển thị
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chọn chủ đề màu sắc phù hợp với môi trường làm việc của bạn
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Light Card */}
                <div
                  onClick={() => {
                    if (theme === 'dark') toggleTheme();
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center gap-3 ${
                    theme === 'light'
                      ? 'border-indigo-600 bg-indigo-50/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-24 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <Sun className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Giao diện Sáng (Light)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tối ưu cho ban ngày
                    </span>
                  </div>
                </div>

                {/* Dark Card */}
                <div
                  onClick={() => {
                    if (theme === 'light') toggleTheme();
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center gap-3 ${
                    theme === 'dark'
                      ? 'border-indigo-600 bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-full h-24 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <Moon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Giao diện Tối (Dark)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Dịu mắt, độ tương phản cao
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ACCOUNT */}
          {activeCategory === 'account' && (
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Thông tin tài khoản
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cập nhật username của bạn trên hệ thống
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên người dùng (Username)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600"
                  required
                />
              </div>

              {user?.email && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={updatingUsername}
                  leftIcon={Save}
                >
                  {updatingUsername ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          )}

          {/* 3. PRIVACY */}
          {activeCategory === 'privacy' && (
            <form onSubmit={handleUpdateVisibility} className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Quyền riêng tư hồ sơ
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kiểm soát ai có thể nhìn thấy bài viết và thông tin của bạn
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: 'PUBLIC',
                    title: 'Công khai (Public)',
                    desc: 'Mọi người trên mạng xã hội đều có thể xem trang cá nhân của bạn.',
                  },
                  {
                    value: 'FRIENDS',
                    title: 'Chỉ bạn bè (Friends Only)',
                    desc: 'Chỉ những người đã kết bạn với bạn mới có thể xem các thông tin chi tiết.',
                  },
                  {
                    value: 'PRIVATE',
                    title: 'Riêng tư (Private)',
                    desc: 'Chỉ bạn mới có quyền xem thông tin cá nhân của mình.',
                  },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      visibility === item.value
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={item.value}
                      checked={visibility === item.value}
                      onChange={() => setVisibility(item.value)}
                      className="mt-1 accent-indigo-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={updatingVisibility}
                  leftIcon={Save}
                >
                  {updatingVisibility ? 'Đang cập nhật...' : 'Cập nhật quyền riêng tư'}
                </Button>
              </div>
            </form>
          )}

          {/* 4. SECURITY */}
          {activeCategory === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Đổi mật khẩu
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Đảm bảo mật khẩu của bạn có ít nhất 6 ký tự để bảo vệ tài khoản an toàn
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={changingPassword}
                  leftIcon={Lock}
                >
                  {changingPassword ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu'}
                </Button>
              </div>
            </form>
          )}

          {/* 5. BLOCKED USERS */}
          {activeCategory === 'blocked' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Danh sách người dùng đã chặn
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Những người này sẽ không thể xem bài viết hay liên lạc với bạn trên hệ thống
                </p>
              </div>

              {loadingBlocked ? (
                <div className="flex items-center justify-center p-10">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : blockedUsers.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {blockedUsers.map((item) => {
                    const bId = item.blockedUserId || item.blockedId || item.userId || item.id;
                    const name = item.blockedFullName || item.blockedUsername || item.fullName || item.username || `Người dùng #${bId}`;
                    const avatar = item.blockedAvatar || item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

                    return (
                      <div
                        key={bId}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Đã chặn
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUnblock(bId)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/30 transition"
                        >
                          Bỏ chặn
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  Bạn chưa chặn bất kỳ người dùng nào.
                </p>
              )}
            </div>
          )}

          {/* 6. NOTIFICATIONS */}
          {activeCategory === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Cài đặt thông báo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tùy chỉnh thông báo trên thiết bị và email
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Thông báo đẩy trên trình duyệt
                  </span>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Email cập nhật hoạt động
                  </span>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
