import { create } from 'zustand'
import i18n from '../i18n'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import 'dayjs/locale/es'

export type Language = 'zh' | 'en' | 'es'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

const useLanguageStore = create<LanguageState>((set) => ({
  language: (localStorage.getItem('language') as Language) || 'zh',
  setLanguage: (language: Language) => {
    localStorage.setItem('language', language)
    i18n.changeLanguage(language)
    // 设置 dayjs 的语言
    let dayjsLocale = 'en'
    if (language === 'zh') {
      dayjsLocale = 'zh-cn'
    } else if (language === 'es') {
      dayjsLocale = 'es'
    }
    dayjs.locale(dayjsLocale)
    set({ language })
  }
}))

// 初始化时设置语言
const initLanguage = (localStorage.getItem('language') as Language) || 'zh'
i18n.changeLanguage(initLanguage)
// 初始化 dayjs 语言
let dayjsLocale = 'en'
if (initLanguage === 'zh') {
  dayjsLocale = 'zh-cn'
} else if (initLanguage === 'es') {
  dayjsLocale = 'es'
}
dayjs.locale(dayjsLocale)

export default useLanguageStore
