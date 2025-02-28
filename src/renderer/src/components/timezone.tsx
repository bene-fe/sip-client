import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

interface TimezoneClockProps {
  timezone: string
  country?: string
}

const TimezoneClock: React.FC<TimezoneClockProps> = ({ timezone, country }) => {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs().tz(timezone)
      const formattedTime = `${country} ${now.format('(UTC Z) YYYY-MM-DD HH:mm:ss')}`
      setCurrentTime(formattedTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [timezone])

  return <div>{currentTime}</div>
}

export default TimezoneClock
