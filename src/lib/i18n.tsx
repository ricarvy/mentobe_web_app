'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, TranslationKey, translations } from '@/lib/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const savedLang = localStorage.getItem('tarot_language') as Language | null;
    if (savedLang && translations[savedLang]) {
      return savedLang;
    }
    if (savedLang) {
      const langMap: Record<string, Language> = {
        'cn': 'zh',
        'zh-CN': 'zh',
        'zh-TW': 'zh',
        'jp': 'ja',
        'ja-JP': 'ja',
      };
      const mappedLang = langMap[savedLang];
      if (mappedLang && translations[mappedLang]) {
        localStorage.setItem('tarot_language', mappedLang);
        return mappedLang;
      }
    }
    const browserLang = navigator.language.split('-')[0] as Language;
    if (translations[browserLang]) {
      return browserLang;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tarot_language', lang);
  };

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
