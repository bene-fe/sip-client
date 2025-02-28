import { create } from 'zustand'
import { getNumberPage, getTaskNumberPage } from '../../api/agent-seat'
import { convertTimeZone } from '../../utils'
import {
  getTaskNumberDetail,
  getTaskAgentNumberDetail,
  getNumberDetail,
  getAgentNumberDetail
} from '../../api/agent-seat'
import useStore from '../../store'

export type MainTab = 'task' | 'normal'
export type SubTab = 'today' | 'missed' | 'called'

export interface TaskRecord {
  uuid: string
  phone: string
  beginTime: string
  status: number
}

interface Store {
  // 状态
  currentCustomer: TaskRecord | null
  selectedRecordId: string | null
  mainTab: MainTab
  subTab: SubTab
  currentPage: number
  pageSize: number
  searchPhone: string | null
  taskData: TaskRecord[]
  total: number
  loading: boolean
  callDetail: CallDetail | null
  agentCallDetail: AgentCallDetail[] | null
  // 方法
  setCallDetail: (callDetail: CallDetail | null) => void
  setAgentCallDetail: (agentCallDetail: AgentCallDetail[] | null) => void
  setCurrentCustomer: (currentCustomer: TaskRecord | null) => void
  setSelectedRecordId: (id: string | null) => void
  setMainTab: (tab: MainTab) => void
  setSubTab: (tab: SubTab) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setSearchPhone: (phone: string) => void
  fetchTaskData: () => Promise<void>
}

// 计算每页显示数量的函数
const calculatePageSize = () => {
  const itemHeight = 76
  const availableHeight = window.innerHeight - 380
  return Math.max(4, Math.floor(availableHeight / itemHeight))
}

const myCallStore = create<Store>()((set, get) => ({
  // 初始状态
  currentCustomer: null,
  selectedRecordId: null,
  callDetail: null,
  agentCallDetail: [],
  mainTab: 'normal' as MainTab,
  subTab: 'today' as SubTab,
  currentPage: 1,
  pageSize: calculatePageSize(),
  searchPhone: null,
  taskData: [],
  total: 0,
  loading: false,

  // 方法
  setCurrentCustomer: (currentCustomer) => {
    set({
      currentCustomer,
      selectedRecordId: currentCustomer?.uuid || null
    })
  },
  setSelectedRecordId: (id) => set({ selectedRecordId: id }),
  setMainTab: (mainTab) => set({ mainTab }),
  setSubTab: (subTab) => set({ subTab, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearchPhone: (searchPhone) => set({ searchPhone, currentPage: 1 }),
  setCallDetail: (callDetail) => set({ callDetail }),
  setAgentCallDetail: (agentCallDetail) => set({ agentCallDetail }),
  // 获取任务列表数据
  fetchTaskData: async () => {
    const { searchPhone, subTab, currentPage, pageSize, mainTab } = get()
    set({ loading: true })
    const { agentDetail } = useStore.getState()

    const handleTask = (uuid: string) => {
      getTaskNumberDetail(uuid).then((r: any) => {
        if (r.code === 0) {
          set({
            callDetail: r.data
          })
        }
      })

      getTaskAgentNumberDetail(uuid).then((r: any) => {
        if (r.code === 0) {
          set({
            agentCallDetail: r.data
          })
        }
      })
    }

    const handleNormal = (uuid: string) => {
      getNumberDetail(uuid).then((r: any) => {
        if (r.code === 0) {
          set({
            callDetail: r.data
          })
        }
      })

      getAgentNumberDetail(uuid).then((r: any) => {
        if (r.code === 0) {
          set({
            agentCallDetail: r.data
          })
        }
      })
    }

    if (mainTab === 'task') {
      try {
        const response: any = await getTaskNumberPage({
          phone: searchPhone || null,
          isMissed: subTab === 'missed',
          pageNumber: currentPage,
          pageSize
        })

        const { data } = response
        // 转换时区
        data.records.forEach((item: any) => {
          item.beginTime = convertTimeZone(agentDetail?.org?.timezone, item.beginTime, true)
        })
        set({
          taskData: data.records,
          total: data.total,
          currentCustomer: data.records[0] || null,
          selectedRecordId: data.records[0]?.uuid || null
        })
        if (data.records[0]?.uuid) {
          handleTask(data.records[0]?.uuid)
        }
      } catch (error) {
        console.error('Failed to fetch task data:', error)
      } finally {
        set({ loading: false })
      }
    } else {
      try {
        const response: any = await getNumberPage({
          phone: searchPhone || null,
          isMissed: subTab === 'missed',
          pageNumber: currentPage,
          pageSize
        })

        const { data } = response
        // 转换时区
        data.records.forEach((item: any) => {
          item.beginTime = convertTimeZone(agentDetail.org?.timezone, item.beginTime, true)
        })
        set({
          taskData: data.records,
          total: data.total,
          currentCustomer: data.records[0] || null,
          selectedRecordId: data.records[0]?.uuid || null
        })
        if (data.records[0]?.uuid) {
          handleNormal(data.records[0]?.uuid)
        }
      } catch (error) {
        console.error('Failed to fetch task data:', error)
      } finally {
        set({ loading: false })
      }
    }
  }
}))

export default myCallStore
