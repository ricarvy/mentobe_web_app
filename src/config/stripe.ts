/**
 * Stripe 支付配置
 * 文档: https://docs.stripe.com/checkout/embedded/quickstart
 */

export interface StripeConfig {
  publishableKey: string;
  environment: 'test' | 'production';
  priceIds: {
    proMonthly: string;
    proYearly: string;
    premiumMonthly: string;
    premiumYearly: string;
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
 * - NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY: Pro月付价格ID (price_xxx)
 * - NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY: Pro年付价格ID (price_xxx)
 * - NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY: Premium月付价格ID (price_xxx)
 * - NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY: Premium年付价格ID (price_xxx)
 *
 * 获取配置步骤：
 * 1. 注册 Stripe 账户: https://dashboard.stripe.com/register
 * 2. 创建产品和价格: https://dashboard.stripe.com/products
 *    - 创建4个价格：Pro Monthly, Pro Yearly, Premium Monthly, Premium Yearly
 * 3. 获取 Publishable Key 和 Price IDs
 * 4. 在 .env.local 中配置环境变量
 */
export const stripeConfig: StripeConfig = {
  // 从环境变量读取
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  environment: (process.env.NEXT_PUBLIC_STRIPE_ENVIRONMENT as 'test' | 'production') || 'test',
  
  // 价格ID（在Stripe后台创建产品后获取）
  priceIds: {
    proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_xxx',
    proYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_xxx',
    premiumMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY || 'price_xxx',
    premiumYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY || 'price_xxx',
  },
  
  // 成功和取消页面URL
  successUrl: typeof window !== 'undefined' 
    ? `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`
    : 'http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: typeof window !== 'undefined'
    ? `${window.location.origin}/pricing`
    : 'http://localhost:5000/pricing',
};

/**
 * 根据计划和周期获取价格ID
 */
export function getPriceId(plan: 'pro' | 'premium', billingCycle: 'monthly' | 'yearly'): string {
  if (plan === 'pro' && billingCycle === 'monthly') {
    return stripeConfig.priceIds.proMonthly;
  } else if (plan === 'pro' && billingCycle === 'yearly') {
    return stripeConfig.priceIds.proYearly;
  } else if (plan === 'premium' && billingCycle === 'monthly') {
    return stripeConfig.priceIds.premiumMonthly;
  } else if (plan === 'premium' && billingCycle === 'yearly') {
    return stripeConfig.priceIds.premiumYearly;
  }
  return '';
}

/**
 * 验证 Stripe 配置是否有效
 */
export function validateStripeConfig(): boolean {
  return !!(
    stripeConfig.publishableKey &&
    stripeConfig.priceIds.proMonthly &&
    stripeConfig.priceIds.proYearly &&
    stripeConfig.priceIds.premiumMonthly &&
    stripeConfig.priceIds.premiumYearly &&
    !stripeConfig.publishableKey.includes('xxx') &&
    !stripeConfig.priceIds.proMonthly.includes('xxx') &&
    !stripeConfig.priceIds.proYearly.includes('xxx') &&
    !stripeConfig.priceIds.premiumMonthly.includes('xxx') &&
    !stripeConfig.priceIds.premiumYearly.includes('xxx')
  );
}
