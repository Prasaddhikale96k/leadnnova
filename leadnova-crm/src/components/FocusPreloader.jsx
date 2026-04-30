'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function FocusPreloader({ onComplete }) {
  const topPanelRef = useRef(null)
  const bottomPanelRef = useRef(null)
  const leadRef = useRef(null)
  const novaRef = useRef(null)
  const scannerRef = useRef(null)
  const subtextRef = useRef(null)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    
    const lead = leadRef.current
    const nova = novaRef.current
    const scanner = scannerRef.current
    const subtext = subtextRef.current
    const topPanel = topPanelRef.current
    const bottomPanel = bottomPanelRef.current

    if (!lead || !nova || !scanner || !subtext || !topPanel || !bottomPanel) return
    
    const tl = gsap.timeline()

    tl.set([lead, nova], { opacity: 0, filter: 'blur(40px)', y: 20 })
    
    tl.to([lead, nova], {
      opacity: 1,
      filter: 'blur(25px)',
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    })

    tl.to([lead, nova], {
      filter: 'blur(0px)',
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.15
    }, '+=0.2')

    tl.to(scanner, {
      scaleX: 1,
      duration: 0.5,
      ease: 'power2.inOut'
    }, '-=0.3')

    tl.to(subtext, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2')

    tl.to({}, { duration: 0.6 })
    tl.call(() => setExiting(true))

    return () => { tl.kill() }
  }, [])

  useEffect(() => {
    if (!exiting) return

    const topPanel = topPanelRef.current
    const bottomPanel = bottomPanelRef.current
    if (!topPanel || !bottomPanel) return

    const exitTl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = 'auto'
        onComplete?.()
      }
    })

    exitTl.to(topPanel, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut'
    })
    exitTl.to(bottomPanel, {
      yPercent: 100,
      duration: 0.8,
      ease: 'power4.inOut'
    }, '<')
    
    exitTl.to('body', {
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power4.inOut'
    }, '<')

    return () => { exitTl.kill() }
  }, [exiting, onComplete])

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      <div ref={topPanelRef} className="absolute inset-x-0 top-0 h-1/2 bg-black z-10" />
      <div ref={bottomPanelRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-black z-10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
          <span ref={leadRef} className="inline-block">Lead</span>
          <span ref={novaRef} className="inline-block">Nova</span>
        </h1>

        <div ref={scannerRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-white/40 origin-left scale-x-0" />

        <div ref={subtextRef} className="mt-8 text-[10px] font-mono tracking-[0.3em] text-white/40 opacity-0 translate-y-2">
          SYSTEM_STATUS:_OPTIMIZED
        </div>
      </div>
    </div>
  )
}
