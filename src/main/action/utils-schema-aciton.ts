import { WebContents } from 'electron'
import { parseSipUrl } from '../utils/index'
import { isString } from 'lodash'

// 拨打电话
export const transferToLogin = (window: WebContents, agentNumber: string, agentPasswd: string) => {
  if (agentNumber && agentPasswd) {
    window.send('utils-action', 'login', agentNumber, agentPasswd)
  }
}

// 处理sip schema
export const utilsAction = (window: WebContents, url: string) => {
  const { action, agentNumber, agentPasswd } = parseSipUrl(url)
  if (action === 'login' && isString(agentNumber) && isString(agentPasswd)) {
    transferToLogin(window, agentNumber, agentPasswd)
  }
}
