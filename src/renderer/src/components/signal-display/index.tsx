import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Tooltip } from 'antd'

interface SignalDisplayProps {
  width?: number
  height?: number
}

interface SignalData {
  delay: number
  jitter: number
  status: string
  packetLoss: number
}

const SignalDisplay: React.FC<SignalDisplayProps> = ({
  width = 100,
  height = 60,
}) => {
  const [signalData, setSignalData] = useState<SignalData>({
    delay: 0,
    jitter: 0,
    status: 'normal',
    packetLoss: 0,
  })
  const [failedRequests, setFailedRequests] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  const calculateMetrics = useCallback(
    (newDelay: number) => {
      // 计算丢包率
      const packetLoss = (failedRequests / (totalRequests || 1)) * 100

      // 确定状态
      let status = 'normal'
      if (newDelay > 200) status = 'poor'
      if (newDelay > 500) status = 'bad'
      if (packetLoss > 5) status = 'unstable'
      if (packetLoss > 10) status = 'critical'

      setSignalData({
        delay: newDelay,
        jitter: 0,
        status,
        packetLoss: Math.round(packetLoss * 10) / 10,
      })
    },
    [failedRequests, totalRequests]
  )

  useEffect(() => {
    const measureDelay = async () => {
      const startTime = performance.now()
      try {
        const response = await fetch(import.meta.env.VITE_AGENT_WORKBENCH_URL, {
          method: 'HEAD',
          cache: 'no-cache',
        })
        if (response.ok) {
          const endTime = performance.now()
          const delay = Math.round(endTime - startTime)
          calculateMetrics(delay)
        } else {
          setFailedRequests((prev) => prev + 1)
        }
      } catch (error) {
        console.error('测量延迟失败:', error)
        setFailedRequests((prev) => prev + 1)
      }
      setTotalRequests((prev) => prev + 1)
    }

    // 只在第一次渲染时执行
    if (isFirstRender.current) {
      measureDelay()
      isFirstRender.current = false
    }

    // 清除之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // 设置新的定时器
    intervalRef.current = setInterval(measureDelay, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [calculateMetrics])

  const getStatusColor = () => {
    switch (signalData.status) {
      case 'poor':
        return 'text-yellow-500 bg-yellow-500'
      case 'bad':
        return 'text-orange-500 bg-orange-500'
      case 'unstable':
        return 'text-red-500 bg-red-500'
      case 'critical':
        return 'text-red-600 bg-red-600'
      default:
        return 'text-green-500 bg-green-500'
    }
  }

  const getTextColor = () => {
    switch (signalData.status) {
      case 'poor':
        return 'text-yellow-500'
      case 'bad':
        return 'text-orange-500'
      case 'unstable':
        return 'text-red-500'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-green-500'
    }
  }

  // 计算信号强度
  const getSignalStrength = () => {
    if (signalData.delay <= 100) return 4 // 满格
    if (signalData.delay <= 200) return 3 // 3格
    if (signalData.delay <= 500) return 2 // 2格
    if (signalData.delay <= 1000) return 1 // 1格
    return 0 // 无信号
  }

  const renderSignalBars = () => {
    const strength = getSignalStrength()
    const totalBars = 4

    return (
      <div className="flex items-end gap-[2px]">
        {Array.from({ length: totalBars }).map((_, index) => (
          <div
            key={index}
            className={`rounded-[1px] ${
              index < strength ? getStatusColor().split(' ')[1] : 'bg-gray-200'
            }`}
            style={{
              width: '3px',
              height: `${((index + 1) / totalBars) * height}px`,
              minHeight: '3px',
            }}
          />
        ))}
      </div>
    )
  }

  const tooltipContent = (
    <div className="p-2">
      <div className="mb-1">延迟: {signalData.delay}ms</div>
      <div className="mb-1">抖动: {signalData.jitter}ms</div>
      <div className={`mb-1 ${getTextColor()}`}>状况: {signalData.status}</div>
      <div>丢包率: {signalData.packetLoss}%</div>
    </div>
  )

  return (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <Tooltip title={tooltipContent} placement="bottom">
        <div className="flex items-center">
          {renderSignalBars()}
          <span className={`ml-1 text-xs ${getTextColor()}`}>
            {signalData.delay}ms
          </span>
        </div>
      </Tooltip>
    </div>
  )
}

export default SignalDisplay
