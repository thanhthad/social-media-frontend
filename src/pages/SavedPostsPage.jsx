import { useState, useEffect } from 'react';
import postService from '../services/postService';
import PostCard from '../components/post/PostCard';
import { Bookmark } from 'lucide-react';
import { PostSkeleton } from '../components/ui/Skeleton';

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchSavedPosts = async (pageNum = 0, isReset = false) => {
    setLoading(true);
    try {
      const res = await postService.getSavedPosts(pageNum, 10);
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
    } catch (err) {
      console.error('Failed to load saved posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts(0, true);
  }, []);

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-blue-600 fill-blue-600" />
            Bài viết đã lưu
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Chỉ bạn mới có thể nhìn thấy các bài viết bạn đã lưu.
          </p>
        </div>
      </div>

      {/* Post list */}
      <div className="space-y-5">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={() => fetchSavedPosts(0, true)}
          />
        ))}

        {loading && (
          <div className="space-y-5">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 space-y-3">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Bookmark size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800">Chưa có bài viết nào được lưu</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Lưu bài viết và video để xem lại sau bất cứ khi nào bạn muốn.
            </p>
          </div>
        )}

        {!loading && hasMore && posts.length > 0 && (
          <button
            onClick={() => fetchSavedPosts(page + 1, false)}
            className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-blue-600 font-semibold hover:bg-blue-50 text-sm shadow-sm transition"
          >
            Tải thêm bài viết đã lưu
          </button>
        )}
      </div>
    </div>
  );
}
