import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import NotificationDropdown from '../notification/NotificationDropdown';
import {
  Home,
  Search,
  Compass,
  Clapperboard,
  MessageCircle,
  Heart,
  PlusSquare,
  Bookmark,
  Settings,
  Shield,
  LogOut,
  Menu,
  User,
  Sparkles,
} from 'lucide-react';

export default function InstagramSidebar({ onOpenCreateChoice }) {
  const { isAuthenticated, logout } = useAuth();
  const { user, isAdmin, logout: clearUserContext } = useUser();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  const handleLogout = () => {
    setShowMoreMenu(false);
    logout();
    if (clearUserContext) clearUserContext();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (!isAuthenticated) return null;

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-18 xl:w-60 bg-white border-r border-gray-200 z-40 px-3 py-6 justify-between transition-all select-none">
      {/* Top Brand Logo */}
      <div className="space-y-6">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 text-gray-900 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition">
            S
          </div>
          <span className="hidden xl:block font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 font-sans">
            SocialApp
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {/* Home */}
          <Link
            to="/"
            className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group ${
              isActive('/')
                ? 'font-bold text-gray-900 bg-gray-100/70'
                : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 font-normal'
            }`}
          >
            <Home size={24} className={isActive('/') ? 'stroke-[2.5]' : 'stroke-[1.8] group-hover:scale-105 transition'} />
            <span className="hidden xl:block text-sm">Trang chủ</span>
          </Link>

          {/* Search */}
          <Link
            to="/search"
            className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group ${
              isActive('/search')
                ? 'font-bold text-gray-900 bg-gray-100/70'
                : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 font-normal'
            }`}
          >
            <Search size={24} className={isActive('/search') ? 'stroke-[2.5]' : 'stroke-[1.8] group-hover:scale-105 transition'} />
            <span className="hidden xl:block text-sm">Tìm kiếm</span>
          </Link>

          {/* Reels */}
          <Link
            to="/reels"
            className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group ${
              isActive('/reels')
                ? 'font-bold text-gray-900 bg-gray-100/70'
                : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 font-normal'
            }`}
          >
            <Clapperboard size={24} className={isActive('/reels') ? 'stroke-[2.5] text-pink-600' : 'stroke-[1.8] group-hover:scale-105 transition'} />
            <span className="hidden xl:block text-sm">Reels</span>
          </Link>

          {/* Messages */}
          <Link
            to="/messages"
            className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group ${
              isActive('/messages')
                ? 'font-bold text-gray-900 bg-gray-100/70'
                : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 font-normal'
            }`}
          >
            <MessageCircle size={24} className={isActive('/messages') ? 'stroke-[2.5] text-sky-600' : 'stroke-[1.8] group-hover:scale-105 transition'} />
            <span className="hidden xl:block text-sm">Tin nhắn</span>
          </Link>

          {/* Dating */}
          <Link
            to="/dating"
            className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group ${
              isActive('/dating')
                ? 'font-bold text-rose-600 bg-rose-50/70'
                : 'text-gray-700 hover:bg-rose-50/50 hover:text-rose-600 font-normal'
            }`}
          >
            <Heart size={24} className={isActive('/dating') ? 'stroke-[2.5] fill-rose-500 text-rose-500' : 'stroke-[1.8] group-hover:scale-105 transition'} />
            <span className="hidden xl:block text-sm">Hẹn hò</span>
          </Link>

          {/* Notifications */}
          <div className="flex items-center gap-4 px-3 py-1.5 rounded-2xl hover:bg-gray-100/80 transition cursor-pointer text-gray-700">
            <NotificationDropdown />
            <span className="hidden xl:block text-sm font-normal">Thông báo</span>
          </div>

          {/* Create (+) */}
          <button
            type="button"
            onClick={onOpenCreateChoice}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-gray-100/80 text-gray-700 hover:text-gray-900 transition group cursor-pointer"
          >
            <PlusSquare size={24} className="stroke-[1.8] group-hover:scale-105 transition" />
            <span className="hidden xl:block text-sm font-normal">Tạo</span>
          </button>

          {/* Profile */}
          <Link
            to="/profile"
            className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group ${
              isActive('/profile')
                ? 'font-bold text-gray-900 bg-gray-100/70'
                : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 font-normal'
            }`}
          >
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className={`w-6 h-6 rounded-full object-cover ${
                    isActive('/profile') ? 'ring-2 ring-black' : ''
                  }`}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <span className="hidden xl:block text-sm">Trang cá nhân</span>
          </Link>
        </nav>
      </div>

      {/* Bottom "Xem thêm" Menu */}
      <div className="relative" ref={moreMenuRef}>
        <button
          type="button"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-gray-100/80 text-gray-700 hover:text-gray-900 transition group cursor-pointer"
        >
          <Menu size={24} className="stroke-[1.8] group-hover:scale-105 transition" />
          <span className="hidden xl:block text-sm font-normal">Xem thêm</span>
        </button>

        {/* Popover Dropdown */}
        <AnimatePresence>
          {showMoreMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute bottom-14 left-0 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-50 divide-y divide-gray-50"
            >
              <div className="py-1 space-y-0.5 text-xs font-semibold text-gray-700">
                <Link
                  to="/saved-posts"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 rounded-2xl transition"
                >
                  <Bookmark size={17} className="text-gray-500" />
                  <span>Đã lưu</span>
                </Link>

                <Link
                  to="/edit-profile"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 rounded-2xl transition"
                >
                  <Settings size={17} className="text-gray-500" />
                  <span>Cài đặt</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-indigo-50 text-indigo-700 rounded-2xl transition"
                  >
                    <Shield size={17} className="text-indigo-600" />
                    <span>Quản trị hệ thống</span>
                  </Link>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition cursor-pointer"
                >
                  <LogOut size={17} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
