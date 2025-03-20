import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n'
import { ConfigProvider, theme } from 'antd'
import { StyleProvider } from '@ant-design/cssinjs'
import { ProConfigProvider } from '@ant-design/pro-components'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
// 导入 antd 的语言包
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import esES from 'antd/locale/es_ES'
import useLanguageStore from './store/language'
import './assets/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 将 Root 组件导出
export const Root = () => {
  const { language } = useLanguageStore()

  const queryClient = new QueryClient()

  // 根据当前语言选择对应的 antd 语言包
  let antdLocale = enUS
  if (language === 'zh') {
    antdLocale = zhCN
  } else if (language === 'es') {
    antdLocale = esES
  }

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm: theme.compactAlgorithm,
        token: {
          colorPrimary: '#2f4cdd',
          colorInfo: '#2f4cdd',
          colorError: '#e34d59',
          colorWarning: '#ed7b2f',
          colorSuccess: '#00a870'
        },
        components: {
          Menu: {
            itemSelectedBg: 'rgb(47,76,221)',
            itemSelectedColor: 'rgb(255,255,255)'
          }
        }
      }}
    >
      <StyleProvider hashPriority="high">
        <ProConfigProvider>
          <HashRouter>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </AuthProvider>
          </HashRouter>
        </ProConfigProvider>
      </StyleProvider>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
