'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'local';

export function GA4Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId) return;
    if (typeof window === 'undefined') return;

    const search = searchParams.toString();
    const pagePath = search ? `${pathname}?${search}` : pathname;

    window.gtag?.('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      app_env: appEnv,
    });
  }, [pathname, searchParams]);

  return null;
}

// Custom hook for tracking events
export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    if (typeof window === 'undefined' || !window.gtag) {
      console.warn('GA4 is not initialized');
      return;
    }

    try {
      window.gtag('event', eventName, {
        ...params,
        app_env: appEnv, // Ensure environment info is always included
      });
    } catch (error) {
      console.error('GA4 tracking error:', error);
    }
  }, []);

  return { trackEvent };
}
