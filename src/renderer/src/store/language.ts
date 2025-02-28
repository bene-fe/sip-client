import { create } from 'zustand'
import i18n from '../i18n'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

export type Language = 'zh' | 'en'

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
    dayjs.locale(language === 'zh' ? 'zh-cn' : 'en')
    set({ language })
  }
}))

// 初始化时设置语言
const initLanguage = (localStorage.getItem('language') as Language) || 'zh'
i18n.changeLanguage(initLanguage)
// 初始化 dayjs 语言
dayjs.locale(initLanguage === 'zh' ? 'zh-cn' : 'en')

export default useLanguageStore
