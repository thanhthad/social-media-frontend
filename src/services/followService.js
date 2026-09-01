import friendshipService from './friendshipService';

// Forwarding to friendshipService for compatibility
const followService = {
  followUser: (userId) => friendshipService.sendFriendRequest(userId),
  unfollowUser: (userId) => friendshipService.rejectFriendRequest(userId),
  getFollowers: (userId, page = 0, size = 10) => friendshipService.getFriends(userId, page, size),
  getFollowing: (userId, page = 0, size = 10) => friendshipService.getFriends(userId, page, size),
  getMyFollowers: (page = 0, size = 10) => friendshipService.getFriendSuggestions(),
  getMyFollowing: (page = 0, size = 10) => friendshipService.getFriendSuggestions(),
};

export default followService;
