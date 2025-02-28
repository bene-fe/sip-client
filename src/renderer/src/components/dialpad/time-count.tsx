import React, { useState, useEffect, useRef } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export enum TimeAction {
  Start,
  Stop
}

interface TimeCountProps {
  action: TimeAction
  className?: string
}

const TimeCount: React.FC<TimeCountProps> = ({ action, className }) => {
  const [time, setTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // 清除之前的计时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }

    // 只有在 Stop 状态时才重置计时器
    if (action === TimeAction.Stop) {
      setTime(0)
    }

    if (action === TimeAction.Start) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [action])

  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = timeInSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return <div className={`${className}`}>{formatTime(time)}</div>
}

export default TimeCount
