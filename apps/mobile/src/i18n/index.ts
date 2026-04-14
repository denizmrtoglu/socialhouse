import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'

import tr from './locales/tr.json'
import en from './locales/en.json'

const deviceLocale = getLocales()[0]?.languageCode ?? 'tr'
const supportedLocales = ['tr', 'en']
const lng = supportedLocales.includes(deviceLocale) ? deviceLocale : 'tr'

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng,
  fallbackLng: 'tr',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
export type SupportedLocale = 'tr' | 'en'
