import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Edit2,
  Users,
  Image,
  Trash2,
  ShieldCheck,
  Heart,
  ExternalLink,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import conversationService from '../../services/conversationService';

export default function ChatInfoSidebar({
  isOpen,
  onClose,
  conversation,
  messages = [],
  currentUser,
  onConversationUpdated,
  onOpenMembersModal,
  onOpenMediaLightbox,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !conversation) return null;

  const convId = conversation.conversation_id || conversation.id;
  const isGroup = conversation.type === 'GROUP' || conversation.isGroup;
  const isDating = conversation.type === 'DATING';
  const name = conversation.displayName || conversation.name || 'Cuộc trò chuyện';
  const avatar = conversation.avatarUrl || 'https://via.placeholder.com/80';

  // Collect all media from loaded messages
  const allMedia = messages
    .flatMap((m) => m.medias || [])
    .filter((m) => m && m.url);

  // Handle Edit Group Name
  const handleSaveGroupName = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || newGroupName.trim() === name) {
      setIsEditingName(false);
      return;
    }

    setSaving(true);
    try {
      await conversationService.updateGroupName(convId, newGroupName.trim());
      toast.success('Đã đổi tên nhóm chat thành công!');
      setIsEditingName(false);
      if (onConversationUpdated) onConversationUpdated();
    } catch (err) {
      toast.error('Không thể đổi tên nhóm');
    } finally {
      setSaving(false);
    }
  };

  // Handle Upload Group Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 10MB');
      return;
    }

    const toastId = toast.loading('Đang cập nhật ảnh nhóm...');
    try {
      await conversationService.updateGroupAvatar(convId, file);
      toast.success('Đã cập nhật ảnh nhóm thành công!', { id: toastId });
      if (onConversationUpdated) onConversationUpdated();
    } catch (err) {
      toast.error('Không thể cập nhật ảnh nhóm', { id: toastId });
    }
  };

  // Delete / Leave Conversation
  const handleDeleteConversation = async () => {
    if (window.confirm('Bạn có chắc muốn xóa hoặc rời khỏi cuộc trò chuyện này?')) {
      try {
        await conversationService.deleteConversation(convId);
        toast.success('Đã xóa cuộc trò chuyện');
        onClose();
        if (onConversationUpdated) onConversationUpdated();
      } catch (err) {
        toast.error('Không thể xóa cuộc trò chuyện');
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 320, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="h-full border-l border-gray-100 bg-white flex flex-col overflow-hidden flex-shrink-0 z-20"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm">Thông tin chi tiết</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 dating-scrollbar">
          {/* Avatar & Display Name */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative group">
              <img
                src={avatar}
                alt=""
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-md"
              />
              {isGroup && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-xs"
                    title="Đổi ảnh đại diện nhóm"
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="w-full">
              {isEditingName ? (
                <form onSubmit={handleSaveGroupName} className="flex items-center gap-1 mt-1">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-blue-400 rounded-xl text-xs outline-none font-bold text-center"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="p-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl"
                  >
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <h4 className="font-black text-gray-900 text-base truncate max-w-[200px]">
                    {name}
                  </h4>
                  {isGroup && (
                    <button
                      onClick={() => {
                        setNewGroupName(name);
                        setIsEditingName(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                      title="Đổi tên nhóm"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Tag / Type badge */}
              <div className="mt-1">
                {isDating ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold">
                    <Heart size={10} className="fill-current" /> Hẹn hò kết đôi
                  </span>
                ) : isGroup ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                    <Users size={10} /> Nhóm chat
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400 font-medium">Trò chuyện riêng tư</span>
                )}
              </div>
            </div>
          </div>

          {/* Group Members Section */}
          {isGroup && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Thành viên nhóm
                </span>
                <button
                  onClick={onOpenMembersModal}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Quản lý
                </button>
              </div>

              <button
                onClick={onOpenMembersModal}
                className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-blue-50/50 border border-gray-200 flex items-center justify-between text-xs font-bold text-gray-700 hover:text-blue-700 transition"
              >
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <span>Xem & Thêm thành viên</span>
                </div>
                <ExternalLink size={14} />
              </button>
            </div>
          )}

          {/* Shared Media Gallery */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Image size={13} className="text-pink-500" />
                Ảnh & Video ({allMedia.length})
              </span>
            </div>

            {allMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden p-1 bg-gray-50 border border-gray-100">
                {allMedia.slice(0, 9).map((m, idx) => (
                  <div
                    key={m.id || idx}
                    onClick={() => onOpenMediaLightbox && onOpenMediaLightbox(m.url, m.mediaType)}
                    className="aspect-square bg-slate-900 rounded-xl overflow-hidden cursor-pointer group relative shadow-xs"
                  >
                    <img
                      src={m.url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[11px] text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                Chưa có ảnh/video nào được chia sẻ.
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleDeleteConversation}
              className="w-full py-3 px-4 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center justify-center gap-2"
            >
              <Trash2 size={15} />
              {isGroup ? 'Rời / Xóa nhóm chat' : 'Xóa cuộc trò chuyện'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
