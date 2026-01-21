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

/**
 * 直接调用 Stripe API (临时方案)
 * 注意：这仅用于测试，生产环境应在后端实现 Stripe API
 *
 * ⚠️ 安全警告：
 * - 在生产环境中，STRIPE_SECRET_KEY 必须配置在后端服务器
 * - 不要在前端或客户端代码中使用 Secret Key
 * - 此方案仅用于测试环境验证前端逻辑
 */
async function createStripeSessionDirect(
  priceId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('sk_test_')) {
    throw new Error('STRIPE_SECRET_KEY 未配置或无效。请在 .env.local 中配置：STRIPE_SECRET_KEY=sk_test_xxx');
  }

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      mode: 'payment',
      payment_method_types: 'card',
      line_items: JSON.stringify([
        {
          price: priceId,
          quantity: 1,
        },
      ]),
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        userEmail: userEmail,
      },
    }),
  });

  return await stripeResponse.json();
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

    // 临时方案：直接调用 Stripe API（绕过后端）
    console.log('[Stripe Checkout] Using direct Stripe API call (test mode)');

    const stripeData = await createStripeSessionDirect(
      priceId,
      userId,
      userEmail,
      stripeConfig.successUrl,
      stripeConfig.cancelUrl
    );

    if (stripeData.error) {
      console.error('[Stripe Checkout] Stripe API error:', stripeData.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: stripeData.error.code || 'STRIPE_ERROR',
            message: stripeData.error.message || 'Stripe API 调用失败',
          },
        },
        { status: 400 }
      );
    }

    console.log('[Stripe Checkout] Session created:', stripeData.id);

    // 返回 session ID 和 publishable key
    return NextResponse.json({
      success: true,
      data: {
        sessionId: stripeData.id,
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

