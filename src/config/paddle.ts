/**
 * Paddle 支付配置
 * 文档: https://developer.paddle.com/
 */

export interface PaddleConfig {
  token: string;
  environment: 'sandbox' | 'production';
  scriptUrl: string;
  priceIds: {
    monthly: string;
    yearly: string;
  };
  settings: {
    displayMode: 'overlay' | 'inline' | 'redirect';
    theme: 'light' | 'dark' | 'none';
    successUrl: string;
  };
}

/**
 * Paddle 配置
 *
 * 环境变量说明：
 * - NEXT_PUBLIC_PADDLE_TOKEN: Paddle API Token
 * - NEXT_PUBLIC_PADDLE_ENVIRONMENT: 环境类型 (sandbox/production)
 * - NEXT_PUBLIC_PADDLE_PRICE_MONTHLY: 月付价格ID
 * - NEXT_PUBLIC_PADDLE_PRICE_YEARLY: 年付价格ID
 *
 * 获取配置步骤：
 * 1. 注册 Paddle 账户: https://www.paddle.com/
 * 2. 创建产品和价格
 * 3. 获取 Price IDs 和 API Token
 * 4. 在 .env.local 中配置环境变量
 */
export const paddleConfig: PaddleConfig = {
  // 从环境变量读取，提供默认值用于开发
  token: process.env.NEXT_PUBLIC_PADDLE_TOKEN || '',
  environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  
  // Paddle.js CDN 地址
  scriptUrl: 'https://cdn.paddle.com/paddle/v2/paddle.js',
  
  // 价格ID（在Paddle后台创建产品后获取）
  priceIds: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY || 'pri_01hxxxxxxxxxxxxx',
    yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY || 'pri_01hxxxxxxxxxxxxx',
  },
  
  // 支付弹窗设置
  settings: {
    displayMode: 'overlay',
    theme: 'dark',
    successUrl: typeof window !== 'undefined' 
      ? `${window.location.origin}/?payment=success`
      : 'http://localhost:5000/?payment=success',
  },
};

/**
 * 验证 Paddle 配置是否有效
 */
export function validatePaddleConfig(): boolean {
  return !!(
    paddleConfig.token &&
    paddleConfig.priceIds.monthly &&
    paddleConfig.priceIds.yearly &&
    !paddleConfig.priceIds.monthly.includes('xxxx') &&
    !paddleConfig.priceIds.yearly.includes('xxxx')
  );
}
