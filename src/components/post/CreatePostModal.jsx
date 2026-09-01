import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Film, Send, Globe, Users, Lock } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import postService from '../../services/postService';
import toast from 'react-hot-toast';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('visibility', visibility);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await postService.createPost(formData);

      setContent('');
      setVisibility('PUBLIC');
      setSelectedFiles([]);
      toast.success('Đã chia sẻ bài viết mới!');
      onClose();

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800"
            >
              Hủy
            </button>
            <h3 className="font-bold text-gray-900 text-sm">Tạo bài viết mới</h3>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && selectedFiles.length === 0)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng...' : 'Chia sẻ'}
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* User Profile info */}
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-xs">{user?.fullName || user?.username}</p>
                <div className="mt-0.5">
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-[11px] font-semibold text-gray-600 bg-gray-100 rounded-lg px-2 py-0.5 border-none outline-none cursor-pointer"
                  >
                    <option value="PUBLIC">Công khai</option>
                    <option value="FRIEND">Bạn bè</option>
                    <option value="PRIVATE">Chỉ mình tôi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              className="w-full resize-none outline-none text-gray-800 placeholder-gray-400 text-sm leading-relaxed min-h-[120px]"
              placeholder="Viết chú thích hoặc chia sẻ suy nghĩ của bạn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Media Upload Area */}
            {selectedFiles.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50/50 hover:bg-blue-50/20 transition"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Image size={24} />
                </div>
                <p className="text-xs font-bold text-gray-700">Kéo thả ảnh hoặc video vào đây</p>
                <p className="text-[11px] text-gray-400">Chọn từ máy tính của bạn</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {selectedFiles.map((file, index) => {
                  const isVideo = file.type.startsWith('video');
                  const fileUrl = URL.createObjectURL(file);
                  return (
                    <div
                      key={index}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-xs"
                    >
                      {isVideo ? (
                        <video src={fileUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={fileUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white rounded-full p-1 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}

                {/* Add more button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 transition"
                >
                  <Image size={20} />
                  <span className="text-[10px] font-bold mt-1">Thêm</span>
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept="image/*,video/*"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
