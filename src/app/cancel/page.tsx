'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Home, CreditCard, ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// 内部组件：处理 searchParams
function CancelContent() {
  const { t } = useI18n();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // 在客户端动态获取 searchParams
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get('session_id'));
    console.log('Payment cancel page accessed', { sessionId: params.get('session_id') });
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-8">
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
        <Card className="max-w-3xl mx-auto bg-black/60 backdrop-blur-xl border-purple-500/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              {t.payment.cancel.title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              {t.payment.cancel.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 失败原因 */}
            <div className="text-center space-y-3">
              <div className="text-gray-200">
                {t.payment.cancel.reason}
              </div>
              {sessionId && (
                <div className="text-sm text-gray-400 font-mono bg-black/30 p-3 rounded-lg">
                  Session ID: {sessionId}
                </div>
              )}
            </div>

            {/* Stripe Dashboard配置信息 */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Stripe Dashboard Configuration
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-gray-300 font-medium mb-2">Cancel Page URL:</div>
                  <div className="space-y-2">
                    <div className="bg-black/40 p-3 rounded font-mono text-gray-300">
                      <div className="text-purple-400 mb-1">Development:</div>
                      <div>http://localhost:5000/cancel</div>
                    </div>
                    <div className="bg-black/40 p-3 rounded font-mono text-gray-300">
                      <div className="text-purple-400 mb-1">Production:</div>
                      <div>https://yourdomain.com/cancel</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 font-medium mb-2">Success Page URL:</div>
                  <div className="space-y-2">
                    <div className="bg-black/40 p-3 rounded font-mono text-gray-300">
                      <div className="text-purple-400 mb-1">Development:</div>
                      <div>http://localhost:5000/success</div>
                    </div>
                    <div className="bg-black/40 p-3 rounded font-mono text-gray-300">
                      <div className="text-purple-400 mb-1">Production:</div>
                      <div>https://yourdomain.com/success</div>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 text-xs mt-4 pt-4 border-t border-purple-500/20">
                  💡 Configure these URLs in your Stripe Dashboard:
                  Products → Pricing → Select your price → Edit → Click "More options" → Edit payment link settings
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/pricing" className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto min-w-[200px] bg-purple-600 hover:bg-purple-700 text-white">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t.payment.cancel.backToPricing}
                </Button>
              </Link>
              <Link href="/" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full sm:w-auto min-w-[200px] border-gray-600 text-white hover:bg-gray-800">
                  <Home className="w-4 h-4 mr-2" />
                  {t.payment.cancel.backToHome}
                </Button>
              </Link>
            </div>

            {/* 额外提示 */}
            <div className="text-center text-sm text-gray-400 pt-4">
              {t.payment.cancel.help}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 主页面组件，使用 Suspense 避免构建错误
export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
