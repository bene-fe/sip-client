import axios, { Method } from 'axios'
import { isString, isNil } from 'lodash-es'
import useStore from '../store'
import { message } from 'antd'
import { logout } from '../utils'
import * as Sign from '../utils/sig'

declare global {
  interface Window {
    DEBUG: boolean
  }
}

const service = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_SERVER_URL
})

service.interceptors.request.use(
  (config) => {
    const token = useStore.getState().token
    if (token) {
      config.headers['authorization'] = `${token}`
      if (window?.DEBUG) {
        console.log('token:', token)
      }
    }
    return config
  },
  (error) => {
    message.error(error.toString())
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  async (response) => {
    // 401 logout
    if (response.data.code == 401 || response.data.code == 402 || response.data.code == 403) {
      message.error(response.data.msg || 'this token is invalid, please login again or contact support')
      await new Promise((resolve) => setTimeout(resolve, 3000))
      return logout()
    }

    if (window?.DEBUG && response.headers['X-Trace-id']) {
      console.info(
        `X-Trace-ID: ${response.headers['X-Trace-id']}, 时间: ${new Date().toLocaleString()}, 路径: ${response.config.url}`
      )
    }

    if (
      response?.data?.code !== 0 &&
      response?.data?.msg &&
      !response?.config?.url?.includes('/basic/callback/') // 回调地址的验证错误不提示
    ) {
      message.error({
        content: response.data.msg,
        style: { position: 'absolute', top: 80, right: 100 }
      })
    }

    if (response?.data.type == 'application/json') {
      // blob 转 json
      const json = JSON.parse(await response.data.text())
      if (json.code == 400) {
        return message.error(json.msg)
      }
    }

    if (response?.data.type == 'image/png') {
      return response
    }

    return response.data
  },
  (error) => {
    if (error) {
      message.error({
        content: error.toString(),
        style: { position: 'absolute', top: 100, right: 100 }
      })
    }
    if (error.response.status == 403) {
      return logout()
    }
    return Promise.reject(error)
  }
)
export default (url: string, method: Method, data?: any, opts?: any) => {
  let params: any = data || {}

  // 重新排序保证签名数据和发送数据一致
  for (const key of Object.keys(data)) {
    let value = data[key]
    if (isString(value)) {
      value = value.trim()
    }
    params[key] = value
    if (isNil(value) || value === undefined || value === null) {
      delete params[key]
    }
  }

  params = {
    ...params,
    SecretId: import.meta.env.VITE_SECRET_ID,
    Timestamp: Sign.getTimestamp(),
    Nonce: Sign.getNonce()
  }
  params['Sign'] = Sign.getMd5Sign(params, import.meta.env.VITE_SECRET_ID)

  return service({
    url,
    method,
    data: params,
    ...opts
  })
}
