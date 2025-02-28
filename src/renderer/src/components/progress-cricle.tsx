import React from 'react'

interface ProgressCircleProps {
  progress: number // Progress percentage (0-100)
  size: number // Diameter of the circle
  strokeWidth: number // Width of the progress stroke
  className?: string
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size,
  strokeWidth,
  className,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className={className}>
      <circle
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="rgb(47, 76, 221)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="1.5em"
        fill="#333"
      >
        {`${progress}%`}
      </text>
    </svg>
  )
}

export default ProgressCircle
