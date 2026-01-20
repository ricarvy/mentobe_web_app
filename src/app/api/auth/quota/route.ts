import { NextRequest, NextResponse } from 'next/server';
import { dailyQuotaManager } from '@/storage/database';
import { appConfig } from '@/config';
import { DEMO_ACCOUNT } from '@/config/demo-account';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const remaining = await dailyQuotaManager.getRemainingQuota(userId);
    const quota = await dailyQuotaManager.getTodayQuota(userId);

    // 演示账号显示无限配额
    if (userId === DEMO_ACCOUNT.id) {
      return NextResponse.json({
        remaining: 999999,
        used: 0,
        total: 'Unlimited',
        isDemo: true,
      });
    }

    return NextResponse.json({
      remaining,
      used: quota?.count || 0,
      total: appConfig.features.dailyQuota.free,
      isDemo: false,
    });
  } catch (error) {
    console.error('Error in quota route:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    // 确保总是返回 JSON
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
