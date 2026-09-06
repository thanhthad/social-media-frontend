import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import NotificationDropdown from '../notification/NotificationDropdown';
import {
  Home,
  Search,
  Clapperboard,
  MessageCircle,
  Heart,
  PlusSquare,
  Bookmark,
  Settings,
  Shield,
  LogOut,
  Menu,
  Sparkles,
  Users,
} from 'lucide-react';

// All nav items use indigo-600 as active, except Dating (rose) and Reels (fuchsia)
const NAV_ITEMS = [
  { to: '/',        icon: Home,          label: 'Trang chủ', exact: true },
  { to: '/search',  icon: Search,        label: 'Tìm kiếm' },
  { to: '/reels',   icon: Clapperboard,  label: 'Reels',     special: 'reels' },
  { to: '/messages',icon: MessageCircle, label: 'Tin nhắn' },
  { to: '/dating',  icon: Heart,         label: 'Hẹn hò',    special: 'dating' },
  { to: '/friends', icon: Users,         label: 'Bạn bè' },
];

function NavItem({ item, isActiveRoute }) {
  const Icon = item.icon;
  const active = isActiveRoute(item.to, item.exact);

  let activeTextColor = 'text-indigo-600';
  let activeBgColor   = 'bg-indigo-50';
  let inactiveHover   = 'hover:bg-slate-100 hover:text-slate-900';

  if (item.special === 'dating') {
    activeTextColor = 'text-rose-600';
    activeBgColor   = 'bg-rose-50';
    inactiveHover   = 'hover:bg-rose-50 hover:text-rose-600';
  } else if (item.special === 'reels') {
    activeTextColor = 'text-fuchsia-600';
    activeBgColor   = 'bg-fuchsia-50';
    inactiveHover   = 'hover:bg-fuchsia-50 hover:text-fuchsia-600';
  }

  const iconFill = item.special === 'dating' && active ? 'fill-rose-500' : '';

  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 group font-medium ${
        active
          ? `${activeTextColor} ${activeBgColor} font-semibold`
          : `text-slate-600 ${inactiveHover}`
      }`}
      title={item.label}
    >
      <Icon
        size={22}
        className={`flex-shrink-0 ${active ? `${activeTextColor} ${iconFill} stroke-2` : 'stroke-[1.75] group-hover:scale-105 transition-transform'}`}
      />
      <span className="hidden xl:block text-sm leading-none">{item.label}</span>
    </Link>
  );
}

export default function InstagramSidebar({ onOpenCreateChoice }) {
  const { logout }                           = useAuth();
  const { user, isAdmin, logout: clearUser } = useUser();
  const location  = useLocation();
  const [showMore, setShowMore] = useState(false);
  const moreRef   = useRef(null);

  const handleLogout = () => {
    setShowMore(false);
    logout();
    if (clearUser) clearUser();
  };

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActiveRoute = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[68px] xl:w-60 bg-white border-r border-slate-200 z-40 px-2.5 xl:px-3.5 py-5 justify-between select-none">
      {/* Brand Logo */}
      <div className="space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl mb-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 flex-shrink-0 group-hover:shadow-indigo-500/40 transition-shadow">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="hidden xl:block font-black text-xl tracking-tight gradient-text-brand">
            VibeSocial
          </span>
        </Link>

        {/* Nav Items */}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} isActiveRoute={isActiveRoute} />
          ))}

          {/* Notifications */}
          <NotificationDropdown isSidebar />

          {/* Create */}
          <button
            type="button"
            onClick={onOpenCreateChoice}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition text-slate-600 hover:text-slate-900 group font-medium cursor-pointer"
          >
            <PlusSquare size={22} className="flex-shrink-0 stroke-[1.75] group-hover:scale-105 transition-transform" />
            <span className="hidden xl:block text-sm leading-none">Tạo mới</span>
          </button>

          {/* Profile */}
          <Link
            to="/profile"
            className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 font-medium ${
              isActiveRoute('/profile')
                ? 'text-indigo-600 bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="relative flex-shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username || ''}
                  className={`w-6 h-6 rounded-full object-cover ${
                    isActiveRoute('/profile') ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                  }`}
                />
              ) : (
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center ${
                  isActiveRoute('/profile') ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                }`}>
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <span className="hidden xl:block text-sm leading-none">Trang cá nhân</span>
          </Link>
        </nav>
      </div>

      {/* More Menu */}
      <div className="relative" ref={moreRef}>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
        >
          <Menu size={22} className="flex-shrink-0 stroke-[1.75]" />
          <span className="hidden xl:block text-sm leading-none">Xem thêm</span>
        </button>

        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute bottom-14 left-0 w-60 bg-white rounded-2xl shadow-dropdown border border-slate-200 p-1.5 z-50"
            >
              <Link
                to="/saved-posts"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm text-slate-700 font-medium"
              >
                <Bookmark size={16} className="text-slate-500" />
                Đã lưu
              </Link>
              <Link
                to="/edit-profile"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm text-slate-700 font-medium"
              >
                <Settings size={16} className="text-slate-500" />
                Cài đặt
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setShowMore(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 transition text-sm text-indigo-700 font-medium"
                >
                  <Shield size={16} className="text-indigo-500" />
                  Quản trị hệ thống
                </Link>
              )}

              <hr className="my-1 border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-red-50 transition text-sm text-red-600 font-medium cursor-pointer"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
