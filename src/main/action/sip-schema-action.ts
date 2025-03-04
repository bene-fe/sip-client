import { WebContents } from 'electron'
import { parseSipUrl } from '../utils/ index'
import { isString } from 'lodash'

// 拨打电话
export const makeCall = (window: WebContents, phone: string) => {
  if (phone) {
    window.send('sip-action', 'call', phone)
  }
}

// 处理sip schema
export const sipAction = (window: WebContents, url: string) => {
  const { action, phone } = parseSipUrl(url)
  if (action === 'call' && isString(phone)) {
    makeCall(window, phone)
  }
}
