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

  useEffect(() => {
    // 从localStorage加载保存的语言
    const savedLang = localStorage.getItem('tarot_language') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else if (savedLang) {
      // 兼容旧的语言代码
      const langMap: Record<string, Language> = {
        'cn': 'zh',
        'zh-CN': 'zh',
        'zh-TW': 'zh',
        'jp': 'ja',
        'ja-JP': 'ja',
      };
      const mappedLang = langMap[savedLang];
      if (mappedLang && translations[mappedLang]) {
        setLanguageState(mappedLang);
        localStorage.setItem('tarot_language', mappedLang);
      }
    } else {
      // 检测浏览器语言
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

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
