import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clapperboard, Plus, Heart, Compass, LogIn } from 'lucide-react';
import { useSocial } from '../../contexts/MockSocialContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

export const MobileNav = ({ onOpenCreatePost }) => {
  const location = useLocation();
  const { currentUser } = useSocial();
  const { user } = useUser();
  const { isAuthenticated } = useAuth();

  const isRouteActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
            isRouteActive('/')
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Trang chủ"
        >
          <Home className={`w-5 h-5 ${isRouteActive('/') ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] leading-none">Trang chủ</span>
        </Link>

        {/* 2. Reels */}
        <Link
          to="/reels"
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
            isRouteActive('/reels')
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Reels"
        >
          <Clapperboard className={`w-5 h-5 ${isRouteActive('/reels') ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] leading-none">Reels</span>
        </Link>

        {isAuthenticated ? (
          <>
            {/* 3. Center Create Action */}
            <button
              type="button"
              onClick={onOpenCreatePost}
              className="flex items-center justify-center -mt-3 w-11 h-11 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25 active:scale-95 transition"
              aria-label="Tạo bài viết mới"
            >
              <Plus className="w-6 h-6 stroke-[2.4]" />
            </button>

            {/* 4. Dating */}
            <Link
              to="/dating"
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
                isRouteActive('/dating')
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              aria-label="Hẹn hò"
            >
              <Heart
                className={`w-5 h-5 ${
                  isRouteActive('/dating') ? 'stroke-[2.2] fill-rose-500 text-rose-500' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[10px] leading-none">Hẹn hò</span>
            </Link>

            {/* 5. Profile */}
            <Link
              to="/profile"
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
                isRouteActive('/profile')
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              aria-label="Cá nhân"
            >
              <img
                src={user?.avatarUrl || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt=""
                className={`w-5 h-5 rounded-full object-cover ${
                  isRouteActive('/profile') ? 'ring-2 ring-indigo-600 dark:ring-indigo-400' : ''
                }`}
              />
              <span className="text-[10px] leading-none">Cá nhân</span>
            </Link>
          </>
        ) : (
          <>
            {/* 3. Search / Explore */}
            <Link
              to="/search"
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
                isRouteActive('/search')
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              aria-label="Khám phá"
            >
              <Compass className={`w-5 h-5 ${isRouteActive('/search') ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] leading-none">Khám phá</span>
            </Link>

            {/* 4. Login */}
            <Link
              to="/login"
              className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-indigo-600 dark:text-indigo-400 font-semibold"
              aria-label="Đăng nhập"
            >
              <LogIn className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] leading-none">Đăng nhập</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
