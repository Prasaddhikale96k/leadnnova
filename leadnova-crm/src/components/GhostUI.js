'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function GhostUI({ theme }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ghosts = el.querySelectorAll('.ghost-el')
    ghosts.forEach((g, i) => {
      gsap.to(g, {
        y: () => (i % 2 === 0 ? -30 : 30),
        x: () => (i % 2 === 0 ? 15 : -15),
        duration: 3 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3,
      })
    })

    const handleScroll = () => {
      const scrollY = window.scrollY
      ghosts.forEach((g, i) => {
        const speed = 0.02 + i * 0.01
        gsap.set(g, { y: -scrollY * speed })
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isDark = theme.bg === '#000000'
  const ghostColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const lineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {/* Ghost line chart */}
      <div className="ghost-el absolute top-[15%] left-[8%] w-48 h-32" style={{ opacity: 0.04 }}>
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <polyline points="0,100 30,80 60,90 90,40 120,60 150,20 180,50 200,30" fill="none" stroke={lineColor} strokeWidth="1" />
          <circle cx="90" cy="40" r="3" fill={ghostColor} />
          <circle cx="150" cy="20" r="3" fill={ghostColor} />
        </svg>
      </div>

      {/* Ghost circular progress */}
      <div className="ghost-el absolute top-[30%] right-[10%] w-24 h-24" style={{ opacity: 0.04 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke={lineColor} strokeWidth="2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={ghostColor} strokeWidth="2" strokeDasharray="180 251" strokeLinecap="round" />
        </svg>
      </div>

      {/* Ghost data ticker */}
      <div className="ghost-el absolute bottom-[20%] left-[12%] px-3 py-2 rounded" style={{ opacity: 0.04 }}>
        <span className="text-[9px] font-mono tracking-wider" style={{ color: textColor }}>[SCRAPING...]</span>
      </div>

      {/* Ghost data ticker 2 */}
      <div className="ghost-el absolute top-[60%] right-[8%] px-3 py-2 rounded" style={{ opacity: 0.04 }}>
        <span className="text-[9px] font-mono tracking-wider" style={{ color: textColor }}>[ENRICHING...]</span>
      </div>

      {/* Ghost bar chart */}
      <div className="ghost-el absolute bottom-[35%] right-[15%] w-32 h-20" style={{ opacity: 0.04 }}>
        <svg viewBox="0 0 130 80" className="w-full h-full">
          {[10, 25, 40, 55, 70, 85, 100].map((x, i) => (
            <rect key={i} x={x} y={60 - i * 8} width="12" height={8 + i * 8} fill={ghostColor} rx="1" />
          ))}
        </svg>
      </div>

      {/* Ghost ring */}
      <div className="ghost-el absolute top-[75%] left-[20%] w-16 h-16" style={{ opacity: 0.03 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke={lineColor} strokeWidth="1" strokeDasharray="4 8" />
        </svg>
      </div>

      {/* Ghost data ticker 3 */}
      <div className="ghost-el absolute top-[10%] right-[25%] px-3 py-2 rounded" style={{ opacity: 0.04 }}>
        <span className="text-[9px] font-mono tracking-wider" style={{ color: textColor }}>[ANALYZING...]</span>
      </div>
    </div>
  )
}
