import request from '../utils/request'

export const getAgentWorkbenchUserInfo = (number: string) => {
  return request(`/basic/agent-workbench/agent/info?number=${number}`, 'GET', {})
}

export const logout = () => {
  return request(`/basic/user/logout`, 'POST', {})
}

export const agentLogout = (number: string) => {
  return request(`/basic/agent-workbench/logout`, 'POST', { number })
}

export const agentLogin = (params: {
  number: string
  password: string
  captchaCode: string
  captchaText: string
  nonce: string
  timestamp: number
}) => {
  return request(`/basic/agent-workbench/login`, 'POST', params)
}

export const agentWithoutCaptchaLogin = (params: {
  number: string
  password: string
  nonce: string
  timestamp: number
}) => {
  return request(`/basic/agent-workbench/client/login`, 'POST', params)
}

export const getCaptcha = async () => {
  try {
    const response = await request(
      `/basic/public/captcha`,
      'GET',
      {},
      {
        responseType: 'blob'
      }
    )
    if (response.headers['captchacode']) {
      // 从响应头中获取验证码标识
      return {
        image: response.data,
        captchaCode: response.headers['captchacode']
      }
    }
    // 如果没有captchaCode，返回一个默认值
    return {
      image: null,
      captchaCode: ''
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : '获取验证码失败')
  }
}
