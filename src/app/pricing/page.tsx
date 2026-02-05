'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useUser } from '@/lib/userContext';
import { apiRequest } from '@/lib/api-client';
import { useAnalytics } from '@/components/GA4Tracker';

// API Response Types
interface StripePrice {
  id: string;
  unit_amount: number;
  amount: number;
  currency: string;
}

interface PricingConfigData {
  prices: {
    pro_monthly: StripePrice;
    pro_yearly: StripePrice;
    premium_monthly: StripePrice;
    premium_yearly: StripePrice;
  };
}

export default function PricingPage() {
  const { t, language } = useI18n();
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [pricingConfig, setPricingConfig] = useState<PricingConfigData['prices'] | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch pricing config from API
  useEffect(() => {
    const fetchPricingConfig = async () => {
      try {
        setConfigLoading(true);
        const data = await apiRequest<PricingConfigData>('/api/stripe/config', {
          requireAuth: false,
        });
        console.log('Fetched pricing config:', data);
        if (data?.prices) {
          setPricingConfig(data.prices);
        }
      } catch (error) {
        console.error('Failed to fetch pricing config:', error);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchPricingConfig();
  }, []);

  // Track view_item_list when page loads
  useEffect(() => {
    trackEvent('view_item_list', {
      items: [
        { item_id: 'pro_monthly', item_name: 'Pro Monthly', item_category: 'subscription' },
        { item_id: 'pro_yearly', item_name: 'Pro Yearly', item_category: 'subscription' },
        { item_id: 'premium_monthly', item_name: 'Premium Monthly', item_category: 'subscription' },
        { item_id: 'premium_yearly', item_name: 'Premium Yearly', item_category: 'subscription' },
      ],
    });
  }, [trackEvent]);

  // Format price helper
  const formatPrice = (price: StripePrice) => {
    return `${price.amount}`;
  };

  // Hardcoded upgrade price ID as fallback/default
  const UPGRADE_PRICE_ID = "price_1SxOoPGVP93aj81TCDnE6Kln";

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);

    const payload = {
      priceId: UPGRADE_PRICE_ID,
      userId: user.id,
      userEmail: user.email,
      successUrl: window.location.origin + "/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: window.location.origin + "/cancel"
    };

    try {
      const response = await apiRequest<{
        url: string;
        sessionId?: string;
      }>('/api/stripe/create-checkout-session', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(payload),
      });

      if (response.url) {
        console.log("Session ID:", response.sessionId);
        window.location.href = response.url;
      } else {
        console.error("Failed to create checkout session");
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Failed to create checkout session. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: 'pro' | 'premium') => {
    // Logic for button action dispatch
    if (user?.vipLevel === 'pro' && plan === 'premium') {
        await handleUpgrade();
        return;
    }

    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (user.vipLevel === 'premium' && plan === 'pro') {
      // Should be disabled in UI, but keep safeguard
      return;
    }

    if (!pricingConfig) {
      return;
    }

    setLoading(true);

    try {
      const configKey = `${plan}_${billingCycle}` as keyof typeof pricingConfig;
      const priceInfo = pricingConfig[configKey];
      
      if (!priceInfo || !priceInfo.id) {
        console.error('Invalid price ID');
        return;
      }

      const priceId = priceInfo.id;

      // Track begin_checkout
      trackEvent('begin_checkout', {
        currency: priceInfo.currency,
        value: priceInfo.amount,
        items: [{
          item_id: priceId,
          item_name: `${plan} ${billingCycle}`,
          price: priceInfo.amount,
          quantity: 1
        }]
      });

      // Save to localStorage
      localStorage.setItem('pending_checkout_price', priceInfo.amount.toString());
      localStorage.setItem('pending_checkout_currency', priceInfo.currency);
      localStorage.setItem('pending_checkout_plan', `${plan} ${billingCycle}`);

      const response = await apiRequest<{
        url: string;
      }>('/api/stripe/create-checkout-session', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          priceId: priceId,
          successUrl: window.location.origin + '/success',
          cancelUrl: window.location.origin + '/cancel',
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (response.url) {
        window.location.href = response.url;
      } else {
        console.error('No checkout URL in response', response);
        alert('Failed to redirect to payment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  type Plan = {
    name: string;
    description: string;
    price: string;
    period?: string;
    currency?: string;
    features: string[];
    button: string;
    buttonRenew?: string;
    buttonUpgrade?: string;
    buttonDowngrade?: string;
    popular: boolean;
    planType?: 'pro' | 'premium';
  };

  const plans: Plan[] = [
    {
      ...t.pricing.plans.free,
    },
    {
      ...t.pricing.plans.pro,
      planType: 'pro',
      price: pricingConfig ? formatPrice(pricingConfig[`pro_${billingCycle}`]) : '--',
      currency: pricingConfig ? pricingConfig[`pro_${billingCycle}`].currency.toLowerCase() : undefined,
      period: billingCycle === 'monthly' ? (language === 'zh' ? '/月' : '/month') : (language === 'zh' ? '/年' : '/year'),
    },
    {
      ...t.pricing.plans.premium,
      planType: 'premium',
      price: pricingConfig ? formatPrice(pricingConfig[`premium_${billingCycle}`]) : '--',
      currency: pricingConfig ? pricingConfig[`premium_${billingCycle}`].currency.toLowerCase() : undefined,
      period: billingCycle === 'monthly' ? (language === 'zh' ? '/月' : '/month') : (language === 'zh' ? '/年' : '/year'),
    },
  ];

  const getButtonState = (plan: Plan) => {
    // Default state
    let buttonText = plan.button;
    let isDisabled = false;
    let action = () => plan.planType && handleSubscribe(plan.planType);
    let isUpgrade = false;

    if (configLoading) {
      buttonText = 'Loading...';
      isDisabled = true;
      return { buttonText, isDisabled, action, isUpgrade };
    }

    if (!pricingConfig && (plan.planType === 'pro' || plan.planType === 'premium')) {
       // Only disable paid plans if config is missing
       // Free plan doesn't need config
       isDisabled = true;
       return { buttonText, isDisabled, action, isUpgrade };
    }

    if (!user || !plan.planType) {
        return { buttonText, isDisabled, action, isUpgrade };
    }

    const isProUser = user.vipLevel === 'pro';
    const isPremiumUser = user.vipLevel === 'premium';

    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log('[PricingPage] Button State Check:', {
        vipLevel: user.vipLevel,
        planType: plan.planType,
        isProUser,
        isPremiumUser
      });
    }

    const isProPlan = plan.planType === 'pro';
    const isPremiumPlan = plan.planType === 'premium';

    if (isProUser) {
        if (isProPlan) {
            buttonText = plan.buttonRenew || 'Renew';
        } else if (isPremiumPlan) {
            buttonText = plan.buttonUpgrade || 'Upgrade';
            action = handleUpgrade;
            isUpgrade = true;
        }
    } else if (isPremiumUser) {
        if (isProPlan) {
            buttonText = plan.buttonDowngrade || 'Downgrade Not Allowed';
            isDisabled = true;
        } else if (isPremiumPlan) {
            buttonText = plan.buttonRenew || 'Renew';
        }
    }

    return { buttonText, isDisabled, action, isUpgrade };
  };

  return (
    <>
      {/* 自定义动画样式 */}
      <style jsx global>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        
        .twinkle {
          animation: twinkle ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 加载遮罩层 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-950/90 via-black/90 to-pink-950/90 backdrop-blur-sm">
          {/* 动态背景星星 */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
              />
            ))}
          </div>
          
          <div className="relative flex flex-col items-center gap-8">
            {/* 旋转加载动画 */}
            <div className="relative w-32 h-32">
              {/* 外圈 - 紫色 */}
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
              
              {/* 中圈 - 粉色 */}
              <div className="absolute inset-4 border-3 border-pink-500/20 rounded-full"></div>
              <div className="absolute inset-4 border-3 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              
              {/* 内圈 - 紫色 */}
              <div className="absolute inset-8 border-2 border-purple-400/30 rounded-full"></div>
              <div className="absolute inset-8 border-2 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
              
              {/* 中心图标 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
            </div>
            
            {/* 加载文字 */}
            <div className="text-center space-y-3">
              <div className="text-white text-2xl font-bold animate-pulse">
                {t.payment?.loading?.title || 'Redirecting to Stripe...'}
              </div>
              <div className="text-gray-300 text-base">
                {t.payment?.loading?.subtitle || 'Please wait while we set up your subscription'}
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-pink-950" />
        {/* 星星层 */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                {t.pricing.subtitle}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t.pricing.title}
            </h1>
            <p className="text-xl text-purple-200/80">
              {t.pricing.subtitle}
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mt-12">
            <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/20 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                {t.pricing.billingCycle.monthly}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                {t.pricing.billingCycle.yearly}
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  {t.pricing.billingCycle.save.replace('{percent}', '54')}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-purple-500/20 bg-black/40 backdrop-blur-md transition-all hover:border-purple-500/40 ${
                  plan.popular ? 'border-2 border-purple-500/50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-purple-300/80">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    {plan.currency && (
                      <span className="text-sm text-purple-300">{plan.currency}</span>
                    )}
                    {plan.period && (
                      <span className="text-xl text-purple-300">{plan.period}</span>
                    )}
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-purple-200/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  {plan.planType && (() => {
                    const { buttonText, isDisabled, action } = getButtonState(plan);
                    return (
                      <div className="w-full space-y-2">
                        <Button
                          onClick={action}
                          disabled={loading || isDisabled}
                          className={`w-full ${
                            plan.popular
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                              : 'bg-purple-600 hover:bg-purple-700'
                          } ${isDisabled ? 'bg-gray-600 cursor-not-allowed opacity-50 hover:bg-gray-600' : ''}`}
                        >
                          {loading && !isDisabled ? 'Processing...' : buttonText}
                          {!loading && !isDisabled && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                        {isDisabled && (
                          <p className="text-xs text-center text-purple-300/60">
                            {t.pricing?.downgradeWarning || 'Downgrading from Premium is not allowed'}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-white">
              {t.pricing.features.title}
            </h2>
            <p className="text-center text-purple-200/80 mb-12">
              {t.pricing.features.subtitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {t.pricing.features.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                  <p className="text-purple-200/80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee Section */}
          <div className="mt-24 max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-3 text-white">{t.pricing.guarantee.title}</h3>
              <p className="text-purple-200/80">{t.pricing.guarantee.description}</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
              {t.pricing.faq.title}
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {t.pricing.faq.questions.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-purple-900/10 border border-purple-500/20 rounded-lg backdrop-blur-sm"
                >
                  <AccordionTrigger className="px-6 py-4 text-left text-purple-200 hover:text-white">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-purple-200/80">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA Section */}
          <div className="mt-16 md:mt-24 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to start your journey?
            </h2>
            <p className="text-lg sm:text-xl text-purple-200/80 mb-8">
              Join thousands of seekers discovering insights with AI-powered tarot
            </p>
            <Button
              size="lg"
              disabled={loading}
              onClick={() => handleSubscribe('pro')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8"
            >
              {loading ? 'Processing...' : 'Get Started Now'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
