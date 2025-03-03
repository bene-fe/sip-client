import routes from '../agent-routes'
import { message } from 'antd'

import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { agentLogout } from '../api/user'
import useStore from '@renderer/store'
import useDialpad from '@renderer/components/dialpad/dialpad'

dayjs.extend(utc)
dayjs.extend(timezone)

interface MenuItemType {
  path?: string
  name: string
  icon?: ReactNode
  routes: MenuItemType[]
}

export const MenuRoute = (role: string) => {
  const { t } = useTranslation()
  const menuDataRender: { path: string; routes: MenuItemType[] } = {
    path: '/agent-my-call',
    routes: []
  }

  routes.forEach((i) => {
    const firstLevelMenu: MenuItemType = {
      path: i.path,
      name: t(i.title),
      routes: []
    }
    menuDataRender.routes.push(firstLevelMenu)

    if (i?.children) {
      i.children.forEach((j) => {
        if (j.role.includes(role)) {
          const secondLevelMenu: MenuItemType = {
            path: j.path,
            name: t(j.title),
            routes: []
          }

          if (j?.children) {
            j.children.forEach((k) => {
              if (k.role.includes(role) && !k.isHide) {
                secondLevelMenu.routes.push({
                  path: k.path,
                  name: t(k.title),
                  routes: []
                })
              }
            })
          }

          if (!j.isHide && (!j.children || j.children.length === 0)) {
            firstLevelMenu.routes.push({
              path: j.path,
              name: t(j.title),
              routes: []
            })
          } else if (j.children && secondLevelMenu.routes.length > 0) {
            firstLevelMenu.routes.push(secondLevelMenu)
          }
        }
      })
    }
  })

  menuDataRender.routes = menuDataRender.routes.filter((i: MenuItemType) => i.routes.length > 0)

  return { ...menuDataRender }
}

export const enumToOjb = (src: any) => {
  const arrayObjects: any = []
  for (const [propertyKey, propertyValue] of Object.entries(src)) {
    if (!Number.isNaN(Number(propertyKey))) {
      continue
    }
    arrayObjects.push({ value: propertyValue, label: propertyKey })
  }
  return arrayObjects
}

export const copyContent = (content: string) => {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.setAttribute('value', content)
  input.select()
  if (document.execCommand('copy')) {
    document.execCommand('copy')
    message.success('复制成功')
  }
  document.body.removeChild(input)
}

export const checkAnalysisParams = (params: StatisticParamsType) => {
  if (params.statisticType === 'taskList' && params?.taskIdList && params.taskIdList.length === 0) {
    return false
  }

  if (params.statisticType === 'startDate' && (!params.startDate || !params.endDate)) {
    return false
  }

  if (params.taskIdList?.length == 0) {
    delete params.taskIdList
  }

  return true
}

export const renderPercents = (num1: number, num2: number, suffix: string = '%') => {
  // 考虑NaN的情况
  if (num1 === 0 && num2 === 0 && suffix === 's') {
    return '0s'
  }
  if (num1 === 0 && num2 === 0 && suffix === '%') {
    return '0%'
  }

  if (suffix === 's') {
    return (num1 / num2).toFixed(2) + suffix
  }
  return ((num1 / num2) * 100).toFixed(2) + suffix
}

export const downloadCsv = (res: any) => {
  const blob = new Blob([res], {
    type: 'text/csv'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = 'task_data.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const convertTimeZone = (timeZone: string, date: any, withTime: boolean = false) => {
  const formatString = withTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
  return dayjs.tz(date, 'UTC').tz(timeZone).format(formatString)
}

export const convertToUTC = (timeZone: string, date: string | Date | Dayjs, withTime: boolean = false) => {
  const formatString = withTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
  return dayjs.tz(date, timeZone).utc().format(formatString)
}

export const formatToUTCParams = (startDate: string, endDate: string, timezone: string, withTime: boolean = false) => {
  return {
    startDate: convertToUTC(timezone, startDate, withTime),
    endDate: convertToUTC(timezone, endDate, withTime)
  }
}

export const logout = async () => {
  const { setToken, setUserInfo, setAgentDetail, setAgentInfo, agentInfo } = useStore.getState()
  const { logout: logoutDialpad } = useDialpad.getState()

  try {
    // 等待登出API完成
    agentLogout(agentInfo?.number)
  } catch (error) {
    console.error('登出API调用失败', error)
  }

  // 先清除状态和token
  logoutDialpad()
  // 在清除所有状态和调用API后，最后再跳转到登录页面
  setToken('')
  setUserInfo(null)
  // setIsWorkBench(false)
  setAgentDetail(null)
  setAgentInfo(null)
  localStorage.removeItem('token')
  window.location.replace('/login')
}
