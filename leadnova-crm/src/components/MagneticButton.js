'use client'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

export default function MagneticButton({ children, onClick, className = '', strength = 0.35 }) {
  const btnRef = useRef(null)
  const wrapperRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const btn = btnRef.current
    const wrapper = wrapperRef.current
    if (!btn || !wrapper) return

    const handleMove = (e) => {
      const rect = wrapper.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      const dist = Math.sqrt(x * x + y * y)

      if (dist < 200) {
        const pull = strength * (1 - dist / 200)
        gsap.to(btn, {
          x: x * pull,
          y: y * pull,
          duration: 0.4,
          ease: 'power2.out',
        })
      }
    }

    const handleEnter = () => {
      setIsHovered(true)
      gsap.to(btn, {
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.out',
      })
    }

    const handleLeave = () => {
      setIsHovered(false)
      gsap.to(btn, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)',
      })
    }

    wrapper.addEventListener('mousemove', handleMove)
    wrapper.addEventListener('mouseenter', handleEnter)
    wrapper.addEventListener('mouseleave', handleLeave)

    return () => {
      wrapper.removeEventListener('mousemove', handleMove)
      wrapper.removeEventListener('mouseenter', handleEnter)
      wrapper.removeEventListener('mouseleave', handleLeave)
    }
  }, [strength])

  return (
    <div ref={wrapperRef} className="inline-block" style={{ cursor: 'none' }}>
      <button
        ref={btnRef}
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
    </div>
  )
}
