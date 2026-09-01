import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ThumbsUp, Laugh, Frown, Angry, Sparkles } from 'lucide-react';
import messageService from '../../services/messageService';
import { REACTION_ICONS } from '../post/ReactionPicker';

export default function MessageReactionUsersModal({ isOpen, onClose, messageId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    if (isOpen && messageId) {
      setLoading(true);
      messageService
        .getUsersReacted(messageId)
        .then((res) => {
          const raw = res.data?.data || res.data || [];
          setUsers(Array.isArray(raw) ? raw : []);
        })
        .catch((err) => {
          console.error('Failed to get reacted users', err);
          setUsers([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, messageId]);

  if (!isOpen) return null;

  // Compute unique reactions present
  const availableTypes = Array.from(new Set(users.map((u) => u.type))).filter(Boolean);

  const filteredUsers =
    activeFilter === 'ALL' ? users : users.filter((u) => u.type === activeFilter);

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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Cảm xúc về tin nhắn</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Reaction Tabs */}
          {users.length > 0 && (
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto bg-gray-50/50">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả ({users.length})
              </button>

              {availableTypes.map((type) => {
                const config = REACTION_ICONS[type];
                const count = users.filter((u) => u.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      activeFilter === type
                        ? 'bg-white shadow ring-1 ring-blue-500 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{config?.emoji || '👍'}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Users list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u, idx) => {
                const config = REACTION_ICONS[u.type];
                return (
                  <div
                    key={u.userId || idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={u.avatarUrl || 'https://via.placeholder.com/40'}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5 shadow">
                          {config?.emoji || '👍'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {u.username || `Người dùng #${u.userId}`}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {config?.label || 'Đã bày tỏ cảm xúc'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                Chưa có ai bày tỏ cảm xúc.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
