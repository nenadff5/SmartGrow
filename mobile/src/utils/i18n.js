import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import i18nResources from '../assets/i18n/i18n-resources';
import LanguageDetectorPlugin from './LanguageDetector';
import { setLocalStorageItem } from '../utils/LocalStorage';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetectorPlugin)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: i18nResources,
    compatibilityJSON: 'v3',
  });

export const changeLanguage = (languageKey) => {
  setLocalStorageItem('@appLang', languageKey);
  i18n.changeLanguage(languageKey, (err) => {
    if (err) return console.log('Error changing language', err);
  });
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const translateWithoutHook = (key, namespace) => {
  return i18n.t(key, { ns: namespace });
};

export default i18n;
