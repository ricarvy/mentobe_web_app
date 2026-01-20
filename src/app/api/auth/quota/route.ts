import { NextRequest } from 'next/server';
import { dailyQuotaManager } from '@/storage/database';
import { appConfig } from '@/config';
import { DEMO_ACCOUNT } from '@/config/demo-account';
import {
  withErrorHandler,
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        'User ID is required'
      );
    }

    const remaining = await dailyQuotaManager.getRemainingQuota(userId);
    const quota = await dailyQuotaManager.getTodayQuota(userId);

    // 演示账号显示无限配额
    if (userId === DEMO_ACCOUNT.id) {
      const quotaData = {
        remaining: 999999,
        used: 0,
        total: 'Unlimited',
        isDemo: true,
      };
      return Response.json(createSuccessResponse(quotaData));
    }

    const quotaData = {
      remaining,
      used: quota?.count || 0,
      total: appConfig.features.dailyQuota.free,
      isDemo: false,
    };
    return Response.json(createSuccessResponse(quotaData));
  });
}
