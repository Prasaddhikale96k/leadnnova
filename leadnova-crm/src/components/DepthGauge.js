'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

export default function DepthGauge() {
  const { isDark } = useTheme()
  const scrollProgress = useMotionValue(0)
  const smoothProgress = useSpring(scrollProgress, { damping: 20, stiffness: 100 })
  const displayValue = useTransform(smoothProgress, (v) => `DEP_${Math.round(v * 100).toString().padStart(3, '0')}%`)
  const [currentDisplay, setCurrentDisplay] = useState('DEP_000%')

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
      scrollProgress.set(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    return smoothProgress.on('change', (v) => {
      setCurrentDisplay(`DEP_${Math.round(v * 100).toString().padStart(3, '0')}%`)
    })
  }, [])

  const gaugeColor = isDark ? '#FFFFFF' : '#000000'

  return (
    <div className="fixed right-4 top-0 h-screen z-[200] flex flex-col items-center justify-end pointer-events-none">
      <div className="relative h-[60vh] w-[1px]" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>
        <motion.div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: useTransform(smoothProgress, (v) => `${v * 100}%`),
            background: gaugeColor,
          }}
        />
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{
            bottom: useTransform(smoothProgress, (v) => `${v * 100}%`),
            background: gaugeColor,
            boxShadow: isDark ? '0 0 8px rgba(255,255,255,0.5)' : '0 0 8px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      <span className="mt-3 font-mono text-[9px] tracking-widest" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
        {currentDisplay}
      </span>
    </div>
  )
}
