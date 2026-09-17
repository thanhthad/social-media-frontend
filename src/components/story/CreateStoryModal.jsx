import React, { useState, useRef } from 'react';
import { UploadCloud, X, Film, Image as ImageIcon } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import storyService from '../../services/storyService';
import { useSocial } from '../../contexts/MockSocialContext';

export const CreateStoryModal = ({ isOpen, onClose }) => {
  const { refreshData } = useSocial();
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleClearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Vui lòng chọn ảnh hoặc video cho story');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung cho story');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('visibility', visibility);
      formData.append('file', file);

      await storyService.createStory(formData);
      toast.success('Tin của bạn đã được đăng thành công!');

      handleClearFile();
      setContent('');
      onClose();
      if (refreshData) refreshData();
    } catch (err) {
      console.error('Create story error:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo story');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo tin 24h mới" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Media Preview Box */}
        <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800">
          {previewUrl ? (
            file?.type.startsWith('video') ? (
              <video src={previewUrl} controls className="w-full h-full object-cover" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="text-center p-6 text-slate-400 cursor-pointer hover:opacity-80 transition"
            >
              <UploadCloud className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
              <p className="text-xs font-semibold text-slate-300">Nhấn để tải lên ảnh hoặc video</p>
              <p className="text-[11px] text-slate-500 mt-1">Hỗ trợ JPG, PNG, MP4 tối đa 24h</p>
            </div>
          )}

          {previewUrl && (
            <button
              type="button"
              onClick={handleClearFile}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {content && (
            <div className="absolute bottom-3 inset-x-3 text-center pointer-events-none">
              <span className="text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                {content}
              </span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Content input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nội dung chú thích *
          </label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ khoảnh khắc của bạn..."
            className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-600 text-slate-900 dark:text-white"
            required
            maxLength={500}
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Quyền riêng tư:
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-white"
          >
            <option value="PUBLIC">Công khai (Public)</option>
            <option value="FRIEND">Bạn bè (Friends)</option>
            <option value="PRIVATE">Chỉ mình tôi (Private)</option>
          </select>
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Đăng Story
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStoryModal;
