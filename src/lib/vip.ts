/**
 * VIP 等级工具函数
 * 用于判断和格式化用户 VIP 信息
 */

export type VipLevel = 'pro' | 'premium';

export interface VipInfo {
  level: VipLevel | 'free';
  name: string;
  displayName: string;
  badgeColor: string;
  isExpired: boolean;
  expireDate: Date | null;
}

/**
 * 获取用户 VIP 信息
 * @param vipLevel - 用户 VIP 等级 ('pro': Pro会员, 'premium': Premium会员, undefined: 普通用户)
 * @param vipExpireAt - VIP 到期时间 (ISO 8601 字符串或 null)
 * @returns VIP 信息对象
 */
export function getVipInfo(vipLevel: VipLevel | undefined, vipExpireAt: string | null | undefined): VipInfo {
  const expireDate = vipExpireAt ? new Date(vipExpireAt) : null;
  const now = new Date();
  const isExpired = expireDate && expireDate < now;

  switch (vipLevel) {
    case 'pro':
      return {
        level: 'pro',
        name: 'Pro',
        displayName: 'Pro Member',
        badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
        isExpired: !!isExpired,
        expireDate,
      };

    case 'premium':
      return {
        level: 'premium',
        name: 'Premium',
        displayName: 'Premium Member',
        badgeColor: 'bg-gradient-to-r from-yellow-600 to-orange-600',
        isExpired: !!isExpired,
        expireDate,
      };

    default:
      return {
        level: 'free',
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
export function hasValidVip(vipLevel: VipLevel | undefined, vipExpireAt: string | null | undefined): boolean {
  if (!vipLevel) {
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
export function getVipLevelText(vipLevel: VipLevel | undefined, _language: string = 'en'): string {
  switch (vipLevel) {
    case 'pro':
      return 'Pro Member';
    case 'premium':
      return 'Premium Member';
    default:
      return 'Free User';
  }
}

