import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  CheckCircle2,
  Edit3,
  Share2,
  Grid,
  FileText,
  Clapperboard,
  Users,
  Camera,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  ShieldAlert,
  Briefcase,
  GraduationCap,
  Globe,
  Lock,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import userService from '../services/userService';
import postService from '../services/postService';
import reelService from '../services/reelService';
import friendshipService from '../services/friendshipService';
import conversationService from '../services/conversationService';
import blockService from '../services/blockService';
import PostCard from '../components/post/PostCard';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';

export const ProfilePage = () => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, currentUserId, refreshUser } = useUser();

  const isOwnProfile = !routeUserId || String(routeUserId) === String(currentUserId);
  const targetUserId = routeUserId ? Number(routeUserId) : currentUserId;

  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [friendshipStatus, setFriendshipStatus] = useState('NONE'); // 'NONE' | 'FRIEND' | 'SENT' | 'RECEIVED'
  const [actionLoading, setActionLoading] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Fetch all user profile information
  const loadProfileData = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);

    try {
      // 1. User details & stats
      const [userRes, statsRes] = await Promise.allSettled([
        isOwnProfile ? userService.getMe() : userService.getUserById(targetUserId),
        userService.getUserStats(targetUserId),
      ]);

      if (userRes.status === 'fulfilled') {
        const u = userRes.value.data?.data || userRes.value.data;
        setProfileUser(u);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || statsRes.value.data);
      }

      // 2. User Posts
      try {
        const pRes = await postService.getUserPosts(targetUserId, 0, 30);
        const pList = pRes.data?.data?.content || pRes.data?.data || [];
        setPosts(Array.isArray(pList) ? pList : []);
      } catch (e) {
        console.warn('User posts fetch error', e);
      }

      // 3. User Reels
      try {
        const rRes = await reelService.getUserReels(targetUserId, 0, 30);
        const rList = rRes.data?.data?.content || rRes.data?.data || [];
        setReels(Array.isArray(rList) ? rList : []);
      } catch (e) {
        console.warn('User reels fetch error', e);
      }

      // 4. User Friends
      try {
        const fRes = await friendshipService.getFriends(targetUserId, 0, 50);
        const fList = fRes.data?.data?.content || fRes.data?.data || [];
        setFriends(Array.isArray(fList) ? fList : []);
      } catch (e) {
        console.warn('User friends fetch error', e);
      }

      // 5. Friendship check if not own profile
      if (!isOwnProfile && currentUserId) {
        try {
          const myFriendsRes = await friendshipService.getFriends(currentUserId, 0, 100);
          const myFriends = myFriendsRes.data?.data?.content || myFriendsRes.data?.data || [];
          const isFriend = myFriends.some(
            (f) => (f.userId || f.id) === Number(targetUserId)
          );
          if (isFriend) {
            setFriendshipStatus('FRIEND');
          } else {
            const pendingRes = await friendshipService.getPendingRequests(0, 50);
            const pendings = pendingRes.data?.data?.content || pendingRes.data?.data || [];
            const isPending = pendings.some(
              (r) => (r.userId || r.id) === Number(targetUserId)
            );
            if (isPending) {
              setFriendshipStatus('RECEIVED');
            } else {
              setFriendshipStatus('NONE');
            }
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      toast.error('Không thể tải thông tin trang cá nhân');
    } finally {
      setLoading(false);
    }
  }, [targetUserId, isOwnProfile, currentUserId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Handle Friendship actions
  const handleSendFriendRequest = async () => {
    setActionLoading(true);
    try {
      await friendshipService.sendFriendRequest(targetUserId);
      setFriendshipStatus('SENT');
      toast.success('Đã gửi lời mời kết bạn');
    } catch (e) {
      toast.error('Không thể gửi lời mời kết bạn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    setActionLoading(true);
    try {
      await friendshipService.acceptFriendRequest(targetUserId);
      setFriendshipStatus('FRIEND');
      toast.success('Đã chấp nhận kết bạn');
      loadProfileData();
    } catch (e) {
      toast.error('Không thể chấp nhận kết bạn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelFriend = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy kết bạn / hủy lời mời?')) return;
    setActionLoading(true);
    try {
      await friendshipService.cancelFriendRequest(targetUserId);
      setFriendshipStatus('NONE');
      toast.success('Đã hủy kết bạn');
      loadProfileData();
    } catch (e) {
      toast.error('Không thể thực hiện');
    } finally {
      setActionLoading(false);
    }
  };

  // Start private chat
  const handleStartChat = async () => {
    try {
      const res = await conversationService.createPrivate(targetUserId);
      navigate('/messages');
    } catch (e) {
      navigate('/messages');
    }
  };

  // Block user
  const handleBlockUser = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn chặn người dùng này?')) return;
    try {
      await blockService.blockUser(targetUserId);
      toast.success('Đã chặn người dùng này');
      navigate('/');
    } catch (e) {
      toast.error('Không thể chặn người dùng');
    }
  };

  // Upload Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('Đang cập nhật ảnh đại diện...');
    try {
      await userService.updateAvatar(file);
      toast.success('Đã cập nhật ảnh đại diện thành công!', { id: toastId });
      refreshUser?.();
      loadProfileData();
    } catch (err) {
      toast.error('Không thể cập nhật ảnh đại diện', { id: toastId });
    }
  };

  // Upload Cover
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('Đang cập nhật ảnh bìa...');
    try {
      await userService.updateCover(file);
      toast.success('Đã cập nhật ảnh bìa thành công!', { id: toastId });
      refreshUser?.();
      loadProfileData();
    } catch (err) {
      toast.error('Không thể cập nhật ảnh bìa', { id: toastId });
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    toast.success('Đã sao chép liên kết trang cá nhân!');
  };

  if (loading && !profileUser) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const displayName =
    profileUser?.fullName ||
    profileUser?.displayName ||
    profileUser?.username ||
    'Người dùng';
  const username = profileUser?.username || profileUser?.userName || '';
  const avatarUrl =
    profileUser?.avatarUrl ||
    profileUser?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  const coverUrl =
    profileUser?.coverUrl ||
    profileUser?.cover ||
    'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&auto=format&fit=crop&q=80';

  const bio = profileUser?.bio || profileUser?.aboutMe || '';
  const location = [profileUser?.city, profileUser?.country].filter(Boolean).join(', ');
  const website = profileUser?.website || '';
  const occupation = profileUser?.occupation || profileUser?.work || '';

  const tabs = [
    { id: 'posts', label: 'Bài viết', icon: FileText, badge: stats?.postCount ?? posts.length },
    { id: 'reels', label: 'Reels', icon: Clapperboard, badge: reels.length },
    { id: 'friends', label: 'Bạn bè', icon: Users, badge: stats?.friendCount ?? friends.length },
    { id: 'about', label: 'Giới thiệu', icon: Grid },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-2">
      {/* 1. Profile Header Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs mb-6">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-slate-200 dark:bg-slate-800 group">
          <img
            src={coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Cover upload button (own profile) */}
          {isOwnProfile && (
            <>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5 shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>Đổi ảnh bìa</span>
              </button>
            </>
          )}
        </div>

        {/* Profile Info Row */}
        <div className="px-5 sm:px-8 pb-6 pt-0 relative">
          {/* Avatar and Main Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="relative inline-block group">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md ring-1 ring-slate-200/50"
              />
              {isOwnProfile && (
                <>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border-2 border-white dark:border-slate-900 transition"
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center flex-wrap gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Share2}
                onClick={handleShareProfile}
              >
                Chia sẻ
              </Button>

              {isOwnProfile ? (
                <Link to="/profile/edit">
                  <Button variant="primary" size="sm" leftIcon={Edit3}>
                    Chỉnh sửa trang cá nhân
                  </Button>
                </Link>
              ) : (
                <>
                  {/* Friendship Button */}
                  {friendshipStatus === 'NONE' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={UserPlus}
                      disabled={actionLoading}
                      onClick={handleSendFriendRequest}
                    >
                      Kết bạn
                    </Button>
                  )}
                  {friendshipStatus === 'SENT' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={UserX}
                      disabled={actionLoading}
                      onClick={handleCancelFriend}
                    >
                      Đã gửi lời mời
                    </Button>
                  )}
                  {friendshipStatus === 'RECEIVED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={UserCheck}
                      disabled={actionLoading}
                      onClick={handleAcceptFriendRequest}
                    >
                      Chấp nhận kết bạn
                    </Button>
                  )}
                  {friendshipStatus === 'FRIEND' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={UserCheck}
                      disabled={actionLoading}
                      onClick={handleCancelFriend}
                    >
                      Bạn bè
                    </Button>
                  )}

                  {/* Message Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={MessageCircle}
                    onClick={handleStartChat}
                  >
                    Nhắn tin
                  </Button>

                  {/* Block Button */}
                  <button
                    onClick={handleBlockUser}
                    className="p-2 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 rounded-xl transition"
                    title="Chặn người dùng này"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Identity & Bio */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {displayName}
                </h1>
                {profileUser?.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950" />
                )}
              </div>
              {username && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  @{username}
                </span>
              )}
            </div>

            {bio && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {bio}
              </p>
            )}

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              {location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{location}</span>
                </div>
              )}
              {occupation && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{occupation}</span>
                </div>
              )}
              {website && (
                <div className="flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {website}
                  </a>
                </div>
              )}
            </div>

            {/* Stats Counter Row */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {stats?.postCount ?? posts.length}
                </span>{' '}
                <span className="text-slate-500">Bài viết</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {stats?.friendCount ?? friends.length}
                </span>{' '}
                <span className="text-slate-500">Bạn bè</span>
              </div>
              {stats?.followerCount !== undefined && (
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {stats.followerCount}
                  </span>{' '}
                  <span className="text-slate-500">Người theo dõi</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="px-5 sm:px-8 border-t border-slate-100 dark:border-slate-800">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underlined"
          />
        </div>
      </div>

      {/* 2. Profile Body Content */}
      <div className="w-full">
        {activeTab === 'posts' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id || post.postId}
                  post={post}
                  onPostUpdated={loadProfileData}
                  onPostDeleted={(deletedId) =>
                    setPosts((prev) =>
                      prev.filter((p) => (p.id || p.postId) !== deletedId)
                    )
                  }
                />
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Chưa có bài viết nào
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Người dùng này chưa chia sẻ bài viết nào lên bảng tin.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {reels.length > 0 ? (
              reels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => navigate('/reels')}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-black cursor-pointer shadow-sm"
                >
                  <img
                    src={reel.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                    <p className="line-clamp-2 text-[11px] font-medium mb-1">
                      {reel.content}
                    </p>
                    <span className="text-[10px] text-white/70">
                      {reel.viewCount || 0} lượt xem
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <Clapperboard className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Chưa có Reel nào
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {friends.length > 0 ? (
              friends.map((friend) => {
                const fId = friend.userId || friend.id;
                const fName = friend.fullName || friend.username || 'Bạn bè';
                const fAvatar =
                  friend.avatarUrl ||
                  friend.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                return (
                  <Link
                    key={fId}
                    to={`/profile/${fId}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-md transition group"
                  >
                    <img
                      src={fAvatar}
                      alt={fName}
                      className="w-16 h-16 rounded-full object-cover mb-2 ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-600 transition"
                    />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">
                      {fName}
                    </h4>
                    {friend.username && (
                      <span className="text-[10px] text-slate-400 truncate w-full">
                        @{friend.username}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Chưa có bạn bè nào
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs max-w-2xl mx-auto space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Thông tin chi tiết
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-slate-400 block mb-1">Họ và tên</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {displayName}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-slate-400 block mb-1">Tên người dùng</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  @{username}
                </span>
              </div>
              {profileUser?.phone && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <span className="text-slate-400 block mb-1">Số điện thoại</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profileUser.phone}
                  </span>
                </div>
              )}
              {profileUser?.education && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <span className="text-slate-400 block mb-1">Học vấn</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profileUser.education}
                  </span>
                </div>
              )}
              {profileUser?.company && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <span className="text-slate-400 block mb-1">Công ty</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profileUser.company}
                  </span>
                </div>
              )}
              {profileUser?.profileVisibility && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <span className="text-slate-400 block mb-1">Quyền riêng tư hồ sơ</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profileUser.profileVisibility}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
