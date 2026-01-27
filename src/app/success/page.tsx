'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useUser } from '@/lib/userContext';
import { useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/components/GA4Tracker';

export default function SuccessPage() {
  const { t } = useI18n();
  const { refreshUser } = useUser();
  const searchParams = useSearchParams();
  const { trackEvent } = useAnalytics();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate processing in React Strict Mode
    if (processedRef.current) return;
    
    const sessionId = searchParams.get('session_id');
    const price = localStorage.getItem('pending_checkout_price');
    const currency = localStorage.getItem('pending_checkout_currency');
    const plan = localStorage.getItem('pending_checkout_plan');

    if (sessionId && price && currency) {
      trackEvent('purchase', {
        transaction_id: sessionId,
        value: parseFloat(price),
        currency: currency,
        items: [{
          item_name: plan || 'Subscription',
          price: parseFloat(price),
          quantity: 1
        }]
      });

      // Clear localStorage
      localStorage.removeItem('pending_checkout_price');
      localStorage.removeItem('pending_checkout_currency');
      localStorage.removeItem('pending_checkout_plan');
      
      processedRef.current = true;
    }

    // 刷新用户信息，获取最新的VIP等级和到期时间
    const refreshUserInfo = async () => {
      try {
        await refreshUser();
        console.log('[Success Page] User info refreshed successfully');
      } catch (error) {
        console.error('[Success Page] Failed to refresh user info:', error);
      }
    };

    refreshUserInfo();

    // 这里可以添加页面访问统计或日志
    console.log('Payment success page accessed');
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-pink-950" />
        {/* 星星层 */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <Card className="max-w-2xl mx-auto bg-black/60 backdrop-blur-xl border-purple-500/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              {t.payment.success.title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              {t.payment.success.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4 mb-8">
              <div className="text-gray-200">
                {t.payment.success.message}
              </div>
              <div className="text-sm text-gray-400">
                {t.payment.success.note}
              </div>
            </div>

            <Link href="/">
              <Button className="w-full sm:w-auto min-w-[200px] bg-purple-600 hover:bg-purple-700 text-white">
                <Home className="w-4 h-4 mr-2" />
                {t.payment.success.backToHome}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
