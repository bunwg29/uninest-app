import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { vi, en } from './locales';

const defaultLocale = Localization.getLocales()[0]?.languageCode === 'en' ? 'en' : 'vi';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: defaultLocale,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
