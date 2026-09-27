import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if valid token exists in localStorage on initial load
    const token = localStorage.getItem('accessToken');
    if (token) {
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);

    // Sync with axiosClient when token expires or refresh fails
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const register = async (username, email, password) => {
    try {
      const response = await axiosClient.post('/auth/register', {
        username: username.trim(),
        email: email.trim(),
        password,
      });
      toast.success('Đăng ký thành công! Vui lòng xác thực email của bạn.');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error);
      const msg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      toast.error(msg);
      return { 
        success: false, 
        error: msg 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email: email.trim(),
        password,
      });
      
      const authData = response.data?.data;
      if (!authData || !authData.accessToken) {
        throw new Error(response.data?.message || 'Dữ liệu xác thực không hợp lệ từ máy chủ');
      }

      const { accessToken, refreshToken, userId, username } = authData;
      
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userId) localStorage.setItem('userId', userId.toString());
      if (username) localStorage.setItem('username', username);
      
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setIsAuthenticated(true);
      toast.success('Đăng nhập thành công!');
      return { success: true, data: authData };
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      const isNotVerified = 
        msg.toLowerCase().includes('not verified') || 
        msg.toLowerCase().includes('chưa xác thực') ||
        error.response?.status === 403;
      
      toast.error(msg);
      return { 
        success: false, 
        notVerified: isNotVerified,
        error: msg 
      };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axiosClient.post('/auth/logout', { refreshToken });
      } catch (e) {
        console.warn('Server logout error:', e);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    delete axiosClient.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    toast.success('Đã đăng xuất');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axiosClient.post('/auth/forgot-password', { email: email.trim() });
      toast.success('Đã gửi email khôi phục mật khẩu!');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Forgot password error:', error);
      const msg = error.response?.data?.message || 'Không thể gửi email khôi phục';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axiosClient.post('/auth/reset-password', { 
        token: token.trim(), 
        newPassword 
      });
      toast.success('Đặt lại mật khẩu thành công! Hãy đăng nhập lại.');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Reset password error:', error);
      const msg = error.response?.data?.message || 'Đặt lại mật khẩu thất bại';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await axiosClient.get(`/auth/verify-email?token=${encodeURIComponent(token.trim())}`);
      toast.success('Xác thực email thành công!');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Verify email error:', error);
      const msg = error.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await axiosClient.post('/auth/resend-verification', { email: email.trim() });
      toast.success('Đã gửi lại email xác thực! Vui lòng kiểm tra hòm thư.');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Resend verification error:', error);
      const msg = error.response?.data?.message || 'Không thể gửi lại email xác thực';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      login, 
      register, 
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
