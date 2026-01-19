/**
 * 演示账号配置
 * 用于开发和演示环境，可以快速体验所有功能
 */

export const DEMO_ACCOUNT = {
  email: 'demo@mentobai.com',
  password: 'Demo123!',
  username: 'Demo User',
  id: 'demo-user-id',
  isActive: true,
  unlimitedQuota: true, // 无限限额
} as const;

// 验证是否为演示账号
export function isDemoAccount(email: string, password: string): boolean {
  return email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password;
}
