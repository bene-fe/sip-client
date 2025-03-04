import React, { useState, useEffect, useRef } from 'react'

interface CountdownProps {
  seconds: number
  className?: string
  onDelay?: (additionalSeconds: number) => void
}

const Countdown: React.FC<CountdownProps> = ({ seconds, className, onDelay }) => {
  const [time, setTime] = useState(seconds)
  const lastSecondsRef = useRef(seconds)

  // 只在初始化和seconds变化时更新time
  useEffect(() => {
    // 如果服务器返回的时间比当前时间大，说明是延长操作，不更新本地时间
    if (seconds > lastSecondsRef.current) {
      lastSecondsRef.current = seconds
      return
    }

    // 其他情况下更新时间
    setTime(seconds)
    lastSecondsRef.current = seconds
  }, [seconds])

  // 倒计时效果
  useEffect(() => {
    if (time <= 0) return

    const intervalId = setInterval(() => {
      setTime((prevTime) => prevTime - 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [time])

  const handleDelay = () => {
    if (onDelay) {
      // 直接增加60秒
      setTime((time) => time + 60)
      onDelay(60)
    }
  }

  return (
    <span className={className} style={{ cursor: 'pointer' }} onClick={handleDelay}>
      ({time})
    </span>
  )
}

export default Countdown
