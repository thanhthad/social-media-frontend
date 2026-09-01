import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const register = async (username, email, password) => {
    try {
      await axiosClient.post('/auth/register', {
        username,
        email,
        password,
      });
      toast.success('Đăng ký thành công!');
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Register failed' 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });
      
      const { accessToken, refreshToken, userId } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (userId) {
        localStorage.setItem('userId', userId.toString());
      }
      
      setIsAuthenticated(true);
      toast.success('Đăng nhập thành công!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
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
    setIsAuthenticated(false);
    toast.success('Đã đăng xuất');
  };

  const forgotPassword = async (email) => {
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error.response?.data?.message || 'Error occurred' };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await axiosClient.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.response?.data?.message || 'Error occurred' };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await axiosClient.get(`/auth/verify-email?token=${token}`);
      return { success: true };
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, error: error.response?.data?.message || 'Verification failed' };
    }
  };

  const resendVerification = async (email) => {
    try {
      await axiosClient.post('/auth/resend-verification', { email });
      return { success: true };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to resend' };
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
