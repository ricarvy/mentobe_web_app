'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { saveAuthCredentials } from '@/lib/auth';
import { convertApiUserToUser, useUser } from '@/lib/userContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

function GoogleLoginContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUser();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing login...');

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      setTimeout(() => {
        setStatus('error');
        setMessage(t.auth.loginFailed);
      }, 0);
      setTimeout(() => router.replace('/login'), 3000);
      return;
    }

    if (token && userStr) {
      try {
        // 解析用户数据
        const rawUserData = JSON.parse(decodeURIComponent(userStr));
        
        // 转换用户数据
        const userData = convertApiUserToUser(rawUserData);
        
        // 合并 token
        const finalUserData = { ...userData, accessToken: token };
        
        // 保存到 localStorage
        saveAuthCredentials(finalUserData, userData.email, '');
        
        // 更新全局状态
        setTimeout(() => {
          setUser(finalUserData);
          setStatus('success');
          setMessage('Login successful! Redirecting...');
        }, 0);
        
        // 停留 3 秒后跳转
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        setTimeout(() => {
          setStatus('error');
          setMessage(t.auth.loginFailed);
        }, 0);
        setTimeout(() => router.replace('/login'), 3000);
      }
    } else {
        // 如果没有参数，可能是非法访问，跳转回登录页
        setTimeout(() => router.replace('/login'), 3000);
    }
  }, [searchParams, router, t, setUser]);

  return (
    <div className="w-full max-w-md">
      <Card className="border-purple-500/20 bg-black/40 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
             <Sparkles className={`h-12 w-12 ${status === 'success' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-purple-400 animate-pulse'}`} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {status === 'success' ? 'Welcome Back!' : status === 'error' ? 'Login Failed' : 'Verifying...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-purple-200/80">
            {message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GoogleLoginSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-black/90">
      <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
        <GoogleLoginContent />
      </Suspense>
    </main>
  );
}
