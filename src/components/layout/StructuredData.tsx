/**
 * Structured Data Component for SEO
 * 包含 JSON-LD 结构化数据，用于 SEO 优化
 */

import React from 'react';

export function StructuredData() {
  const webApplicationData = {
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
  };

  const organizationData = {
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
  };

  const faqPageData = {
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
          text: 'We offer various tarot spreads including Single Card, Three Card Spread, and Celtic Cross. Each spread provides different insights and perspectives on your questions.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate are AI tarot readings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI is trained on extensive tarot knowledge and combines traditional meanings with modern AI interpretation. While readings provide valuable insights and guidance, they should be used for entertainment and self-reflection purposes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I save my readings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! When you create an account, all your readings are automatically saved. You can access your reading history anytime and review past interpretations.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageData) }}
      />
    </>
  );
}
