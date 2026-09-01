import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import userService from '../services/userService';
import adminService from '../services/adminService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated) {
      setUser(null);
      setRoles([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await userService.getMe();
      const userData = res.data.data;
      if (userData) {
        setUser({
          ...userData,
          id: userData.userId || userData.id,
        });
      }

      // Fetch roles
      try {
        const rolesRes = await adminService.getMyRoles();
        const roleList = rolesRes.data?.data || [];
        setRoles(Array.isArray(roleList) ? roleList : []);
      } catch (e) {
        setRoles([]);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = () => {
    setUser(null);
    setRoles([]);
  };

  const isAdmin = roles.some(
    (r) => r.name === 'ROLE_ADMIN' || r.name === 'ADMIN' || r === 'ADMIN' || r === 'ROLE_ADMIN'
  );

  const currentUserId = user?.id || user?.userId || (localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null);

  return (
    <UserContext.Provider
      value={{
        user,
        currentUserId,
        setUser,
        roles,
        isAdmin,
        isLoading,
        refreshUser: fetchUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
