'use client'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function StaggeredCharReveal({ children, className = '', as: Tag = 'h2', delay = 0.02 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      const chars = container.querySelectorAll('.char')

      gsap.set(chars, { y: '110%', opacity: 0, rotateX: -40 })

      gsap.to(chars, {
        y: '0%',
        opacity: 1,
        rotateX: 0,
        duration: 0.8,
        stagger: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [delay])

  const renderChildren = (child) => {
    if (typeof child === 'string') {
      return child.split('').map((char, i) => (
        <span key={i} className="char inline-block" style={{ willChange: 'transform, opacity' }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))
    }
    if (child && typeof child === 'object' && child.type) {
      return child
    }
    return child
  }

  const content = Array.isArray(children)
    ? children.flatMap((child, idx) => {
        if (typeof child === 'string') {
          const lines = child.split('\n')
          return lines.flatMap((line, lineIdx) => {
            const chars = line.split('').map((char, i) => (
              <span key={`${idx}-${lineIdx}-${i}`} className="char inline-block" style={{ willChange: 'transform, opacity' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))
            if (lineIdx < lines.length - 1) {
              return [...chars, <br key={`br-${idx}-${lineIdx}`} />]
            }
            return chars
          })
        }
        return <span key={idx}>{child}</span>
      })
    : renderChildren(children)

  return (
    <Tag ref={containerRef} className={className} style={{ overflow: 'hidden' }}>
      {content}
    </Tag>
  )
}
