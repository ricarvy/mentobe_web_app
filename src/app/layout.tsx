import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { StarBackground } from '@/components/StarBackground';
import { I18nProvider } from '@/lib/i18n';
import { UserProvider } from '@/lib/userContext';

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
  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Mentob AI',
              description: 'AI-powered tarot reading platform offering personalized insights and guidance',
              url: 'https://mentobai.com',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1250',
              },
              featureList: [
                'AI-powered tarot readings',
                'Multiple tarot spreads',
                'Real-time interpretation',
                'Personalized insights',
                'Free daily readings',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Mentob AI',
              url: 'https://mentobai.com',
              logo: 'https://mentobai.com/logo.png',
              description: 'AI-powered tarot reading platform',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: 'contact@mentobai.com',
                availableLanguage: ['English', 'Spanish', 'French', 'German'],
              },
              sameAs: [
                'https://twitter.com/mentobai',
                'https://facebook.com/mentobai',
                'https://instagram.com/mentobai',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'How does AI tarot reading work?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our AI analyzes traditional tarot card meanings and combines them with advanced natural language processing to provide personalized interpretations based on your questions and the cards drawn.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is the tarot reading free?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! We offer free tarot readings. After creating an account, you get 3 free AI-powered interpretations per day.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What tarot spreads are available?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We offer various spreads including Single Card for quick insights, Three Card spread for past-present-future readings, and the comprehensive Celtic Cross spread for detailed analysis.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <I18nProvider>
          <UserProvider>
            <StarBackground />
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  {children}
                </main>
              </div>
              <Footer />
            </div>
          </UserProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
