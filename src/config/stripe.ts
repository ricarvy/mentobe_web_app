/**
 * Stripe 支付配置
 * 文档: https://docs.stripe.com/checkout/embedded/quickstart
 */

export interface StripeConfig {
  publishableKey: string;
  environment: 'test' | 'production';
  priceIds: {
    monthly: string;
    yearly: string;
  };
  successUrl: string;
  cancelUrl: string;
}

/**
 * Stripe 配置
 *
 * 环境变量说明：
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Stripe Publishable Key (pk_xxx)
 * - NEXT_PUBLIC_STRIPE_ENVIRONMENT: 环境类型 (test/production)
 * - NEXT_PUBLIC_STRIPE_PRICE_MONTHLY: 月付价格ID (price_xxx)
 * - NEXT_PUBLIC_STRIPE_PRICE_YEARLY: 年付价格ID (price_xxx)
 *
 * 获取配置步骤：
 * 1. 注册 Stripe 账户: https://dashboard.stripe.com/register
 * 2. 创建产品和价格: https://dashboard.stripe.com/products
 * 3. 获取 Publishable Key 和 Price IDs
 * 4. 在 .env.local 中配置环境变量
 */
export const stripeConfig: StripeConfig = {
  // 从环境变量读取
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  environment: (process.env.NEXT_PUBLIC_STRIPE_ENVIRONMENT as 'test' | 'production') || 'test',
  
  // 价格ID（在Stripe后台创建产品后获取）
  priceIds: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_xxx',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_xxx',
  },
  
  // 成功和取消页面URL
  successUrl: typeof window !== 'undefined' 
    ? `${window.location.origin}/?payment=success`
    : 'http://localhost:5000/?payment=success',
  cancelUrl: typeof window !== 'undefined'
    ? `${window.location.origin}/pricing`
    : 'http://localhost:5000/pricing',
};

/**
 * 验证 Stripe 配置是否有效
 */
export function validateStripeConfig(): boolean {
  return !!(
    stripeConfig.publishableKey &&
    stripeConfig.priceIds.monthly &&
    stripeConfig.priceIds.yearly &&
    !stripeConfig.publishableKey.includes('xxx') &&
    !stripeConfig.priceIds.monthly.includes('xxx') &&
    !stripeConfig.priceIds.yearly.includes('xxx')
  );
}
