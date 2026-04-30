'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function GhostLights() {
  const containerRef = useRef(null)
  const orbsRef = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    orbsRef.current.forEach((orb, i) => {
      if (!orb) return

      // Random starting positions
      gsap.set(orb, {
        x: () => gsap.utils.random(-200, 200),
        y: () => gsap.utils.random(-200, 200),
      })

      // Continuous floating animation
      gsap.to(orb, {
        x: () => gsap.utils.random(-300, 300),
        y: () => gsap.utils.random(-300, 300),
        scale: () => gsap.utils.random(0.8, 1.2),
        duration: gsap.utils.random(8, 15),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 2,
      })

      // Subtle rotation for organic feel
      gsap.to(orb, {
        rotation: () => gsap.utils.random(-30, 30),
        duration: gsap.utils.random(10, 20),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 3,
      })
    })

    // Parallax on scroll
    const handleScroll = () => {
      const scrollY = window.scrollY
      orbsRef.current.forEach((orb, i) => {
        if (!orb) return
        const speed = 0.05 + i * 0.02
        gsap.set(orb, { y: `+=${-scrollY * speed}` })
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const orbColors = [
    'radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%)',
    'radial-gradient(circle, rgba(0,0,50,0.03) 0%, transparent 70%)',
    'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)',
  ]

  const orbSizes = ['600px', '500px', '400px']
  const orbPositions = [
    { top: '10%', left: '20%' },
    { top: '60%', right: '10%' },
    { top: '40%', left: '60%' },
  ]

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {orbColors.map((bg, i) => (
        <div
          key={i}
          ref={el => { orbsRef.current[i] = el }}
          className="absolute rounded-full"
          style={{
            width: orbSizes[i],
            height: orbSizes[i],
            background: bg,
            filter: 'blur(120px)',
            opacity: 0.05,
            ...orbPositions[i],
          }}
        />
      ))}
    </div>
  )
}
