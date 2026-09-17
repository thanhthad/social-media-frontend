import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Send,
  Phone,
  Video,
  Image as ImageIcon,
  ArrowLeft,
  CheckCheck,
  Plus,
  Info,
  Smile,
  Trash2,
  Reply,
  X,
  Users,
  Heart,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import conversationService from '../services/conversationService';
import messageService from '../services/messageService';
import friendshipService from '../services/friendshipService';
import useWebSocketStore from '../stores/useWebSocketStore';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import ChatInfoSidebar from '../components/chat/ChatInfoSidebar';
import GroupMembersModal from '../components/chat/GroupMembersModal';
import MediaLightboxModal from '../components/chat/MediaLightboxModal';
import MessageReactionUsersModal from '../components/chat/MessageReactionUsersModal';
import ReactionPicker, { REACTION_ICONS } from '../components/post/ReactionPicker';

export const MessagesPage = () => {
  const { user } = useUser();
  const currentUserId = user?.id || user?.userId;

  // Conversations state
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'DATING'
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  // Messages state
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [sending, setSending] = useState(false);

  // Modals & Panels
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null); // { url, type }
  const [reactionUsersMsgId, setReactionUsersMsgId] = useState(null);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState(null);

  // Online / active friends
  const [friends, setFriends] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res =
        activeTab === 'DATING'
          ? await conversationService.getMyDatingConversations()
          : await conversationService.getMyConversations();
      const list = res.data?.data || [];
      const convList = Array.isArray(list) ? list : [];
      setConversations(convList);

      // Keep or update active conversation
      if (convList.length > 0) {
        setActiveConversation((prev) => {
          if (!prev) return convList[0];
          const exists = convList.find(
            (c) => (c.conversation_id || c.id) === (prev.conversation_id || prev.id)
          );
          return exists || convList[0];
        });
      } else {
        setActiveConversation(null);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch Friends for Quick-Chat bar
  useEffect(() => {
    if (currentUserId) {
      friendshipService
        .getFriends(currentUserId, 0, 30)
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          setFriends(Array.isArray(raw) ? raw : []);
        })
        .catch(() => {});
    }
  }, [currentUserId]);

  // 3. Fetch Messages for Active Conversation
  const convId = activeConversation?.conversation_id || activeConversation?.id;

  const fetchMessages = useCallback(async (cId) => {
    if (!cId) return;
    setLoadingMessages(true);
    try {
      const res = await messageService.getMessages(cId, 0, 50);
      const data = res.data?.data?.content || res.data?.data || [];
      const list = Array.isArray(data) ? [...data].reverse() : [];
      setMessages(list);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (convId) {
      fetchMessages(convId);
      setReplyingTo(null);
      setSelectedFiles([]);
    } else {
      setMessages([]);
    }
  }, [convId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. WebSocket Listener for incoming messages & reactions
  useEffect(() => {
    const unsubMsg = useWebSocketStore.getState().addMessageListener((newMsg) => {
      const targetConvId = newMsg.conversationId || newMsg.conversation_id;
      if (targetConvId && String(targetConvId) === String(convId)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
      fetchConversations();
    });

    const unsubReaction = useWebSocketStore.getState().addReactionListener((reaction) => {
      const msgId = reaction.messageId;
      if (msgId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === msgId) {
              const currentCounts = { ...(m.counts || {}) };
              if (reaction.action === 'REMOVE') {
                if (currentCounts[reaction.type]) {
                  currentCounts[reaction.type] = Math.max(0, currentCounts[reaction.type] - 1);
                }
              } else {
                currentCounts[reaction.type] = (currentCounts[reaction.type] || 0) + 1;
              }
              return {
                ...m,
                counts: currentCounts,
                myReaction: reaction.userId === currentUserId ? reaction.type : m.myReaction,
              };
            }
            return m;
          })
        );
      }
    });

    return () => {
      unsubMsg();
      unsubReaction();
    };
  }, [convId, currentUserId, fetchConversations]);

  // Start private conversation with a friend
  const handleStartPrivate = async (friendUserId) => {
    try {
      const res = await conversationService.createPrivate(friendUserId);
      const newConv = res.data?.data;
      await fetchConversations();
      if (newConv) {
        setActiveConversation(newConv);
        setMobileView('chat');
      }
    } catch (err) {
      toast.error('Không thể mở cuộc trò chuyện');
    }
  };

  // Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && selectedFiles.length === 0) || !convId) return;

    setSending(true);
    try {
      const res = await messageService.sendMessage(
        convId,
        messageInput.trim(),
        selectedFiles,
        replyingTo?.id || null
      );
      const sentMsg = res.data?.data;
      if (sentMsg) {
        setMessages((prev) => [...prev, sentMsg]);
      } else {
        fetchMessages(convId);
      }
      setMessageInput('');
      setSelectedFiles([]);
      setReplyingTo(null);
      fetchConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  // React to Message
  const handleReact = async (messageId, type) => {
    try {
      await messageService.reactToMessage(messageId, type);
      setActiveReactionPickerMsgId(null);
      fetchMessages(convId);
    } catch (err) {
      toast.error('Không thể bày tỏ cảm xúc');
    }
  };

  // Delete Message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    try {
      await messageService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success('Đã xóa tin nhắn');
    } catch (err) {
      toast.error('Không thể xóa tin nhắn');
    }
  };

  // File Upload Handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast.error('Tối đa 5 tệp mỗi tin nhắn');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    (c.displayName || c.name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const activeName =
    activeConversation?.displayName ||
    activeConversation?.name ||
    'Cuộc trò chuyện';
  const activeAvatar =
    activeConversation?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs flex relative">
      {/* LEFT COLUMN: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header & Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Tin nhắn
            </h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
              title="Tạo nhóm mới"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo nhóm</span>
            </button>
          </div>

          {/* Conversation Type Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('DATING')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'DATING'
                  ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-xs'
                  : 'text-slate-500 hover:text-rose-500'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              Hẹn hò
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin nhắn..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Quick Friends Strip */}
        {friends.length > 0 && (
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-3">
            {friends.map((f) => {
              const friendId = f.userId || f.id;
              const name = f.fullName || f.username || 'Bạn bè';
              const avatar =
                f.avatarUrl ||
                f.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              return (
                <div
                  key={friendId}
                  onClick={() => handleStartPrivate(friendId)}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                  title={`Nhắn tin cho ${name}`}
                >
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-600 transition"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium max-w-[50px] truncate">
                    {name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 dark:divide-slate-800/60">
          {loadingConversations ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Đang tải danh sách tin nhắn...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            filteredConversations.map((convo) => {
              const cId = convo.conversation_id || convo.id;
              const isActive =
                (activeConversation?.conversation_id || activeConversation?.id) ===
                cId;
              const name = convo.displayName || convo.name || 'Người dùng';
              const avatar =
                convo.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

              return (
                <div
                  key={cId}
                  onClick={() => {
                    setActiveConversation(convo);
                    setMobileView('chat');
                  }}
                  className={`flex items-center gap-3 p-3.5 cursor-pointer transition select-none ${
                    isActive
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    {convo.type === 'GROUP' && (
                      <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                        <Users className="w-2.5 h-2.5" />
                      </span>
                    )}
                    {convo.type === 'DATING' && (
                      <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                        <Heart className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {name}
                      </span>
                      {convo.lastMessageAt && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(convo.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {convo.preview || 'Bắt đầu cuộc trò chuyện...'}
                    </p>
                  </div>

                  {convo.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Chat Window */}
      {activeConversation ? (
        <div
          className={`flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/30 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={activeAvatar}
                  alt={activeName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {activeName}
                </h3>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {activeConversation.type === 'GROUP'
                    ? 'Nhóm chat'
                    : activeConversation.type === 'DATING'
                    ? 'Ghép đôi Hẹn hò'
                    : 'Đang hoạt động'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toast('Tính năng gọi thoại đang trong bản thử nghiệm!')}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Gọi thoại"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => toast('Tính năng gọi video đang trong bản thử nghiệm!')}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Gọi video"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowChatInfo(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Thông tin cuộc trò chuyện"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {loadingMessages ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Đang tải tin nhắn...
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe =
                  String(msg.senderId) === String(currentUserId) ||
                  msg.sender_id === currentUserId;
                const senderName = msg.senderName || msg.sender_name || 'Người dùng';
                const avatar =
                  msg.avatarUrl ||
                  msg.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                const hasReactions =
                  msg.totalReactions > 0 ||
                  (msg.counts && Object.values(msg.counts).some((v) => v > 0));

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 group relative ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isMe && (
                      <img
                        src={avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                        title={senderName}
                      />
                    )}

                    <div className="max-w-[75%] sm:max-w-md flex flex-col relative">
                      {/* Sender name for group chat */}
                      {!isMe && activeConversation.type === 'GROUP' && (
                        <span className="text-[10px] text-slate-500 mb-1 font-semibold ml-1">
                          {senderName}
                        </span>
                      )}

                      {/* Replying indicator */}
                      {msg.replyToMessageId && (
                        <div className="mb-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-t-xl border-l-2 border-indigo-500 truncate">
                          Trả lời tin nhắn #{msg.replyToMessageId}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {msg.content && <p className="break-words">{msg.content}</p>}

                        {/* Media attachments */}
                        {msg.medias && msg.medias.length > 0 && (
                          <div
                            className={`mt-2 grid gap-1.5 ${
                              msg.medias.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                            }`}
                          >
                            {msg.medias.map((media, i) => {
                              const isVideo =
                                media.type === 'VIDEO' ||
                                media.url?.match(/\.(mp4|webm|mov)$/i);
                              return (
                                <div
                                  key={media.id || i}
                                  onClick={() =>
                                    setLightboxMedia({
                                      url: media.url,
                                      type: isVideo ? 'VIDEO' : 'IMAGE',
                                    })
                                  }
                                  className="relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition max-h-48 bg-black/10"
                                >
                                  {isVideo ? (
                                    <video
                                      src={media.url}
                                      className="w-full h-full object-cover max-h-48"
                                    />
                                  ) : (
                                    <img
                                      src={media.url}
                                      alt=""
                                      className="w-full h-full object-cover max-h-48"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isMe ? 'text-indigo-100/70' : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 stroke-[2]" />}
                        </div>
                      </div>

                      {/* Reaction Badges */}
                      {hasReactions && (
                        <div
                          onClick={() => setReactionUsersMsgId(msg.id)}
                          className="mt-1 flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 rounded-full shadow-xs text-[11px] w-fit"
                        >
                          {msg.counts &&
                            Object.entries(msg.counts).map(([type, count]) => {
                              if (count <= 0) return null;
                              return (
                                <span key={type} className="flex items-center gap-0.5">
                                  <span>{REACTION_ICONS[type]?.emoji || '👍'}</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {count}
                                  </span>
                                </span>
                              );
                            })}
                        </div>
                      )}

                      {/* Message Actions Menu (hover) */}
                      <div
                        className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-1.5 py-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs z-10 ${
                          isMe ? '-left-20' : '-right-20'
                        }`}
                      >
                        {/* Reaction Trigger */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveReactionPickerMsgId(
                                activeReactionPickerMsgId === msg.id ? null : msg.id
                              )
                            }
                            className="p-1 hover:text-indigo-600 text-slate-400 transition"
                            title="Thả cảm xúc"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                          {activeReactionPickerMsgId === msg.id && (
                            <ReactionPicker
                              onSelect={(type) => handleReact(msg.id, type)}
                              onClose={() => setActiveReactionPickerMsgId(null)}
                            />
                          )}
                        </div>

                        {/* Reply Button */}
                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 hover:text-indigo-600 text-slate-400 transition"
                          title="Trả lời"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (if mine) */}
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 hover:text-red-600 text-slate-400 transition"
                            title="Xóa tin nhắn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Replying Preview Banner */}
          {replyingTo && (
            <div className="px-4 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <Reply className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 truncate">
                  Đang trả lời:{' '}
                  <strong>{replyingTo.senderName || 'Tin nhắn'}</strong> - "
                  {replyingTo.content}"
                </span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Attached Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="relative group shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5"
                >
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold p-1 text-center">
                      FILE
                    </div>
                  )}
                  <button
                    onClick={() => removeSelectedFile(idx)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-80 hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-indigo-600 transition rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Đính kèm ảnh / video"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Soạn tin nhắn..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-600"
            />
            <button
              type="submit"
              disabled={(!messageInput.trim() && selectedFiles.length === 0) || sending}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl transition active:scale-95 shadow-xs"
            >
              <Send className="w-4 h-4 stroke-[2]" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <MessageSquare className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold">
            Chọn một cuộc trò chuyện để bắt đầu nhắn tin
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Hoặc chọn một người bạn ở danh sách phía trên để mở tin nhắn riêng
          </p>
        </div>
      )}

      {/* Sub Modals & Sidebars */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(newGroup) => {
            fetchConversations();
            if (newGroup) setActiveConversation(newGroup);
          }}
        />
      )}

      {showChatInfo && activeConversation && (
        <ChatInfoSidebar
          isOpen={showChatInfo}
          onClose={() => setShowChatInfo(false)}
          conversation={activeConversation}
          messages={messages}
          currentUser={user}
          onConversationUpdated={fetchConversations}
          onOpenMembersModal={() => setShowMembersModal(true)}
          onOpenMediaLightbox={(url, type) => setLightboxMedia({ url, type })}
        />
      )}

      {showMembersModal && activeConversation && (
        <GroupMembersModal
          conversationId={convId}
          conversationName={activeName}
          onClose={() => setShowMembersModal(false)}
          onMembersUpdated={fetchConversations}
        />
      )}

      {lightboxMedia && (
        <MediaLightboxModal
          isOpen={!!lightboxMedia}
          onClose={() => setLightboxMedia(null)}
          mediaUrl={lightboxMedia.url}
          mediaType={lightboxMedia.type}
        />
      )}

      {reactionUsersMsgId && (
        <MessageReactionUsersModal
          isOpen={!!reactionUsersMsgId}
          onClose={() => setReactionUsersMsgId(null)}
          messageId={reactionUsersMsgId}
        />
      )}
    </div>
  );
};

export default MessagesPage;
