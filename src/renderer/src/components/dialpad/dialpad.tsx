import { create } from 'zustand'
import { message } from 'antd'
import { TimeAction } from './time-count'
import myCallStore from '../../pages/my-call/my-call-store'
import { logout } from '../../utils'
import { persist } from 'zustand/middleware'
import SipCall from '../../sip'
import SipController from '../../sip/controller'
import dayjs from 'dayjs'

type Store = {
  sipInstance: SipCall | null
  sipController: SipController | null
  loading: boolean
  logStatus: boolean
  sipState: SipStateType
  statusIsHold: boolean
  disableMic: boolean
  status: number // 1: 离线, 2: 在线, 3: 响铃中, 4: 通话中, 5: 呼叫中, 6: 小休中 7:忙碌中 8:整理中
  lantencyStat: any | undefined
  loginLoading: boolean
  countTimeAction: TimeAction
  discallee: string
  callbackInfo: any
  tidyTime: number
  groupCallInfo: Array<{
    process: {
      type: number
      taskCode: string
      taskName: string
      data: {
        completedCount: number
        totalCount: number
        customerAnsweredCount: number
      }
    }
    status: number
  }>
  onCallingNumber: Array<{
    process: {
      type: number
      taskCode: string
      taskName: string
      data: {
        customerPhoneNumber: string
        dialCount: string
        uuid: string
        isRedial: boolean
        timestamp: string
        businessId: string
        extraInfo: string
      }
    }
    status: number
  }>
  callEndNumber: Array<{
    process: {
      type: number
      taskCode: string
      taskName: string
      data: {
        customerPhoneNumber: string
        status: number
        uuid: string
        isRedial: boolean
        ringType: string
        dialCount: number
        businessId: string | null
        extraInfo: string | null
        timestamp: number
      }
    }
    status: number
  }>
  loginInfo: any
  currentCallNumber: string
  countCallAction: number
  reloadCallRecord: boolean
  navigate: any | null
}

type SipStateType = {
  statusIsring: boolean //是否在振铃中
  statusIsCall: boolean //是否在拨打中

  callDirection: string //呼叫方向

  agentNo: string //分机号
  discaller: string //主叫号码
  discallee: string //被叫号码

  historyAccounts: string[] //历史账号列表
  lastAccount: string //最后一次使用的账号配置

  networkSpeed: number //网速
  testMicrophoneOb: null | any
  testMicrophoneVolume: number
  mediaDevices: null

  autoAnswer: boolean //自动接听
  autoDisableMic: boolean //自动静音

  loading: null
  locale: string
  locales: { label: string; value: string }[]
  callEndInfo: undefined
}

type Action = {
  setSipInstance: (loginInfo: any) => void
  setEventListener: (event: any, data: any) => void
  setSipState: (state: any) => void
  transferCall: (num: string) => Promise<void>
  setResting: () => void
  setIdle: () => void
  setBusy: () => void
  answerCall: () => void
  holdCall: () => void
  unholdCall: () => void
  muteCall: () => void
  unmuteCall: () => void
  hangupCall: () => void
  setLoginInfo: (loginInfo: any) => void
  wrapUp: (seconds: number) => void
  wrapUpEnd: () => void
  logout: () => void
  setCountTimeAction: (action: TimeAction) => void
  setCountCallAction: (action: TimeAction) => void
  makeCall: (num: string) => void
  getOrgOnlineAgent: () => void
  setNavigate: (navigate: any) => void
}

const useDialpad = create<Store & Action>()(
  persist(
    (set, get) => ({
      sipInstance: null,
      sipController: null,
      loading: false,
      logStatus: false,
      status: 1,
      loginInfo: {},
      loginLoading: false,
      currentCallNumber: '',
      reloadCallRecord: false,
      sipState: {
        statusIsring: false,
        statusIsCall: false,
        callDirection: '',
        agentNo: '',
        discaller: '',
        discallee: '',
        historyAccounts: [],
        lastAccount: '',
        networkSpeed: 0,
        testMicrophoneOb: null,
        testMicrophoneVolume: 0,
        mediaDevices: null,
        autoAnswer: false,
        autoDisableMic: false,
        loading: null,
        locale: 'zh',
        locales: [],
        callEndInfo: undefined
      },
      tidyTime: 0,
      statusIsHold: false,
      disableMic: false,
      lantencyStat: undefined,
      countTimeAction: TimeAction.Stop,
      countCallAction: TimeAction.Stop,
      discallee: '',
      callbackInfo: {},
      callEndNumber: [],
      onCallingNumber: [],
      groupCallInfo: [],
      navigate: null,
      setNavigate: (navigate: any) => set({ navigate }),
      setSipState: (state: any) => {
        set({
          sipState: state
        })
      },
      setLoginInfo: (loginInfo: any) => {
        set({ loginInfo })
      },
      setSipInstance: (loginInfo: any) => {
        if (loginInfo) {
          console.log('loginInfo--->', loginInfo)
          const sipController = new SipController({
            ...loginInfo,
            statusListener: (status: number) => {
              console.log('status--->', status)
              set({ status, loginLoading: false })
            },
            callbackInfo: (info: any) => {
              console.log('callbackInfo--->', info)
              set({ callbackInfo: info })
            },
            groupCallNotify: (info: any) => {
              console.log('groupCallInfo--->', info)
              const currentGroupCallInfo = [...get().groupCallInfo]
              const currentOnCallingNumber = [...get().onCallingNumber]
              const currentCallEndNumber = [...get().callEndNumber]

              if (info?.type == 2 && info?.taskCode) {
                // 查找是否已存在相同 taskCode 的任务
                const existingIndex = currentGroupCallInfo.findIndex((item) => item.process.taskCode === info.taskCode)

                if (existingIndex >= 0) {
                  // 更新已存在的任务数据
                  currentGroupCallInfo[existingIndex] = {
                    ...currentGroupCallInfo[existingIndex],
                    process: info
                  }
                } else {
                  // 添加新任务
                  currentGroupCallInfo.unshift({
                    process: info,
                    status: 0
                  })
                }

                set({ groupCallInfo: currentGroupCallInfo })
              }

              if (info?.type == 1 && info?.data?.taskCode) {
                // 查找是否已存在相同 taskCode 的任务
                const existingIndex = currentGroupCallInfo.findIndex(
                  (item) => item.process.taskCode === info.data.taskCode
                )

                if (existingIndex >= 0) {
                  // 更新已存在的任务状态
                  currentGroupCallInfo[existingIndex] = {
                    ...currentGroupCallInfo[existingIndex],
                    status: info?.data?.status
                  }

                  set({ groupCallInfo: currentGroupCallInfo })
                }
              }

              if (info?.type === 3) {
                if (info?.data?.timestamp) {
                  if (currentOnCallingNumber.length > 0) {
                    const lastItem = currentOnCallingNumber[currentOnCallingNumber.length - 1]
                    const lastTimestamp = dayjs(lastItem.process.data.timestamp)
                    const currentTimestamp = dayjs(info.data.timestamp)
                    const diffSeconds = currentTimestamp.diff(lastTimestamp, 'seconds')
                    if (diffSeconds > 3) {
                      currentOnCallingNumber.shift() // 删除第一个元素
                    }
                    currentOnCallingNumber.push({
                      process: info,
                      status: 0
                    })
                  } else {
                    currentOnCallingNumber.push({
                      process: info,
                      status: 0
                    })
                  }
                }
                set({ onCallingNumber: currentOnCallingNumber })
              }
              if (info?.type === 4) {
                if (info?.data?.timestamp) {
                  const tempCurrentOnCallingumber = currentOnCallingNumber.filter((item) => {
                    return item.process.data.uuid !== info.data.uuid
                  })

                  currentCallEndNumber.push({
                    process: info,
                    status: 0
                  })
                  set({
                    onCallingNumber: tempCurrentOnCallingumber,
                    callEndNumber: currentCallEndNumber
                  })
                }
              }
            },
            otherEvent: (info: any) => {
              const { setMainTab, fetchTaskData, setCurrentTempCall } = myCallStore.getState()
              if (info?.action === 'currentCallUuid') {
                if (info?.content?.callType && info?.content?.callUuid) {
                  set({
                    reloadCallRecord: !get().reloadCallRecord
                  })
                  setCurrentTempCall(info?.content)
                  console.log('currentCallUuid--->', info?.content)
                  if (info?.content?.callType !== 'GROUP_CALL') {
                    setMainTab('normal')
                  } else {
                    setMainTab('task')
                  }
                  fetchTaskData()
                }
              }

              if (info.action === 'warpUpTimeNotify') {
                set({
                  tidyTime: info.content
                })
              }
            },
            kick: () => {
              message.error('您的账号已在其他设备登录，您已被强制下线。')
              setTimeout(() => {
                logout()
              }, 2000)
            }
          })

          set({
            loginInfo,
            loginLoading: true,
            sipController: sipController,
            sipInstance: new SipCall({
              ...loginInfo,
              stateEventListener: get().setEventListener,
              sipController: sipController // 传递SipController实例给SipCall
            })
          })
        }
      },
      setEventListener: (event: any, data: any) => {
        const { setCurrentTempCall } = myCallStore.getState()

        console.log('收到事件', event, data)
        switch (event) {
          case 'ERROR':
            set({ loading: false })
            break
          case 'DISCONNECTED':
            set({ logStatus: false, loading: false })
            message.info('Disconnected')
            break
          case 'REGISTERED':
            set({ logStatus: true, loading: false })
            set({
              sipState: {
                ...get().sipState,
                agentNo: data.localAgent
              }
            })
            break
          case 'UNREGISTERED':
            set({
              sipState: {
                ...get().sipState,
                statusIsring: false,
                statusIsCall: false,
                callEndInfo: undefined
              },
              statusIsHold: false,
              disableMic: false,
              currentCallNumber: '',
              lantencyStat: undefined,
              logStatus: false,
              status: 1
            })
            break
          case 'INCOMING_CALL':
            set({
              sipState: {
                ...get().sipState,
                callEndInfo: undefined,
                statusIsring: true,
                callDirection: data.direction
              },
              currentCallNumber: data.otherLegNumber
            })
            if (get().sipState.autoAnswer) {
              //自动应答
              get().sipInstance?.answer()
            }
            break
          // this.playRingMedia();
          case 'OUTGOING_CALL':
            set({
              sipState: {
                ...get().sipState,
                callEndInfo: undefined,
                statusIsring: true,
                callDirection: data.direction,
                discaller: data.otherLegNumber
              },
              discallee: get().sipState.agentNo,
              currentCallNumber: data.otherLegNumber,
              countCallAction: TimeAction.Start
            })
            break
          case 'IN_CALL':
            if (get().sipState.autoDisableMic) {
              //自动禁音
              get().sipInstance?.mute()
            }
            set({
              sipState: {
                ...get().sipState,
                statusIsring: false,
                statusIsCall: true
              }
            })
            break
          case 'CALL_END':
            set({
              sipState: {
                ...get().sipState,
                statusIsring: false,
                statusIsCall: false,
                callEndInfo: data
              },
              currentCallNumber: '',
              callbackInfo: {},
              disableMic: false,
              lantencyStat: undefined,
              countCallAction: TimeAction.Stop,
              statusIsHold: false,
              reloadCallRecord: !get().reloadCallRecord
            })
            setCurrentTempCall(null)
            break
          case 'HOLD':
            set({
              statusIsHold: true
            })
            break
          case 'UNHOLD':
            set({
              statusIsHold: false
            })
            break
          case 'MUTE':
            set({
              disableMic: true
            })
            break
          case 'UNMUTE':
            set({
              disableMic: false
            })
            break
          case 'CONNECTED':
            set({
              loading: false
            })
            break
          case 'DISCONNECT':
            console.log('DISCONNECT', data.msg)
            break
          case 'RECONNECT':
            break
          case 'REGISTER_FAILED':
            set({ logStatus: false, loading: false, status: 1, loginLoading: false })
            message.error('Register failed')
            break
          case 'LATENCY_STAT':
            set({ lantencyStat: data })
            break
          case 'MIC_ERROR':
            message.error(data.msg)
            break
          default:
        }
      },
      setCountTimeAction: (action: TimeAction) => {
        set({ countTimeAction: action })
      },
      setCountCallAction: (action: TimeAction) => {
        set({ countCallAction: action })
      },
      transferCall: async (num: string) => {
        get().sipInstance?.transferCall(num)
      },
      makeCall: (num: string) => {
        get().sipInstance?.call(num)
      },
      setResting: () => {
        get().sipInstance?.setResting()
      },
      setIdle: () => {
        get().sipInstance?.setIdle()
      },
      setBusy: () => {
        get().sipInstance?.setBusy()
      },
      answerCall: () => {
        get().sipInstance?.answer()
      },
      holdCall: () => {
        get().sipInstance?.hold()
      },
      unholdCall: () => {
        get().sipInstance?.unhold()
      },
      hangupCall: () => {
        get().sipInstance?.hangup()
      },
      muteCall: () => {
        get().sipInstance?.mute()
      },
      unmuteCall: () => {
        get().sipInstance?.unmute()
      },
      wrapUp: (seconds: number) => {
        get().sipInstance?.wrapUp(seconds)
      },
      wrapUpEnd: () => {
        get().sipInstance?.wrapUpCancel()
      },
      getOrgOnlineAgent: () => {
        get().sipInstance?.getOrgOnlineAgent()
      },
      logout: () => {
        get().sipController?.logout()
        get().sipInstance?.unregister()
        set({
          callbackInfo: {},
          sipInstance: null,
          sipController: null,
          status: 1,
          currentCallNumber: '',
          reloadCallRecord: false
        })
      }
    }),
    {
      name: 'dialpad-storage',
      partialize: (state) => ({
        groupCallInfo: state.groupCallInfo,
        loginInfo: state.loginInfo
      })
    }
  )
)

export default useDialpad
