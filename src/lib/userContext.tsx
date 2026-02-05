'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
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

  const logout = () => {
    localStorage.removeItem('tarot_user');
    setUser(null);
  };

  const fetchUserProfile = async (): Promise<User | null> => {
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
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const credentials = getAuthCredentials();
      if (!credentials) {
        console.error('[refreshUser] No credentials found');
        return null;
      }

      // 如果存在 accessToken，尝试通过 /api/auth/me 获取最新用户信息
      if (credentials.accessToken) {
        console.log('[refreshUser] Token exists, fetching profile from /api/auth/me');
        const userData = await fetchUserProfile();
        
        if (userData) {
          // 更新 localStorage (保留现有凭证信息)
          saveAuthCredentials(
            userData as unknown as Record<string, unknown>, 
            credentials.email, 
            credentials.password
          );
          setUser(userData);
          console.log('[refreshUser] User info refreshed successfully from token', {
            vipLevel: userData.vipLevel,
            vipExpireAt: userData.vipExpireAt,
          });
          return userData;
        }
        
        console.warn('[refreshUser] Failed to refresh from token');
        
        // 如果没有密码（例如第三方登录），无法回退到账号密码登录，无法刷新，只能登出
        if (!credentials.password) {
           console.warn('[refreshUser] No password available for fallback login, logging out');
           logout();
           return null;
        }
        
        console.log('[refreshUser] Falling back to login for refresh');
      }

      // 使用登录API获取最新的用户信息
      const apiData = await apiRequest<ApiResponseUser>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        requireAuth: false,
      });

      // 转换API响应为User类型
      const userData = convertApiUserToUser(apiData);

      // 更新localStorage
      saveAuthCredentials(userData as unknown as Record<string, unknown>, credentials.email, credentials.password);
      // 更新state
      setUser(userData);

      console.log('[refreshUser] User info refreshed successfully', {
        vipLevel: userData.vipLevel,
        vipExpireAt: userData.vipExpireAt,
      });
      
      return userData;
    } catch (error) {
      console.error('[refreshUser] Failed to refresh user info:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, refreshUser }}>
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
