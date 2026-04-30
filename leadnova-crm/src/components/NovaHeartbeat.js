'use client'
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useTheme } from '@/context/ThemeContext'

const statusLogs = [
  'SYSTEM_READY_04.04.26',
  'SYNCING_GLOBAL_LEAD_DB...',
  'AI_AGENT_ACTIVE: NASHIK_NODE',
  'OUTREACH_ENGINE: ONLINE',
  'SMTP_HANDSHAKE: SECURE',
  'LEAD_SCORE: OPTIMIZED',
  'ENRICHING_DATABASE_72%',
  'GEMINI_API: CONNECTED',
]

const circularPattern = [0, 1, 2, 5, 8, 7, 6, 3]

export default function NovaHeartbeat() {
  const { isDark } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const dotRefs = useRef([])
  const textRef = useRef(null)
  const tlRef = useRef(null)
  const glitchTlRef = useRef(null)

  useEffect(() => {
    if (tlRef.current) tlRef.current.kill()

    const tl = gsap.timeline({ repeat: -1 })

    circularPattern.forEach((idx, i) => {
      const dot = dotRefs.current[idx]
      if (dot) {
        tl.to(dot, {
          scale: 1,
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out',
        }, i * 0.08)
        tl.to(dot, {
          scale: 0.3,
          opacity: 0.2,
          duration: 0.4,
          ease: 'power2.inOut',
        }, i * 0.08 + 0.15)
      }
    })

    tlRef.current = tl
  }, [isDark])

  useEffect(() => {
    const dots = dotRefs.current.filter(Boolean)
    if (dots.length === 0) return

    if (isHovered) {
      if (tlRef.current) tlRef.current.pause()

      dots.forEach((dot) => {
        gsap.to(dot, {
          x: (Math.random() - 0.5) * 12,
          y: (Math.random() - 0.5) * 12,
          scale: gsap.utils.random(0.5, 1.2),
          opacity: gsap.utils.random(0.3, 1),
          duration: 0.3,
          ease: 'power3.out',
        })
      })
    } else {
      if (tlRef.current) tlRef.current.resume()

      dots.forEach((dot) => {
        gsap.to(dot, {
          x: 0,
          y: 0,
          scale: 0.3,
          opacity: 0.2,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        })
      })
    }
  }, [isHovered])

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      if (textRef.current) {
        const glitchTl = gsap.timeline({
          onComplete: () => {
            idx = (idx + 1) % statusLogs.length
            textRef.current.textContent = statusLogs[idx]
          }
        })

        glitchTl
          .to(textRef.current, { opacity: 0.1, x: -3, skewX: -5, duration: 0.04 })
          .to(textRef.current, { opacity: 0.8, x: 2, skewX: 3, duration: 0.04 })
          .to(textRef.current, { opacity: 0.2, x: -1, skewX: -2, duration: 0.04 })
          .to(textRef.current, { opacity: 1, x: 0, skewX: 0, duration: 0.15, ease: 'power2.out' })

        glitchTlRef.current = glitchTl
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const dotRestColor = isDark ? '#D1D5DB' : '#D1D5DB'

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-6 h-6 grid grid-cols-3 grid-rows-3 gap-0.5 place-items-center">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            ref={el => { dotRefs.current[i] = el }}
            className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
            style={{
              transformOrigin: 'center',
              opacity: 0.2,
              scale: 0.3,
              backgroundColor: dotRestColor,
            }}
          />
        ))}
      </div>

      <div className="overflow-hidden h-3">
        <span
          ref={textRef}
          className="text-[7px] font-mono tracking-wider whitespace-nowrap block transition-colors duration-500"
          style={{
            fontFamily: "'Space Grotesk', monospace",
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          }}
        >
          {statusLogs[0]}
        </span>
      </div>
    </div>
  )
}
