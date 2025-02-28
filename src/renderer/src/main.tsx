import './assets/index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n'
import { ConfigProvider, theme } from 'antd'
import { StyleProvider } from '@ant-design/cssinjs'
import { ProConfigProvider } from '@ant-design/pro-components'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
// 导入 antd 的语言包
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import useLanguageStore from './store/language'

// 将 Root 组件导出
export const Root = () => {
  const { language } = useLanguageStore()

  // 根据当前语言选择对应的 antd 语言包
  const antdLocale = language === 'zh' ? zhCN : enUS

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
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
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
