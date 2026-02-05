
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/stripe/config
 * 获取 Stripe 价格配置
 */
export async function GET(request: NextRequest) {
  try {
    // 优先使用服务端内部通信 URL，避免容器内 DNS 解析问题
    const backendUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901';
    const lang = request.nextUrl.searchParams.get('lang') || 'en';
    const backendUrlWithLang = `${backendUrl}/api/stripe/config?lang=${lang}`;

    console.log('[Stripe Config] Calling backend API:', backendUrlWithLang);

    const response = await fetch(backendUrlWithLang, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.success) {
      console.error('[Stripe Config] Backend API error:', data.error);
      return NextResponse.json(
        {
          success: false,
          error: data.error || {
            code: 'BACKEND_ERROR',
            message: '获取价格配置失败',
          },
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error) {
    console.error('[Stripe Config] Error:', error);
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
