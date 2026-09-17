import React, { useState, useEffect, useCallback } from 'react';
import { Bookmark, RefreshCw } from 'lucide-react';
import PostCard from '../components/post/PostCard';
import savedPostService from '../services/savedPostService';
import toast from 'react-hot-toast';

export const SavedPostsPage = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await savedPostService.getSavedPosts(0, 30);
      const data = res.data?.data?.content || res.data?.data || [];
      setSavedPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load saved posts', err);
      toast.error('Không thể tải danh sách bài viết đã lưu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs mb-6">
        <div className="flex items-center gap-2.5 mb-1 text-amber-500">
          <Bookmark className="w-5 h-5 fill-current" />
          <span className="text-xs font-bold uppercase tracking-wider">Bộ sưu tập</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Bài viết đã lưu ({savedPosts.length})
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Danh sách các bài viết bạn đã đánh dấu để xem lại sau
        </p>
      </div>

      {/* Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : savedPosts.length > 0 ? (
          savedPosts.map((post) => (
            <PostCard
              key={post.id || post.postId}
              post={{ ...post, isSaved: true }}
              onPostUpdated={fetchSavedPosts}
              onPostDeleted={() => fetchSavedPosts()}
            />
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
            <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Chưa có bài viết nào được lưu
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Nhấn vào biểu tượng Lưu trên bất kỳ bài viết nào để lưu lại tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPostsPage;
