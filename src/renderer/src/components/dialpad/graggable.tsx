import React, { useState, useRef, useEffect } from 'react'

interface DraggableProps {
  children: React.ReactNode
  initialPosition?: { x: number; y: number }
}

const Draggable: React.FC<DraggableProps> = ({
  children,
  initialPosition = {
    x: typeof window !== 'undefined' ? window.innerWidth - 520 : 0,
    y: 70,
  },
}) => {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      requestAnimationFrame(() => {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        const element = elementRef.current
        const elementWidth = element?.offsetWidth || 0
        const elementHeight = element?.offsetHeight || 0

        const newX = Math.min(
          Math.max(0, e.clientX - dragRef.current.x),
          viewportWidth - elementWidth
        )
        const newY = Math.min(
          Math.max(0, e.clientY - dragRef.current.y),
          viewportHeight - elementHeight
        )

        setPosition({
          x: newX,
          y: newY,
        })
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={elementRef}
      style={{
        zIndex: 1000,
        position: 'fixed',
        left: position.x,
        top: position.y,
        // cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transform: `translate3d(0, 0, 0)`,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  )
}

export default Draggable
