import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import conversationService from '../services/conversationService';
import messageService from '../services/messageService';
import messageReactionService from '../services/messageReactionService';
import conversationMemberService from '../services/conversationMemberService';
import useWebSocketStore from '../stores/useWebSocketStore';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import GroupMembersModal from '../components/chat/GroupMembersModal';
import ChatInfoSidebar from '../components/chat/ChatInfoSidebar';
import MediaLightboxModal from '../components/chat/MediaLightboxModal';
import MessageReactionUsersModal from '../components/chat/MessageReactionUsersModal';
import ReactionPicker, { REACTION_ICONS } from '../components/post/ReactionPicker';
import toast from 'react-hot-toast';
import {
  Users,
  Send,
  Image as ImageIcon,
  Trash2,
  Reply,
  Smile,
  X,
  Info,
  Search,
  ArrowLeft,
  Heart,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function MessagesPage() {
  const location = useLocation();
  const { user: currentUser } = useUser();

  // Conversations State
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(location.state?.conversation || null);
  const [loadingConv, setLoadingConv] = useState(true);
  const [convSearchQuery, setConvSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'GROUP' | 'DATING'

  // Messages State & Pagination
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMsgs, setHasMoreMsgs] = useState(true);
  const [page, setPage] = useState(0);

  // Input & Reply & Media
  const [inputText, setInputText] = useState(location.state?.initialText || '');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [sending, setSending] = useState(false);

  // Sidebars & Modals
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState(null);
  const [selectedReactionMsgId, setSelectedReactionMsgId] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null); // { url, type }

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsMessages = useWebSocketStore((state) => state.messages);
  const addReactionListener = useWebSocketStore((state) => state.addReactionListener);
  const addConversationListener = useWebSocketStore((state) => state.addConversationListener);

  const activeConvId = activeConv?.conversation_id || activeConv?.id;
  const currentUid = currentUser?.id || currentUser?.userId;

  // 1. Fetch Conversations List
  const fetchConversations = useCallback(
    async (selectTargetId = null) => {
      setLoadingConv(true);
      try {
        const res =
          activeTabFilter === 'DATING'
            ? await conversationService.getMyDatingConversations()
            : await conversationService.getMyConversations();

        const raw = res.data?.data?.content || res.data?.data || [];
        const list = Array.isArray(raw) ? raw : [];

        // Deduplicate conversations by conversation ID
        const uniqueList = [];
        const seenIds = new Set();
        for (const c of list) {
          const id = c.conversation_id || c.id;
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            uniqueList.push(c);
          }
        }

        setConversations(uniqueList);

        // Handle navigation with state
        if (selectTargetId) {
          const found = uniqueList.find((c) => (c.conversation_id || c.id) === selectTargetId);
          if (found) setActiveConv(found);
        } else if (location.state?.conversation) {
          const target = location.state.conversation;
          const tId = target.conversation_id || target.id;
          const found = uniqueList.find((c) => (c.conversation_id || c.id) === tId);
          setActiveConv(found || target);
        } else if (location.state?.conversationId) {
          const found = uniqueList.find(
            (c) => (c.conversation_id || c.id) === location.state.conversationId
          );
          if (found) setActiveConv(found);
        } else if (location.state?.targetUserId) {
          // Auto open or create private conversation
          const targetUserId = location.state.targetUserId;
          const existing = list.find(
            (c) => c.type === 'PRIVATE' && (c.user_id === targetUserId || c.userId === targetUserId)
          );
          if (existing) {
            setActiveConv(existing);
          } else {
            try {
              const createRes = await conversationService.createPrivate(targetUserId);
              const newConv = createRes.data?.data || createRes.data;
              if (newConv) {
                const formatted = {
                  ...newConv,
                  conversation_id: newConv.id || newConv.conversation_id,
                };
                setConversations((prev) => [formatted, ...prev]);
                setActiveConv(formatted);
              }
            } catch (e) {
              console.error('Failed to create private chat for user', e);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoadingConv(false);
      }
    },
    [activeTabFilter, location.state]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch Initial Messages & Conversation Detail when Active Conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    setLoadingMsgs(true);
    setPage(0);
    setHasMoreMsgs(true);

    // Fetch conversation detail to ensure latest members and metadata
    conversationService
      .getConversationDetail(activeConvId)
      .then((detailRes) => {
        const detail = detailRes.data?.data || detailRes.data;
        if (detail) {
          setActiveConv((prev) => ({
            ...prev,
            ...detail,
            conversation_id: detail.id || detail.conversation_id,
          }));
        }
      })
      .catch((err) => {
        console.log('Could not load extra conversation detail', err);
      });

    messageService
      .getMessages(activeConvId, 0, 30)
      .then((res) => {
        const pageData = res.data?.data;
        const msgs = pageData?.content || (Array.isArray(pageData) ? pageData : []);
        setMessages([...msgs].reverse());
        setHasMoreMsgs(pageData?.last === false || msgs.length === 30);

        // Mark last message as read
        if (msgs.length > 0) {
          const latest = msgs[0];
          conversationMemberService
            .updateLastReadMessage(activeConvId, latest.id)
            .catch(() => {});
        }

        // Reset unread count for active conversation in list
        setConversations((prev) =>
          prev.map((c) =>
            (c.conversation_id || c.id) === activeConvId ? { ...c, unreadCount: 0 } : c
          )
        );
      })
      .catch((err) => {
        console.error('Failed to fetch messages', err);
      })
      .finally(() => {
        setLoadingMsgs(false);
      });
  }, [activeConvId]);

  // 3. Load More Older Messages (Pagination Scroll Up)
  const handleLoadMoreMessages = async () => {
    if (!activeConvId || loadingMore || !hasMoreMsgs) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const container = messagesContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;

    try {
      const res = await messageService.getMessages(activeConvId, nextPage, 30);
      const pageData = res.data?.data;
      const msgs = pageData?.content || (Array.isArray(pageData) ? pageData : []);

      if (msgs.length > 0) {
        setMessages((prev) => [...[...msgs].reverse(), ...prev]);
        setPage(nextPage);
        setHasMoreMsgs(pageData?.last === false || msgs.length === 30);

        // Preserve scroll position
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - previousScrollHeight;
          }
        }, 50);
      } else {
        setHasMoreMsgs(false);
      }
    } catch (err) {
      console.error('Failed to load more messages', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 4. Real-time STOMP WebSocket Message Handling
  useEffect(() => {
    if (wsMessages.length > 0) {
      const latestMsg = wsMessages[wsMessages.length - 1];
      const msgConvId = latestMsg.conversationId || latestMsg.conversation_id;

      // Check if message belongs to currently active conversation
      const isForActive =
        (msgConvId && activeConvId && String(msgConvId) === String(activeConvId)) ||
        (!msgConvId && activeConv && latestMsg.senderId === (activeConv.user_id || activeConv.userId));

      if (isForActive) {
        setMessages((prev) => {
          if (!prev.some((m) => m.id === latestMsg.id)) {
            return [...prev, latestMsg];
          }
          return prev;
        });

        // Mark read
        if (activeConvId && latestMsg.id) {
          conversationMemberService
            .updateLastReadMessage(activeConvId, latestMsg.id)
            .catch(() => {});
        }
      }

      // Update conversations list latest preview
      setConversations((prev) =>
        prev.map((conv) => {
          const cId = conv.conversation_id || conv.id;
          const match =
            (msgConvId && String(cId) === String(msgConvId)) ||
            (!msgConvId && (conv.user_id === latestMsg.senderId || conv.userId === latestMsg.senderId));

          if (match) {
            return {
              ...conv,
              preview: latestMsg.content || 'Đã gửi một tệp đính kèm',
              lastMessage: latestMsg.content || 'Đã gửi một tệp đính kèm',
              lastMessageAt: latestMsg.createdAt || new Date().toISOString(),
              unreadCount: isForActive ? 0 : (conv.unreadCount || 0) + 1,
            };
          }
          return conv;
        })
      );
    }
  }, [wsMessages, activeConvId, activeConv]);

  // Real-time Reaction & Conversation Listeners
  useEffect(() => {
    const unsubReaction = addReactionListener((reaction) => {
      const msgId = reaction.messageId || reaction.message_id;
      if (msgId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === msgId) {
              const reactions = Array.isArray(m.reactions) ? [...m.reactions] : [];
              const uId = reaction.userId || reaction.user_id;
              const existingIdx = reactions.findIndex((r) => (r.userId || r.user_id) === uId);
              if (existingIdx >= 0) {
                if (reaction.type) {
                  reactions[existingIdx] = { ...reactions[existingIdx], ...reaction };
                } else {
                  reactions.splice(existingIdx, 1);
                }
              } else if (reaction.type) {
                reactions.push(reaction);
              }
              return { ...m, reactions };
            }
            return m;
          })
        );
      }
    });

    const unsubConv = addConversationListener((conv) => {
      setConversations((prev) => {
        const cId = conv.conversation_id || conv.id;
        const exists = prev.some((c) => (c.conversation_id || c.id) === cId);
        if (exists) {
          return prev.map((c) => ((c.conversation_id || c.id) === cId ? { ...c, ...conv } : c));
        } else {
          return [conv, ...prev];
        }
      });
    });

    return () => {
      if (unsubReaction) unsubReaction();
      if (unsubConv) unsubConv();
    };
  }, [addReactionListener, addConversationListener]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (page === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, page]);

  // 5. Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && selectedFiles.length === 0) || !activeConvId || sending) return;

    setSending(true);
    const contentToSend = inputText.trim();
    const filesToSend = [...selectedFiles];
    const replyIdToSend = replyToMessage?.id || null;

    // Clear input fields immediately for snappy UI
    setInputText('');
    setSelectedFiles([]);
    setReplyToMessage(null);

    try {
      const sentRes = await messageService.sendMessage(
        activeConvId,
        contentToSend,
        filesToSend,
        replyIdToSend
      );
      const sentMsg = sentRes.data?.data || sentRes.data;

      if (sentMsg) {
        setMessages((prev) => {
          if (!prev.some((m) => m.id === sentMsg.id)) {
            return [...prev, sentMsg];
          }
          return prev;
        });

        // Update conversation list preview
        setConversations((prev) =>
          prev.map((c) =>
            (c.conversation_id || c.id) === activeConvId
              ? {
                  ...c,
                  preview: sentMsg.content || 'Đã gửi một tệp đính kèm',
                  lastMessageAt: sentMsg.createdAt || new Date().toISOString(),
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message', err);
      toast.error('Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  // 6. Delete Message
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      try {
        await messageService.deleteMessage(messageId);
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        toast.success('Đã xóa tin nhắn');
      } catch (err) {
        toast.error('Không thể xóa tin nhắn');
      }
    }
  };

  // 7. React to Message
  const handleReactToMessage = async (messageId, type) => {
    setActiveReactionPickerMsgId(null);
    try {
      await messageReactionService.reactToMessage(messageId, type);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const oldType = m.myReaction;
            const newCounts = { ...(m.counts || {}) };

            if (oldType && newCounts[oldType]) {
              newCounts[oldType] = Math.max(0, Number(newCounts[oldType]) - 1);
            }
            newCounts[type] = (Number(newCounts[type]) || 0) + 1;

            return {
              ...m,
              myReaction: type,
              counts: newCounts,
              totalReactions: (m.totalReactions || 0) + (oldType ? 0 : 1),
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.error('Failed to react to message', err);
    }
  };

  // 8. Remove Reaction
  const handleRemoveReaction = async (messageId) => {
    try {
      await messageService.removeReaction(messageId);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const oldType = m.myReaction;
            const newCounts = { ...(m.counts || {}) };
            if (oldType && newCounts[oldType]) {
              newCounts[oldType] = Math.max(0, Number(newCounts[oldType]) - 1);
            }
            return {
              ...m,
              myReaction: null,
              counts: newCounts,
              totalReactions: Math.max(0, (m.totalReactions || 1) - 1),
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.error('Failed to remove reaction', err);
    }
  };

  // File selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 10) {
      toast.error('Tối đa 10 tệp mỗi tin nhắn');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  // Filter conversations list
  const filteredConversations = conversations.filter((c) => {
    const name = c.displayName || c.name || '';
    const matchesSearch = name.toLowerCase().includes(convSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTabFilter === 'UNREAD') return (c.unreadCount || 0) > 0;
    if (activeTabFilter === 'GROUP') return c.type === 'GROUP' || c.isGroup;
    if (activeTabFilter === 'DATING') return c.type === 'DATING';

    return true;
  });

  return (
    <div className="h-full w-full max-w-7xl mx-auto p-1 sm:p-3 flex overflow-hidden">
      <div className="w-full h-full bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200/80 flex overflow-hidden relative">
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COLUMN 1: Conversations List */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/40 flex-shrink-0 ${
            activeConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 px-5 border-b border-gray-100 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Đoạn Chat</h2>
              <p className="text-[11px] font-semibold text-gray-400">
                {conversations.length} cuộc trò chuyện
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateGroup(true)}
              className="w-10 h-10 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition shadow-xs"
              title="Tạo nhóm chat mới"
            >
              <Users size={19} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 bg-white border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={convSearchQuery}
                onChange={(e) => setConvSearchQuery(e.target.value)}
                placeholder="Tìm đoạn chat..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto dating-scrollbar pb-1">
              {[
                { key: 'ALL', label: 'Tất cả' },
                { key: 'UNREAD', label: 'Chưa đọc' },
                { key: 'GROUP', label: 'Nhóm' },
                { key: 'DATING', label: 'Hẹn hò ❤️' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTabFilter(tab.key)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                    activeTabFilter === tab.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 dating-scrollbar">
            {loadingConv ? (
              <div className="py-16 flex flex-col justify-center items-center gap-2">
                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400 font-semibold">Đang tải đoạn chat...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const cId = conv.conversation_id || conv.id;
                const isSelected = activeConvId === cId;
                const isGroup = conv.type === 'GROUP' || conv.isGroup;
                const isDating = conv.type === 'DATING';
                const previewText = conv.preview || conv.lastMessage || 'Bắt đầu trò chuyện ngay...';
                const unread = conv.unreadCount || 0;

                return (
                  <div
                    key={cId}
                    onClick={() => setActiveConv(conv)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition relative group ${
                      isSelected
                        ? 'bg-white shadow-sm ring-1 ring-blue-200 font-bold'
                        : 'hover:bg-white/80 text-gray-700'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-xs"
                      />
                      {isDating ? (
                        <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-tr from-pink-500 to-rose-600 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                          <Heart size={10} className="fill-current" />
                        </span>
                      ) : isGroup ? (
                        <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                          <Users size={10} />
                        </span>
                      ) : null}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {conv.displayName || conv.name || 'Cuộc trò chuyện'}
                        </p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-gray-400 font-normal flex-shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[11px] truncate ${unread > 0 ? 'font-bold text-gray-900' : 'text-gray-400 font-normal'}`}>
                          {previewText}
                        </p>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-black rounded-full min-w-[18px] text-center shadow-xs flex-shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-xs text-gray-400 space-y-2">
                <p className="font-semibold text-gray-600">Không tìm thấy đoạn chat nào</p>
                <p className="text-[11px]">Hãy tạo nhóm mới hoặc bắt đầu trò chuyện từ hồ sơ bạn bè.</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COLUMN 2: Chat Viewport */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`flex-1 flex flex-col bg-white h-full relative ${
            !activeConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Chat Top Header Bar */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-md shadow-xs z-10">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setActiveConv(null)}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full md:hidden transition"
                    title="Quay lại danh sách"
                  >
                    <ArrowLeft size={19} />
                  </button>

                  <div className="relative">
                    <img
                      src={activeConv.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </div>

                  <div>
                    <h3 className="font-black text-gray-900 text-sm leading-tight truncate max-w-[200px] sm:max-w-md">
                      {activeConv.displayName || activeConv.name || 'Cuộc trò chuyện'}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      Đang hoạt động
                    </p>
                  </div>
                </div>

                {/* Top Action Icons */}
                <div className="flex items-center gap-1.5">
                  {(activeConv.type === 'GROUP' || activeConv.isGroup) && (
                    <button
                      type="button"
                      onClick={() => setShowGroupMembers(true)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                      title="Xem thành viên"
                    >
                      <Users size={18} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                    className={`p-2 rounded-full transition ${
                      showInfoSidebar
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title="Thông tin chi tiết"
                  >
                    <Info size={19} />
                  </button>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dating-scrollbar"
              >
                {/* Load More Button if has older messages */}
                {hasMoreMsgs && messages.length >= 30 && (
                  <div className="flex justify-center py-2">
                    <button
                      type="button"
                      onClick={handleLoadMoreMessages}
                      disabled={loadingMore}
                      className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-full text-xs font-bold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Đang tải...</span>
                        </>
                      ) : (
                        <span>Tải tin nhắn cũ hơn</span>
                      )}
                    </button>
                  </div>
                )}

                {loadingMsgs ? (
                  <div className="py-20 flex flex-col justify-center items-center gap-2">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 font-semibold">Đang tải tin nhắn...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId === currentUid;
                    const myReact = msg.myReaction;
                    const reactIcon = myReact ? REACTION_ICONS[myReact] : null;
                    const totalReactions = msg.totalReactions || 0;
                    const counts = msg.counts || {};

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex items-end gap-2 group relative ${
                          isMine ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {!isMine && (
                          <img
                            src={msg.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 mb-1 flex-shrink-0"
                          />
                        )}

                        <div className="max-w-[75%] sm:max-w-[65%] space-y-1">
                          {/* Sender name for group */}
                          {!isMine && (activeConv.type === 'GROUP' || activeConv.isGroup) && (
                            <p className="text-[10px] text-gray-500 pl-1 font-bold">
                              {msg.senderName || 'Thành viên'}
                            </p>
                          )}

                          {/* Bubble Container */}
                          <div
                            className={`p-3.5 rounded-3xl text-xs leading-relaxed shadow-sm relative ${
                              isMine
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                                : 'bg-white text-gray-900 border border-gray-100 rounded-bl-xs'
                            }`}
                          >
                            {/* Reply Context if any */}
                            {msg.replyToMessage && (
                              <div
                                className={`mb-2 p-2 rounded-xl text-[11px] border-l-3 ${
                                  isMine
                                    ? 'bg-white/15 border-white/70 text-white'
                                    : 'bg-gray-100 border-blue-500 text-gray-700'
                                }`}
                              >
                                <span className="font-bold">Đang trả lời: </span>
                                <span className="line-clamp-1">{msg.replyToMessage.content || 'Tệp đính kèm'}</span>
                              </div>
                            )}

                            {/* Text content */}
                            {msg.content && (
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            )}

                            {/* Media attachments */}
                            {msg.medias && msg.medias.length > 0 && (
                              <div className="grid grid-cols-2 gap-1.5 mt-2 rounded-2xl overflow-hidden">
                                {msg.medias.map((m, mi) => (
                                  <div
                                    key={m.id || mi}
                                    onClick={() => setLightboxMedia({ url: m.url, type: m.mediaType })}
                                    className="aspect-square bg-slate-900 cursor-pointer overflow-hidden group/media relative rounded-xl"
                                  >
                                    <img
                                      src={m.url}
                                      alt=""
                                      className="w-full h-full object-cover group-hover/media:scale-105 transition-transform"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reaction badge pill on bubble bottom */}
                            {totalReactions > 0 && (
                              <div
                                onClick={() => setSelectedReactionMsgId(msg.id)}
                                className="absolute -bottom-3 right-3 bg-white text-gray-700 rounded-full px-2 py-0.5 text-[10px] font-black shadow-md border border-gray-200 flex items-center gap-1 cursor-pointer hover:bg-gray-50 transition z-10"
                                title="Xem danh sách cảm xúc"
                              >
                                {Object.entries(counts)
                                  .filter(([_, count]) => Number(count) > 0)
                                  .map(([type]) => (
                                    <span key={type}>{REACTION_ICONS[type]?.emoji || '👍'}</span>
                                  ))}
                                <span>{totalReactions}</span>
                              </div>
                            )}
                          </div>

                          {/* Timestamp */}
                          <p
                            className={`text-[10px] text-gray-400 px-1.5 ${
                              isMine ? 'text-right' : 'text-left'
                            }`}
                          >
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </p>
                        </div>

                        {/* Quick Action buttons on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 mb-4 flex-shrink-0">
                          {/* Reaction Picker Button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveReactionPickerMsgId(
                                  activeReactionPickerMsgId === msg.id ? null : msg.id
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-amber-500 rounded-full hover:bg-white shadow-xs transition"
                              title="Bày tỏ cảm xúc"
                            >
                              <Smile size={15} />
                            </button>
                            <AnimatePresence>
                              {activeReactionPickerMsgId === msg.id && (
                                <ReactionPicker
                                  onSelect={(type) => {
                                    if (myReact === type) {
                                      handleRemoveReaction(msg.id);
                                    } else {
                                      handleReactToMessage(msg.id, type);
                                    }
                                  }}
                                  onClose={() => setActiveReactionPickerMsgId(null)}
                                />
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Reply Button */}
                          <button
                            type="button"
                            onClick={() => setReplyToMessage(msg)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-white shadow-xs transition"
                            title="Trả lời"
                          >
                            <Reply size={15} />
                          </button>

                          {/* Delete Button (if mine) */}
                          {isMine && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-white shadow-xs transition"
                              title="Xóa tin nhắn"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center space-y-3 text-gray-400">
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                      <Sparkles size={28} />
                    </div>
                    <p className="font-bold text-gray-800 text-sm">Chưa có tin nhắn nào</p>
                    <p className="text-xs max-w-xs mx-auto">
                      Hãy gửi lời chào đầu tiên để bắt đầu cuộc trò chuyện thú vị! 👋
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 border-t border-gray-100 bg-white">
                {/* Reply Context Banner */}
                {replyToMessage && (
                  <div className="flex items-center justify-between bg-blue-50/80 px-4 py-2 rounded-2xl text-xs text-blue-900 mb-2 border border-blue-100 shadow-xs">
                    <div className="truncate flex items-center gap-2">
                      <Reply size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="font-bold">Đang trả lời {replyToMessage.senderName || 'tin nhắn'}: </span>
                      <span className="truncate text-gray-600">{replyToMessage.content || 'Tệp đính kèm'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyToMessage(null)}
                      className="p-1 hover:bg-blue-200/60 rounded-full text-blue-700 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-2 mb-2 dating-scrollbar">
                    {selectedFiles.map((file, fi) => (
                      <div
                        key={fi}
                        className="relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== fi))}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form Input */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition"
                    title="Đính kèm ảnh hoặc video"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập tin nhắn... (Nhấn Enter để gửi)"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition font-medium"
                  />

                  <button
                    type="submit"
                    disabled={(!inputText.trim() && selectedFiles.length === 0) || sending}
                    className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl disabled:opacity-40 shadow-md shadow-blue-500/20 transition active:scale-95 flex-shrink-0"
                  >
                    {sending ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Send size={17} />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State when no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Users size={42} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Tin nhắn của bạn</h3>
              <p className="text-xs text-gray-400 max-w-xs mt-1.5 leading-relaxed">
                Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tạo nhóm mới để bắt đầu trò chuyện!
              </p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COLUMN 3: Chat Info Sidebar */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <ChatInfoSidebar
          isOpen={showInfoSidebar && !!activeConv}
          onClose={() => setShowInfoSidebar(false)}
          conversation={activeConv}
          messages={messages}
          currentUser={currentUser}
          onConversationUpdated={() => fetchConversations(activeConvId)}
          onOpenMembersModal={() => setShowGroupMembers(true)}
          onOpenMediaLightbox={(url, type) => setLightboxMedia({ url, type })}
        />
      </div>

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(newGroup) => {
            fetchConversations();
            if (newGroup) setActiveConv(newGroup);
          }}
        />
      )}

      {showGroupMembers && activeConv && (
        <GroupMembersModal
          conversationId={activeConv.conversation_id || activeConv.id}
          conversationName={activeConv.displayName || activeConv.name}
          onClose={() => setShowGroupMembers(false)}
          onMembersUpdated={() => fetchConversations(activeConvId)}
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

      {selectedReactionMsgId && (
        <MessageReactionUsersModal
          isOpen={!!selectedReactionMsgId}
          onClose={() => setSelectedReactionMsgId(null)}
          messageId={selectedReactionMsgId}
        />
      )}
    </div>
  );
}
