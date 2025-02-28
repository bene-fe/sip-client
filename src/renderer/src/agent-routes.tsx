import MyCall from './pages/my-call'

export interface MenuItem {
  title: string
  path?: string
  page?: any
  role: string[]
  children?: MenuItem[]
  isHide?: boolean // 在菜单隐藏
}

const routes: MenuItem[] = [
  {
    path: '/my-call',
    title: 'routes.myCall',
    page: 'my call',
    isHide: false,
    role: ['ivr-admin'],
    children: [
      {
        path: '/agent-my-call',
        title: 'routes.myCall',
        page: MyCall,
        role: ['ivr-admin']
      }
    ]
  }
]

export const findRouteByPath = (path: string, routes: MenuItem[]): MenuItem | undefined => {
  for (const route of routes) {
    if (route.path === path) {
      return route
    }
    if (route.children) {
      const found = findRouteByPath(path, route.children)
      if (found) {
        return found
      }
    }
  }

  return undefined
}

export default routes
