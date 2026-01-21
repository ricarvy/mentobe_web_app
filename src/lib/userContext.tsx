'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthCredentials, saveAuthCredentials } from '@/lib/auth';
import { apiRequest } from '@/lib/api-client';

interface User {
  id: string;
  username: string;
  email: string;
  isActive?: boolean;
  isDemo?: boolean;
  unlimitedQuota?: boolean;
  vipLevel?: number; // 0: Free, 1: Pro, 2: Premium
  vipExpireAt?: string | null; // ISO 8601 日期字符串或 null
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('tarot_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        localStorage.removeItem('tarot_user');
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('tarot_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const credentials = getAuthCredentials();
      if (!credentials) {
        console.error('[refreshUser] No credentials found');
        return;
      }

      // 使用登录API获取最新的用户信息
      const data = await apiRequest<{
        id: string;
        username: string;
        email: string;
        isActive: boolean;
        isDemo: boolean;
        unlimitedQuota: boolean;
        vipLevel: number;
        vipExpireAt: string | null;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        requireAuth: false,
      });

      // 更新localStorage
      saveAuthCredentials(data, credentials.email, credentials.password);
      // 更新state
      setUser(data);

      console.log('[refreshUser] User info refreshed successfully', {
        vipLevel: data.vipLevel,
        vipExpireAt: data.vipExpireAt,
      });
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
