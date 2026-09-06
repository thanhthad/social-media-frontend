import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import hashtagService from '../services/hashtagService';
import CreatePostForm from '../components/post/CreatePostForm';
import PostCard from '../components/post/PostCard';
import StoryBar from '../components/story/StoryBar';
import FriendSuggestions from '../components/friend/FriendSuggestions';
import PendingFriendRequests from '../components/friend/PendingFriendRequests';
import { PostSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useUser } from '../contexts/UserContext';
import {
  Sparkles,
  Compass,
  Users,
  Search,
  TrendingUp,
} from 'lucide-react';

const HomePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'explore'
  const loadMoreRef = useRef(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    fetchPosts(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchTrending = async () => {
    try {
      const res = await hashtagService.getTrending(5);
      if (res.data?.data) setTrendingTags(res.data.data);
    } catch (err) {
      // silently ignore trending tags failure
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
          return [...prev, ...content.filter((p) => !existingIds.has(p.id))];
        });
      }
      setPage(pageNum);
      setHasMore(content.length === 10);
    } catch (err) {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (loading || !hasMore) return;
    fetchPosts(page + 1, false);
  };

  const handlePostCreated = () => {
    if (activeTab === 'feed') fetchPosts(0, true);
    else setActiveTab('feed');
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="max-w-5xl mx-auto flex justify-center gap-8 items-start pt-2 sm:pt-4 pb-4">
      {/* ── Center Feed Column ── */}
      <div className="w-full max-w-[600px] flex-1 min-w-0 space-y-3">
        {/* Story Bar */}
        <StoryBar />

        {/* Feed Tabs — minimal pill style */}
        <div className="flex bg-white rounded-2xl border border-slate-200 p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={13} />
            Dành cho bạn
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Compass size={13} />
            Khám phá
          </button>
        </div>

        {/* Create Post form (only for feed tab) */}
        {activeTab === 'feed' && <CreatePostForm onPostCreated={handlePostCreated} />}

        {/* Posts */}
        <div className="space-y-3">
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
          <div className="space-y-3">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && posts.length > 0 && (
          <button
            onClick={loadMore}
            className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-indigo-600 font-semibold hover:bg-slate-50 text-xs shadow-xs transition active:scale-[0.99] cursor-pointer"
          >
            Tải thêm bài viết
          </button>
        )}

        {/* End of feed */}
        {!loading && !hasMore && posts.length > 0 && (
          <p className="text-center py-6 text-xs text-slate-400 font-medium">
            ✦ Bạn đã xem hết bài viết mới nhất
          </p>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card">
            <EmptyState
              icon={<Users size={28} />}
              title={activeTab === 'feed' ? 'Bảng tin đang trống' : 'Chưa có bài viết nào'}
              description={
                activeTab === 'feed'
                  ? 'Hãy kết bạn hoặc theo dõi thêm người dùng để xem bài viết của họ.'
                  : 'Chưa có bài viết để khám phá. Hãy quay lại sau.'
              }
              action={
                activeTab === 'feed'
                  ? { label: 'Tìm bạn bè', onClick: () => navigate('/friends') }
                  : undefined
              }
            />
          </div>
        )}
      </div>

      {/* ── Right Sidebar (Desktop only) ── */}
      <div className="hidden lg:block w-[300px] shrink-0 sticky top-5 space-y-4">
        {/* Current User Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card">
          <Link to="/profile" className="flex items-center gap-3 group">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 group-hover:border-indigo-300 transition-colors flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-slate-400 truncate">@{user?.username}</p>
            </div>
          </Link>
        </div>

        {/* Pending Friend Requests */}
        <PendingFriendRequests isWidget={true} limit={3} />

        {/* Friend Suggestions */}
        <FriendSuggestions />

        {/* Trending Hashtags */}
        {trendingTags.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <TrendingUp size={14} className="text-indigo-500" />
              Xu hướng
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {trendingTags.map((tag) => (
                <Link
                  key={tag.name || tag}
                  to={`/search?q=${encodeURIComponent(tag.name || tag)}&type=tag`}
                  className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full hover:bg-indigo-100 transition-colors"
                >
                  #{tag.name || tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="text-[11px] text-slate-400 leading-loose px-1">
          <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
            {['Giới thiệu', 'Trợ giúp', 'Quyền riêng tư', 'Điều khoản'].map((item) => (
              <span key={item} className="hover:text-slate-600 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-1 text-slate-300 uppercase tracking-wide font-medium text-[10px]">
            © {new Date().getFullYear()} VibeSocial
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
