import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, UserMinus, ShieldCheck, Search, Users, Check } from 'lucide-react';
import conversationMemberService from '../../services/conversationMemberService';
import friendshipService from '../../services/friendshipService';
import { useUser } from '../../contexts/UserContext';
import toast from 'react-hot-toast';

export default function GroupMembersModal({
  conversationId,
  conversationName,
  onClose,
  onMembersUpdated,
}) {
  const { user } = useUser();
  const [members, setMembers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingUserId, setAddingUserId] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const res = await conversationMemberService.getMembers(conversationId);
      const raw = res.data?.data || res.data || [];
      setMembers(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to load group members', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMembers();
    if (user?.id) {
      friendshipService
        .getFriends(user.id, 0, 50)
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          setFriends(Array.isArray(raw) ? raw : []);
        })
        .catch(() => {});
    }
  }, [conversationId, user, fetchMembers]);

  const handleAddMember = async (targetUserId) => {
    if (!targetUserId || !conversationId) return;
    setAddingUserId(targetUserId);
    try {
      await conversationMemberService.addMember(conversationId, targetUserId);
      toast.success('Đã thêm thành viên vào nhóm!');
      fetchMembers();
      if (onMembersUpdated) onMembersUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm thành viên');
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (window.confirm('Bạn có chắc muốn xóa thành viên này khỏi nhóm?')) {
      try {
        await conversationMemberService.removeMember(conversationId, targetUserId);
        toast.success('Đã xóa thành viên khỏi nhóm');
        fetchMembers();
        if (onMembersUpdated) onMembersUpdated();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể xóa thành viên');
      }
    }
  };

  const currentUserId = user?.id || user?.userId;
  const isCurrentUserAdmin = members.some(
    (m) => (m.userId || m.id) === currentUserId && m.role === 'ADMIN'
  );

  const memberUserIds = new Set(members.map((m) => m.userId || m.id));
  const nonMemberFriends = friends.filter(
    (f) => !memberUserIds.has(f.userId || f.id)
  );

  const filteredNonMemberFriends = nonMemberFriends.filter((f) =>
    (f.fullName || f.username || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Thành viên nhóm ({members.length})
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-[260px]">{conversationName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action: Add member toggle */}
          <div className="p-4 border-b border-gray-100 bg-white">
            {!showAddMember ? (
              <button
                onClick={() => setShowAddMember(true)}
                className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition active:scale-95"
              >
                <UserPlus size={16} />
                Thêm bạn bè vào nhóm
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Chọn bạn bè để thêm:</span>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                  >
                    Đóng
                  </button>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên bạn bè..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto dating-scrollbar">
                  {filteredNonMemberFriends.length > 0 ? (
                    filteredNonMemberFriends.map((f) => {
                      const fId = f.userId || f.id;
                      return (
                        <div
                          key={fId}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={f.avatarUrl || 'https://via.placeholder.com/32'}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {f.fullName || f.username}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddMember(fId)}
                            disabled={addingUserId === fId}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                          >
                            {addingUserId === fId ? 'Đang thêm...' : 'Thêm'}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-gray-400 py-3">
                      Không còn bạn bè nào để thêm.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 dating-scrollbar">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : members.length > 0 ? (
              members.map((m) => {
                const mUserId = m.userId || m.id;
                const isMe = mUserId === currentUserId;
                const isAdmin = m.role === 'ADMIN';

                return (
                  <div
                    key={mUserId}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={m.avatarUrl || 'https://via.placeholder.com/40'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-gray-900 text-xs truncate">
                            {m.username || `Thành viên #${mUserId}`}
                          </p>
                          {isMe && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                              Bạn
                            </span>
                          )}
                          {isAdmin && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">
                              <ShieldCheck size={11} /> Trưởng nhóm
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {m.joinedAt ? `Tham gia ${new Date(m.joinedAt).toLocaleDateString('vi-VN')}` : 'Thành viên'}
                        </p>
                      </div>
                    </div>

                    {!isMe && isCurrentUserAdmin && (
                      <button
                        onClick={() => handleRemoveMember(mUserId)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Xóa khỏi nhóm"
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-gray-400 py-6">Không có thành viên nào.</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

