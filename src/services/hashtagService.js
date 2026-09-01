import axiosClient from '../api/axiosClient';
const hashtagService = {
  getTrending: (limit = 10) => axiosClient.get('/hashtags/trending', { params: { limit } }),
  searchByHashtag: (query, page = 0, size = 10) => axiosClient.get('/posts/search/hashtag', { params: { query, page, size } })
};
export default hashtagService;
