import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Heart, UserPlus, ArrowRight, Sparkles, LogIn } from 'lucide-react';
import { useSocial } from '../../contexts/MockSocialContext';
import { useAuth } from '../../contexts/AuthContext';
import hashtagService from '../../services/hashtagService';
import LoginPromptModal from '../common/LoginPromptModal';

export const RightSidebar = () => {
  const { suggestedFriends, sendFriendRequest } = useSocial();
  const { isAuthenticated } = useAuth();
  const [trending, setTrending] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPromptData, setLoginPromptData] = useState({ title: '', message: '' });
  const navigate = useNavigate();

  const handleOpenLoginModal = (title, message) => {
    setLoginPromptData({
      title: title || 'Tham gia cùng cộng đồng SocialDB',
      message: message || 'Bạn cần đăng nhập để trải nghiệm tính năng này.',
    });
    setShowLoginModal(true);
  };

  useEffect(() => {
    let mounted = true;
    hashtagService
      .getTrending()
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data || [];
        setTrending(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.warn('Failed to load trending hashtags:', e?.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="hidden lg:block w-80 shrink-0 py-6 pl-4 space-y-6 select-none">
      {/* 1. Dating Teaser Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/10 border border-rose-200/70 dark:border-rose-900/40 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>SocialDB Dating</span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Tìm kiếm nửa kia lý tưởng
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3.5">
          Khám phá những người độc thân có chung gu và sở thích quanh bạn.
        </p>
        {isAuthenticated ? (
          <Link
            to="/dating"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 group"
          >
            <span>Khám phá ngay</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => handleOpenLoginModal('SocialDB Dating', 'Đăng nhập để tạo hồ sơ hẹn hò và kết nối với những người bạn tương thích.')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 group"
          >
            <span>Khám phá ngay</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* 2. Trending Topics Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 stroke-[2.2]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Chủ đề thịnh hành
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Hôm nay</span>
        </div>

        <div className="space-y-3.5">
          {trending.length > 0 ? (
            trending.slice(0, 5).map((item, idx) => {
              const tagName = item.name || item.tag || item;
              const postCount = item.postCount || item.count || '';
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tagName)}`)}
                  className="flex items-start justify-between group cursor-pointer hover:opacity-80 transition"
                >
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      #{tagName.replace(/^#/, '')}
                    </span>
                  </div>
                  {postCount !== '' && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {postCount} bài viết
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">Chưa có hashtag thịnh hành</p>
          )}
        </div>
      </div>

      {/* 3. Suggested Users OR Guest CTA Widget */}
      {isAuthenticated ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Gợi ý kết bạn
            </h3>
            <Link
              to="/friends"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3.5">
            {suggestedFriends && suggestedFriends.length > 0 ? (
              suggestedFriends.slice(0, 4).map((item) => {
                const uId = item.userId || item.id;
                const name = item.fullName || item.name || item.userName || `Người dùng #${uId}`;
                const avatar = item.avatarUrl || item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                const reason = item.mutualFriendsCount
                  ? `${item.mutualFriendsCount} bạn chung`
                  : item.reason || 'Gợi ý cho bạn';

                return (
                  <div key={uId} className="flex items-center justify-between gap-3">
                    <Link to={`/profile/${uId}`} className="flex items-center gap-2.5 min-w-0 group">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition">
                          {name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {reason}
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => sendFriendRequest(uId)}
                      className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition shrink-0"
                      title="Kết bạn"
                    >
                      <UserPlus className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">Không có gợi ý mới</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200/70 dark:border-indigo-800/50 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Mạng xã hội SocialDB</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
            Kết nối & Chia sẻ đam mê
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Đăng ký tài khoản để kết bạn với những người chung sở thích, trò chuyện riêng tư và đăng tải Reels video ngắn.
          </p>

          <div className="space-y-2">
            <Link
              to="/register"
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký ngay (Miễn phí)</span>
            </Link>
            <Link
              to="/login"
              className="w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Minimalist Footer */}
      <div className="px-2 text-[11px] text-slate-400 dark:text-slate-600 leading-relaxed space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/settings" className="hover:underline">Điều khoản</Link>
          <Link to="/settings" className="hover:underline">Bảo mật</Link>
          <Link to="/settings" className="hover:underline">Hỗ trợ</Link>
          <Link to="/settings" className="hover:underline">API Backend</Link>
        </div>
        <p>© 2026 SocialDB Platform. All backend APIs connected.</p>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={loginPromptData.title}
        message={loginPromptData.message}
      />
    </aside>
  );
};

export default RightSidebar;
