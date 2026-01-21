/**
 * Stripe 后端 API 接口
 * 文件位置：后端项目的 src/api/stripe/create-checkout-session/route.ts
 *
 * 注意：此代码需要在后端服务器（http://120.76.142.91:8901）上部署
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Stripe 配置
 *
 * 需要在后端环境变量中配置：
 * - STRIPE_SECRET_KEY: Stripe Secret Key (sk_test_xxx 或 sk_live_xxx)
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

/**
 * POST /api/stripe/create-checkout-session
 * 创建 Stripe Checkout Session
 *
 * 请求体:
 * {
 *   "priceId": "price_1Sren7GVP93aj81Tr4d18z2S",
 *   "userId": "user_xxx",
 *   "userEmail": "user@example.com",
 *   "successUrl": "https://yourdomain.com/?payment=success",
 *   "cancelUrl": "https://yourdomain.com/pricing"
 * }
 *
 * 响应:
 * {
 *   "success": true,
 *   "data": {
 *     "sessionId": "cs_xxx"
 *   }
 * }
 */

interface CreateCheckoutSessionRequest {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // 验证 Stripe Secret Key
    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('sk_xxx')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_STRIPE_SECRET_KEY',
            message: 'Stripe Secret Key 未配置或无效',
          },
        },
        { status: 500 }
      );
    }

    // 解析请求体
    const body: CreateCheckoutSessionRequest = await request.json();
    const { priceId, userId, userEmail, successUrl, cancelUrl } = body;

    // 验证必要参数
    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '缺少必要参数：priceId, userId, userEmail',
          },
        },
        { status: 400 }
      );
    }

    console.log('[Stripe Backend] Creating checkout session:', {
      userId,
      userEmail,
      priceId,
    });

    // 调用 Stripe API 创建 Checkout Session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'payment', // 或 'subscription' 如果是订阅模式
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
        client_reference_id: userId, // 用于后续Webhook识别用户
        metadata: {
          userId: userId,
          userEmail: userEmail,
        },
      }),
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('[Stripe Backend] Stripe API error:', stripeData);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: stripeData.error?.code || 'STRIPE_API_ERROR',
            message: stripeData.error?.message || 'Stripe API 调用失败',
            details: stripeData.error,
          },
        },
        { status: stripeResponse.status }
      );
    }

    console.log('[Stripe Backend] Checkout session created:', stripeData.id);

    // 返回 session ID
    return NextResponse.json({
      success: true,
      data: {
        sessionId: stripeData.id,
        url: stripeData.url, // Stripe Checkout 页面URL
      },
    });
  } catch (error) {
    console.error('[Stripe Backend] Error:', error);
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
