import React, { useState, useRef } from 'react';
import { Image, X, UploadCloud, Film } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { useUser } from '../../contexts/UserContext';
import postService from '../../services/postService';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // File objects
  const [previews, setPreviews] = useState([]);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const currentUser = {
    name: user?.fullName || user?.name || user?.userName || 'Bạn',
    avatar: user?.avatarUrl || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > 5) {
      toast.error('Chỉ được tải lên tối đa 5 tệp mỗi bài viết');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      name: file.name,
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(previews[index]?.url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc chọn tệp đính kèm');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (content.trim()) {
        formData.append('content', content.trim());
      }
      formData.append('visibility', visibility);
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await postService.createPost(formData);
      toast.success('Đã đăng bài viết thành công!');

      // Reset
      setContent('');
      setSelectedFiles([]);
      setPreviews([]);
      onClose();
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error('Create post error:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo bài viết mới" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Author & Visibility Selector */}
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-600/20"
          />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {currentUser.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
              >
                <option value="PUBLIC">Công khai 🌐</option>
                <option value="FRIEND">Bạn bè 👥</option>
                <option value="PRIVATE">Chỉ mình tôi 🔒</option>
              </select>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`${currentUser.name} ơi, bạn đang nghĩ gì thế? Thêm #hashtag...`}
          className="w-full text-sm bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 outline-none resize-none leading-relaxed"
          autoFocus
        />

        {/* Media Preview Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {previews.map((item, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-900">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Tải ảnh / Video</span>
          </button>

          <Button
            type="submit"
            disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
            className="px-5 py-2 text-xs font-semibold"
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng bài viết'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
