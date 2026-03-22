import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { User } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从localStorage加载用户和token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;

        // 保存到localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // 更新状态
        setToken(newToken);
        setUser(userData);
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    // 清除localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 清除状态
    setToken(null);
    setUser(null);
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();

      if (response.success && response.data) {
        // 更新localStorage
        localStorage.setItem('user', JSON.stringify(response.data));

        // 更新状态
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // 如果刷新失败，可能是token过期，执行登出
      logout();
    }
  }, [logout]);

  // 更新用户信息
  const updateUser = useCallback(async (name: string) => {
    try {
      const response = await authApi.updateProfile(name);

      if (response.success && response.data) {
        // 更新localStorage
        localStorage.setItem('user', JSON.stringify(response.data));

        // 更新状态
        setUser(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 使用Auth Context的Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
