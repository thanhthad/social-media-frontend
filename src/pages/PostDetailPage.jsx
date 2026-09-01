import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import PostCard from '../components/post/PostCard';
import { ArrowLeft } from 'lucide-react';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      setLoading(true);
      postService
        .getPostById(postId)
        .then((res) => {
          setPost(res.data?.data || res.data);
        })
        .catch((err) => {
          console.error('Failed to load post detail', err);
        })
        .finally(() => setLoading(false));
    }
  }, [postId]);

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Top navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition text-sm w-fit"
      >
        <ArrowLeft size={18} />
        <span>Quay lại</span>
      </button>

      {loading ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-center items-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : post ? (
        <PostCard
          post={post}
          onPostDeleted={() => navigate('/')}
          onPostUpdated={() => {
            postService.getPostById(postId).then((res) => setPost(res.data?.data));
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-700 font-bold text-base">Bài viết không tồn tại hoặc đã bị xóa.</p>
        </div>
      )}
    </div>
  );
}
