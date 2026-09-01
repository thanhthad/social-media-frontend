import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Globe, Users, Lock, X, Sparkles, Send, Film } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import postService from '../../services/postService';
import toast from 'react-hot-toast';

export default function CreatePostForm({ onPostCreated }) {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);

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
      setIsFocused(false);
      toast.success('🎉 Đã đăng bài viết thành công!');

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Không thể đăng bài, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`glass-card rounded-3xl p-5 mb-5 transition-all duration-300 ${
        isFocused ? 'ring-2 ring-blue-500/20 shadow-lg border-blue-200' : 'shadow-sm'
      }`}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3.5">
          {/* User Avatar */}
          <div className="relative flex-shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.username || 'User'}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-gray-100"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>

          {/* Input Area */}
          <div className="flex-1 min-w-0">
            <textarea
              className="w-full resize-none outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base bg-transparent font-normal leading-relaxed pt-1"
              rows={isFocused || content.length > 50 ? 3 : 2}
              placeholder={`Chào ${user?.username || 'bạn'}, bạn đang có ý tưởng gì hôm nay?`}
              value={content}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* Selected Media Previews */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-2.5 pt-2 pl-0 sm:pl-14"
            >
              {selectedFiles.map((file, index) => {
                const isVideo = file.type.startsWith('video');
                const fileUrl = URL.createObjectURL(file);
                return (
                  <div
                    key={index}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 group rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-sm"
                  >
                    {isVideo ? (
                      <video src={fileUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={fileUrl} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    )}

                    {isVideo && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[9px] font-bold text-white flex items-center gap-1">
                        <Film size={10} /> Video
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white rounded-full p-1 shadow-md transition-all opacity-80 hover:opacity-100 flex items-center justify-center w-6 h-6 text-xs"
                      aria-label="Remove media"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bottom Bar */}
        <div className="mt-3 pt-3 border-t border-gray-100/90 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {/* Media Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-semibold text-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Image size={14} />
              </div>
              <span className="hidden sm:inline">Ảnh / Video</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept="image/*,video/*"
            />

            {/* Visibility Selector */}
            <div className="relative flex items-center">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="text-xs border border-gray-200/80 rounded-xl text-gray-700 bg-gray-50/80 hover:bg-gray-100 transition-colors py-1.5 px-3 pr-7 outline-none cursor-pointer font-semibold appearance-none"
              >
                <option value="PUBLIC">🌍 Công khai</option>
                <option value="FRIEND">👥 Bạn bè</option>
                <option value="PRIVATE">🔒 Chỉ mình tôi</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!content.trim() && selectedFiles.length === 0)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-5 rounded-2xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-xs hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={13} />
            )}
            <span>Đăng bài</span>
          </button>
        </div>
      </form>
    </div>
  );
}
