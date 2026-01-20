/**
 * Quota 相关的工具函数
 */

import { apiRequest, ApiRequestError } from './api-client';

export interface QuotaInfo {
  remaining: number;
  used: number;
  total: number | string;
  isDemo: boolean;
}

/**
 * 获取用户的quota信息
 * @param userId - 用户ID
 * @returns QuotaInfo
 * @throws ApiRequestError
 */
export async function getQuota(userId: string): Promise<QuotaInfo> {
  try {
    const data = await apiRequest<QuotaInfo>(
      `/api/auth/quota?userId=${userId}`,
      {
        method: 'GET',
        requireAuth: false,
      }
    );
    return data;
  } catch (error) {
    console.error('Error fetching quota:', error);
    if (error instanceof ApiRequestError) {
      console.error('[Quota Error]', error.message, error.code, error.details);
    }
    throw error;
  }
}
