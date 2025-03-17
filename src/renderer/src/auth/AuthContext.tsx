import { useState, ReactNode } from 'react'
import { agentLogin, agentLogout, agentWithoutCaptchaLogin } from '../api/user'
import md5 from 'blueimp-md5'
import { AuthContext } from './context'
import useStore from '../store'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setToken, setUserInfo, setAgentInfo, agentInfo } = useStore()
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  const login = async (username: string, password: string, captchaText: string, captchaCode: string) => {
    const timestamp = new Date().getTime()
    const nonce = Math.random().toString(32).substr(2)
    const res: any = await agentLogin({
      number: username,
      password: md5(timestamp + password + nonce),
      nonce,
      timestamp,
      captchaText,
      captchaCode
    })
    if (res?.data) {
      setToken(res.data?.token)
      localStorage.setItem('token', res.data?.token)
      setIsAuthenticated(true)
      setAgentInfo({
        number: username,
        token: res.data?.token,
        userName: username,
        password
      })
    } else {
      throw new Error(res?.msg || 'Login failed')
    }
  }

  const loginWithoutCaptcha = async (username: string, password: string) => {
    const timestamp = new Date().getTime()
    const nonce = Math.random().toString(32).substr(2)
    const res: any = await agentWithoutCaptchaLogin({
      number: username,
      password: md5(timestamp + password + nonce),
      nonce,
      timestamp
    })
    if (res?.data) {
      setToken(res.data?.token)
      localStorage.setItem('token', res.data?.token)
      setIsAuthenticated(true)
      setAgentInfo({
        number: username,
        token: res.data?.token,
        userName: username,
        password
      })
    } else {
      throw new Error(res?.msg || 'Login failed')
    }
  }

  const logout = async () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUserInfo(null)
    setAgentInfo(null)
    window.open('/login', '_self')
    await agentLogout(agentInfo?.number)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loginWithoutCaptcha }}>
      {children}
    </AuthContext.Provider>
  )
}
