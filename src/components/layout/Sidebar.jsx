import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Users,
  MessageCircle,
  Bell,
  Clapperboard,
  Heart,
  Bookmark,
  User,
  Settings,
  Plus,
  Shield,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { useSocial } from '../../contexts/MockSocialContext';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import LoginPromptModal from '../common/LoginPromptModal';

export const Sidebar = ({ onOpenCreatePost }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, friendRequests, conversations, notifications } = useSocial();
  const { isAdmin, user } = useUser();
  const { isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const pendingFriends = friendRequests.length;

  const navItems = [
    { to: '/', label: 'Trang chủ', icon: Home, exact: true, public: true },
    { to: '/search', label: 'Khám phá', icon: Compass, public: true },
    { to: '/reels', label: 'Reels Video', icon: Clapperboard, public: true },
    { to: '/friends', label: 'Bạn bè', icon: Users, badge: pendingFriends, authRequired: true },
    { to: '/messages', label: 'Tin nhắn', icon: MessageCircle, badge: unreadMessages, authRequired: true },
    { to: '/notifications', label: 'Thông báo', icon: Bell, badge: unreadNotifs, authRequired: true },
    { to: '/dating', label: 'Hẹn hò', icon: Heart, isDating: true, authRequired: true },
    { to: '/saved', label: 'Đã lưu', icon: Bookmark, authRequired: true },
    { to: '/profile', label: 'Cá nhân', icon: User, authRequired: true },
    { to: '/settings', label: 'Cài đặt', icon: Settings, authRequired: true },
    ...(isAdmin ? [{ to: '/admin', label: 'Quản trị (Admin)', icon: Shield, isAdminNav: true, authRequired: true }] : []),
  ];

  const handleNavClick = (e, item) => {
    if (item.authRequired && !isAuthenticated) {
      e.preventDefault();
      setPromptMessage(`Bạn cần đăng nhập để truy cập tính năng ${item.label}.`);
      setShowLoginPrompt(true);
    }
  };

  const handleCreatePostClick = () => {
    if (!isAuthenticated) {
      setPromptMessage('Bạn cần đăng nhập để tạo bài viết mới.');
      setShowLoginPrompt(true);
      return;
    }
    onOpenCreatePost();
  };

  const isItemActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-18 xl:w-64 py-4 px-2 xl:px-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto border-r border-slate-200/80 dark:border-slate-800/80 transition-all">
      {/* Top Nav list */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const active = isItemActive(item.to, item.exact);
          const Icon = item.icon;
          const isDating = item.isDating;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={(e) => handleNavClick(e, item)}
              title={item.label}
              className={`group flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-medium transition-all duration-150 ${
                active
                  ? isDating
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : isDating
                  ? 'text-slate-600 dark:text-slate-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 hover:text-rose-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    active ? 'stroke-[2.2]' : 'stroke-[1.8]'
                  } ${isDating && active ? 'fill-rose-500' : ''}`}
                />
                {item.badge > 0 && (
                  <span className="xl:hidden absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="hidden xl:block text-sm tracking-tight">{item.label}</span>

              {item.badge > 0 && (
                <span className="hidden xl:flex ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Create Post Button */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleCreatePostClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-xs transition active:scale-[0.98]"
            title="Tạo bài viết"
          >
            <Plus className="w-5 h-5 stroke-[2.2]" />
            <span className="hidden xl:block text-sm">Tạo bài viết</span>
          </button>
        </div>
      </div>

      {/* Bottom: User Card vs Guest Login Card */}
      {isAuthenticated ? (
        <Link
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 transition group mt-4"
          title="Trang cá nhân"
        >
          <img
            src={user?.avatarUrl || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.fullName || currentUser?.name}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-transparent group-hover:ring-indigo-600/30 transition"
          />
          <div className="hidden xl:flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
              {user?.fullName || currentUser?.name || 'Người dùng'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
              @{user?.username || currentUser?.username}
            </span>
          </div>
        </Link>
      ) : (
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40 text-center hidden xl:block">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1.5" />
          <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
            Gia nhập SocialDB
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 leading-snug">
            Đăng nhập để like, comment và kết nối bạn bè.
          </p>
          <Link
            to="/login"
            className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <LogIn size={13} />
            <span>Đăng nhập ngay</span>
          </Link>
        </div>
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message={promptMessage}
      />
    </aside>
  );
};

export default Sidebar;
