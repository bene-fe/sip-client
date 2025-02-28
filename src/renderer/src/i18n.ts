import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from './locales/en/translation.json'
import zhTranslation from './locales/zh/translation.json'

const resources = {
  en: {
    translation: enTranslation
  },
  zh: {
    translation: zhTranslation
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh', // 默认语言
  fallbackLng: 'en', // 当前语言的翻译没有找到时，使用的备选语言
  interpolation: {
    escapeValue: false // React 已经安全地转义了
  }
})

export default i18n
