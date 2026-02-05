'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TranslationKey, translations } from '@/lib/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let targetLang: Language = 'en';
    try {
      const savedLang = localStorage.getItem('tarot_language') as Language | null;

      if (savedLang && translations[savedLang]) {
        targetLang = savedLang;
      } else if (savedLang) {
        const langMap: Record<string, Language> = {
          cn: 'zh',
          'zh-CN': 'zh',
          'zh-TW': 'zh',
          jp: 'ja',
          'ja-JP': 'ja',
        };
        const mappedLang = langMap[savedLang];
        if (mappedLang && translations[mappedLang]) {
          localStorage.setItem('tarot_language', mappedLang);
          targetLang = mappedLang;
        }
      } else if (navigator.language) {
        const browserLang = navigator.language.split('-')[0] as Language;
        if (translations[browserLang]) {
          targetLang = browserLang;
        }
      }
    } catch {
      targetLang = 'en';
    }

    if (targetLang !== 'en') {
      setLanguageState(targetLang);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tarot_language', lang);
  };

  // Prevent hydration mismatch by rendering only after client-side language determination
  // Or just accept the flicker. For SEO, rendering 'en' content first is fine.
  // To avoid flicker, we could use a loading state, but that might delay LCP.
  // Given this is a client-side app wrapper, we accept the small flicker or use 'en' as default.
  // However, the error log specifically complained about mismatch.
  // By initializing state to 'en' and updating in useEffect, we solve the mismatch.

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
