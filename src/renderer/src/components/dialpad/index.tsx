import Graggable from './graggable'
import useDialpad from './dialpad'
import { useCallback, useEffect, useRef, useState } from 'react'
import SipCall from '../../sip'
import TimeCount, { TimeAction } from './time-count'
import { Avatar, Button, Input } from 'antd'
import { PhoneFilled, UserOutlined, SyncOutlined, SearchOutlined } from '@ant-design/icons'
import TransferIcon from './transfer-icon'
import PauseIcon from './pause-icon'
import { MicIcon, MicOffIcon } from './mic-icon'
import useStore from '../../store'
import SignalDisplay from '../signal-display'
import Countdown from '../second-count-down'
import { searchAgentSeat } from '../../api/agent-seat'

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
    status,
    hangupCall,
    answerCall,
    holdCall,
    unholdCall,
    statusIsHold,
    countCallAction,
    disableMic,
    setCountCallAction,
    muteCall,
    unmuteCall,
    currentCallNumber,
    sipInstance,
    wrapUp,
    wrapUpEnd,
    transferCall,
    setLoginInfo,
    tidyTime
  } = useDialpad()
  const { agentInfo } = useStore()
  const [onlineAgents, setOnlineAgents] = useState<
    {
      agentCode: string
      status: number
      agentNumber: string
      lastChangeTimestamp: number
      agentName: string
    }[]
  >([])
  const [showAgentChange, setShowAgentChange] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const agentListRef = useRef<HTMLDivElement>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

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

    return () => {
      sipInstance?.unregister()
      setSipInstance(null)
      setLoginInfo(null)
    }
  }, [])

  useEffect(() => {
    const needTimeCountStatuses = [3, 4, 5]
    if (needTimeCountStatuses.includes(status)) {
      setCountCallAction(TimeAction.Stop)
      setTimeout(() => {
        setCountCallAction(TimeAction.Start)
      }, 500)
    }

    if (status === 1) {
      setShowAgentChange(false)
    }
  }, [status])

  useEffect(() => {
    if (sipState?.callEndInfo) {
      setShowAgentChange(false)
    }
  }, [sipState])

  const renderCallButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <Button
        size={size}
        type="text"
        shape="circle"
        disabled={![1, 8, 5, 4, 3].includes(status)}
        icon={<PhoneFilled className="text-white flex items-center justify-center" />}
        style={{
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: ![1, 8, 5, 4, 3].includes(status) ? '#d1d5db' : '#10b981'
        }}
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
        style={{
          backgroundColor: ![1, 8, 5, 4, 3].includes(status) ? '#d1d5db' : '#e34d59'
        }}
      />
    )
  }

  const handleTransferCall = () => {
    setShowAgentChange(!showAgentChange)
    if (!showAgentChange) {
      setCurrentPage(1)
      setOnlineAgents([])
      setHasMore(true)
      setSearchKeyword('')
      loadAgents(1, '')
    }
  }

  const loadAgents = useCallback(
    (page: number, keyword: string = searchKeyword) => {
      if (loading || (!hasMore && page > 1)) return

      setLoading(true)
      searchAgentSeat({
        status: 2,
        pageNumber: page,
        pageSize: 20,
        agentName: keyword || undefined
      })
        .then((r: any) => {
          if (r.code == 0 && r?.data?.records) {
            if (page === 1) {
              setOnlineAgents(r.data.records)
            } else {
              setOnlineAgents((prev) => [...prev, ...r.data.records])
            }

            // 如果返回的记录数小于请求的数量，说明没有更多数据了
            if (r.data.records.length < 20) {
              setHasMore(false)
            } else {
              setHasMore(true)
            }
            setCurrentPage(page)
          }
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    },
    [loading, hasMore, searchKeyword]
  )

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchKeyword(value)

    // 防抖处理，避免频繁请求
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1)
      setHasMore(true)
      loadAgents(1, value)
    }, 500)

    setSearchTimeout(timeout)
  }

  // 监听滚动事件
  const handleScroll = useCallback(() => {
    if (!agentListRef.current || loading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = agentListRef.current
    // 当滚动到距离底部20px时，加载更多数据
    if (scrollHeight - scrollTop - clientHeight < 20) {
      loadAgents(currentPage + 1)
    }
  }, [loadAgents, currentPage, loading, hasMore])

  // 添加滚动事件监听
  useEffect(() => {
    const agentList = agentListRef.current
    if (agentList && showAgentChange) {
      agentList.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (agentList) {
        agentList.removeEventListener('scroll', handleScroll)
      }
    }
  }, [showAgentChange, handleScroll])

  const renderTransferButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <Button
        size={size}
        type="text"
        shape="circle"
        disabled={!sipState.statusIsCall}
        icon={<TransferIcon className={`${showAgentChange ? 'text-green-500' : 'text-white'} w-6 h-6`} />}
        onClick={() => handleTransferCall()}
      />
    )
  }

  const renderPauseButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <Button
        size={size}
        type="text"
        shape="circle"
        icon={
          <PauseIcon
            className={`${statusIsHold ? 'text-red-500' : disableMic ? 'text-gray-500' : 'text-white'} w-6 h-6`}
          />
        }
        disabled={disableMic}
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

  const renderMicButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <>
        {[4].includes(status) && !statusIsHold ? (
          <Button
            size={size}
            type="text"
            shape="circle"
            icon={<MicIcon className={`${disableMic ? 'text-red-500' : 'text-white'} w-6 h-6`} />}
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
        <span className="text-white text-xl">
          整理中
          <Countdown
            seconds={status === 8 ? tidyTime : 0}
            onDelay={(seconds) => wrapUp(seconds)}
            className="countdown-element"
          />
        </span>
        <div className="flex flex-row gap-2">
          <Button
            type="default"
            onClick={() => {
              const countdownElement = document.querySelector('.countdown-element') as HTMLElement
              if (countdownElement) {
                countdownElement.click()
              }
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
        className={`w-[520px] min-h-[90px] flex flex-col items-start justify-center px-4 gap-2 rounded-lg bg-[#081042] ${className}`}
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
                  icon={<UserOutlined style={{ fontSize: '1.5rem' }} />}
                  shape="circle"
                  style={{ backgroundColor: '#d1d5db', flexShrink: 0 }}
                />
                <div className="flex w-full flex-col items-start gap-2 flex-1">
                  <div className="text-white text-2xl font-bold tracking-wide">{currentCallNumber}</div>
                  <div className="flex flex-1 flex-row gap-3 items-center">
                    <div className="flex items-center justify-center w-[38px]">
                      <SignalDisplay width={12} height={12} />
                    </div>
                    <div className="text-gray-400 text-base">{statusMap[status]}</div>
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
            {status === 3 && sipState.callDirection !== 'outbound' && renderCallButton({ size: 'large' })}
            {[3, 4, 5].includes(status) && renderHangupButton({ size: 'large' })}
          </div>
        </div>
        {status === 4 && (
          <div className="border-t w-full border-gray-300/50 flex items-center justify-start gap-2 px-2 py-2">
            {renderPauseButton({ size: 'large' })}
            {renderTransferButton({ size: 'large' })}
            {renderMicButton({ size: 'large' })}
          </div>
        )}
        <div className="w-full flex flex-col items-start justify-center max-h-[350px]">
          {showAgentChange && status === 4 && (
            <>
              <div className="w-full px-4 py-3 bg-gray-800/50 flex items-center justify-between">
                <span className="text-gray-300 font-medium">在线坐席列表</span>
                <Button
                  type="text"
                  icon={<SyncOutlined className="text-gray-400" />}
                  onClick={() => {
                    setCurrentPage(1)
                    setOnlineAgents([])
                    setHasMore(true)
                    setSearchKeyword('')
                    loadAgents(1, '')
                  }}
                />
              </div>
              <div className="w-full px-4 py-2 bg-gray-800/30">
                <Input
                  placeholder="搜索坐席名称"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  allowClear
                />
              </div>
              <div ref={agentListRef} className="overflow-y-auto max-h-[250px] w-full">
                {onlineAgents.length === 0 && !loading && (
                  <div className="w-full py-6 text-center text-gray-400 text-sm">
                    {searchKeyword ? '没有找到匹配的坐席' : '暂无在线坐席'}
                  </div>
                )}
                {onlineAgents.map((agent, index) => (
                  <div
                    key={agent.agentNumber || index}
                    className="w-full px-4 py-3 hover:bg-gray-700/30 transition-all duration-200 cursor-pointer flex items-center gap-3 group border-b border-gray-700/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-200 text-sm font-medium">坐席 {agent.agentName}</span>
                      <span className="text-gray-400 text-xs">Agent Number #{agent.agentNumber}</span>
                    </div>
                    <Button
                      type="text"
                      icon={<PhoneFilled className="text-green-500" />}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => transferCall(agent.agentNumber)}
                    />
                  </div>
                ))}
                {loading && <div className="w-full py-3 text-center text-gray-400 text-sm">加载中...</div>}
                {!hasMore && onlineAgents.length > 0 && (
                  <div className="w-full py-3 text-center text-gray-400 text-sm">没有更多坐席了</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Graggable>
  )
}

export default Dialpad
