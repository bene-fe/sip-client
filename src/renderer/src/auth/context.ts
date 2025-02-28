import { createContext } from 'react'

export interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string, captchaText: string, captchaCode: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
