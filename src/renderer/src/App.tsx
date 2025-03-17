import NotFound from './pages/NotFound'
import { lazy, Suspense, useEffect } from 'react'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import agentRouter from './agent-routes'
import { AuthGuard } from './auth/AuthGuard'
import { Skeleton } from 'antd'
import 'dayjs/locale/es-mx.js'
import { useMenu } from './hooks/useMenu'
import { useAuth } from './auth/useAuth'
import { destroyAction, listenAction } from './action'

const AppLayout = lazy(() => import('./layout'))
const Login = lazy(() => import('./pages/login'))
const findMenuRoute = (path: string, routes: any[]): any => {
  for (const route of routes) {
    if (route.path === path) {
      return route
    }
    if (route.children && route.children.length > 0) {
      const found = findMenuRoute(path, route.children)
      if (found) return found
    }
  }
  return null
}

const App = () => {
  const { loginWithoutCaptcha, isAuthenticated } = useAuth()
  const { route: menuRoutes } = useMenu()

  const renderRoutes = (routes: any[]): React.ReactNode[] => {
    return routes.flatMap((route: any) => {
      const result: React.ReactNode[] = []

      if (route.page) {
        result.push(<Route key={route.path} path={route.path} element={<route.page />} />)
      }
      // 检查权限时，如果没有menuRoutes，也应该渲染路由
      //
      const menuRoute = findMenuRoute(route.path, menuRoutes)
      if (route.page && (menuRoute || !menuRoutes?.length)) {
        result.push(<Route key={route.path} path={route.path} element={<route.page />} />)
      }

      if (route.children) {
        result.push(...renderRoutes(route.children))
      }

      return result
    })
  }

  useEffect(() => {
    listenAction(loginWithoutCaptcha)

    return () => {
      destroyAction()
    }
  }, [isAuthenticated])

  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <Routes>
          <Route path="/login" Component={Login} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            {renderRoutes(agentRouter)}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
