import React, { useState, useEffect } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export enum TimeAction {
  Start,
  Stop,
}

interface TimeCountProps {
  action: TimeAction
  className?: string
}

const TimeCount: React.FC<TimeCountProps> = ({ action, className }) => {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined

    // 无论是什么动作，都先清零计时器
    setTime(0)

    if (action === TimeAction.Start) {
      setIsRunning(true)
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }

    if (action === TimeAction.Stop && isRunning) {
      setIsRunning(false)
      clearInterval(interval)
    }

    return () => {
      clearInterval(interval)
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
