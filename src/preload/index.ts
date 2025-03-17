import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 定义事件监听器类型
type EventListener = (event: IpcRendererEvent, ...args: any[]) => void
// 存储所有事件监听器的映射
const listeners: Map<string, Map<string, EventListener>> = new Map()

// 生成唯一ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15)
}

// 通用的事件监听器注册和移除函数
const registerListener = (channel: string, listener: EventListener): string => {
  const id = generateId()

  if (!listeners.has(channel)) {
    listeners.set(channel, new Map())
  }

  listeners.get(channel)?.set(id, listener)
  ipcRenderer.on(channel, listener)

  return id
}

const removeListener = (channel: string, id: string): boolean => {
  const channelListeners = listeners.get(channel)
  if (!channelListeners) return false

  const listener = channelListeners.get(id)
  if (!listener) return false

  ipcRenderer.removeListener(channel, listener)
  channelListeners.delete(id)

  if (channelListeners.size === 0) {
    listeners.delete(channel)
  }

  return true
}

// Custom APIs for renderer
const api = {
  // 注册SIP呼叫事件监听器
  makeCall: (callback: (action: string, phone: string) => void) => {
    const listener = (_, action, phone) => {
      callback(action, phone)
    }

    const id = registerListener('sip-action', listener)

    return () => {
      removeListener('sip-action', id)
    }
  },
  // 注册登录事件监听器
  transferToLogin: (callback: (action: string, agentNumber: string, agentPasswd: string) => void) => {
    const listener = (_, action, agentNumber, agentPasswd) => {
      console.log('transferToLogin--->', action, agentNumber, agentPasswd)
      callback(action, agentNumber, agentPasswd)
    }

    const id = registerListener('utils-action', listener)

    return () => {
      removeListener('utils-action', id)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
