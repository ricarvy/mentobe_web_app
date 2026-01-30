import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/debug/log-payment
 * 记录支付状态日志到服务器控制台
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, details } = body;

    const timestamp = new Date().toISOString();
    const logPrefix = `[PAYMENT_LOG] [${timestamp}] [${level?.toUpperCase() || 'INFO'}]`;

    console.log('================================================================');
    console.log(`${logPrefix} ${message}`);
    if (details) {
      console.log(`${logPrefix} Details:`, JSON.stringify(details, null, 2));
    }
    console.log('================================================================');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process log request:', error);
    return NextResponse.json({ success: false, error: 'Failed to log' }, { status: 500 });
  }
}
