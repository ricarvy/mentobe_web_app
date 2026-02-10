'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { getAuthCredentials, saveAuthCredentials } from '@/lib/auth';
import { apiRequest } from '@/lib/api-client';

interface User {
  id: string;
  username: string;
  email: string;
  isActive?: boolean;
  isDemo?: boolean;
  unlimitedQuota?: boolean;
  vipLevel?: 'pro' | 'premium'; // 'pro': Pro会员, 'premium': Premium会员, undefined: 普通用户
  vipExpireAt?: string | null; // ISO 8601 日期字符串或 null
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

// 后端API响应类型
interface ApiResponseUser {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  isDemo: boolean;
  unlimitedQuota: boolean;
  vipLevel: number | string; // 0: Free, 1: Pro, 2: Premium (Allow string from API just in case)
  vipExpireAt: string | null;
}

// 将后端的数字VIP等级转换为前端的字符串类型
export function convertVipLevelFromApi(vipLevel: number | string | undefined): 'pro' | 'premium' | undefined {
  const level = Number(vipLevel);
  if (isNaN(level)) return undefined;

  switch (level) {
    case 1:
      return 'pro';
    case 2:
      return 'premium';
    default:
      return undefined;
  }
}

// 转换API响应为User类型
export function convertApiUserToUser(apiUser: ApiResponseUser): User {
  return {
    ...apiUser,
    vipLevel: convertVipLevelFromApi(apiUser.vipLevel),
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const savedUser = localStorage.getItem('tarot_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as User;
        return parsedUser;
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      localStorage.removeItem('tarot_user');
    }
    return null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('tarot_user');
    setUser(null);
  }, []);

  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      // 尝试调用 /api/auth/me 获取用户信息
      const apiData = await apiRequest<ApiResponseUser>('/api/auth/me', {
        method: 'GET',
        requireAuth: true,
      });
      
      const userData = convertApiUserToUser(apiData);
      return userData;
    } catch (error) {
      console.warn('[fetchUserProfile] Failed to fetch user profile:', error);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const userData = await fetchUserProfile();
      
      if (userData) {
        // Only update state if user data has actually changed
        setUser(currentUser => {
          // Compare content excluding potentially volatile fields if necessary
          if (JSON.stringify(currentUser) !== JSON.stringify(userData)) {
            // Preserve existing credentials in localStorage
            try {
              const savedStr = localStorage.getItem('tarot_user');
              const savedData = savedStr ? JSON.parse(savedStr) : {};
              const newStorageData = { ...savedData, ...userData };
              localStorage.setItem('tarot_user', JSON.stringify(newStorageData));
            } catch (e) {
              console.error('Failed to update localStorage', e);
              localStorage.setItem('tarot_user', JSON.stringify(userData));
            }
            return userData;
          }
          return currentUser;
        });
      }
      return userData;
    } catch (error) {
      console.warn('[refreshUser] Failed to refresh user:', error);
      return null;
    }
  }, [fetchUserProfile]);

  const value = useMemo(() => ({
    user,
    setUser,
    logout,
    refreshUser
  }), [user, logout, refreshUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
