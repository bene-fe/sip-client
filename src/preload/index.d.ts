import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // SIP呼叫事件监听器
      makeCall: (callback: (action: string, phone: string) => void) => () => void
      // 通知事件监听器
      onNotification: (callback: (type: string, message: string) => void) => () => void
      // 登录事件监听器
      transferToLogin: (callback: (action: string, agentNumber: string, agentPasswd: string) => void) => () => void
    }
  }
}
