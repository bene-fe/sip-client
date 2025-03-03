import { create } from 'zustand'
import SipClient from 'sip-call-ring'
import { message } from 'antd'
import { TimeAction } from './time-count'
import myCallStore from '../../pages/my-call/my-call-store'
import { useCheckRouteIsMyCall } from './utils'
import { logout } from '../../utils'

type Store = {
  sipInstance: SipClient | null
  loading: boolean
  logStatus: boolean
  sipState: SipStateType
  statusIsHold: boolean
  disableMic: boolean
  status: number // 1: 离线, 2: 在线, 3: 响铃中, 4: 通话中, 5: 呼叫中, 6: 小休中 7:忙碌中 8:整理中
  lantencyStat: any | undefined
  countTimeAction: TimeAction
  discallee: string
  callbackInfo: any
  groupCallInfo: {
    process: {
      type: number
      taskCode: string
      data: {
        completedCount: number
        totalCount: number
        customerAnsweredCount: number
      }
    }
    status: number
  }
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
  reLogin: () => void
  setLoginInfo: (loginInfo: any) => void
  wrapUp: (seconds: number) => void
  wrapUpEnd: () => void
  logout: () => void
  setCountTimeAction: (action: TimeAction) => void
  setCountCallAction: (action: TimeAction) => void
  makeCall: (num: string) => void
  getOrgOnlineAgent: () => Promise<void>
  setNavigate: (navigate: any) => void
}

const useDialpad = create<Store & Action>((set, get) => ({
  sipInstance: null,
  loading: false,
  logStatus: false,
  status: 1,
  loginInfo: {},
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
  statusIsHold: false,
  disableMic: false,
  lantencyStat: undefined,
  countTimeAction: TimeAction.Stop,
  countCallAction: TimeAction.Stop,
  discallee: '',
  callbackInfo: {},
  groupCallInfo: {
    process: {
      type: 0,
      taskCode: '',
      data: {
        completedCount: 0,
        totalCount: 0,
        customerAnsweredCount: 0
      }
    },
    status: 0
  },
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
  reLogin: () => {
    if (get().loginInfo) {
      set({
        loginInfo: get().loginInfo,
        sipInstance: new SipClient({
          ...get().loginInfo,
          stateEventListener: get().setEventListener,
          statusListener: (status: number) => {
            console.log('status--->', status)
            set({ status })
          },
          callbackInfo: (info: any) => {
            console.log('callbackInfo--->', info)
            set({ callbackInfo: info })
          },
          groupCallNotify: (info: any) => {
            console.log('groupCallInfo--->', info)
            if (info?.type == 2) {
              set({
                groupCallInfo: {
                  process: info,
                  status: get().groupCallInfo.status
                }
              })
            }

            if (info?.type == 1) {
              set({
                groupCallInfo: {
                  process: get().groupCallInfo.process,
                  status: info?.data?.status
                }
              })
            }
          },
          otherEvent: (info: any) => {
            const { setMainTab, fetchTaskData } = myCallStore.getState()
            if (info?.action === 'currentCallUuid') {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const isMyCallRoute = useCheckRouteIsMyCall()
              if (!isMyCallRoute) {
                get().navigate('/agent-my-call')
              }
              if (info?.content?.callType && info?.content?.callUuid) {
                set({
                  reloadCallRecord: !get().reloadCallRecord
                })
                if (info?.content?.callType !== 'GROUP_CALL') {
                  setMainTab('normal')
                } else {
                  setMainTab('task')
                }
                fetchTaskData()
              }
            }
          },
          kick: () => {
            message.error('您的账号已在其他设备登录，您已被强制下线。')
            setTimeout(() => {
              logout()
            }, 2000)
          }
        })
      })
    }
  },
  setSipInstance: (loginInfo: any) => {
    if (loginInfo) {
      set({
        loginInfo,
        sipInstance: new SipClient({
          ...loginInfo,
          stateEventListener: get().setEventListener,
          statusListener: (status: number) => {
            console.log('status--->', status)
            set({ status })
          },
          callbackInfo: (info: any) => {
            console.log('callbackInfo--->', info)
            set({ callbackInfo: info })
          },
          groupCallNotify: (info: any) => {
            console.log('groupCallInfo--->', info)
            if (info?.type == 2) {
              set({
                groupCallInfo: {
                  process: info,
                  status: get().groupCallInfo.status
                }
              })
            }

            if (info?.type == 1) {
              set({
                groupCallInfo: {
                  process: get().groupCallInfo.process,
                  status: info?.data?.status
                }
              })
            }
          },
          otherEvent: (info: any) => {
            const { setMainTab, fetchTaskData } = myCallStore.getState()
            if (info?.action === 'currentCallUuid') {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const isMyCallRoute = useCheckRouteIsMyCall()
              if (!isMyCallRoute) {
                get().navigate('/agent-my-call')
              }
              if (info?.content?.callType && info?.content?.callUuid) {
                set({
                  reloadCallRecord: !get().reloadCallRecord
                })
                if (info?.content?.callType !== 'GROUP_CALL') {
                  setMainTab('normal')
                } else {
                  setMainTab('task')
                }
                fetchTaskData()
              }
            }
          },
          kick: () => {
            message.error('您的账号已在其他设备登录，您已被强制下线。')
            setTimeout(() => {
              logout()
            }, 2000)
          }
        })
      })
    }
  },
  setEventListener: (event: any, data: any) => {
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
          currentCallNumber: data.otherLegNumber,
          discallee: get().sipState.agentNo,
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
          },
          countCallAction: TimeAction.Start
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
          statusIsHold: false,
          disableMic: false,
          lantencyStat: undefined,
          countCallAction: TimeAction.Stop,
          reloadCallRecord: !get().reloadCallRecord
        })
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
        set({ logStatus: false, loading: false })
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
    return get().sipInstance?.transferCall(num)
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
  getOrgOnlineAgent: async () => {
    return get().sipInstance?.getOrgOnlineAgent()
  },
  logout: () => {
    get().sipInstance?.unregister()
    set({
      callbackInfo: {},
      groupCallInfo: {
        process: {
          type: 0,
          taskCode: '',
          data: {
            completedCount: 0,
            totalCount: 0,
            customerAnsweredCount: 0
          }
        },
        status: 0
      },
      sipInstance: null,
      status: 1,
      currentCallNumber: '',
      reloadCallRecord: false
    })
  }
}))

export default useDialpad
