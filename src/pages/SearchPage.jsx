import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import postService from '../services/postService';
import hashtagService from '../services/hashtagService';
import PostCard from '../components/post/PostCard';
import { Search, User, Grid, Hash, Heart, MessageCircle, Play, Sparkles, TrendingUp, X } from 'lucide-react';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialType = queryParams.get('type') === 'tag' ? 'tag' : null;

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialQuery ? 'posts' : 'explore'); // 'explore' | 'users' | 'posts'
  const [searchType, setSearchType] = useState(initialType);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingExplore, setLoadingExplore] = useState(false);

  // Fetch trending hashtags
  useEffect(() => {
    hashtagService.getTrending(8)
      .then((res) => {
        const list = res.data?.data || [];
        setTrendingTags(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  // Fetch Explore Grid when in explore tab and no search query
  useEffect(() => {
    if (!initialQuery) {
      setLoadingExplore(true);
      postService.getExplore(0, 30)
        .then((res) => {
          const content = res.data?.data?.content || res.data?.data || [];
          setExplorePosts(Array.isArray(content) ? content : []);
        })
        .catch((err) => console.error('Failed to load explore feed', err))
        .finally(() => setLoadingExplore(false));
    }
  }, [initialQuery]);

  // Handle URL query changes
  useEffect(() => {
    if (initialQuery) {
      if (initialType === 'tag') {
        setActiveTab('posts');
      } else if (activeTab === 'explore') {
        setActiveTab('users');
      }
      performSearch(initialQuery, initialType === 'tag' ? 'posts' : (activeTab === 'explore' ? 'users' : activeTab), initialType);
    } else {
      setActiveTab('explore');
      setHasSearched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const performSearch = async (searchQuery, tab, sType = null) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      if (tab === 'users') {
        const res = await userService.searchUsers(searchQuery.trim(), 0, 30);
        setUsers(res.data?.data?.content || res.data?.data || []);
      } else {
        if (sType === 'tag' || searchQuery.startsWith('#')) {
          const cleanTag = searchQuery.replace(/^#/, '');
          const res = await postService.searchByHashtag(cleanTag);
          setPosts(res.data?.data?.content || res.data?.data || []);
        } else {
          const res = await postService.searchByContent(searchQuery.trim());
          setPosts(res.data?.data?.content || res.data?.data || []);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      if (tab === 'users') setUsers([]);
      else setPosts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      navigate('/search');
      return;
    }
    const isTag = query.trim().startsWith('#');
    navigate(`/search?q=${encodeURIComponent(query.trim())}${isTag ? '&type=tag' : ''}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (query.trim() && tab !== 'explore') {
      performSearch(query, tab, searchType);
    }
  };

  const handleTagClick = (tagName) => {
    const formatted = `#${tagName.replace(/^#/, '')}`;
    setQuery(formatted);
    setSearchType('tag');
    setActiveTab('posts');
    navigate(`/search?q=${encodeURIComponent(formatted)}&type=tag`);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setExplorePosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 px-3 sm:px-4 space-y-5">
      {/* ── Search Input & Header ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Search size={19} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm người dùng, bài viết, hoặc #hashtag..."
            className="w-full pl-11 pr-24 py-3 bg-gray-50/80 border border-gray-200/90 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                navigate('/search');
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? '...' : 'Tìm'}
          </button>
        </form>

        {/* Trending Hashtag Pills */}
        {trendingTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto dating-scrollbar pt-1 pb-0.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
              <TrendingUp size={12} className="text-amber-500" /> Thịnh hành:
            </span>
            {trendingTags.map((tag, idx) => (
              <button
                key={tag.id || idx}
                onClick={() => handleTagClick(tag.name || tag.hashtag)}
                className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                #{tag.name || tag.hashtag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Sub Navigation Tabs ── */}
      {hasSearched ? (
        <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1 shadow-xs">
          <button
            onClick={() => handleTabChange('users')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <User size={15} />
            <span>Người dùng ({users.length})</span>
          </button>
          <button
            onClick={() => handleTabChange('posts')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Grid size={15} />
            <span>Bài viết ({posts.length})</span>
          </button>
        </div>
      ) : null}

      {/* ── Main Content Area ── */}
      {isSearching ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-400">Đang tìm kiếm...</p>
        </div>
      ) : hasSearched ? (
        /* SEARCH RESULTS */
        activeTab === 'users' ? (
          users.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 space-y-2">
              <User size={36} className="mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-600">Không tìm thấy người dùng nào phù hợp</p>
              <p className="text-xs text-gray-400">Thử tìm bằng tên hiển thị hoặc username khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map((user, idx) => (
                <Link
                  key={`search-user-${user.id || idx}-${idx}`}
                  to={`/users/${user.id}`}
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatarUrl || 'https://via.placeholder.com/48'}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:ring-2 group-hover:ring-blue-400 transition"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate group-hover:text-blue-600 transition">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                    Xem
                  </span>
                </Link>
              ))}
            </div>
          )
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 space-y-2">
            <Grid size={36} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-600">Không tìm thấy bài viết nào</p>
            <p className="text-xs text-gray-400">Thử tìm với từ khóa hoặc hashtag khác</p>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-4">
            {posts.map((post, idx) => (
              <PostCard
                key={`search-post-${post.id || idx}-${idx}`}
                post={post}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        )
      ) : (
        /* INSTAGRAM EXPLORE MEDIA GRID */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <h3 className="text-base font-black text-gray-900 tracking-tight">Khám Phá Xu Hướng</h3>
            </div>
            <span className="text-xs text-gray-400 font-semibold">{explorePosts.length} nội dung</span>
          </div>

          {loadingExplore ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-400">Đang khám phá thế giới...</p>
            </div>
          ) : explorePosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 space-y-2">
              <Grid size={36} className="mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-600">Chưa có nội dung khám phá</p>
              <p className="text-xs text-gray-400">Hãy là người đầu tiên chia sẻ khoảnh khắc đẹp!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 rounded-2xl overflow-hidden">
              {explorePosts.map((post, idx) => {
                const media = post.postMediaResponses || post.media || [];
                const firstMedia = media[0];
                const isVideo = firstMedia?.mediaType === 'VIDEO' || post.type === 'REEL';
                const hasMultiple = media.length > 1;
                const mediaUrl = firstMedia?.mediaUrl || firstMedia?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80';

                return (
                  <Link
                    key={post.id || idx}
                    to={post.type === 'REEL' ? `/reels` : `/`}
                    className="relative aspect-square bg-gray-100 group overflow-hidden cursor-pointer"
                  >
                    {/* Media Thumbnail */}
                    {isVideo ? (
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    )}

                    {/* Top Right Badges */}
                    <div className="absolute top-2 right-2 z-10 drop-shadow">
                      {isVideo ? (
                        <span className="p-1 bg-black/50 text-white rounded-md flex items-center justify-center backdrop-blur-xs">
                          <Play size={12} className="fill-current" />
                        </span>
                      ) : hasMultiple ? (
                        <span className="p-1 bg-black/50 text-white rounded-md flex items-center justify-center backdrop-blur-xs">
                          <Grid size={12} />
                        </span>
                      ) : null}
                    </div>

                    {/* Instagram Hover Stats Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 text-white font-bold text-sm z-20">
                      <div className="flex items-center gap-1.5">
                        <Heart size={16} className="fill-current text-white" />
                        <span>{post.reactionCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle size={16} className="fill-current text-white" />
                        <span>{post.commentCount || 0}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
