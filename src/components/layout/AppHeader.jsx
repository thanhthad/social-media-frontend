import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  MessageCircle,
  Sun,
  Moon,
  Database,
  User,
  Settings,
  Bookmark,
  LogOut,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useSocial } from '../../contexts/MockSocialContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

export const AppHeader = ({ onOpenCreatePost }) => {
  const { currentUser, notifications, conversations, theme, toggleTheme } = useSocial();
  const { isAuthenticated, logout } = useAuth();
  const { isAdmin, user } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
              <Database className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Social<span className="text-indigo-600 dark:text-indigo-400">DB</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                Network
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 stroke-[1.8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, mọi người, chủ đề..."
              className="w-full pl-10 pr-12 py-2 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600/30 focus:ring-2 focus:ring-indigo-500/15 transition outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center">
              <kbd className="text-[10px] font-semibold text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-700">
                /
              </kbd>
            </div>
          </form>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition"
            aria-label="Chuyển chế độ sáng tối"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 stroke-[1.8] text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>

          {/* Authenticated options vs Guest Auth buttons */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 ml-1">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm shadow-indigo-500/25 transition active:scale-95"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <>
              {/* Messages shortcut */}
              <Link
                to="/messages"
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition"
                aria-label="Tin nhắn"
              >
                <MessageCircle className="w-5 h-5 stroke-[1.8]" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              {/* Notifications shortcut */}
              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5 stroke-[1.8]" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                    {unreadNotifs}
                  </span>
                )}
              </Link>

              {/* User Profile dropdown menu */}
              <div className="relative ml-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  aria-label="Tùy chọn người dùng"
                >
                  <img
                    src={user?.avatarUrl || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user?.fullName || currentUser?.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-600/20"
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-dropdown p-2 z-50 animate-scale-in">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user?.fullName || currentUser?.name || 'Người dùng'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        @{user?.username || currentUser?.username}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
                    >
                      <User className="w-4 h-4 stroke-[1.8] text-indigo-600" />
                      <span>Trang cá nhân</span>
                    </Link>

                    <Link
                      to="/saved"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
                    >
                      <Bookmark className="w-4 h-4 stroke-[1.8] text-amber-500" />
                      <span>Đã lưu</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
                    >
                      <Settings className="w-4 h-4 stroke-[1.8] text-slate-500" />
                      <span>Cài đặt & Quyền riêng tư</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition font-medium"
                      >
                        <Shield className="w-4 h-4 stroke-[1.8]" />
                        <span>Trang quản trị Admin</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={async () => {
                        setShowUserMenu(false);
                        await logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition font-medium text-left"
                    >
                      <LogOut className="w-4 h-4 stroke-[1.8]" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
