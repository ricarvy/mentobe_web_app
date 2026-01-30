
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/stripe/payment-status/[session_id]
 * 查询 Stripe 支付状态
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await params;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // 获取后端 API 地址
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901';
    
    // 获取 Authorization header
    const authHeader = request.headers.get('Authorization');
    
    // 构造后端请求 URL
    const targetUrl = `${backendUrl}/api/stripe/payment-status/${session_id}`;
    
    console.log(`[Payment Status] Proxying to: ${targetUrl}`);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果有 Auth header，透传给后端
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Payment Status] Backend error:', data);
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to fetch payment status' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Payment Status] Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
