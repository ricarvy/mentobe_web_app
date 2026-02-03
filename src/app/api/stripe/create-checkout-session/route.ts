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
    const body: CreateCheckoutSessionRequest = await request.json();
    const { priceId, userId, userEmail } = body;

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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901';
    const lang = getLanguageFromRequest(request);
    const backendUrlWithLang = `${backendUrl}/api/stripe/create-checkout-session?lang=${lang}`;

    console.log('[Stripe Checkout] Calling backend API:', backendUrlWithLang);
    console.log('[Stripe Checkout] Success URL:', stripeConfig.successUrl);
    console.log('[Stripe Checkout] Cancel URL:', stripeConfig.cancelUrl);

    const response = await fetch(backendUrlWithLang, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...addAuthHeader({}),
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        successUrl: stripeConfig.successUrl,
        cancelUrl: stripeConfig.cancelUrl,
      }),
    });

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

    // 返回 session ID 和 publishable key
    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.data.sessionId,
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

