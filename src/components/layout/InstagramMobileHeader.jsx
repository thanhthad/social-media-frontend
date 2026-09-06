import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Users, MessageCircle, Sparkles } from 'lucide-react';
import NotificationDropdown from '../notification/NotificationDropdown';
import friendshipService from '../../services/friendshipService';

export default function InstagramMobileHeader() {
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    friendshipService
      .getPendingFriendRequests(0, 1)
      .then((res) => {
        const data = res.data?.data;
        const count =
          data?.totalElements ??
          data?.total ??
          (Array.isArray(data?.content) ? data.content.length : 0);
        setPendingCount(count);
      })
      .catch(() => {});
  }, [location.pathname]);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[52px] bg-white/95 backdrop-blur-xl border-b border-slate-200 z-30 px-4 flex items-center justify-between select-none">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 group active:scale-95 transition-transform">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
          <Sparkles size={15} className="text-white" />
        </div>
        <span className="font-black text-[1.1rem] leading-none tracking-tight gradient-text-brand">
          VibeSocial
        </span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-0.5">
        <Link
          to="/search"
          className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition active:scale-90"
          aria-label="Tìm kiếm"
        >
          <Search size={19} strokeWidth={1.9} />
        </Link>

        <Link
          to="/friends"
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition active:scale-90"
          aria-label="Bạn bè"
        >
          <Users size={19} strokeWidth={1.9} />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </Link>

        <div className="w-9 h-9 flex items-center justify-center">
          <NotificationDropdown />
        </div>

        <Link
          to="/messages"
          className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition active:scale-90"
          aria-label="Tin nhắn"
        >
          <MessageCircle size={19} strokeWidth={1.9} />
        </Link>
      </div>
    </header>
  );
}
