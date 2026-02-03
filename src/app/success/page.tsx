'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, AlertCircle, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useUser } from '@/lib/userContext';
import { useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/components/GA4Tracker';
import { apiRequest } from '@/lib/api-client';

function SuccessContent() {
  const { t } = useI18n();
  const { refreshUser } = useUser();
  const searchParams = useSearchParams();
  const { trackEvent } = useAnalytics();
  const processedRef = useRef(false);
  
  // Status state: processing, success, failed, pending
  const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'pending'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Prevent duplicate processing in React Strict Mode
    if (processedRef.current) return;
    
    const sessionId = searchParams.get('session_id');
    
    // Debug log for session_id
    console.log('[Success Page] Received session_id:', sessionId);

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
      
      localStorage.removeItem('pending_checkout_price');
      localStorage.removeItem('pending_checkout_currency');
      
      processedRef.current = true;
    }

    if (!sessionId) {
      setStatus('failed');
      setErrorMessage('未检测到支付会话信息');
      return;
    }

    // Polling function
    const checkPaymentStatus = async () => {
      try {
        console.log('[Success Page] Checking payment status for session:', sessionId);
        
        const response = await apiRequest<{ status: string }>(`/api/stripe/payment-status/${sessionId}`, {
          method: 'GET',
          requireAuth: true,
        });

        console.log('[Success Page] Payment status response:', response);
        const paymentStatus = response.status;

        if (paymentStatus === 'completed') {
          // Success!
          await refreshUser();
          setStatus('success');
          localStorage.removeItem('pending_checkout_plan');
          
          // Log success
          await logPaymentResult('info', 'Payment completed successfully', { sessionId, plan, status: paymentStatus });
        } else if (paymentStatus === 'waiting_for_webhook') {
          // Continue polling
          setStatus('processing');
          setTimeout(checkPaymentStatus, 2000);
        } else if (paymentStatus === 'pending') {
          // Payment not finished
          setStatus('pending');
        } else if (paymentStatus === 'failed') {
          // Payment failed
          setStatus('failed');
          setErrorMessage('Payment failed or expired.');
          await logPaymentResult('critical', 'Payment failed or expired', { sessionId, plan, status: paymentStatus });
        } else if (paymentStatus === 'not_found') {
          setStatus('failed');
          setErrorMessage('Session not found.');
        } else {
          // Unknown status, treat as processing or error? Let's continue polling for safety or fail?
          // If unknown, maybe retry a few times? For now, continue polling if it looks transient, or fail.
          // Let's assume waiting if unknown, but log warning.
          console.warn('[Success Page] Unknown status:', paymentStatus);
          setTimeout(checkPaymentStatus, 3000);
        }

      } catch (error) {
        console.error('[Success Page] Error checking payment status:', error);
        // On network error, maybe retry?
        setTimeout(checkPaymentStatus, 3000);
      }
    };

    // Helper to log payment result
    const logPaymentResult = async (level: 'info' | 'critical', message: string, details: any) => {
      try {
        await fetch('/api/debug/log-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            message,
            details: {
              ...details,
              timestamp: new Date().toISOString(),
            }
          })
        });
      } catch (e) {
        console.error('Failed to log payment result:', e);
      }
    };

    // Start polling
    checkPaymentStatus();

    console.log('Payment success page accessed');
  }, [refreshUser, searchParams, trackEvent]);

  // Render content based on status
  const renderIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center border-2 border-purple-500 animate-pulse">
             <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'success':
        return (
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
        );
      case 'pending':
        return (
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500">
            <Clock className="w-12 h-12 text-yellow-400" />
          </div>
        );
      case 'failed':
        return (
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
        );
    }
  };

  const renderTitle = () => {
    switch (status) {
      case 'processing': return t.payment.success.processing;
      case 'success': return t.payment.success.title;
      case 'pending': return 'Payment Pending'; // Add translation later
      case 'failed': return errorMessage === '未检测到支付会话信息' ? '无法验证支付' : t.payment.failed.title;
    }
  };

  const renderDescription = () => {
    switch (status) {
      case 'processing': return t.payment.success.processingDesc;
      case 'success': return t.payment.success.description;
      case 'pending': return 'Please complete your payment.';
      case 'failed': return errorMessage || 'Something went wrong.';
    }
  };

  return (
    <div className="relative z-10 container mx-auto px-4">
      <Card className="max-w-2xl mx-auto bg-black/60 backdrop-blur-xl border-purple-500/20">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {renderIcon()}
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            {renderTitle()}
          </CardTitle>
          <CardDescription className="text-lg text-gray-300">
            {renderDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4 mb-8">
            <div className="text-gray-200">
              {status === 'processing' ? t.payment.success.processingMessage : 
               status === 'success' ? t.payment.success.message : ''}
            </div>
            {status === 'success' && (
              <div className="text-sm text-gray-400">
                {t.payment.success.note}
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            {status === 'success' && (
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-2 rounded-full transition-all duration-300 transform hover:scale-105">
                  <Home className="mr-2 h-4 w-4" />
                  {t.payment.success.backToHome}
                </Button>
              </Link>
            )}
            {(status === 'failed' || status === 'pending') && (
               <Link href="/pricing">
                 <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-900/20">
                   Return to Pricing
                 </Button>
               </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#0f0a1e] relative overflow-hidden flex items-center justify-center py-20">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]" />
      </div>

      <Suspense fallback={
        <div className="text-white text-center">Loading...</div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
