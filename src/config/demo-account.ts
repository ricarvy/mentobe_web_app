/**
 * 演示账号配置
 * 用于开发和演示环境，可以快速体验所有功能
 *
 * 可以通过环境变量控制：
 * - DEMO_ACCOUNT_ENABLED: 是否启用演示账号 (默认: true)
 * - DEMO_ACCOUNT_EMAIL: 演示账号邮箱 (默认: demo@mentobai.com)
 * - DEMO_ACCOUNT_PASSWORD: 演示账号密码 (默认: Demo123!)
 */

// 先读取环境变量，提供默认值
const DEMO_EMAIL = process.env.DEMO_ACCOUNT_EMAIL || 'demo@mentobai.com';
const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD || 'Demo123!';
const DEMO_ENABLED = process.env.DEMO_ACCOUNT_ENABLED !== 'false';

console.log('[Demo Account Config]', {
  enabled: DEMO_ENABLED,
  email: DEMO_EMAIL,
  passwordLength: DEMO_PASSWORD.length,
});

export const DEMO_ACCOUNT = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  username: 'Demo User',
  id: 'demo-user-id',
  isActive: true,
  unlimitedQuota: true, // 无限限额
} as const;

// 演示账号功能开关
export const DEMO_ACCOUNT_ENABLED = DEMO_ENABLED;

// 验证是否为演示账号
export function isDemoAccount(email: string, password: string): boolean {
  if (!DEMO_ACCOUNT_ENABLED) {
    console.log('[Demo Account] Demo account is disabled');
    return false;
  }

  // 添加安全检查
  if (!email || !password) {
    console.log('[Demo Account] Missing email or password');
    return false;
  }

  // 确保 DEMO_ACCOUNT.email 和 password 存在
  const demoEmail = DEMO_ACCOUNT.email || 'demo@mentobai.com';
  const demoPassword = DEMO_ACCOUNT.password || 'Demo123!';

  const match = email === demoEmail && password === demoPassword;
  console.log('[Demo Account Check]', {
    enabled: DEMO_ACCOUNT_ENABLED,
    emailMatch: email === demoEmail,
    passwordMatch: password === demoPassword,
    isMatch: match,
  });

  return match;
}
