import lottie from 'lottie-web'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import notfoundAnimation from '../assets/404.json'

const NotFound = () => {
  const notfoundRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<any>(null)

  useEffect(() => {
    if (notfoundRef.current) {
      animationRef.current = lottie.loadAnimation({
        container: notfoundRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: notfoundAnimation
      })
    }

    return (): void => {
      if (animationRef.current) {
        animationRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div ref={notfoundRef} className="w-[600px] h-[600px]" />
      <Link to="/" className="mt-8 px-6 py-2 text-lg font-medium transition-colors">
        Back Home
      </Link>
    </div>
  )
}

export default NotFound
