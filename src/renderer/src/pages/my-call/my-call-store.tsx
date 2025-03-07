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
import dayjs from 'dayjs'

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
  contentLoading: boolean
  callDetail: CallDetail | null
  agentCallDetail: AgentCallDetail[] | null
  currentTempCall: any | null

  // 方法
  setCurrentTempCall: (uuid: string | null) => void
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
  setContentLoading: (loading: boolean) => void
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
  currentTempCall: null,
  agentCallDetail: [],
  mainTab: 'normal' as MainTab,
  subTab: 'today' as SubTab,
  currentPage: 1,
  contentLoading: false,
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
  setContentLoading: (loading: boolean) => set({ contentLoading: loading }),
  setCurrentTempCall: (tempCall: any) => set({ currentTempCall: tempCall }),
  setSelectedRecordId: (id) => set({ selectedRecordId: id }),
  setMainTab: (mainTab) => set({ mainTab }),
  setSubTab: (subTab) => set({ subTab, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearchPhone: (searchPhone) => set({ searchPhone, currentPage: 1 }),
  setCallDetail: (callDetail) => set({ callDetail }),
  setAgentCallDetail: (agentCallDetail) => {
    set({ agentCallDetail })
  },
  // 获取任务列表数据
  fetchTaskData: async () => {
    const { searchPhone, subTab, currentPage, pageSize, mainTab, currentTempCall } = get()
    set({ loading: true })
    const { agentDetail } = useStore.getState()

    const handleTask = async (uuid: string) => {
      set({ contentLoading: true })

      try {
        const taskNumberResponse: any = await getTaskNumberDetail(uuid)
        if (taskNumberResponse?.code === 0) {
          set({
            callDetail: taskNumberResponse.data
          })
        }

        const taskAgentNumberResponse: any = await getTaskAgentNumberDetail(uuid)
        if (taskAgentNumberResponse?.code === 0) {
          set({
            agentCallDetail: taskAgentNumberResponse.data
          })
        }
      } catch (error) {
        console.error('获取任务详情失败', error)
      } finally {
        set({ contentLoading: false })
      }
    }

    const handleNormal = async (uuid: string) => {
      set({ contentLoading: true })

      try {
        const numberResponse: any = await getNumberDetail(uuid)
        if (numberResponse.code === 0) {
          set({
            callDetail: numberResponse.data
          })
        }

        const agentNumberResponse: any = await getAgentNumberDetail(uuid)
        if (agentNumberResponse.code === 0) {
          set({
            agentCallDetail: agentNumberResponse.data
          })
        }
      } catch (error) {
        console.error('获取通话详情失败', error)
      } finally {
        set({ contentLoading: false })
      }
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
          item.beginTime = convertTimeZone(agentDetail.org?.timezone, item.beginTime, true)
        })
        if (currentTempCall && currentTempCall?.callUuid && data.records[0]?.uuid !== currentTempCall?.callUuid) {
          const tempCall = {
            uuid: currentTempCall?.callUuid,
            phone: currentTempCall?.customerPhoneNumber,
            beginTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            status: 0
          }
          set({
            taskData: [tempCall, ...data.records],
            total: data.total + 1,
            currentCustomer: tempCall || null,
            selectedRecordId: tempCall.uuid || null
          })
          handleTask(tempCall.uuid)
        } else {
          set({
            taskData: data.records,
            total: data.total,
            currentCustomer: data.records[0] || null,
            selectedRecordId: data.records[0]?.uuid || null
          })
          if (data.records[0]?.uuid) {
            handleTask(data.records[0]?.uuid)
          }
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
          item.beginTime = convertTimeZone(agentDetail?.org?.timezone, item.beginTime, true)
        })
        if (currentTempCall && currentTempCall?.callUuid && data.records[0]?.uuid !== currentTempCall?.callUuid) {
          const tempCall = {
            uuid: currentTempCall?.callUuid,
            phone: currentTempCall?.customerPhoneNumber,
            beginTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            status: 0
          }
          set({
            taskData: [tempCall, ...data.records],
            total: data.total + 1,
            currentCustomer: tempCall || null,
            selectedRecordId: tempCall.uuid || null
          })
          handleNormal(tempCall.uuid)
        } else {
          set({
            taskData: data.records,
            total: data.total,
            currentCustomer: data.records[0] || null,
            selectedRecordId: data.records[0]?.uuid || null
          })
          if (data.records[0]?.uuid) {
            handleNormal(data.records[0]?.uuid)
          }
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
