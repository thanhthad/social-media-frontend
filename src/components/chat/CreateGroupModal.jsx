import { useState, useEffect, useRef } from 'react';
import conversationService from '../../services/conversationService';
import friendshipService from '../../services/friendshipService';
import { useUser } from '../../contexts/UserContext';
import toast from 'react-hot-toast';
import { X, Camera, Users, Check, Search } from 'lucide-react';

export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      friendshipService
        .getFriends(user.id, 0, 50)
        .then((res) => {
          const list = res.data?.data?.content || res.data?.data || [];
          setFriends(list);
        })
        .catch((err) => console.error('Failed to fetch friends', err));
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhóm chat');
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 thành viên');
      return;
    }

    setLoading(true);
    try {
      const res = await conversationService.createGroup(
        name.trim(),
        selectedMembers,
        avatarFile
      );
      toast.success('Tạo nhóm chat thành công!');
      if (onGroupCreated) onGroupCreated(res.data?.data);
      onClose();
    } catch (err) {
      console.error('Failed to create group conversation', err);
      toast.error(err.response?.data?.message || 'Không thể tạo nhóm chat.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter((f) =>
    (f.fullName || f.username || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-lg">Tạo nhóm chat mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Avatar and Group Name */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-500 flex items-center justify-center cursor-pointer overflow-hidden group flex-shrink-0"
              title="Đổi ảnh đại diện nhóm"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tên nhóm chat *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên nhóm..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none text-sm transition"
                required
              />
            </div>
          </div>

          {/* Member Selection Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Thêm thành viên ({selectedMembers.length} đã chọn)
              </label>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bạn bè..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Friend List */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((f) => {
                  const fId = f.userId || f.id;
                  const isSelected = selectedMembers.includes(fId);
                  return (
                    <div
                      key={fId}
                      onClick={() => toggleMember(fId)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-50/80 border border-blue-200'
                          : 'hover:bg-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={f.avatarUrl || 'https://via.placeholder.com/40'}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-xs truncate">
                            {f.fullName || f.username}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            @{f.username}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xs text-gray-400 py-6">
                  {friends.length === 0
                    ? 'Bạn chưa có bạn bè nào để thêm vào nhóm.'
                    : 'Không tìm thấy bạn bè nào khớp.'}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={loading || !name.trim() || selectedMembers.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 transition transform active:scale-95"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{loading ? 'Đang tạo...' : 'Tạo nhóm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
