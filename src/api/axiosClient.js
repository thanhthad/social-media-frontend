import axios from 'axios';

// Get base URL from environment variables or default
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for sending requests
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Nếu request payload là FormData, xóa Content-Type để trình duyệt tự gắn multipart/form-data kèm boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh mutex and queue to prevent concurrent duplicate refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor for responses
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401, request exists, has not been retried,
    // and is not an auth endpoint that shouldn't trigger refresh
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If a refresh is already in progress, enqueue this request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error('No refresh token available'), null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Use standard axios to avoid triggering axiosClient interceptors
        const res = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const newAccessToken = res.data?.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken;

        if (newAccessToken && newRefreshToken) {
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return axiosClient(originalRequest);
        } else {
          throw new Error('Invalid refresh response structure');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
