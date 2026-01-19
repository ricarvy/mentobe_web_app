import { zh } from './zh';
import { en } from './en';
import { ja } from './ja';

export const translations = {
  zh,
  en,
  ja,
};

export type Language = keyof typeof translations;
export type TranslationKey = typeof zh;

export const languages = [
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
];
