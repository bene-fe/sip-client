import Graggable from './graggable'
import useDialpad from './dialpad'
import { useEffect, useState } from 'react'
import SipCall from 'sip-call-ring'
import TimeCount, { TimeAction } from './time-count'
import { Avatar, Button } from 'antd'
import { PhoneFilled, UserOutlined, SyncOutlined } from '@ant-design/icons'
import TransferIcon from './transfer-icon'
import PauseIcon from './pause-icon'
import { MicIcon, MicOffIcon } from './mic-icon'
import useStore from '../../store'
import SignalDisplay from '../signal-display'

const statusMap: { [key: number]: string } = {
  1: '离线',
  2: '在线',
  3: '响铃中',
  4: '通话中',
  5: '呼叫中',
  6: '小休中',
  7: '忙碌中',
  8: '整理中'
}

const Dialpad = ({ className }: { className?: string }) => {
  const {
    sipState,
    setSipInstance,
    setSipState,
    setCountTimeAction,
    status,
    hangupCall,
    answerCall,
    holdCall,
    unholdCall,
    statusIsHold,
    countCallAction,
    disableMic,
    muteCall,
    unmuteCall,
    currentCallNumber,
    sipInstance,
    wrapUp,
    wrapUpEnd,
    getOrgOnlineAgent,
    transferCall,
    setLoginInfo
  } = useDialpad()
  const { agentInfo } = useStore()
  const [onlineAgents, setOnlineAgents] = useState<string[]>([])
  const [showAgentChange, setShowAgentChange] = useState(false)

  useEffect(() => {
    SipCall.getMediaDeviceInfo().then((res) => {
      setSipState({
        ...sipState,
        mediaDevices: res
      })
      setLoginInfo({
        host: import.meta.env.VITE_AGENT_WORKBENCH_URL,
        port: '443',
        domain: '',
        proto: true,
        extNo: agentInfo?.number,
        extPwd: agentInfo?.password,
        stun: {
          type: 'stun',
          host: '',
          username: '',
          password: ''
        },
        checkMic: true,
        autoRegister: true,
        autoAnswer: false,
        autoMute: false,
        lang: 'en'
        // debug: true,
      })
    })
    setCountTimeAction(TimeAction.Start)

    return () => {
      sipInstance?.unregister()
      setSipInstance(null)
      setLoginInfo(null)
    }
  }, [])

  const renderCallButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <Button
        size={size}
        type="text"
        shape="circle"
        disabled={![1, 8, 5, 4, 3].includes(status)}
        icon={<PhoneFilled className="text-white flex items-center justify-center" />}
        className={`text-xl flex items-center justify-center ${
          ![1, 8, 5, 4, 3].includes(status) ? 'bg-gray-300' : 'bg-green-500'
        }`}
        onClick={() => {
          answerCall()
        }}
      />
    )
  }
  const renderHangupButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <Button
        size={size}
        type="text"
        shape="circle"
        icon={<PhoneFilled className="text-white flex items-center justify-center rotate-180" />}
        onClick={() => {
          hangupCall()
        }}
        className="bg-red-500"
      />
    )
  }

  const renderPauseButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <Button
        size={size}
        type="text"
        shape="circle"
        icon={<PauseIcon className={`${statusIsHold ? 'text-red-500' : 'text-white'} w-6 h-6`} />}
        disabled={statusIsHold}
        onClick={() => {
          if (statusIsHold) {
            unholdCall()
          } else {
            holdCall()
          }
        }}
      />
    )
  }

  const renderTransferButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <Button
        size={size}
        type="text"
        shape="circle"
        disabled={!sipState.statusIsCall}
        icon={<TransferIcon className={`${showAgentChange ? 'text-green-500' : 'text-white'} w-6 h-6`} />}
        onClick={() => {
          setShowAgentChange(!showAgentChange)
          getOrgOnlineAgent().then((r: any) => {
            if (r.code == 0) {
              setOnlineAgents(r.data)
            }
          })
        }}
      />
    )
  }

  const renderMicButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <>
        {status === 4 ? (
          <Button
            size={size}
            type="text"
            shape="circle"
            icon={<MicIcon className="text-white w-6 h-6" />}
            onClick={() => {
              if (disableMic) {
                unmuteCall()
              } else {
                muteCall()
              }
            }}
          />
        ) : (
          <Button
            size={size}
            type="text"
            shape="circle"
            icon={<MicOffIcon className="text-gray-600 w-6 h-6" />}
            onClick={() => {
              if (disableMic) {
                unmuteCall()
              } else {
                muteCall()
              }
            }}
          />
        )}
      </>
    )
  }

  const renderWrapUpButton = () => {
    return (
      <div className="w-full flex flex-row justify-between items-center">
        <span className="text-white text-xl">整理中</span>
        <div className="flex flex-row gap-2">
          <Button
            type="default"
            onClick={() => {
              wrapUp(60)
            }}
          >
            延长
          </Button>
          <Button
            type="primary"
            onClick={() => {
              wrapUpEnd()
            }}
          >
            完成
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Graggable>
      <div
        className={`w-[480px] min-h-[90px] flex flex-col items-start justify-center px-4 gap-2 rounded-lg bg-[#081042] ${className}`}
        style={{
          transform: 'translate3d(0, 0, 0)',
          ...(status === 3 && {
            animation: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) infinite',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          })
        }}
      >
        {/* 信息和 接通挂断按钮 */}
        <div className="flex w-full items-center justify-between p-4 gap-4 rounded-lg">
          <div className="w-full flex items-center justify-start gap-6">
            {status !== 8 && (
              <>
                <Avatar
                  size={56}
                  icon={<UserOutlined className="text-2xl" />}
                  shape="circle"
                  className="bg-gray-300 flex-shrink-0"
                />
                <div className="flex w-full flex-col items-start gap-2 flex-1">
                  <div className="text-white text-2xl font-bold tracking-wide">{currentCallNumber}</div>
                  <div className="flex flex-1 flex-row gap-3 items-center">
                    <div className="text-gray-400 text-base">{statusMap[status]}</div>
                    <div className="flex items-center justify-center w-[38px]">
                      <SignalDisplay width={12} height={12} />
                    </div>
                    <div className="text-gray-400 text-base">
                      <TimeCount action={countCallAction} />
                    </div>
                  </div>
                </div>
              </>
            )}
            {status === 8 && renderWrapUpButton()}
          </div>

          <div className="flex items-center justify-center gap-4">
            {status === 3 && renderCallButton({ size: 'large' })}
            {[3, 4, 5].includes(status) && renderHangupButton({ size: 'large' })}
          </div>
        </div>
        {/* {status === 4 && ( */}
        <div className="border-t w-full border-gray-300/50 flex items-center justify-start gap-2 px-2 py-2">
          {renderPauseButton({ size: 'large' })}
          {renderTransferButton({ size: 'large' })}
          {renderMicButton({ size: 'large' })}
        </div>
        {/* )} */}
        <div className="w-full flex flex-col items-start justify-center max-h-[350px]">
          {showAgentChange && (
            <>
              <div className="w-full px-4 py-3 bg-gray-800/50 flex items-center justify-between">
                <span className="text-gray-300 font-medium">在线坐席列表</span>
                <Button
                  type="text"
                  icon={<SyncOutlined className="text-gray-400" />}
                  onClick={() => {
                    getOrgOnlineAgent().then((r: any) => {
                      if (r.code == 0) {
                        setOnlineAgents(r.data)
                      }
                    })
                  }}
                />
              </div>
              <div className="overflow-y-auto max-h-[300px] w-full">
                {onlineAgents.map((agent, index) => (
                  <div
                    key={index}
                    className="w-full px-4 py-3 hover:bg-gray-700/30 transition-all duration-200 cursor-pointer flex items-center gap-3 group border-b border-gray-700/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-200 text-sm font-medium">坐席 {agent}</span>
                      <span className="text-gray-400 text-xs">
                        Extension #{(index + 1).toString().padStart(3, '0')}
                      </span>
                    </div>
                    <Button
                      type="text"
                      icon={<PhoneFilled className="text-green-500" />}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => transferCall(agent)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Graggable>
  )
}

export default Dialpad
