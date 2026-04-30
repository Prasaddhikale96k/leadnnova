'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export const magneticEffect = (element, strength = 0.3) => {
  if (!element) return
  const handleMouseMove = (e) => {
    const rect = element.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(element, { x: x * strength, y: y * strength, duration: 0.3, ease: 'power2.out' })
  }
  const handleMouseLeave = () => {
    gsap.to(element, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
  }
  element.addEventListener('mousemove', handleMouseMove)
  element.addEventListener('mouseleave', handleMouseLeave)
  return () => {
    element.removeEventListener('mousemove', handleMouseMove)
    element.removeEventListener('mouseleave', handleMouseLeave)
  }
}

export const rippleEffect = (element, e) => {
  if (!element) return
  const ripple = document.createElement('span')
  const rect = element.getBoundingClientRect()
  ripple.style.cssText = `
    position: absolute; width: 20px; height: 20px; border-radius: 50%;
    background: currentColor; opacity: 0.3; pointer-events: none;
    left: ${e.clientX - rect.left - 10}px; top: ${e.clientY - rect.top - 10}px;
  `
  element.appendChild(ripple)
  gsap.to(ripple, {
    width: Math.max(rect.width, rect.height) * 2,
    height: Math.max(rect.width, rect.height) * 2,
    opacity: 0, duration: 0.6, ease: 'power2.out',
    onComplete: () => ripple.remove()
  })
}

export const glitchText = (element, duration = 0.3) => {
  if (!element) return
  const original = element.textContent
  const chars = '!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let iterations = 0
  const maxIterations = 20
  const interval = setInterval(() => {
    element.textContent = original.split('').map((char, index) => {
      if (index < iterations) return original[index]
      return chars[Math.floor(Math.random() * chars.length)]
    }).join('')
    iterations += 1
    if (iterations > maxIterations) { clearInterval(interval); element.textContent = original }
  }, duration * 1000 / maxIterations)
}

export const parallaxElement = (element, speed = 0.5, direction = 'down') => {
  if (!element) return
  gsap.to(element, {
    y: direction === 'down' ? `${speed * 100}%` : `-${speed * 100}%`,
    ease: 'none',
    scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 1 }
  })
}

export const scrambleReveal = (element) => {
  if (!element) return
  const originalText = element.textContent
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  gsap.to(element, {
    scrollTrigger: {
      trigger: element, start: 'top 80%',
      onEnter: () => {
        let iterations = 0
        const interval = setInterval(() => {
          element.textContent = originalText.split('').map((char, index) => {
            if (index < iterations || char === ' ') return originalText[index]
            return chars[Math.floor(Math.random() * chars.length)]
          }).join('')
          iterations += 1 / 3
          if (iterations >= originalText.length) { clearInterval(interval); element.textContent = originalText }
        }, 30)
      }
    }
  })
}
