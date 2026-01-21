/**
 * VIP 等级工具函数
 * 用于判断和格式化用户 VIP 信息
 */

export enum VipLevel {
  FREE = 0,
  PRO = 1,
  PREMIUM = 2,
}

export interface VipInfo {
  level: VipLevel;
  name: string;
  displayName: string;
  badgeColor: string;
  isExpired: boolean;
  expireDate: Date | null;
}

/**
 * 获取用户 VIP 信息
 * @param vipLevel - 用户 VIP 等级 (0: Free, 1: Pro, 2: Premium)
 * @param vipExpireAt - VIP 到期时间 (ISO 8601 字符串或 null)
 * @returns VIP 信息对象
 */
export function getVipInfo(vipLevel: number | undefined, vipExpireAt: string | null | undefined): VipInfo {
  const level = vipLevel ?? VipLevel.FREE;
  const expireDate = vipExpireAt ? new Date(vipExpireAt) : null;
  const now = new Date();
  const isExpired = expireDate && expireDate < now;

  switch (level) {
    case VipLevel.PRO:
      return {
        level: VipLevel.PRO,
        name: 'Pro',
        displayName: 'Pro Member',
        badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
        isExpired: !!isExpired,
        expireDate,
      };

    case VipLevel.PREMIUM:
      return {
        level: VipLevel.PREMIUM,
        name: 'Premium',
        displayName: 'Premium Member',
        badgeColor: 'bg-gradient-to-r from-yellow-600 to-orange-600',
        isExpired: !!isExpired,
        expireDate,
      };

    case VipLevel.FREE:
    default:
      return {
        level: VipLevel.FREE,
        name: 'Free',
        displayName: 'Free User',
        badgeColor: 'bg-purple-600',
        isExpired: false,
        expireDate: null,
      };
  }
}

/**
 * 判断用户是否有有效 VIP
 * @param vipLevel - 用户 VIP 等级
 * @param vipExpireAt - VIP 到期时间
 * @returns 是否有有效 VIP
 */
export function hasValidVip(vipLevel: number | undefined, vipExpireAt: string | null | undefined): boolean {
  if (!vipLevel || vipLevel === VipLevel.FREE) {
    return false;
  }

  if (!vipExpireAt) {
    return false;
  }

  const expireDate = new Date(vipExpireAt);
  const now = new Date();
  return expireDate >= now;
}

/**
 * 格式化 VIP 到期时间
 * @param vipExpireAt - VIP 到期时间
 * @returns 格式化后的日期字符串
 */
export function formatVipExpireDate(vipExpireAt: string | null | undefined): string {
  if (!vipExpireAt) {
    return 'Never';
  }

  try {
    const date = new Date(vipExpireAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Failed to parse VIP expire date:', error);
    return 'Unknown';
  }
}

/**
 * 获取 VIP 等级的显示文本
 * @param vipLevel - 用户 VIP 等级
 * @param language - 语言代码
 * @returns VIP 等级显示文本
 */
export function getVipLevelText(vipLevel: number | undefined, language: string = 'en'): string {
  const level = vipLevel ?? VipLevel.FREE;

  switch (level) {
    case VipLevel.PRO:
      return 'Pro Member';
    case VipLevel.PREMIUM:
      return 'Premium Member';
    case VipLevel.FREE:
    default:
      return 'Free User';
  }
}
