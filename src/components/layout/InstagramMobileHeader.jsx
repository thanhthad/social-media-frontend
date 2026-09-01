import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import NotificationDropdown from '../notification/NotificationDropdown';

export default function InstagramMobileHeader() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 px-4 flex items-center justify-between">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-xs">
          S
        </div>
        <span className="font-bold text-lg tracking-tight text-gray-900">
          SocialApp
        </span>
      </Link>

      {/* Right Icons */}
      <div className="flex items-center gap-1">
        <NotificationDropdown />
        <Link
          to="/messages"
          className="p-2 text-gray-700 hover:text-gray-900 rounded-full transition"
        >
          <MessageCircle size={22} />
        </Link>
      </div>
    </header>
  );
}
