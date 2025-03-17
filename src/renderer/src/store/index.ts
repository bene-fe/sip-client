import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { theme } from 'antd'

type Store = {
  token: string
  userInfo: any | null
  currentTheme: typeof theme.defaultAlgorithm
  agentInfo: any // 登陆等相关信息
  agentDetail: any // 坐席信息和组织信息
}

type Action = {
  setToken: (token: string) => void
  setUserInfo: (userInfo: any | null) => void
  setCurrentTheme: (token: typeof theme.defaultAlgorithm) => void
  clean: () => void
  setAgentInfo: (agentInfo: any) => void
  setAgentDetail: (agentDetail: any) => void
}

const useStore = create<Store & Action>()(
  persist(
    (set) => ({
      token: '',
      userInfo: null,
      currentTheme: theme.defaultAlgorithm,
      agentInfo: null,
      agentDetail: null,
      setCurrentTheme: (token) => set({ currentTheme: token }),
      setAgentDetail: (agentDetail) => set({ agentDetail }),
      setToken: (token) => set({ token }),
      setUserInfo: (userInfo) => set({ userInfo }),
      setAgentInfo: (agentInfo) => set({ agentInfo }),
      clean: () =>
        set({
          token: '',
          userInfo: null,
          agentInfo: null,
          agentDetail: null
        })
    }),
    {
      name: 'app-storage'
    }
  )
)

export default useStore
