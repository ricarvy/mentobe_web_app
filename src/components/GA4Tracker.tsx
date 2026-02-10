'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/lib/userContext';
import { useI18n } from '@/lib/i18n';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'local';

// Helper to get common params
const useCommonAnalyticsParams = () => {
  const { user } = useUser();
  const { language } = useI18n();

  return useMemo(() => ({
    app_env: appEnv,
    app_language: language,
    user_id: user?.id || undefined,
    user_type: user ? (user.isDemo ? 'demo' : 'registered') : 'guest',
    plan_level: user?.vipLevel || 'free',
  }), [user, language]);
};

export function GA4Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const commonParams = useCommonAnalyticsParams();

  useEffect(() => {
    if (!measurementId) return;
    if (typeof window === 'undefined') return;

    const search = searchParams.toString();
    const pagePath = search ? `${pathname}?${search}` : pathname;

    window.gtag?.('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      ...commonParams,
      ts: Date.now(),
    });
  }, [pathname, searchParams, commonParams]);

  // Set user properties
  useEffect(() => {
    if (!measurementId) return;
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('set', 'user_properties', {
      app_env: appEnv,
      user_type: commonParams.user_type,
      plan_level: commonParams.plan_level,
      app_language: commonParams.app_language
    });
    
    if (commonParams.user_id) {
       window.gtag('config', measurementId, {
         user_id: commonParams.user_id
       });
    }
  }, [commonParams]);

  return null;
}

// Custom hook for tracking events
export function useAnalytics() {
  const commonParams = useCommonAnalyticsParams();

  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (typeof window === 'undefined' || !window.gtag) {
      return;
    }

    try {
      window.gtag('event', eventName, {
        ...params,
        ...commonParams,
        ts: Date.now(),
      });
    } catch (error) {
      console.error('GA4 tracking error:', error);
    }
  }, [commonParams]);

  return { trackEvent };
}
