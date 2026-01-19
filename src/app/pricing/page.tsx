'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

declare global {
  interface Window {
    Paddle?: {
      Initialize: (options: { token: string; environment: string }) => void;
      Checkout: {
        open: (options: {
          settings: {
            displayMode: string;
            theme: string;
            locale: string;
            successUrl: string;
          };
          items: Array<{
            priceId: string;
            quantity: number;
          }>;
        }) => void;
        close: () => void;
      };
    };
  }
}

export default function PricingPage() {
  const { t } = useI18n();
  const [paddleInitialized, setPaddleInitialized] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Paddle Price IDs (需要替换为实际的 Paddle Price IDs)
  const priceIds = {
    monthly: 'pri_01hxxxxxxxxxxxxx', // 月付价格ID
    yearly: 'pri_01hxxxxxxxxxxxxx',  // 年付价格ID
  };

  useEffect(() => {
    // 加载 Paddle.js
    const loadPaddle = () => {
      if (window.Paddle) {
        window.Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_TOKEN || 'test_live_token',
          environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox',
        });
        setPaddleInitialized(true);
      }
    };

    // 动态加载 Paddle.js
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.onload = loadPaddle;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    if (!paddleInitialized) {
      console.error('Paddle not initialized');
      return;
    }

    const priceId = plan === 'monthly' ? priceIds.monthly : priceIds.yearly;

    window.Paddle?.Checkout.open({
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        locale: t.common.language === '中文' || t.common.language === '语言' ? 'zh-Hans' : 
                 t.common.language === '日本語' || t.common.language === '言語' ? 'ja' : 'en',
        successUrl: `${window.location.origin}/?payment=success`,
      },
      items: [
        {
          priceId: priceId,
          quantity: 1,
        },
      ],
    });
  };

  type Plan = {
    name: string;
    description: string;
    price: string;
    period?: string;
    features: string[];
    button: string;
    popular: boolean;
    billingCycle?: 'monthly' | 'yearly';
  };

  const plans: Plan[] = [
    {
      ...t.pricing.plans.free,
    },
    {
      ...t.pricing.plans.monthly,
      billingCycle: 'monthly',
    },
    {
      ...t.pricing.plans.yearly,
      billingCycle: 'yearly',
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                {t.pricing.subtitle}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
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
                  {plan.name === 'Free' ? (
                    <Button className="w-full" variant="outline">
                      {plan.button}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => plan.billingCycle && handleSubscribe(plan.billingCycle)}
                      disabled={!paddleInitialized}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {plan.button}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-24 max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
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
          <div className="mt-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to start your journey?
            </h2>
            <p className="text-xl text-purple-200/80 mb-8">
              Join thousands of seekers discovering insights with AI-powered tarot
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8"
              onClick={() => handleSubscribe('monthly')}
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
