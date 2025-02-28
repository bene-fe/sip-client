import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { menuIconMap } from '../constants/menuIcons'
import useStore from '../store'
import { useAuth } from '../auth/useAuth'
import useLanguageStore from '../store/language'
import routeAgent from '../agent-route.json'

// 修改翻译函数来包含图标处理
const translateMenuItem = (item: MenuItem, t: (key: string) => string): MenuItem => {
  const translatedItem = { ...item }
  translatedItem.name = t(item.title || '')

  // 为所有层级的菜单项添加图标
  if (item.path) {
    const IconComponent = menuIconMap[item.path]
    if (IconComponent) {
      translatedItem.icon = <IconComponent />
    }
  }

  if (item.children?.length) {
    translatedItem.children = item.children
      .filter((child) => child.isHide !== true)
      .map((child) => translateMenuItem(child, t))
  }

  return translatedItem
}

export const useMenu = () => {
  const [error, setError] = useState<string | null>(null)
  const [route, setRoute] = useState<MenuItem[]>([])
  const { t } = useTranslation()
  const { token } = useStore()
  const { isAuthenticated } = useAuth()
  const { language } = useLanguageStore()

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const translatedMenu = routeAgent.map((item: MenuItem) => translateMenuItem(item, t))
        setRoute(translatedMenu)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'get menu error')
      }
    }

    fetchMenu()
  }, [token, isAuthenticated, language])

  return { error, route }
}
