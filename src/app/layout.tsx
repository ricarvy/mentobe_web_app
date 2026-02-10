import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';
import { StarBackground } from '@/components/StarBackground';
import { I18nProvider } from '@/lib/i18n';
import { UserProvider } from '@/lib/userContext';
import { TarotFlowProvider } from '@/lib/tarotFlowContext';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import { StructuredData } from '@/components/layout/StructuredData';
import { GA4Tracker } from '@/components/GA4Tracker';

export const metadata: Metadata = {
  title: {
    default: 'Mentob AI - AI-Powered Tarot Reading | Discover Your Future',
    template: '%s | Mentob AI',
  },
  description:
    'Experience the power of AI-driven tarot readings. Get personalized insights, explore different tarot spreads, and unlock the mysteries of your future with our advanced AI technology.',
  keywords: [
    'tarot reading',
    'AI tarot',
    'online tarot',
    'free tarot reading',
    'tarot spreads',
    'tarot cards',
    'tarot interpretation',
    'fortune telling',
    'mystic guidance',
    'divination',
    'tarot online',
    'AI fortune teller',
    'digital tarot',
    'tarot wisdom',
    'mystic reading',
  ],
  authors: [{ name: 'Mentob AI Team', url: 'https://mentobai.com' }],
  creator: 'Mentob AI',
  publisher: 'Mentob AI',
  metadataBase: new URL('https://mentobai.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'es-ES': '/es-ES',
      'fr-FR': '/fr-FR',
      'de-DE': '/de-DE',
    },
  },
  openGraph: {
    title: 'Mentob AI - AI-Powered Tarot Reading',
    description:
      'Discover the mysteries of your future with AI-powered tarot readings. Get personalized insights and guidance for your life journey.',
    url: 'https://mentobai.com',
    siteName: 'Mentob AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mentob AI - AI-Powered Tarot Reading',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentob AI - AI-Powered Tarot Reading',
    description:
      'Discover the mysteries of your future with AI-powered tarot readings. Get personalized insights and guidance for your life journey.',
    images: ['/og-image.jpg'],
    creator: '@mentobai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'local';

  return (
    <html lang="en">
      <head>
        <StructuredData />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { send_page_view: false });
                gtag('set', 'user_properties', { app_env: '${appEnv}' });`}
            </Script>
          </>
        )}
        {/* Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17927152906"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17927152906');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <I18nProvider>
          <UserProvider>
            <Suspense fallback={null}>
              <GA4Tracker />
            </Suspense>
            <TarotFlowProvider>
              <SidebarProvider>
                <StarBackground />
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <div className="flex flex-1">
                    <Sidebar />
                    <MainContent>
                      {children}
                    </MainContent>
                  </div>
                  <Footer />
                </div>
              </SidebarProvider>
            </TarotFlowProvider>
          </UserProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
