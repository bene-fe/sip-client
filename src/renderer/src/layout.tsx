import { useLocation, useNavigate } from 'react-router-dom'
import {
  CloseCircleOutlined,
  CloseSquareOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LogoutOutlined,
  RedoOutlined
} from '@ant-design/icons'
import { Dropdown, ConfigProvider, Skeleton, Tabs, MenuProps, Avatar } from 'antd'
import { useEffect, useState, Suspense, createElement, ReactNode, useRef } from 'react'
import routeAgent, { findRouteByPath } from './agent-routes'
import logo from './assets/logo.png'
import { MenuDataItem, ProLayout } from '@ant-design/pro-components'
import useStore from './store'
import useLayoutTab from './store/layout-tab'
import { Ellipsis } from 'lucide-react'
import TimezoneClock from './components/timezone'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/language-switcher'
import { logout } from './utils'
import { getAgentWorkbenchUserInfo } from './api/user'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import Dialpad from './components/dialpad'
import StatusBar from './components/dialpad/status-bar'
import useDialpad from './components/dialpad/dialpad'
import { useMenu } from './hooks/useMenu'

export type LayoutTabsType = {
  key: string
  label?: string
  children: ReactNode
  closable?: boolean
}

const Layout = () => {
  const { currentTheme, agentInfo, agentDetail, setAgentDetail } = useStore()
  const {
    currentTab,
    setCurrentTab,
    addTab,
    removeTab,
    tabs,
    refreshTab,
    setFullScreen,
    exitFullScreen,
    fullScreen,
    closeOtherTabs,
    closeAllTabs,
    refreshFlags
  } = useLayoutTab()
  const { status, setNavigate } = useDialpad()
  const { t } = useTranslation()
  const [pathname, setPathname] = useState('/')
  const { route: menuRoute } = useMenu()
  const routeLocation = useLocation()
  const navigate = useNavigate()
  const isMenuClick = useRef(false)

  const choiceTab = (item: MenuDataItem & { isUrl: boolean; onClick: () => void }) => {
    const path = item.path || '/agent-my-call'

    if (path === '/agent-my-call') {
      setPathname(path)
      navigate(path)
      return setCurrentTab(path)
    }

    if (path) {
      isMenuClick.current = true
      // 检查标签是否已存在
      const tabExists = tabs.some((tab) => tab.key === path)

      // 更新当前标签和路径
      setCurrentTab(path)
      setPathname(path)
      navigate(path)

      // 只在标签不存在时添加新标签
      if (!tabExists) {
        const tab = findRouteByPath(path, routeAgent)
        if (tab && tab.path) {
          addTab({
            key: path,
            label: t(tab.title),
            children: createElement(tab.page),
            closable: path !== '/agent-my-call'
          })
        }
      }
    }
  }

  const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      if (currentTab === targetKey) {
        const index = tabs.findIndex((tab) => tab.key === targetKey)
        const nextTab = tabs[index - 1]
        if (nextTab) {
          setCurrentTab(nextTab.key)
          setPathname(nextTab.key)
          navigate(nextTab.key)
        }
      }
      removeTab(targetKey as string)
    }
  }

  const dropDownMenuAction: MenuProps['items'] = [
    {
      key: 'refresh',
      icon: <RedoOutlined />,
      label: 'Refresh',
      onClick: refreshTab
    },
    {
      key: 'full-screen',
      icon: <FullscreenOutlined />,
      label: 'Full Screen',
      onClick: setFullScreen
    },
    {
      key: 'exit-full-screen',
      icon: <FullscreenExitOutlined />,
      label: 'Exit Full Screen',
      onClick: exitFullScreen
    },
    {
      key: 'close-all',
      icon: <CloseCircleOutlined />,
      label: 'Close All',
      onClick: closeAllTabs
    },
    {
      key: 'close-other',
      icon: <CloseSquareOutlined />,
      label: 'Close Other',
      onClick: closeOtherTabs
    }
  ]

  const OperationsSlot: Record<'right', React.ReactNode> = {
    right: (
      <Dropdown menu={{ items: dropDownMenuAction }}>
        <Ellipsis size={18} className="mr-4 ml-4 cursor-pointer" />
      </Dropdown>
    )
  }

  const handleUserInfo = async () => {
    if (agentInfo?.number) {
      const userInfoRes = await getAgentWorkbenchUserInfo(agentInfo?.number)
      if (userInfoRes?.data) {
        setAgentDetail(userInfoRes.data)
      }
    }
  }

  useEffect(() => {
    handleUserInfo()
    setNavigate(navigate)
  }, [agentInfo?.number])

  useEffect(() => {
    dayjs.extend(timezone)
    dayjs.extend(utc)

    if (agentDetail?.org?.timezone) {
      dayjs.tz.setDefault(agentDetail?.org?.timezone)
    }
  }, [agentDetail?.org?.timezone])

  useEffect(() => {
    if (routeLocation?.pathname && !isMenuClick.current) {
      const currentRoute = findRouteByPath(routeLocation.pathname, routeAgent)
      if (currentRoute && currentRoute.path) {
        const fullPath = routeLocation.pathname + routeLocation.search
        // 检查标签是否已存在，使用完整路径检查
        const tabExists = tabs.some((tab) => tab.key === fullPath)

        // 更新当前标签和路径
        setCurrentTab(fullPath)
        setPathname(fullPath)

        // 只在标签不存在时才添加新标签
        if (!tabExists) {
          let tabLabel = t(currentRoute.title)
          // 如果是任务详情页面，使用特殊的标签名
          if (routeLocation.pathname.includes('call-bot-task-detail')) {
            const taskId = new URLSearchParams(routeLocation.search).get('taskCode')
            tabLabel = `Task ${taskId}`
          }

          if (routeLocation.pathname.includes('call-bot-detail')) {
            const recordId = new URLSearchParams(routeLocation.search).get('uuid')
            tabLabel = `Call Record ${recordId}`
          }

          // voip
          if (routeLocation.pathname.includes('call-center-outbound-task-detail')) {
            const taskId = new URLSearchParams(routeLocation.search).get('taskCode')
            tabLabel = `Task ${taskId}`
          }

          if (routeLocation.pathname.includes('call-center-outbound-task-record-detail')) {
            const recordId = new URLSearchParams(routeLocation.search).get('uuid')
            tabLabel = `Call Detail ${recordId}`
          }

          if (routeLocation.pathname.includes('call-center-record-detail')) {
            const recordId = new URLSearchParams(routeLocation.search).get('id')
            tabLabel = `Call Detail ${recordId}`
          }

          addTab({
            key: fullPath,
            label: tabLabel,
            children: createElement(currentRoute.page),
            closable: fullPath !== '/agent-my-call'
          })
        }
      }
    }
    // 重置标志
    isMenuClick.current = false
  }, [routeLocation?.pathname, routeLocation?.search])

  if (typeof document === 'undefined') {
    return <div />
  }

  const renderContent = () => (
    <Tabs
      type="editable-card"
      hideAdd
      tabBarExtraContent={OperationsSlot}
      size="small"
      items={tabs.map((tab) => ({
        ...tab,
        label: tab.label || '',
        children: (
          <div
            key={refreshFlags[tab.key] ? `${tab.key}-refresh-true` : `${tab.key}-refresh-false`}
            style={{
              height: 'calc(100vh - 120px)',
              overflowY: 'auto'
            }}
          >
            {tab.children}
          </div>
        )
      }))}
      activeKey={currentTab}
      onEdit={onEdit}
      onChange={(key) => {
        setCurrentTab(key)
        setPathname(key)
        navigate(key)
      }}
    />
  )

  return (
    <div id="pro-layout" style={{ height: '100vh', overflow: 'auto' }}>
      <ConfigProvider
        getTargetContainer={() => document.getElementById('pro-layout') || document.body}
        theme={{
          algorithm: currentTheme
        }}
      >
        <Suspense fallback={<Skeleton />}>
          {fullScreen ? (
            <div
              style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {renderContent()}
            </div>
          ) : (
            <ProLayout
              headerTitleRender={() => (
                <div className="flex flex-row items-center gap-2">
                  <img src={logo} alt="logo" className="w-7 h-4 mr-2" />
                  <span className="text-lg font-bold">Agent Workbench</span>
                  <StatusBar className="ml-[20px]" />
                </div>
              )}
              // logo={logo}
              layout="mix"
              menuDataRender={() => menuRoute}
              location={{ pathname }}
              siderWidth={256}
              token={{
                sider: {
                  colorBgMenuItemSelected: 'rgb(47, 76, 221)',
                  colorTextSubMenuSelected: 'white',
                  colorMenuBackground: 'white'
                },
                header: {
                  colorBgHeader: 'rgba(255, 255, 255, 1)',
                  colorBgScrollHeader: 'rgba(255, 255, 255, 1)'
                }
              }}
              actionsRender={() => (
                <div className="flex flex-row justify-center items-center gap-6 px-4">
                  <TimezoneClock timezone={agentDetail?.org?.timezone} country={agentDetail?.org?.country} />
                  <div className="hover:scale-105 transition-transform">
                    <LanguageSwitcher />
                  </div>
                </div>
              )}
              avatarProps={{
                render: () => (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'logout',
                          icon: <LogoutOutlined />,
                          label: (
                            <div
                              onClick={() => {
                                logout()
                              }}
                            >
                              Logout
                            </div>
                          )
                        }
                      ]
                    }}
                  >
                    <Avatar>{agentDetail?.org?.orgName?.[0]}</Avatar>
                  </Dropdown>
                )
              }}
              siderMenuType="sub"
              menuFooterRender={(props) =>
                props?.collapsed ? undefined : (
                  <div style={{ textAlign: 'center', paddingBlockStart: 8 }}>
                    <div>© 2024 by Jingle Byte</div>
                  </div>
                )
              }
              onMenuHeaderClick={() => {
                setPathname('/agent-my-call')
              }}
              menuItemRender={(item, dom) => (
                <div className="w-full transition-all duration-200 hover:translate-x-2" onClick={() => choiceTab(item)}>
                  {dom}
                </div>
              )}
            >
              <div
                style={{
                  height: 'calc(100vh - 200px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {renderContent()}
              </div>
            </ProLayout>
          )}
        </Suspense>
        <Dialpad className={`absolute right-[0px] top-[0px] ${[3, 4, 5, 8].includes(status) ? 'block' : 'hidden'} `} />
      </ConfigProvider>
    </div>
  )
}

export default Layout
