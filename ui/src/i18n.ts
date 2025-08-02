import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(HttpApi)
  .init({
    fallbackLng: 'en',
    
    // THE ONLY CHANGE IN THIS FILE IS HERE:
    supportedLngs: ['en', 'mr'], // Changed 'hi' to 'mr'
    
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;