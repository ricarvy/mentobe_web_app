/**
 * 演示账号配置
 * 用于开发和演示环境，可以快速体验所有功能
 *
 * 可以通过环境变量控制：
 * - DEMO_ACCOUNT_ENABLED: 是否启用演示账号 (默认: true)
 * - DEMO_ACCOUNT_EMAIL: 演示账号邮箱 (默认: demo@mentobai.com)
 * - DEMO_ACCOUNT_PASSWORD: 演示账号密码 (默认: Demo123!)
 */

// 默认配置
const DEFAULT_CONFIG = {
  email: 'demo@mentobai.com',
  password: 'Demo123!',
  enabled: true,
};

// 读取环境变量
const DEMO_EMAIL = process.env.DEMO_ACCOUNT_EMAIL || DEFAULT_CONFIG.email;
const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD || DEFAULT_CONFIG.password;
const DEMO_ENABLED = process.env.DEMO_ACCOUNT_ENABLED !== 'false';

// 验证默认配置
console.log('[Demo Account Default Config]', {
  email: DEFAULT_CONFIG.email,
  password: DEFAULT_CONFIG.password,
  passwordLength: DEFAULT_CONFIG.password.length,
});

console.log('[Demo Account Config]', {
  enabled: DEMO_ENABLED,
  email: DEMO_EMAIL,
  password: '***',
  passwordLength: DEMO_PASSWORD.length,
  passwordChars: Array.from(DEMO_PASSWORD),
  environment: process.env.NODE_ENV || 'unknown',
});

// 演示账号配置对象
export const DEMO_ACCOUNT = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  username: 'Demo User',
  id: 'demo-user-id',
  isActive: true,
  unlimitedQuota: true, // 无限限额
};

// 演示账号功能开关
export const DEMO_ACCOUNT_ENABLED = DEMO_ENABLED;

// 验证是否为演示账号
export function isDemoAccount(email: string, password: string): boolean {
  console.log('[Demo Account Verification Start]', {
    demoEnabled: DEMO_ACCOUNT_ENABLED,
    demoEmail: DEMO_ACCOUNT.email,
    demoPasswordLength: DEMO_ACCOUNT.password.length,
    demoPasswordChars: Array.from(DEMO_ACCOUNT.password).map(c => c.charCodeAt(0)),
    inputEmail: email,
    inputPasswordLength: password?.length,
    inputPasswordChars: password ? Array.from(password).map(c => c.charCodeAt(0)) : [],
  });

  if (!DEMO_ACCOUNT_ENABLED) {
    console.log('[Demo Account] Demo account is disabled');
    return false;
  }

  // 添加安全检查
  if (!email || !password) {
    console.log('[Demo Account] Missing email or password');
    return false;
  }

  // 使用配置的值
  const demoEmail = DEMO_ACCOUNT.email;
  const demoPassword = DEMO_ACCOUNT.password;

  const emailMatch = email === demoEmail;
  const passwordMatch = password === demoPassword;
  const match = emailMatch && passwordMatch;

  console.log('[Demo Account Verification Result]', {
    emailMatch,
    passwordMatch,
    isMatch: match,
    inputEmail: email,
    inputPassword: password,
    expectedEmail: demoEmail,
    expectedPassword: demoPassword,
    inputPasswordType: typeof password,
    expectedPasswordType: typeof demoPassword,
  });

  return match;
}
