import translationAppEn from '../i18n/en/en-app.json';
import translationAppHr from '../i18n/hr/hr-app.json';

import translationBackendEn from '../i18n/en/en-backend.json';
import translationBackendHr from '../i18n/hr/hr-backend.json';

const i18nResources = {
  en: {
    app: translationAppEn,
    backend: translationBackendEn,
  },
  hr: {
    app: translationAppHr,
    backend: translationBackendHr,
  },
};

export const langsAvailable = [
  { name: 'English', value: 'en' },
  { name: 'Hrvatski', value: 'hr' },
];

export default i18nResources;
