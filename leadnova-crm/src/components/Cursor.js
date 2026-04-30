'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const dotPos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const dotAnim = useRef(null)
  const ringAnim = useRef(null)
  const isHovering = useRef(false)

  useEffect(() => {
    dotAnim.current = gsap.quickTo(dotRef.current, 'x,y', { duration: 0.1, ease: 'power2.out' })
    ringAnim.current = gsap.quickTo(ringRef.current, 'x,y', { duration: 0.35, ease: 'power2.out' })

    const move = (e) => {
      dotPos.current = { x: e.clientX, y: e.clientY }
      ringPos.current = { x: e.clientX, y: e.clientY }
      dotAnim.current(e.clientX, e.clientY)
      ringAnim.current(e.clientX, e.clientY)
    }

    const handleHoverIn = (e) => {
      isHovering.current = true
      gsap.to(dotRef.current, { scale: 0, duration: 0.2 })
      gsap.to(ringRef.current, { scale: 2.5, borderColor: 'rgba(255,255,255,0.3)', duration: 0.3 })
    }

    const handleHoverOut = () => {
      isHovering.current = false
      gsap.to(dotRef.current, { scale: 1, duration: 0.2 })
      gsap.to(ringRef.current, { scale: 1, borderColor: 'rgba(255,255,255,0.15)', duration: 0.3 })
    }

    window.addEventListener('mousemove', move)

    const interactives = document.querySelectorAll('button, a, input, textarea, [data-cursor-hover]')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', handleHoverIn)
      el.addEventListener('mouseleave', handleHoverOut)
    })

    const observer = new MutationObserver(() => {
      document.querySelectorAll('button, a, input, textarea, [data-cursor-hover]').forEach(el => {
        if (!el.dataset.cursorBound) {
          el.dataset.cursorBound = 'true'
          el.addEventListener('mouseenter', handleHoverIn)
          el.addEventListener('mouseleave', handleHoverOut)
        }
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', move)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] mix-blend-difference"
        style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[99998] mix-blend-difference"
        style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', transform: 'translate(-50%, -50%)' }}
      />
    </>
  )
}
