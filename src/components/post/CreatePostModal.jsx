import React, { useState, useRef } from 'react';
import { UploadCloud, X, Sparkles, Mic, Volume2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { useUser } from '../../contexts/UserContext';
import postService from '../../services/postService';
import AIMagicWriter from './AIMagicWriter';
import VoiceNoteRecorder from './VoiceNoteRecorder';
import soundFX from '../../utils/soundEffects';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // File objects
  const [previews, setPreviews] = useState([]);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIMagicOpen, setIsAIMagicOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleToggleSpeechToText = () => {
    soundFX.playPop();
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói trực tiếp.');
      return;
    }

    if (isListeningSpeech) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListeningSpeech(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListeningSpeech(true);
        toast('🎙️ Đang lắng nghe giọng nói... Hãy nói nội dung!', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => setIsListeningSpeech(false);
      recognition.onend = () => setIsListeningSpeech(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListeningSpeech(false);
    }
  };

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

        {/* AI Magic Polish Trigger Ribbon */}
        <div className="flex items-center justify-between py-1 px-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px]">Trợ lý viết bài thông minh</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              setIsAIMagicOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>AI Magic Polish</span>
          </button>
        </div>

        {/* Voice Note Recorder Bar */}
        {isVoiceRecorderOpen && (
          <VoiceNoteRecorder
            onAttachAudio={(audioFile) => {
              setSelectedFiles((prev) => [...prev, audioFile]);
              setPreviews((prev) => [
                ...prev,
                {
                  url: URL.createObjectURL(audioFile),
                  type: 'audio',
                  name: audioFile.name,
                },
              ]);
            }}
            onCancel={() => setIsVoiceRecorderOpen(false)}
          />
        )}

        {/* Media Preview Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {previews.map((item, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : item.type === 'audio' ? (
                  <div className="flex flex-col items-center justify-center p-2 text-center text-white bg-indigo-950/80 w-full h-full">
                    <Mic className="w-6 h-6 text-indigo-400 mb-1" />
                    <span className="text-[10px] truncate max-w-full">{item.name}</span>
                  </div>
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
          accept="image/*,video/*,audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ảnh/Video</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                setIsVoiceRecorderOpen(!isVoiceRecorderOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                isVoiceRecorderOpen
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Mic className="w-4 h-4 text-rose-500" />
              <span>Ghi âm</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSpeechToText}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                isListeningSpeech
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Đọc để tự động viết thành văn bản"
            >
              <Volume2 className={`w-4 h-4 ${isListeningSpeech ? 'text-white' : 'text-emerald-500'}`} />
              <span>{isListeningSpeech ? 'Đang nghe...' : 'Nói để viết'}</span>
            </button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
            className="px-5 py-2 text-xs font-semibold"
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng bài viết'}
          </Button>
        </div>
      </form>

      {/* AI Magic Writer Co-Pilot Modal */}
      <AIMagicWriter
        isOpen={isAIMagicOpen}
        onClose={() => setIsAIMagicOpen(false)}
        currentContent={content}
        onApply={(newText) => setContent(newText)}
      />
    </Modal>
  );
};

export default CreatePostModal;
