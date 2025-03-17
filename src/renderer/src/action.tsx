import { isString } from 'lodash-es'

import useDialpad from './components/dialpad/dialpad'
import { message } from 'antd'

// 存储所有移除监听器的函数
const cleanupFunctions: (() => void)[] = []

// 注册监听器并保存清理函数
const registerListener = (listener: () => void): void => {
  cleanupFunctions.push(listener)
}

export const listenAction = (loginWithoutCaptcha: (username: string, password: string) => Promise<void>) => {
  const { makeCall } = useDialpad.getState()

  // 注册SIP呼叫事件监听器
  const makeCallback = (action: string, phone: string) => {
    if (action === 'call' && isString(phone)) {
      makeCall(phone)
    }
  }

  const transferToLoginCallback = (action: string, agentNumber: string, agentPasswd: string) => {
    if (action === 'login' && isString(agentNumber) && isString(agentPasswd)) {
      loginWithoutCaptcha(agentNumber, agentPasswd)
        .then(() => {
          message.success('登录成功')
        })
        .catch((error: any) => {
          message.error(error.message)
        })
    }
  }

  // 注册监听器并保存返回的移除函数
  const removeCallListener = window.api.makeCall(makeCallback)
  registerListener(removeCallListener)

  const removeTransferToLoginListener = window.api.transferToLogin(transferToLoginCallback)
  registerListener(removeTransferToLoginListener)

  // 可以注册更多监听器，例如：
  /*
  const callbackNotification = (type: string, message: string) => {
    console.log('notification--->', type, message)
    // 处理通知
  }

  const removeNotificationListener = window.api.onNotification(callbackNotification)
  registerListener(removeNotificationListener)
  */
}

// 清除所有注册的监听器
export const destroyAction = () => {
  // 调用所有清理函数
  while (cleanupFunctions.length > 0) {
    const cleanup = cleanupFunctions.pop()
    if (cleanup) {
      cleanup()
    }
  }
}
