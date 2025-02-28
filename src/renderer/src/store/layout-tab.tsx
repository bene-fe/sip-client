import { createElement } from 'react'
import { create } from 'zustand'
import { LayoutTabsType } from '../layout'
import MyCall from '../pages/my-call'

type Store = {
  currentTab: string
  tabs: LayoutTabsType[]
  fullScreen: boolean
  refreshFlags: Record<string, boolean>
}

type Action = {
  setCurrentTab: (tab: string) => void
  addTab: (tab: LayoutTabsType) => void
  removeTab: (tab: string) => void
  closeAllTabs: () => void
  closeOtherTabs: () => void
  refreshTab: () => void
  setFullScreen: () => void
  exitFullScreen: () => void
}

const useLayoutTab = create<Store & Action>((set) => ({
  fullScreen: false,
  refreshFlags: {},
  setFullScreen: () => set({ fullScreen: true }),
  exitFullScreen: () => set({ fullScreen: false }),
  currentTab: '/agent-my-call',
  tabs: [
    {
      key: '/agent-my-call',
      label: 'My Call',
      children: createElement(MyCall),
      closable: false
    }
  ],
  setCurrentTab: (tab) => set({ currentTab: tab }),
  addTab: (tab) =>
    set((state) => {
      const exists = state.tabs.some((t) => t.key === tab.key)
      if (exists) {
        return state
      }
      return { tabs: [...state.tabs, tab] }
    }),
  removeTab: (tab) => set((state) => ({ tabs: state.tabs.filter((i) => i.key !== tab) })),
  closeAllTabs: () =>
    set({
      tabs: [
        {
          key: '/agent-my-call',
          label: 'Dashboard',
          children: createElement(MyCall),
          closable: false
        }
      ],
      currentTab: '/agent-my-call'
    }),
  closeOtherTabs: () =>
    set((state) => ({
      tabs: state.tabs
        .filter((i) => i.key === '/agent-my-call')
        .concat(state.tabs.filter((i) => i.key === state.currentTab && i.key !== '/agent-my-call'))
    })),
  refreshTab: () => {
    set((state) => ({
      refreshFlags: {
        ...state.refreshFlags,
        [state.currentTab]: !state.refreshFlags[state.currentTab]
      }
    }))
  }
}))

export default useLayoutTab
