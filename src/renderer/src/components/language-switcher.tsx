import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import useLanguageStore from '../store/language'
import { LANGUAGE_OPTIONS } from '../constants/language'

const LanguageSwitcher = () => {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguageStore()

  return (
    <Select value={language} onChange={setLanguage} style={{ width: 100 }} className="mx-2">
      {LANGUAGE_OPTIONS.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {t(option.label)}
        </Select.Option>
      ))}
    </Select>
  )
}

export default LanguageSwitcher
