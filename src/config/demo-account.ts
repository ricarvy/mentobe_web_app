/**
 * 演示账号配置
 * 用于开发和演示环境，可以快速体验所有功能
 *
 * 可以通过环境变量控制：
 * - DEMO_ACCOUNT_ENABLED: 是否启用演示账号 (默认: true)
 * - DEMO_ACCOUNT_EMAIL: 演示账号邮箱 (默认: demo@mentobai.com)
 * - DEMO_ACCOUNT_PASSWORD: 演示账号密码 (默认: Demo123!)
 */

export const DEMO_ACCOUNT = {
  email: process.env.DEMO_ACCOUNT_EMAIL || 'demo@mentobai.com',
  password: process.env.DEMO_ACCOUNT_PASSWORD || 'Demo123!',
  username: 'Demo User',
  id: 'demo-user-id',
  isActive: true,
  unlimitedQuota: true, // 无限限额
} as const;

// 演示账号功能开关
export const DEMO_ACCOUNT_ENABLED = process.env.DEMO_ACCOUNT_ENABLED !== 'false';

// 验证是否为演示账号
export function isDemoAccount(email: string, password: string): boolean {
  if (!DEMO_ACCOUNT_ENABLED) {
    console.log('[Demo Account] Demo account is disabled');
    return false;
  }

  const match = email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password;
  console.log('[Demo Account Check]', {
    enabled: DEMO_ACCOUNT_ENABLED,
    emailMatch: email === DEMO_ACCOUNT.email,
    passwordMatch: password === DEMO_ACCOUNT.password,
    isMatch: match,
  });

  return match;
}
