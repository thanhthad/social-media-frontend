import axiosClient from '../api/axiosClient';

const hashtagService = {
  getTrending: () => axiosClient.get('/hashtags/trending'),
  searchHashtags: (keyword) => axiosClient.get('/hashtags/search', { params: { keyword } }),
  searchPostsByHashtag: (name, page = 0, size = 10) =>
    axiosClient.get('/posts/search/hashtag', { params: { name, page, size } }),
};

export default hashtagService;

