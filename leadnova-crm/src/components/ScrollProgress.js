'use client'
import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTheme } from '@/context/ThemeContext'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollProgress() {
  const { isDark } = useTheme()
  const lineRef = useRef(null)
  const glowRef = useRef(null)
  const percentRef = useRef(null)
  const containerRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const line = lineRef.current
    const glow = glowRef.current
    const percent = percentRef.current
    if (!line || !glow || !percent) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
          onUpdate: (self) => {
            const pct = Math.round(self.progress * 100)
            percent.textContent = `DEP_${String(pct).padStart(3, '0')}%`
          },
        },
      })

      tl.to(glow, {
        height: '100%',
        ease: 'none',
      }, 0)
    })

    const showOnScroll = ScrollTrigger.create({
      start: 'top -80',
      onEnter: () => setVisible(true),
      onLeaveBack: () => setVisible(false),
    })

    return () => {
      ctx.revert()
      showOnScroll.kill()
    }
  }, [isDark])

  return (
    <div
      ref={containerRef}
      className="fixed top-0 bottom-0 z-[50] flex items-center"
      style={{
        right: '20px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: visible ? 'none' : 'none',
      }}
    >
      <div className="relative flex items-center" style={{ height: '100%' }}>
        <div
          ref={lineRef}
          className="absolute top-0 left-0"
          style={{ width: '1px', height: '100%', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
        >
          <div
            ref={glowRef}
            className="absolute top-0 left-0"
            style={{
              width: '1px',
              height: '0%',
              background: isDark ? '#FFFFFF' : '#000000',
              boxShadow: isDark ? '0 0 8px rgba(255,255,255,0.5), 0 0 16px rgba(255,255,255,0.2)' : '0 0 8px rgba(0,0,0,0.3), 0 0 16px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        <span
          ref={percentRef}
          className="absolute font-mono text-[9px] tracking-[0.15em] whitespace-nowrap"
          style={{
            left: '12px',
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
          }}
        >
          DEP_000%
        </span>
      </div>
    </div>
  )
}
