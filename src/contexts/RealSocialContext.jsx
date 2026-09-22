import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import postService from '../services/postService';
import storyService from '../services/storyService';
import reelService from '../services/reelService';
import friendshipService from '../services/friendshipService';
import conversationService from '../services/conversationService';
import notificationService from '../services/notificationService';
import reactionService from '../services/reactionService';
import savedPostService from '../services/savedPostService';
import commentService from '../services/commentService';
import blockService from '../services/blockService';
import useWebSocketStore from '../stores/useWebSocketStore';
import toast from 'react-hot-toast';
import { applyThemeAccent, getInitialAccent } from '../utils/themeAccents';
import soundFX from '../utils/soundEffects';

const RealSocialContext = createContext(null);

export const RealSocialProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();

  // Dark / Light Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('socialdb-theme') || 'light');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('socialdb-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    soundFX.playToggle(theme === 'light');
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Accent Theme (Indigo, Violet, Rose, Emerald, Cyan, Amber)
  const [accentTheme, setAccentThemeState] = useState(getInitialAccent);
  useEffect(() => {
    applyThemeAccent(accentTheme);
  }, [accentTheme]);

  const setAccentTheme = (accentId) => {
    soundFX.playPop();
    setAccentThemeState(accentId);
    applyThemeAccent(accentId);
  };

  // Sound FX State
  const [soundEnabled, setSoundEnabled] = useState(() => soundFX.isEnabled());
  const toggleSound = () => {
    const nextState = soundFX.toggle();
    setSoundEnabled(nextState);
    toast(nextState ? '🔊 Đã bật âm thanh hiệu ứng' : '🔇 Đã tắt âm thanh hiệu ứng', {
      duration: 1500,
    });
  };

  // Live state from Backend APIs
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [reels, setReels] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [activeStory, setActiveStory] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fallback / Current User object formatted for components
  const currentUser = {
    id: user?.id || user?.userId || 0,
    name: user?.fullName || user?.name || user?.userName || 'Người dùng',
    username: user?.userName || user?.username || 'user',
    avatar: user?.avatarUrl || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cover: user?.coverUrl || user?.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    bio: user?.bio || '',
    occupation: user?.occupation || '',
    company: user?.company || '',
    education: user?.education || '',
    location: user?.city ? `${user.city}, ${user.country || 'Việt Nam'}` : '',
    phone: user?.phone || '',
    website: user?.website || '',
  };

  // Connect WebSocket on Auth
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated && token) {
      useWebSocketStore.getState().connect(token);
    } else {
      useWebSocketStore.getState().disconnect();
    }
  }, [isAuthenticated]);

  // Load Real Feed & Social Graph
  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    try {
      // 1. Posts Feed
      try {
        const postRes = await postService.getFeed(0, 20);
        const postData = postRes.data?.data?.content || postRes.data?.data || [];
        setPosts(Array.isArray(postData) ? postData : []);
      } catch (e) {
        console.warn('Feed fetch:', e?.message);
      }

      // 2. Stories Feed
      try {
        const [feedStoryRes, myStoryRes] = await Promise.allSettled([
          storyService.getFeed(),
          storyService.getMyStories(),
        ]);
        const feedStories = feedStoryRes.status === 'fulfilled' ? feedStoryRes.value.data?.data || [] : [];
        const myStories = myStoryRes.status === 'fulfilled' ? myStoryRes.value.data?.data || [] : [];
        const mergedStories = [...(Array.isArray(myStories) ? myStories : []), ...(Array.isArray(feedStories) ? feedStories : [])];
        setStories(mergedStories);
      } catch (e) {
        console.warn('Story fetch:', e?.message);
      }

      // 3. Reels Feed
      try {
        const reelRes = await reelService.getReelFeed(0, 20);
        const reelData = reelRes.data?.data?.content || reelRes.data?.data || [];
        setReels(Array.isArray(reelData) ? reelData : []);
      } catch (e) {
        console.warn('Reel fetch:', e?.message);
      }

      // 4. Friend Requests & Suggestions
      try {
        const [reqRes, suggRes] = await Promise.allSettled([
          friendshipService.getPendingRequests(0, 50),
          friendshipService.getFriendSuggestions(),
        ]);
        if (reqRes.status === 'fulfilled') {
          const rData = reqRes.value.data?.data?.content || reqRes.value.data?.data || [];
          setFriendRequests(Array.isArray(rData) ? rData : []);
        }
        if (suggRes.status === 'fulfilled') {
          const sData = suggRes.value.data?.data || [];
          setSuggestedFriends(Array.isArray(sData) ? sData : []);
        }
      } catch (e) {
        console.warn('Friend requests fetch:', e?.message);
      }

      // 5. Conversations
      try {
        const convRes = await conversationService.getMyConversations();
        const convData = convRes.data?.data || [];
        setConversations(Array.isArray(convData) ? convData : []);
        if (convData.length > 0 && !activeConversationId) {
          setActiveConversationId(convData[0].id || convData[0].conversationId);
        }
      } catch (e) {
        console.warn('Conversations fetch:', e?.message);
      }

      // 6. Notifications
      try {
        const notifRes = await notificationService.getNotifications(0, 30);
        const notifData = notifRes.data?.data?.content || notifRes.data?.data || [];
        setNotifications(Array.isArray(notifData) ? notifData : []);

        const countRes = await notificationService.getUnreadCount();
        setUnreadNotifCount(countRes.data?.data || 0);
      } catch (e) {
        console.warn('Notifications fetch:', e?.message);
      }

      // 7. Friends of current user
      if (user?.id || user?.userId) {
        try {
          const uid = user.id || user.userId;
          const friendsRes = await friendshipService.getFriends(uid, 0, 100);
          const friendsData = friendsRes.data?.data?.content || friendsRes.data?.data || [];
          setFriends(Array.isArray(friendsData) ? friendsData : []);
        } catch (e) {
          console.warn('Friends fetch:', e?.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.userId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Subscribe to real-time events from WebSocket store
  useEffect(() => {
    const unsubMsg = useWebSocketStore.getState().addMessageListener((newMsg) => {
      // Refresh conversations list or append message
      conversationService.getMyConversations().then((res) => {
        const cData = res.data?.data || [];
        setConversations(cData);
      });
    });

    const unsubNotif = useWebSocketStore.getState().addNotificationListener((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadNotifCount((prev) => prev + 1);
      toast(newNotif.message || 'Bạn có thông báo mới', { icon: '🔔' });
    });

    return () => {
      unsubMsg();
      unsubNotif();
    };
  }, []);

  // Post Actions (Real API)
  const toggleLikePost = async (postId, type = 'LIKE') => {
    try {
      const res = await reactionService.reactToPost(postId, type);
      const resData = res.data?.data;
      // Optimistic update local posts
      setPosts((prev) =>
        prev.map((p) => {
          const pId = p.id || p.postId;
          if (pId === postId) {
            const isReacted = resData?.isReacted !== undefined ? resData.isReacted : !p.isLiked;
            return {
              ...p,
              isLiked: isReacted,
              userReaction: isReacted ? type : null,
              reactionCount: isReacted ? (p.reactionCount || 0) + 1 : Math.max(0, (p.reactionCount || 1) - 1),
            };
          }
          return p;
        })
      );
    } catch (e) {
      toast.error('Lỗi bày tỏ cảm xúc');
    }
  };

  const toggleSavePost = async (postId) => {
    try {
      const targetPost = posts.find((p) => (p.id || p.postId) === postId);
      const currentlySaved = targetPost?.isSaved;
      if (currentlySaved) {
        await savedPostService.unsavePost(postId);
        toast.success('Đã bỏ lưu bài viết');
      } else {
        await savedPostService.savePost(postId);
        toast.success('Đã lưu bài viết');
      }
      setPosts((prev) =>
        prev.map((p) => {
          const pId = p.id || p.postId;
          if (pId === postId) {
            return { ...p, isSaved: !currentlySaved };
          }
          return p;
        })
      );
    } catch (e) {
      toast.error('Không thể cập nhật bài viết đã lưu');
    }
  };

  const addComment = async (postId, text, parentId = null) => {
    if (!text?.trim()) return;
    try {
      const res = await commentService.createComment(postId, text.trim(), parentId);
      toast.success('Đã gửi bình luận');
      // Increment comment count locally
      setPosts((prev) =>
        prev.map((p) => {
          const pId = p.id || p.postId;
          if (pId === postId) {
            return {
              ...p,
              commentCount: (p.commentCount || 0) + 1,
            };
          }
          return p;
        })
      );
      return res.data?.data;
    } catch (e) {
      toast.error('Không thể đăng bình luận');
    }
  };

  const deletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => (p.id || p.postId) !== postId));
      toast.success('Đã xóa bài viết');
    } catch (e) {
      toast.error('Không thể xóa bài viết');
    }
  };

  // Friend Actions (Real API)
  const sendFriendRequest = async (userId) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      toast.success('Đã gửi lời mời kết bạn');
      setSuggestedFriends((prev) => prev.filter((u) => (u.userId || u.id) !== userId));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể gửi lời mời');
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      await friendshipService.acceptFriendRequest(userId);
      toast.success('Đã đồng ý kết bạn');
      setFriendRequests((prev) => prev.filter((r) => (r.userId || r.id) !== userId));
      loadInitialData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể chấp nhận kết bạn');
    }
  };

  const declineFriendRequest = async (userId) => {
    try {
      await friendshipService.rejectFriendRequest(userId);
      toast('Đã từ chối lời mời');
      setFriendRequests((prev) => prev.filter((r) => (r.userId || r.id) !== userId));
    } catch (e) {
      toast.error('Không thể từ chối lời mời');
    }
  };

  const removeFriend = async (userId) => {
    try {
      await friendshipService.cancelFriendRequest(userId);
      toast('Đã hủy kết bạn / lời mời');
      setFriends((prev) => prev.filter((f) => (f.userId || f.id) !== userId));
    } catch (e) {
      toast.error('Không thể thao tác');
    }
  };

  // Block Actions (Real API)
  const blockUser = async (userId) => {
    try {
      await blockService.blockUser(userId);
      toast.success('Đã chặn người dùng này');
      setFriends((prev) => prev.filter((f) => (f.userId || f.id) !== userId));
      setPosts((prev) => prev.filter((p) => p.userId !== userId && p.author?.id !== userId));
    } catch (e) {
      toast.error('Không thể chặn người dùng');
    }
  };

  const unblockUser = async (userId) => {
    try {
      await blockService.unblockUser(userId);
      toast.success('Đã bỏ chặn người dùng');
    } catch (e) {
      toast.error('Không thể bỏ chặn');
    }
  };

  // Notification Actions (Real API)
  const markNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n.notificationId === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
      toast.success('Đã đánh dấu đọc tất cả thông báo');
    } catch (e) {}
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id && n.notificationId !== id));
      toast.success('Đã xóa thông báo');
    } catch (e) {}
  };

  return (
    <RealSocialContext.Provider
      value={{
        theme,
        toggleTheme,
        accentTheme,
        setAccentTheme,
        soundEnabled,
        toggleSound,
        currentUser,
        posts,
        setPosts,
        stories,
        setStories,
        reels,
        setReels,
        friends,
        setFriends,
        friendRequests,
        setFriendRequests,
        suggestedFriends,
        setSuggestedFriends,
        conversations,
        setConversations,
        activeConversationId,
        setActiveConversationId,
        notifications,
        setNotifications,
        unreadNotifCount,
        activeStory,
        setActiveStory,
        loading,
        refreshData: loadInitialData,

        // Actions
        toggleLikePost,
        toggleSavePost,
        addComment,
        deletePost,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        blockUser,
        unblockUser,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
      }}
    >
      {children}
    </RealSocialContext.Provider>
  );
};

export const useSocial = () => useContext(RealSocialContext);
export default RealSocialContext;
