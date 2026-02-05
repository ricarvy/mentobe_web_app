/**
 * Stripe 支付配置
 * 文档: https://docs.stripe.com/checkout/embedded/quickstart
 */

export interface StripeConfig {
  publishableKey: string;
  environment: 'test' | 'production';
  successUrl: string;
  cancelUrl: string;
}

/**
 * Stripe 配置
 *
 * 环境变量说明：
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Stripe Publishable Key (pk_xxx)
 * - NEXT_PUBLIC_STRIPE_ENVIRONMENT: 环境类型 (test/production)
 *
 * 注意：价格配置现已从后端 API (/api/stripe/config) 动态获取，不再硬编码在此处。
 */
export const stripeConfig: StripeConfig = {
  // 从环境变量读取
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  environment: (process.env.NEXT_PUBLIC_STRIPE_ENVIRONMENT as 'test' | 'production') || 'test',
  
  // 成功和取消页面URL (作为后备默认值)
  successUrl: typeof window !== 'undefined' 
    ? `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`
    : `${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://life.mentobe.co' : 'http://localhost:5000')}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: typeof window !== 'undefined'
    ? `${window.location.origin}/pricing`
    : `${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://life.mentobe.co' : 'http://localhost:5000')}/pricing`,
};

/**
 * 验证 Stripe 配置是否有效
 */
export function validateStripeConfig(): boolean {
  return !!(
    stripeConfig.publishableKey &&
    !stripeConfig.publishableKey.includes('xxx')
  );
}
