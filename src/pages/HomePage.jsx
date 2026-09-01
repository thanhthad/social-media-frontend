import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import postService from '../services/postService';
import hashtagService from '../services/hashtagService';
import friendshipService from '../services/friendshipService';
import CreatePostForm from '../components/post/CreatePostForm';
import PostCard from '../components/post/PostCard';
import StoryBar from '../components/story/StoryBar';
import FriendSuggestions from '../components/friend/FriendSuggestions';
import PendingFriendRequests from '../components/friend/PendingFriendRequests';
import { PostSkeleton } from '../components/ui/Skeleton';
import { useUser } from '../contexts/UserContext';
import {
  Sparkles,
  Compass,
  TrendingUp,
  Heart,
  Clapperboard,
  Bookmark,
  MessageSquare,
  Users,
  User,
  ShieldCheck,
} from 'lucide-react';

const HomePage = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'explore'
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchTrending();
    friendshipService.getPendingFriendRequests(0, 1)
      .then((res) => {
        const data = res.data?.data;
        const count = data?.totalElements ?? data?.total ?? (Array.isArray(data?.content) ? data.content.length : 0);
        setPendingCount(count);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPosts(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchTrending = async () => {
    try {
      const res = await hashtagService.getTrending(5);
      if (res.data?.data) {
        setTrendingTags(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch trending tags', error);
    }
  };

  const fetchPosts = async (pageNum = 0, isReset = false) => {
    setLoading(true);
    try {
      const res =
        activeTab === 'feed'
          ? await postService.getFeed(pageNum, 10)
          : await postService.getExplore(pageNum, 10);

      const content = res.data?.data?.content || res.data?.data || [];
      if (isReset) {
        setPosts(content);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = content.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
      }
      setPage(pageNum);
      setHasMore(content.length === 10);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (loading || !hasMore) return;
    fetchPosts(page + 1, false);
  };

  const handlePostCreated = () => {
    if (activeTab === 'feed') {
      fetchPosts(0, true);
    } else {
      setActiveTab('feed');
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="max-w-5xl mx-auto flex justify-center gap-10 items-start pt-2 sm:pt-4">
      {/* Center Feed Column (Instagram Standard Width) */}
      <div className="w-full max-w-[630px] space-y-4 flex-1 min-w-0">
        {/* Story Bar */}
        <StoryBar />

        {/* Tab Selection */}
        <div className="flex bg-white rounded-2xl border border-gray-200/80 p-1 mb-3">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles size={14} />
            <span>Dành cho bạn</span>
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Compass size={14} />
            <span>Đang theo dõi & Khám phá</span>
          </button>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={() => fetchPosts(0, true)}
            />
          ))}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {!loading && hasMore && posts.length > 0 && (
          <button
            onClick={loadMore}
            className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-blue-600 font-bold hover:bg-gray-50 text-xs shadow-xs transition active:scale-[0.99] cursor-pointer"
          >
            Tải thêm bài viết
          </button>
        )}

        {!loading && !hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400 font-medium">
              ✨ Bạn đã xem hết tất cả bài viết mới nhất!
            </p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-6 space-y-2">
            <p className="text-gray-800 font-bold text-sm">Chưa có bài viết nào trong bảng tin.</p>
            <p className="text-gray-400 text-xs">Hãy theo dõi thêm người dùng khác để xem bài viết của họ!</p>
          </div>
        )}
      </div>

      {/* Right Sidebar Column (Instagram Desktop Style) */}
      <div className="hidden lg:block w-[320px] shrink-0 sticky top-8 space-y-5">
        {/* Current User Row */}
        <div className="flex items-center justify-between py-1">
          <Link to="/profile" className="flex items-center gap-3 min-w-0 flex-1 group">
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 text-xs truncate group-hover:underline">
                {user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.fullName || user?.email}</p>
            </div>
          </Link>
          <Link
            to="/profile"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            Chuyển
          </Link>
        </div>

        {/* Friend Requests Widget */}
        <PendingFriendRequests isWidget={true} limit={3} />

        {/* Friend Suggestions (Suggested For You) */}
        <FriendSuggestions />

        {/* Instagram Minimalist Footer Links */}
        <div className="pt-2 text-[11px] text-gray-400 space-y-3 leading-relaxed">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <span className="hover:underline cursor-pointer">Giới thiệu</span>•
            <span className="hover:underline cursor-pointer">Trợ giúp</span>•
            <span className="hover:underline cursor-pointer">Báo chí</span>•
            <span className="hover:underline cursor-pointer">API</span>•
            <span className="hover:underline cursor-pointer">Việc làm</span>•
            <span className="hover:underline cursor-pointer">Quyền riêng tư</span>•
            <span className="hover:underline cursor-pointer">Điều khoản</span>
          </div>
          <p className="text-gray-300 uppercase tracking-wider font-semibold">
            © {new Date().getFullYear()} SOCIAL MEDIA FROM PLATFORM
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
