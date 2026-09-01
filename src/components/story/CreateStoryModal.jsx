import { useState, useRef } from 'react';
import storyService from '../../services/storyService';
import toast from 'react-hot-toast';
import { X, Image, Video, Globe, Users, Lock, Sparkles } from 'lucide-react';

export default function CreateStoryModal({ onClose, onCreated }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('Kích thước tệp tối đa là 50MB');
      return;
    }

    setFile(selectedFile);
    setIsVideo(selectedFile.type.startsWith('video/'));
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Vui lòng chọn ảnh hoặc video cho tin!');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung hoặc chú thích cho tin!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('content', content.trim());
    formData.append('visibility', visibility);

    setLoading(true);
    try {
      await storyService.createStory(formData);
      toast.success('Đã đăng tin mới thành công!');
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create story', err);
      toast.error(err.response?.data?.message || 'Không thể đăng tin. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-lg">Tạo tin 24h mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Media Preview / Selector */}
          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden bg-black/90 aspect-[9/16] max-h-72 w-full mx-auto flex items-center justify-center group shadow-inner">
              {isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className="w-full h-full object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl('');
                }}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white hover:bg-red-600 rounded-full backdrop-blur-sm transition"
                title="Chọn lại tệp khác"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-indigo-50/40 hover:bg-indigo-50/70 cursor-pointer transition-all duration-200 text-center"
            >
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
                <Image className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Tải ảnh hoặc video lên</p>
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ JPG, PNG, WEBP, MP4, MOV (tối đa 50MB)</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Caption / Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Chú thích tin *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ khoảnh khắc hôm nay của bạn..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none resize-none h-20 text-sm transition"
              maxLength={500}
              required
            />
            <span className="text-[11px] text-gray-400 float-right mt-1">
              {content.length}/500
            </span>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ai có thể xem tin này?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'PUBLIC', label: 'Công khai', icon: Globe },
                { key: 'FRIEND', label: 'Bạn bè', icon: Users },
                { key: 'PRIVATE', label: 'Chỉ mình tôi', icon: Lock },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVisibility(key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition ${
                    visibility === key
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 text-sm transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !file || !content.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 transition transform active:scale-95"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{loading ? 'Đang đăng...' : 'Đăng tin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
