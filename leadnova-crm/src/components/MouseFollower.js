'use client'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { useTheme } from '@/context/ThemeContext'

const sectionColors = {
  hero: 'rgba(255, 255, 255, 0.12)',
  metrics: 'rgba(100, 150, 255, 0.12)',
  workflow: 'rgba(150, 100, 255, 0.12)',
  manifesto: 'rgba(255, 200, 100, 0.12)',
  features: 'rgba(100, 255, 200, 0.12)',
  results: 'rgba(255, 100, 150, 0.12)',
  cta: 'rgba(255, 255, 255, 0.15)',
  default: 'rgba(255, 255, 255, 0.08)',
}

const sectionColorsLight = {
  hero: 'rgba(0, 0, 0, 0.08)',
  metrics: 'rgba(50, 80, 180, 0.08)',
  workflow: 'rgba(80, 50, 180, 0.08)',
  manifesto: 'rgba(180, 120, 50, 0.08)',
  features: 'rgba(50, 180, 120, 0.08)',
  results: 'rgba(180, 50, 80, 0.08)',
  cta: 'rgba(0, 0, 0, 0.1)',
  default: 'rgba(0, 0, 0, 0.05)',
}

export default function MouseFollower() {
  const { isDark } = useTheme()
  const glowRef = useRef(null)
  const dotRef = useRef(null)
  const [activeSection, setActiveSection] = useState('default')

  useEffect(() => {
    const glow = glowRef.current
    const dot = dotRef.current
    if (!glow || !dot) return

    const handleMove = (e) => {
      gsap.to(glow, {
        x: e.clientX - 120,
        y: e.clientY - 120,
        duration: 0.8,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        x: e.clientX - 3,
        y: e.clientY - 3,
        duration: 0.15,
        ease: 'power2.out',
      })
    }

    const checkSection = () => {
      const sections = ['hero', 'metrics', 'workflow', 'manifesto', 'features', 'results', 'cta']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setActiveSection(id)
            return
          }
        }
      }
      setActiveSection('default')
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('scroll', checkSection, { passive: true })
    checkSection()

    gsap.set(glow, { opacity: 1 })
    gsap.set(dot, { opacity: 1 })

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('scroll', checkSection)
    }
  }, [])

  const colors = isDark ? sectionColors : sectionColorsLight

  return (
    <>
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-60 h-60 rounded-full pointer-events-none z-[40] mix-blend-screen"
        style={{
          background: `radial-gradient(circle, ${colors[activeSection] || colors.default} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          willChange: 'transform',
          opacity: 0,
        }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[41]"
        style={{
          willChange: 'transform',
          opacity: 0,
          background: isDark ? '#FFFFFF' : '#000000',
          boxShadow: isDark ? '0 0 8px rgba(255,255,255,0.5)' : '0 0 8px rgba(0,0,0,0.3)',
        }}
      />
    </>
  )
}
