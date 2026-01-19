import { NextRequest, NextResponse } from 'next/server';
import { dailyQuotaManager } from '@/storage/database';

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

    return NextResponse.json({
      remaining,
      used: quota?.count || 0,
      total: 3,
    });
  } catch (error) {
    console.error('Error in quota route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
