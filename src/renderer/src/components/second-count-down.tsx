import React, { useState, useEffect } from 'react'

interface CountdownProps {
  seconds: number
  className?: string
}

const Countdown: React.FC<CountdownProps> = ({ seconds, className }) => {
  const [time, setTime] = useState(seconds)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prevTime) => prevTime - 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])

  return <span className={className}>({time})</span>
}

export default Countdown
