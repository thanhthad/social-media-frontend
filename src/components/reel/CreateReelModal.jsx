import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Video,
  Image as ImageIcon,
  Sparkles,
  Globe,
  Users,
  Lock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import reelService from '../../services/reelService';

export default function CreateReelModal({ isOpen, onClose, onReelCreated }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [duration, setDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const videoElemRef = useRef(null);

  if (!isOpen) return null;

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check video format
    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn tệp video hợp lệ (.mp4, .mov, .webm)');
      return;
    }

    // Check size max 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Dung lượng video tối đa là 100MB');
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);

    // Reset custom thumbnail
    setThumbnailFile(null);
    setThumbnailPreviewUrl('');
  };

  const handleLoadedMetadata = () => {
    if (videoElemRef.current) {
      const dur = Math.round(videoElemRef.current.duration);
      setDuration(dur);
      if (dur > 90) {
        toast('Video dài hơn 90s, hệ thống sẽ tối ưu cho định dạng Reel ngắn', {
          icon: 'ℹ️',
        });
      }
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp ảnh hợp lệ');
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  };

  const handleAddHashtag = (tag) => {
    setContent((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Vui lòng chọn video cho Reel của bạn');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    if (content.trim()) {
      formData.append('content', content.trim());
    }
    formData.append('visibility', visibility);

    try {
      await reelService.createReel(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      toast.success('🎉 Đã tạo Reel thành công!');
      if (onReelCreated) onReelCreated();
      handleClose();
    } catch (err) {
      console.error('Failed to create reel', err);
      const errMsg = err.response?.data?.message || 'Không thể tạo Reel, vui lòng thử lại';
      toast.error(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) {
      if (!window.confirm('Quá trình tải lên đang diễn ra. Bạn có chắc muốn hủy?')) {
        return;
      }
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl('');
    setThumbnailFile(null);
    setThumbnailPreviewUrl('');
    setContent('');
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  };

  const quickTags = ['#fyp', '#trending', '#viral', '#reels', '#lifestyle', '#funny'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
        <div className="absolute inset-0" onClick={handleClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
                <Video size={20} />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg tracking-tight">Tạo Reel mới</h3>
                <p className="text-xs text-gray-400">Chia sẻ khoảnh khắc video ngắn với mọi người</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Video Picker & Preview */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                  Video Reel <span className="text-rose-500">*</span>
                </label>

                {!videoPreviewUrl ? (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="h-80 border-2 border-dashed border-gray-200 hover:border-pink-500 rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer group bg-gray-50/50 hover:bg-pink-50/30 transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-inner">
                      <Upload size={28} />
                    </div>
                    <p className="font-bold text-sm text-gray-800 group-hover:text-pink-600 transition">
                      Nhấn để tải video lên
                    </p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                      Định dạng MP4, MOV, WebM (Tối đa 90s, dung lượng ≤ 100MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden bg-black aspect-[9/16] max-h-80 mx-auto shadow-lg group">
                    <video
                      ref={videoElemRef}
                      src={videoPreviewUrl}
                      onLoadedMetadata={handleLoadedMetadata}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreviewUrl('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition shadow"
                    >
                      <X size={16} />
                    </button>
                    {duration > 0 && (
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] font-bold text-white">
                        {duration}s
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoSelect}
                  className="hidden"
                />

                {/* Optional Custom Thumbnail */}
                {videoPreviewUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-indigo-500" />
                        Ảnh bìa tùy chỉnh (Tùy chọn)
                      </label>
                      {thumbnailPreviewUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailFile(null);
                            setThumbnailPreviewUrl('');
                          }}
                          className="text-xs text-rose-500 font-semibold hover:underline"
                        >
                          Xóa ảnh bìa
                        </button>
                      )}
                    </div>

                    {!thumbnailPreviewUrl ? (
                      <button
                        type="button"
                        onClick={() => thumbInputRef.current?.click()}
                        className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 hover:border-indigo-400 rounded-2xl text-xs font-semibold text-gray-600 hover:text-indigo-600 flex items-center justify-center gap-2 transition"
                      >
                        <ImageIcon size={16} />
                        <span>Chọn ảnh bìa từ máy</span>
                      </button>
                    ) : (
                      <div className="relative w-20 h-28 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md">
                        <img src={thumbnailPreviewUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Content & Metadata */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Caption Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-600">Mô tả Reel</label>
                      <span className="text-[11px] text-gray-400">{content.length}/500</span>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value.slice(0, 500))}
                      placeholder="Viết chú thích cho video Reel của bạn... Thêm hashtag để tăng độ lan tỏa! ✨"
                      rows={5}
                      className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-pink-500 focus:bg-white rounded-2xl text-sm text-gray-800 outline-none transition resize-none"
                    />
                  </div>

                  {/* Quick Hashtags */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      Gợi ý Hashtag thịnh hành
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {quickTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddHashtag(tag)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-pink-100 text-gray-700 hover:text-pink-600 rounded-full text-xs font-medium transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visibility Setting */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Quyền riêng tư</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibility('PUBLIC')}
                        className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                          visibility === 'PUBLIC'
                            ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Globe size={16} />
                        <span>Công khai</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility('FRIEND')}
                        className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                          visibility === 'FRIEND'
                            ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Users size={16} />
                        <span>Bạn bè</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility('PRIVATE')}
                        className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                          visibility === 'PRIVATE'
                            ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Lock size={16} />
                        <span>Chỉ mình tôi</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Đang xử lý & tải video lên...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-2xl text-sm font-bold transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!videoFile || isUploading}
                className="px-7 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-700 hover:to-amber-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang đăng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Đăng Reel</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
