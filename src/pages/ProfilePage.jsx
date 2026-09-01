import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import friendshipService from '../services/friendshipService';
import conversationService from '../services/conversationService';
import blockService from '../services/blockService';
import postService from '../services/postService';
import storyService from '../services/storyService';
import reelService from '../services/reelService';
import PostCard from '../components/post/PostCard';
import CreatePostForm from '../components/post/CreatePostForm';
import MutualFriendsModal from '../components/friend/MutualFriendsModal';
import StoryViewerModal from '../components/story/StoryViewerModal';
import toast from 'react-hot-toast';
import {
  UserPlus,
  UserCheck,
  UserMinus,
  Ban,
  Users,
  MoreVertical,
  Edit3,
  MessageSquare,
  Bookmark,
  Grid,
  Info,
  Briefcase,
  GraduationCap,
  MapPin,
  Link as LinkIcon,
  Phone,
  UserX,
  Globe,
  Lock,
  Camera,
  Play,
  Eye,
  Plus,
  Clapperboard,
} from 'lucide-react';

export default function ProfilePage() {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, currentUserId } = useUser();
  const { isAuthenticated } = useAuth();

  const isOwnProfile = !paramUserId || Number(paramUserId) === currentUserId;
  const targetUserId = isOwnProfile ? currentUserId : Number(paramUserId);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'friends' | 'saved'
  const [showMutualModal, setShowMutualModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Posts
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Saved Posts (for own profile)
  const [savedPosts, setSavedPosts] = useState([]);

  // Reels
  const [userReels, setUserReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);

  // Friends list
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Mutual friends list
  const [mutualFriends, setMutualFriends] = useState([]);
  const [loadingMutualFriends, setLoadingMutualFriends] = useState(false);
  const [friendsSubTab, setFriendsSubTab] = useState('all'); // 'all' | 'mutual'

  // User Stats
  const [userStats, setUserStats] = useState({
    totalPost: 0,
    totalReel: 0,
    totalFriend: 0,
    totalLikesReceived: 0,
    friendshipStatus: 'NONE',
  });

  // Friendship & Block Status
  const [isFriend, setIsFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Story
  const [myStories, setMyStories] = useState([]);
  const [storyViewer, setStoryViewer] = useState({ open: false, index: 0, stories: [] });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUserId) return;
      setLoading(true);
      try {
        if (isOwnProfile && currentUser) {
          setProfileData(currentUser);
        } else {
          const res = await userService.getUserById(targetUserId);
          const data = res.data?.data || res.data;
          setProfileData(data);
          setIsFriend(!!data.isFriend);
          setRequestSent(!!data.requestSent);

          try {
            const blockRes = await blockService.checkBlocked(targetUserId);
            setIsBlocked(!!(blockRes.data?.data ?? blockRes.data));
          } catch (e) {}
        }

        // Fetch User Stats
        userService.getUserStats(targetUserId)
          .then((res) => {
            const stats = res.data?.data;
            if (stats) {
              setUserStats(stats);
              if (stats.friendshipStatus === 'FRIENDS') setIsFriend(true);
              if (stats.friendshipStatus === 'PENDING_SENT') setRequestSent(true);
              if (stats.friendshipStatus === 'BLOCKED') setIsBlocked(true);
            }
          })
          .catch(() => {});
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, isOwnProfile, currentUser]);

  // Fetch own stories when own profile
  useEffect(() => {
    if (!isOwnProfile) return;
    storyService.getMyStories()
      .then((res) => {
        const data = res.data?.data || [];
        setMyStories(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [isOwnProfile]);

  // Fetch Tab Specific Data
  useEffect(() => {
    if (!targetUserId) return;

    if (activeTab === 'posts') {
      setLoadingPosts(true);
      const fetcher = isOwnProfile
        ? postService.getMyPosts(0, 30)
        : postService.getUserPosts(targetUserId, 0, 30);
      fetcher
        .then((res) => {
          const list = res.data?.data?.content || res.data?.data || [];
          setPosts(Array.isArray(list) ? list : []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingPosts(false));
    } else if (activeTab === 'friends') {
      if (friendsSubTab === 'mutual' && !isOwnProfile) {
        setLoadingMutualFriends(true);
        friendshipService
          .getMutualFriends(targetUserId)
          .then((res) => {
            const list = res.data?.data || res.data || [];
            setMutualFriends(Array.isArray(list) ? list : []);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingMutualFriends(false));
      } else {
        setLoadingFriends(true);
        friendshipService
          .getFriends(targetUserId, 0, 50)
          .then((res) => {
            const list = res.data?.data?.content || res.data?.data || [];
            setFriends(Array.isArray(list) ? list : []);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingFriends(false));
      }
    } else if (activeTab === 'saved' && isOwnProfile) {
      postService
        .getSavedPosts(0, 30)
        .then((res) => {
          const list = res.data?.data?.content || res.data?.data || [];
          setSavedPosts(Array.isArray(list) ? list : []);
        })
        .catch((err) => console.error(err));
    } else if (activeTab === 'reels') {
      setLoadingReels(true);
      const req = isOwnProfile
        ? reelService.getMyReels(0, 50)
        : reelService.getUserReels(targetUserId, 0, 50);

      req
        .then((res) => {
          const list = res.data?.data?.content || res.data?.data || [];
          setUserReels(Array.isArray(list) ? list : []);
        })
        .catch((err) => console.error('Failed to load reels', err))
        .finally(() => setLoadingReels(false));
    }
  }, [activeTab, friendsSubTab, targetUserId, isOwnProfile]);

  const handleSendFriendRequest = async () => {
    if (!targetUserId) return;
    try {
      await friendshipService.sendFriendRequest(targetUserId);
      setRequestSent(true);
      toast.success('Đã gửi lời mời kết bạn!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi lời mời kết bạn');
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!targetUserId) return;
    try {
      await friendshipService.cancelFriendRequest(targetUserId);
      setRequestSent(false);
      toast.success('Đã hủy lời mời kết bạn');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy lời mời');
    }
  };

  const handleUnfriend = async () => {
    if (!targetUserId) return;
    if (window.confirm(`Bạn có chắc muốn hủy kết bạn với ${profileData?.fullName || profileData?.username}?`)) {
      try {
        await friendshipService.rejectFriendRequest(targetUserId);
        setIsFriend(false);
        setRequestSent(false);
        toast.success('Đã hủy kết bạn');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể hủy kết bạn');
      }
    }
  };

  const handleStartChat = async () => {
    if (!targetUserId) return;
    setIsStartingChat(true);
    try {
      const res = await conversationService.createPrivate(targetUserId);
      const conv = res.data?.data;
      navigate('/messages', {
        state: {
          conversation: conv,
          conversationId: conv?.conversation_id || conv?.id,
        },
      });
    } catch (err) {
      console.error('Failed to create private conversation', err);
      toast.error(err.response?.data?.message || 'Không thể tạo cuộc trò chuyện');
      navigate('/messages');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleBlockUser = async () => {
    if (!targetUserId) return;
    try {
      await blockService.blockUser(targetUserId);
      toast.success('Đã chặn người dùng này');
      setIsBlocked(true);
      setShowMenu(false);
      navigate('/');
    } catch (err) {
      toast.error('Không thể chặn người dùng');
    }
  };

  const handlePostCreated = () => {
    setLoadingPosts(true);
    postService.getMyPosts(0, 30)
      .then((res) => {
        const list = res.data?.data?.content || res.data?.data || [];
        setPosts(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoadingPosts(false));
  };

  if (loading || !profileData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const {
    username,
    fullName,
    bio,
    avatarUrl,
    coverUrl,
    gender,
    dateOfBirth,
    phone,
    website,
    country,
    city,
    district,
    occupation,
    company,
    education,
    socialLinks,
    totalFriend,
    totalMutualCount = 0,
    totalMutualFriendAvatars = [],
    friendsCount = totalFriend ?? friends.length ?? 0,
    visibility,
  } = profileData;

  // Determine if private profile (for other users)
  const isPrivateProfile = !isOwnProfile && (visibility === 'PRIVATE');
  const isFriendOnlyProfile = !isOwnProfile && (visibility === 'FRIEND') && !isFriend;

  // For story viewer on own profile
  const storyCardsForViewer = myStories.map((s) => ({
    userId: currentUserId,
    username: currentUser?.username,
    avatarUrl: currentUser?.avatarUrl,
    url: s.url || s.mediaUrl,
    mediaType: s.mediaType,
    content: s.content,
    storyId: s.storyId || s.id,
    createdAt: s.createdAt,
    interactions: s.interactions || s.viewers || [],
    isMine: true,
  }));

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-0">
      {/* ── Cover & Avatar Header ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-5">
        <div className="relative">
          {/* Cover Photo */}
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="h-52 sm:h-64 w-full object-cover" />
          ) : (
            <div className="h-52 sm:h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          )}

          {/* Avatar */}
          <div className="absolute -bottom-16 left-6">
            <div className="relative">
              <img
                src={avatarUrl || 'https://via.placeholder.com/150'}
                alt={username}
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl bg-white"
              />
              {/* Story ring if own profile has stories */}
              {isOwnProfile && myStories.length > 0 && (
                <button
                  onClick={() => setStoryViewer({ open: true, index: 0, stories: storyCardsForViewer })}
                  className="absolute inset-0 rounded-full ring-4 ring-gradient-to-tr ring-amber-400 hover:opacity-90 transition"
                  style={{ background: 'transparent' }}
                  title="Xem tin của bạn"
                />
              )}
            </div>
          </div>
        </div>

        {/* User Info & Actions Bar */}
        <div className="pt-20 px-6 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {fullName || username}
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">@{username}</p>
            {bio && <p className="mt-2 text-sm text-gray-600 max-w-lg leading-relaxed">{bio}</p>}

            {/* Instagram Style Stats Row */}
            <div className="flex flex-wrap items-center gap-5 mt-3 text-xs text-gray-500 font-medium">
              <button
                onClick={() => setActiveTab('posts')}
                className="flex items-center gap-1.5 text-gray-800 font-bold hover:text-blue-600 transition cursor-pointer"
              >
                <Grid size={14} className="text-gray-500" />
                <span>
                  <strong className="text-gray-900 font-black">{userStats.totalPost || posts.length || 0}</strong> bài viết
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('friends'); setFriendsSubTab('all'); }}
                className="flex items-center gap-1.5 text-gray-800 font-bold hover:text-blue-600 transition cursor-pointer"
              >
                <Users size={14} className="text-blue-600" />
                <span>
                  <strong className="text-gray-900 font-black">{userStats.totalFriend || friendsCount || 0}</strong> bạn bè
                </span>
              </button>

              <button
                onClick={() => setActiveTab('reels')}
                className="flex items-center gap-1.5 text-gray-800 font-bold hover:text-pink-600 transition cursor-pointer"
              >
                <Clapperboard size={14} className="text-pink-500" />
                <span>
                  <strong className="text-gray-900 font-black">{userStats.totalReel || userReels.length || 0}</strong> reels
                </span>
              </button>

              {userStats.totalLikesReceived > 0 && (
                <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                  <span className="text-rose-500">❤️</span>
                  <span>
                    <strong className="text-gray-900 font-black">{userStats.totalLikesReceived}</strong> lượt thích
                  </span>
                </div>
              )}

              {/* Mutual Friends avatar cluster */}
              {!isOwnProfile && (totalMutualCount > 0 || totalMutualFriendAvatars?.length > 0) && (
                <button
                  onClick={() => setShowMutualModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-full transition border border-blue-100 active:scale-95 cursor-pointer"
                >
                  {totalMutualFriendAvatars?.length > 0 && (
                    <div className="flex -space-x-2">
                      {totalMutualFriendAvatars.slice(0, 4).map((av, idx) => (
                        <img
                          key={idx}
                          src={av || 'https://via.placeholder.com/24'}
                          alt=""
                          className="w-5 h-5 rounded-full ring-2 ring-white object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <Users size={13} />
                  <span>{totalMutualCount || totalMutualFriendAvatars?.length || 0} bạn chung</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0" ref={menuRef}>
            {isOwnProfile ? (
              <>
                <Link
                  to="/edit-profile"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 text-xs font-bold transition active:scale-95"
                >
                  <Edit3 size={15} />
                  Chỉnh sửa trang cá nhân
                </Link>
              </>
            ) : (
              isAuthenticated && (
                <>
                  {isFriend ? (
                    <button
                      onClick={handleUnfriend}
                      className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition shadow-sm bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 active:scale-95"
                      title="Nhấn để hủy kết bạn"
                    >
                      <UserCheck size={15} />
                      Bạn bè
                    </button>
                  ) : requestSent ? (
                    <button
                      onClick={handleCancelFriendRequest}
                      className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition shadow-sm bg-amber-50 text-amber-700 hover:bg-amber-100 active:scale-95 border border-amber-200"
                      title="Nhấn để hủy lời mời đã gửi"
                    >
                      <UserX size={15} />
                      Hủy lời mời
                    </button>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition shadow-sm bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                    >
                      <UserPlus size={15} />
                      Kết bạn
                    </button>
                  )}

                  {/* Message button — only on other user's profile */}
                  <button
                    type="button"
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 text-xs font-bold transition active:scale-95 disabled:opacity-50"
                    title="Nhắn tin riêng tư"
                  >
                    <MessageSquare size={15} />
                    <span>{isStartingChat ? 'Đang mở...' : 'Nhắn tin'}</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl py-1 border border-gray-100 z-30 text-xs">
                        <button
                          onClick={handleBlockUser}
                          className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                        >
                          <Ban size={15} />
                          Chặn người dùng
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-t border-gray-100 px-6 overflow-x-auto scrollbar-none">
          {[
            { key: 'posts', label: 'Bài viết', icon: Grid },
            { key: 'reels', label: 'Reels', icon: Clapperboard },
            { key: 'friends', label: 'Bạn bè', icon: Users },
            ...(isOwnProfile ? [{ key: 'saved', label: 'Đã lưu', icon: Bookmark }] : []),
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT SIDEBAR: About + Friends preview ── */}
        <div className="space-y-4">
          {/* About Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <Info size={16} className="text-blue-600" />
              Giới thiệu
            </h3>

            {(isPrivateProfile || isFriendOnlyProfile) ? (
              <div className="text-center py-4">
                <Lock size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 font-medium">
                  {isPrivateProfile
                    ? 'Trang cá nhân này ở chế độ riêng tư'
                    : 'Chỉ bạn bè mới xem được thông tin này'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {bio && (
                  <p className="text-gray-700 leading-relaxed italic border-l-2 border-blue-200 pl-3">
                    "{bio}"
                  </p>
                )}
                {occupation && (
                  <div className="flex items-start gap-2.5 text-gray-700">
                    <Briefcase size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {occupation}
                      {company && <span className="text-gray-500"> tại <strong>{company}</strong></span>}
                    </span>
                  </div>
                )}
                {education && (
                  <div className="flex items-start gap-2.5 text-gray-700">
                    <GraduationCap size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{education}</span>
                  </div>
                )}
                {(city || country) && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <MapPin size={15} className="text-gray-400 flex-shrink-0" />
                    <span>{[city, district, country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Phone size={15} className="text-gray-400 flex-shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Globe size={15} className="text-gray-400 flex-shrink-0" />
                    <a href={website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                      {website}
                    </a>
                  </div>
                )}
                {socialLinks && Object.entries(socialLinks).some(([, v]) => v) && (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                      <LinkIcon size={12} />
                      Liên kết
                    </p>
                    {Object.entries(socialLinks).map(([key, url]) =>
                      url ? (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs text-blue-600 hover:underline truncate"
                        >
                          <span className="capitalize font-semibold text-gray-500">{key}:</span>
                          <span className="truncate">{url}</span>
                        </a>
                      ) : null
                    )}
                  </div>
                )}
                {!bio && !occupation && !education && !city && !phone && !website && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    {isOwnProfile ? 'Thêm thông tin giới thiệu về bạn' : 'Chưa có thông tin giới thiệu'}
                  </p>
                )}
                {isOwnProfile && (
                  <Link
                    to="/edit-profile"
                    className="mt-1 block text-center text-xs font-semibold text-blue-600 hover:bg-blue-50 py-2 rounded-xl transition"
                  >
                    Chỉnh sửa thông tin
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Friends preview card in sidebar */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                Bạn bè
                <span className="text-xs font-normal text-gray-400">({friendsCount})</span>
              </h3>
              <button
                onClick={() => setActiveTab('friends')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            {!isPrivateProfile && !isFriendOnlyProfile ? (
              <div className="grid grid-cols-3 gap-2">
                {friends.slice(0, 6).map((f) => {
                  const fId = f.userId || f.id;
                  return (
                    <Link key={fId} to={`/users/${fId}`} className="group text-center">
                      <img
                        src={f.avatarUrl || 'https://via.placeholder.com/64'}
                        alt=""
                        className="w-full aspect-square rounded-xl object-cover border border-gray-100 group-hover:opacity-90 transition"
                      />
                      <p className="mt-1 text-[10px] text-gray-600 truncate font-medium group-hover:text-blue-600 transition">
                        {f.fullName || f.username}
                      </p>
                    </Link>
                  );
                })}
                {friends.length === 0 && !loadingFriends && (
                  <p className="col-span-3 text-xs text-gray-400 text-center py-2">Chưa có bạn bè</p>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <Lock size={24} className="mx-auto text-gray-300 mb-1" />
                <p className="text-xs text-gray-400">Danh sách bạn bè bị ẩn</p>
              </div>
            )}
          </div>

          {/* Own Story card in sidebar */}
          {isOwnProfile && myStories.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Camera size={16} className="text-pink-500" />
                  Tin của bạn
                  <span className="text-xs font-normal text-gray-400">({myStories.length})</span>
                </h3>
                <button
                  onClick={() => setStoryViewer({ open: true, index: 0, stories: storyCardsForViewer })}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {myStories.slice(0, 6).map((s, idx) => {
                  const viewers = s.interactions?.length || s.viewers?.length || s.viewCount || 0;
                  return (
                    <button
                      key={s.storyId || s.id || idx}
                      onClick={() => setStoryViewer({ open: true, index: idx, stories: storyCardsForViewer })}
                      className="relative group rounded-xl overflow-hidden aspect-square bg-gray-900"
                    >
                      {s.mediaType === 'VIDEO' ? (
                        <>
                          <video src={s.url || s.mediaUrl} className="w-full h-full object-cover opacity-80" />
                          <Play size={16} className="absolute inset-0 m-auto text-white drop-shadow" />
                        </>
                      ) : (
                        <img src={s.url || s.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-85" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {viewers > 0 && (
                        <div className="absolute bottom-1 left-1 right-1 flex items-center gap-0.5 text-white text-[9px] font-semibold">
                          <Eye size={9} />
                          <span>{viewers}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT MAIN CONTENT ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <>
              {isOwnProfile && (
                <CreatePostForm onPostCreated={handlePostCreated} />
              )}
              {loadingPosts ? (
                <div className="py-16 flex justify-center">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : posts.length > 0 ? (
                posts.map((post, idx) => (
                  <PostCard
                    key={`profile-post-${post.id || idx}-${idx}`}
                    post={post}
                    onPostDeleted={(pId) => setPosts((prev) => prev.filter((p) => p.id !== pId))}
                  />
                ))
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <Grid size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm font-semibold">Chưa có bài viết nào.</p>
                  {isOwnProfile && (
                    <p className="text-xs text-gray-400 mt-1">Hãy chia sẻ khoảnh khắc đầu tiên của bạn!</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Reels Tab */}
          {activeTab === 'reels' && (
            <div className="space-y-4">
              {loadingReels ? (
                <div className="py-16 flex justify-center">
                  <div className="w-8 h-8 border-3 border-pink-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : userReels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {userReels.map((reel, idx) => (
                    <Link
                      key={`profile-reel-${reel.id || idx}-${idx}`}
                      to={`/reels?reelId=${reel.id}`}
                      className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-black shadow-md block"
                    >
                      {reel.thumbnailUrl ? (
                        <img
                          src={reel.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center">
                          <Clapperboard size={28} className="text-white/40" />
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Play icon on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                          <Play size={20} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>

                      {/* Top Duration Badge */}
                      {reel.durationSeconds > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white">
                          {reel.durationSeconds}s
                        </div>
                      )}

                      {/* Bottom Info: Views & Likes */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold drop-shadow">
                        <div className="flex items-center gap-1">
                          <Play size={11} fill="currentColor" />
                          <span>{reel.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-rose-300">
                          <Heart size={11} fill="currentColor" />
                          <span>{reel.reactionCount || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto shadow-inner">
                    <Clapperboard size={28} />
                  </div>
                  <p className="text-gray-700 font-bold text-sm">Chưa có video Reel nào</p>
                  <p className="text-xs text-gray-400">
                    {isOwnProfile
                      ? 'Hãy tạo video Reel đầu tiên để chia sẻ với mọi người!'
                      : 'Người dùng này chưa đăng video Reel nào.'}
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/reels"
                      className="inline-block mt-2 px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl text-xs font-bold shadow transition"
                    >
                      + Tạo Reel mới
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
              {/* Sub-tab switcher */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <div className="flex bg-gray-100/80 p-1 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => setFriendsSubTab('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      friendsSubTab === 'all'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tất cả ({friendsCount})
                  </button>

                  {!isOwnProfile && (totalMutualCount > 0 || totalMutualFriendAvatars?.length > 0) && (
                    <button
                      type="button"
                      onClick={() => setFriendsSubTab('mutual')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        friendsSubTab === 'mutual'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Users size={13} className="text-blue-600" />
                      <span>Bạn chung ({totalMutualCount || totalMutualFriendAvatars?.length || 0})</span>
                    </button>
                  )}
                </div>

                {!isOwnProfile && (totalMutualCount > 0 || totalMutualFriendAvatars?.length > 0) && (
                  <button
                    type="button"
                    onClick={() => setShowMutualModal(true)}
                    className="ml-auto text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-100 transition flex items-center gap-1 active:scale-95"
                  >
                    <Eye size={13} />
                    Xem popup
                  </button>
                )}
              </div>

              {/* Content */}
              {friendsSubTab === 'mutual' && !isOwnProfile ? (
                <div>
                  {loadingMutualFriends ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : mutualFriends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mutualFriends.map((f) => {
                        const fId = f.userId || f.id;
                        return (
                          <Link
                            key={fId}
                            to={`/users/${fId}`}
                            className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 hover:bg-gray-50 hover:border-blue-100 hover:shadow-sm transition group bg-white"
                          >
                            <img
                              src={f.avatarUrl || 'https://via.placeholder.com/48'}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                                {f.fullName || f.username}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">@{f.username}</p>
                            </div>
                            <Users size={14} className="text-blue-400 flex-shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-xs text-gray-400">Không có bạn chung nào.</p>
                  )}
                </div>
              ) : (
                <div>
                  {loadingFriends ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : friends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {friends.map((f) => {
                        const fId = f.userId || f.id;
                        return (
                          <Link
                            key={fId}
                            to={`/users/${fId}`}
                            className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 hover:bg-gray-50 hover:border-blue-100 hover:shadow-sm transition group bg-white"
                          >
                            <img
                              src={f.avatarUrl || 'https://via.placeholder.com/48'}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                                {f.fullName || f.username}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">@{f.username}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-xs text-gray-400">Chưa có bạn bè nào.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Saved Posts Tab */}
          {activeTab === 'saved' && isOwnProfile && (
            <div className="space-y-5">
              {savedPosts.length > 0 ? (
                savedPosts.map((post, idx) => (
                  <PostCard
                    key={`profile-saved-${post.id || idx}-${idx}`}
                    post={post}
                    onPostDeleted={(pId) =>
                      setSavedPosts((prev) => prev.filter((p) => p.id !== pId))
                    }
                  />
                ))
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <Bookmark size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm font-semibold">Bạn chưa lưu bài viết nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mutual Friends Modal */}
      {!isOwnProfile && (
        <MutualFriendsModal
          isOpen={showMutualModal}
          onClose={() => setShowMutualModal(false)}
          targetUserId={targetUserId}
          targetUserName={profileData?.fullName || profileData?.username}
        />
      )}

      {/* Story Viewer Modal (own profile) */}
      {storyViewer.open && (
        <StoryViewerModal
          stories={storyViewer.stories}
          initialIndex={storyViewer.index}
          currentUserId={currentUserId}
          onClose={() => setStoryViewer({ open: false, index: 0, stories: [] })}
          onStoryDeleted={() => {
            storyService.getMyStories()
              .then((res) => {
                const data = res.data?.data || [];
                setMyStories(Array.isArray(data) ? data : []);
              });
          }}
        />
      )}
    </div>
  );
}
