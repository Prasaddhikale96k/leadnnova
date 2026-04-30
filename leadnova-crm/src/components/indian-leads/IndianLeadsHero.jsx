'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

const ChakraSVG = () => (
  <svg viewBox="0 0 100 100" className="w-32 h-32 opacity-10">
    <circle cx="50" cy="50" r="45" fill="none" stroke="#000080" strokeWidth="2" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="#000080" strokeWidth="1" />
    {[...Array(24)].map((_, i) => (
      <line
        key={i}
        x1="50"
        y1="50"
        x2="50"
        y2="15"
        stroke="#000080"
        strokeWidth="1.5"
        transform={`rotate(${i * 15} 50 50)`}
      />
    ))}
  </svg>
)

export default function IndianLeadsHero() {
  const containerRef = useRef(null)
  const headingRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-label', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2 }
      )
      
      gsap.fromTo('.hero-heading-char', 
        { y: 60, opacity: 0, rotateX: -90 },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0, 
          stagger: 0.03, 
          duration: 0.8, 
          delay: 0.4,
          ease: 'back.out(1.7)'
        }
      )
      
      gsap.fromTo('.hero-subtext', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.8 }
      )
      
      gsap.fromTo('.hero-stat', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 1 }
      )

      gsap.to('.ashoka-chakra', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const headingText = 'Find Indian Businesses'
  const chars = headingText.split('')

  const stats = [
    { label: 'searches/month', value: '200+', note: '(free)' },
    { label: 'data points', value: '50+' },
    { label: 'GitHub stars', value: '2400+', note: 'scraper repo' }
  ]

  return (
    <div ref={containerRef} className="relative py-16 md:py-24 px-4">
      {/* Ashoka Chakra Decorative */}
      <div className="absolute top-8 right-8 md:top-16 md:right-16 ashoka-chakra">
        <ChakraSVG />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Label */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-label mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(19,136,8,0.1) 100%)',
              color: '#0A0A0A',
              border: '1px solid rgba(255,107,53,0.3)'
            }}>
            🇮🇳 INDIA LEAD EXTRACTION
          </span>
        </motion.div>

        {/* Main Heading with split animation */}
        <h1 ref={headingRef} className="hero-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight" style={{ color: '#0A0A0A' }}>
          {chars.map((char, i) => (
            <span 
              key={i} 
              className="hero-heading-char inline-block"
              style={{ 
                display: char === ' ' ? 'inline' : 'inline-block',
                width: char === ' ' ? '0.3em' : 'auto'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="hero-subtext text-base md:text-lg mb-10"
          style={{ color: '#6B7280' }}
        >
          Powered by Google Maps Scraper · Real-time data · Supabase sync
        </motion.p>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
              className="hero-stat flex items-center gap-3 px-4 py-2 rounded-lg"
              style={{ 
                background: '#FFFFFF',
                borderLeft: '3px solid #FF6B35',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <span className="text-2xl md:text-3xl font-bold font-mono" style={{ color: '#0A0A0A' }}>
                {stat.value}
              </span>
              <div className="text-left">
                <span className="block text-xs font-medium" style={{ color: '#0A0A0A' }}>
                  {stat.label}
                </span>
                {stat.note && (
                  <span className="block text-[10px]" style={{ color: '#6B7280' }}>
                    {stat.note}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}