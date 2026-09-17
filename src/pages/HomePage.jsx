import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StorySection from '../components/story/StorySection';
import CreateStoryModal from '../components/story/CreateStoryModal';
import CreatePostCard from '../components/post/CreatePostCard';
import CreatePostModal from '../components/post/CreatePostModal';
import PostCard from '../components/post/PostCard';
import LoginPromptModal from '../components/common/LoginPromptModal';
import Tabs from '../components/ui/Tabs';
import { Sparkles, Users, Bookmark, RefreshCw, LogIn, UserPlus, Film, Flame, Lock } from 'lucide-react';
import postService from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you'); // 'for-you' | 'following' | 'saved'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [loginPromptState, setLoginPromptState] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  const openLoginPrompt = (title, message) => {
    setLoginPromptState({
      isOpen: true,
      title: title || 'Tham gia cùng cộng đồng SocialDB',
      message: message || 'Bạn cần đăng nhập để sử dụng tính năng này.',
    });
  };

  const closeLoginPrompt = () => {
    setLoginPromptState((prev) => ({ ...prev, isOpen: false }));
  };

  const tabs = [
    { id: 'for-you', label: isAuthenticated ? 'Dành cho bạn (Khám phá)' : 'Bảng tin công khai', icon: Sparkles },
    { id: 'following', label: isAuthenticated ? 'Đang theo dõi (Bạn bè)' : 'Đang theo dõi 🔒', icon: Users },
    { id: 'saved', label: isAuthenticated ? 'Đã lưu' : 'Đã lưu 🔒', icon: Bookmark },
  ];

  const handleTabChange = (newTab) => {
    if (!isAuthenticated && (newTab === 'following' || newTab === 'saved')) {
      openLoginPrompt(
        newTab === 'following' ? 'Bảng tin theo dõi' : 'Bài viết đã lưu',
        newTab === 'following'
          ? 'Đăng nhập để xem cập nhật mới nhất từ bạn bè và người bạn đang theo dõi.'
          : 'Đăng nhập để lưu và xem lại những bài viết bạn yêu thích.'
      );
      return;
    }
    setActiveTab(newTab);
  };

  const fetchFeed = useCallback(async (tab, pageNum = 0, append = false) => {
    setLoading(true);
    try {
      let res;
      if (tab === 'following') {
        res = await postService.getFeed(pageNum, 15);
      } else if (tab === 'saved') {
        res = await postService.getSavedPosts(pageNum, 15);
      } else {
        // 'for-you'
        res = isAuthenticated
          ? await postService.getExplore(pageNum, 15)
          : await postService.getPublicFeed(pageNum, 15);
      }

      const data = res.data?.data?.content || res.data?.data || [];
      const list = Array.isArray(data) ? data : [];

      if (append) {
        setPosts((prev) => [...prev, ...list]);
      } else {
        setPosts(list);
      }

      setHasMore(list.length >= 15);
    } catch (err) {
      console.warn('Failed to load posts feed:', err?.message);
      if (!append) setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setPage(0);
    fetchFeed(activeTab, 0, false);
  }, [activeTab, fetchFeed]);

  const handleRefresh = () => {
    setPage(0);
    fetchFeed(activeTab, 0, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(activeTab, nextPage, true);
  };

  const handlePostCreated = () => {
    handleRefresh();
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => (p.id || p.postId) !== deletedId));
  };

  const handleOpenCreateStory = () => {
    if (!isAuthenticated) {
      openLoginPrompt('Tạo tin mới 24h', 'Đăng nhập để tạo tin 24h với ảnh, video và hiệu ứng độc đáo.');
      return;
    }
    setIsCreateStoryOpen(true);
  };

  const handleOpenCreatePost = () => {
    if (!isAuthenticated) {
      openLoginPrompt('Đăng bài viết mới', 'Đăng nhập để chia sẻ suy nghĩ, ảnh, video và cảm xúc với mọi người.');
      return;
    }
    setIsCreatePostOpen(true);
  };

  return (
    <div className="w-full">
      {/* 1. Guest Welcome Hero Banner (Only when NOT logged in) */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-indigo-500/15 mb-6 border border-indigo-400/20"
        >
          {/* Background Decorative Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 mb-3.5 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chế độ khách • Khám phá bài viết & Reels tự do</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 leading-tight">
              Chào mừng bạn đến với SocialDB Network ✨
            </h2>

            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-xl mb-5">
              Bạn đang xem các bài viết công khai. Hãy tạo tài khoản ngay để thả cảm xúc, bình luận, kết bạn và sáng tạo video ngắn Reels không giới hạn!
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký miễn phí</span>
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition active:scale-95 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                to="/reels"
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-indigo-100 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5"
              >
                <Film className="w-4 h-4 text-rose-300" />
                <span>Xem Reels Video</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Horizontal Stories Carousel (Shown for all, guest gets prompt on create) */}
      <StorySection onOpenCreateStory={handleOpenCreateStory} />

      {/* 3. Create Post Trigger */}
      {isAuthenticated ? (
        <CreatePostCard onOpenCreateModal={handleOpenCreatePost} />
      ) : (
        <div
          onClick={handleOpenCreatePost}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl p-4 shadow-xs mb-6 cursor-pointer transition group select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              ?
            </div>
            <div className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 text-sm font-medium transition flex items-center justify-between">
              <span>Bạn đang nghĩ gì? Đăng nhập để chia sẻ bài viết...</span>
              <span className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-full font-semibold hidden sm:inline">
                Đăng bài
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Feed Navigation Tabs */}
      <div className="flex items-center justify-between mb-5">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          variant="pills"
        />
        <button
          onClick={handleRefresh}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Làm mới bảng tin"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* 5. Posts Feed Stream */}
      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Đang tải bảng tin...</p>
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id || post.postId}
                post={post}
                onPostDeleted={() => handlePostDeleted(post.id || post.postId)}
              />
            ))}
            {hasMore && (
              <div className="pt-2 pb-6 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Đang tải thêm...' : 'Tải thêm bài viết'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Chưa có bài viết nào
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              {isAuthenticated
                ? 'Hãy tạo bài viết đầu tiên hoặc theo dõi thêm bạn bè để làm phong phú bảng tin!'
                : 'Chưa có bài viết công khai nào được đăng gần đây. Hãy đăng ký tài khoản và là người đầu tiên!'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreatePost}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              {isAuthenticated ? 'Tạo bài viết ngay' : 'Đăng bài viết đầu tiên'}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
      />

      <LoginPromptModal
        isOpen={loginPromptState.isOpen}
        onClose={closeLoginPrompt}
        title={loginPromptState.title}
        message={loginPromptState.message}
      />
    </div>
  );
};

export default HomePage;

