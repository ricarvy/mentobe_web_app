/**
 * Stripe Checkout Session API
 * 创建 Stripe Checkout Session
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripeConfig } from '@/config/stripe';
import { addAuthHeader } from '@/lib/auth';

/**
 * POST /api/stripe/create-checkout-session
 * 创建 Stripe Checkout Session
 *
 * 请求体:
 * {
 *   "priceId": "price_xxx",
 *   "userId": "user_xxx",
 *   "userEmail": "user@example.com"
 * }
 *
 * 响应:
 * {
 *   "success": true,
 *   "data": {
 *     "sessionId": "cs_xxx",
 *     "publishableKey": "pk_xxx"
 *   }
 * }
 */

interface CreateCheckoutSessionRequest {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * 获取当前语言
 */
function getLanguageFromRequest(request: NextRequest): string {
  // 从查询参数获取语言
  const langParam = request.nextUrl.searchParams.get('lang');
  
  if (langParam) {
    return langParam;
  }

  // 默认返回英文
  return 'en';
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const rawBody = await request.json();
    console.log('[Stripe Checkout] Frontend request body:', rawBody);
    
    // 兼容前端可能传过来的不同格式参数
    const priceId = rawBody.priceId || rawBody.price_id;
    const userId = rawBody.userId || rawBody.user_id;
    const userEmail = rawBody.userEmail || rawBody.user_email;
    const successUrl = rawBody.successUrl || rawBody.success_url;
    const cancelUrl = rawBody.cancelUrl || rawBody.cancel_url;

    // 验证必要参数
    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '缺少必要参数',
          },
        },
        { status: 400 }
      );
    }

    // 调用后端 API 创建 Checkout Session
    const backendUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901';
    const lang = getLanguageFromRequest(request);
    const backendUrlWithLang = `${backendUrl}/api/stripe/create-checkout-session?lang=${lang}`;

    const finalSuccessUrl = successUrl || stripeConfig.successUrl;
    const finalCancelUrl = cancelUrl || stripeConfig.cancelUrl;

    console.log('[Stripe Checkout] Calling backend API:', backendUrlWithLang);
    console.log('[Stripe Checkout] Request body:', JSON.stringify({
      price_id: priceId,
      user_id: userId,
      user_email: userEmail,
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    }));

    const response = await fetch(backendUrlWithLang, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...addAuthHeader({}),
      },
      body: JSON.stringify({
        price_id: priceId,
        user_id: userId,
        user_email: userEmail,
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Stripe Checkout] Backend error ${response.status}:`, errorText);
    }

    const data = await response.json();

    if (!data.success) {
      console.error('[Stripe Checkout] Backend API error:', data.error);
      return NextResponse.json(
        {
          success: false,
          error: data.error || {
            code: 'BACKEND_ERROR',
            message: '创建支付会话失败',
          },
        },
        { status: response.status || 500 }
      );
    }

    console.log('[Stripe Checkout] Session created:', data.data.sessionId);

    // 返回 session ID 和 publishable key 以及 checkout URL
    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.data.sessionId,
        url: data.data.url, // 确保返回 URL
        publishableKey: stripeConfig.publishableKey,
      },
    });
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

