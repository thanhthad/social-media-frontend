import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, User, Hash, FileText, RefreshCw, UserPlus } from 'lucide-react';
import postService from '../services/postService';
import userService from '../services/userService';
import hashtagService from '../services/hashtagService';
import friendshipService from '../services/friendshipService';
import PostCard from '../components/post/PostCard';
import Tabs from '../components/ui/Tabs';
import toast from 'react-hot-toast';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(query);
  const [activeTab, setActiveTab] = useState('posts');

  const [postResults, setPostResults] = useState([]);
  const [peopleResults, setPeopleResults] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [hashtagResults, setHashtagResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchParams({ q: inputVal.trim() });
  };

  // Perform search based on active tab and query
  const executeSearch = useCallback(async () => {
    if (!query) {
      // If no query, fetch trending hashtags for the tags tab
      try {
        const trendRes = await hashtagService.getTrending();
        setTrendingHashtags(trendRes.data?.data || []);
      } catch (e) {}
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const res = query.startsWith('#')
          ? await postService.searchByHashtag(query.replace('#', ''), 0, 20)
          : await postService.searchByContent(query, 0, 20);
        const list = res.data?.data?.content || res.data?.data || [];
        setPostResults(Array.isArray(list) ? list : []);
      } else if (activeTab === 'people') {
        const res = await userService.searchUsers(query, 0, 20);
        const list = res.data?.data?.content || res.data?.data || [];
        setPeopleResults(Array.isArray(list) ? list : []);
      } else if (activeTab === 'tags') {
        const [searchRes, trendRes] = await Promise.allSettled([
          hashtagService.searchHashtags(query.replace('#', '')),
          hashtagService.getTrending(),
        ]);
        if (searchRes.status === 'fulfilled') {
          const list = searchRes.value.data?.data || [];
          setHashtagResults(Array.isArray(list) ? list : []);
        }
        if (trendRes.status === 'fulfilled') {
          setTrendingHashtags(trendRes.value.data?.data || []);
        }
      }
    } catch (err) {
      console.error('Search error', err);
      toast.error('Lỗi trong quá trình tìm kiếm');
    } finally {
      setLoading(false);
    }
  }, [query, activeTab]);

  useEffect(() => {
    setInputVal(query);
    executeSearch();
  }, [query, activeTab, executeSearch]);

  const handleSendFriendRequest = async (userId) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      toast.success('Đã gửi lời mời kết bạn');
    } catch (e) {
      toast.error('Không thể gửi lời mời kết bạn');
    }
  };

  const tabs = [
    { id: 'posts', label: 'Bài viết', icon: FileText },
    { id: 'people', label: 'Mọi người', icon: User },
    { id: 'tags', label: 'Chủ đề #hashtag', icon: Hash },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs mb-6">
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2]" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Tìm kiếm bài viết, mọi người, chủ đề #hashtag..."
            className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-600 transition"
          />
        </form>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Results: Posts */}
      {!loading && activeTab === 'posts' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {postResults.length > 0 ? (
            postResults.map((post) => (
              <PostCard
                key={post.id || post.postId}
                post={post}
                onPostUpdated={executeSearch}
                onPostDeleted={(deletedId) =>
                  setPostResults((prev) =>
                    prev.filter((p) => (p.id || p.postId) !== deletedId)
                  )
                }
              />
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <Search className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {query
                  ? `Không tìm thấy bài viết nào cho từ khóa "${query}"`
                  : 'Nhập từ khóa tìm kiếm để bắt đầu'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results: People */}
      {!loading && activeTab === 'people' && (
        <div className="space-y-3 max-w-2xl mx-auto">
          {peopleResults.length > 0 ? (
            peopleResults.map((person) => {
              const uId = person.userId || person.id;
              const name = person.fullName || person.username || 'Người dùng';
              const avatar =
                person.avatarUrl ||
                person.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

              return (
                <div
                  key={uId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-sm transition"
                >
                  <Link
                    to={`/profile/${uId}`}
                    className="flex items-center gap-3.5 min-w-0 group"
                  >
                    <img
                      src={avatar}
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-600 transition"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                        {name}
                      </h4>
                      {person.username && (
                        <span className="text-xs text-slate-400 truncate block">
                          @{person.username}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/profile/${uId}`}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                    >
                      Trang cá nhân
                    </Link>
                    <button
                      onClick={() => handleSendFriendRequest(uId)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Kết bạn</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <User className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {query
                  ? `Không tìm thấy người dùng nào phù hợp với "${query}"`
                  : 'Nhập tên hoặc username để tìm người dùng'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results: Tags & Trending */}
      {!loading && activeTab === 'tags' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          {/* If there are search results for hashtags */}
          {hashtagResults.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Hashtag khớp với tìm kiếm
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hashtagResults.map((tag, i) => (
                  <div
                    key={tag.id || i}
                    onClick={() => {
                      const tagName = tag.name ? `#${tag.name}` : tag;
                      setInputVal(tagName);
                      setSearchParams({ q: tagName });
                      setActiveTab('posts');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition flex items-center justify-between"
                  >
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      #{tag.name || tag}
                    </span>
                    {tag.usageCount !== undefined && (
                      <span className="text-xs text-slate-400">
                        {tag.usageCount} bài viết
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Hashtags */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-600" />
              Chủ đề xu hướng hôm nay
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {trendingHashtags.length > 0 ? (
                trendingHashtags.map((trend, i) => (
                  <div
                    key={trend.id || i}
                    onClick={() => {
                      const tagStr = `#${trend.name || trend.tag || trend}`;
                      setInputVal(tagStr);
                      setSearchParams({ q: tagStr });
                      setActiveTab('posts');
                    }}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        #{trend.name || trend.tag || trend}
                      </span>
                      <span className="text-xs text-slate-400">Chủ đề thịnh hành</span>
                    </div>
                    {trend.usageCount !== undefined && (
                      <span className="text-xs text-indigo-600 font-semibold">
                        {trend.usageCount} bài viết
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Đang cập nhật danh sách chủ đề xu hướng...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
