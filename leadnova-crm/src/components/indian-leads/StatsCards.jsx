'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { FiUsers, FiMail, FiStar, FiGlobe } from 'react-icons/fi'

export default function StatsCards({ leads }) {
  const containerRef = useRef(null)
  
  const stats = {
    totalLeads: leads.length,
    withEmail: leads.filter(l => l.email).length,
    avgRating: leads.length > 0 
      ? leads.reduce((acc, l) => acc + (l.rating || 0), 0) / leads.filter(l => l.rating).length 
      : 0,
    withWebsite: leads.filter(l => l.website).length
  }

  const cards = [
    { 
      label: 'Total Leads', 
      value: stats.totalLeads, 
      subtext: `↑ ${leads[0]?.city || 'Mumbai'}`,
      icon: FiUsers,
      color: '#FF6B35',
      borderColor: '#FF6B35'
    },
    { 
      label: 'Have Email', 
      value: stats.withEmail, 
      subtext: `${stats.totalLeads > 0 ? Math.round((stats.withEmail / stats.totalLeads) * 100) : 0}% rate`,
      icon: FiMail,
      color: '#138808',
      borderColor: '#138808'
    },
    { 
      label: 'Avg Rating', 
      value: stats.avgRating.toFixed(1), 
      subtext: 'of 5.0',
      icon: FiStar,
      color: '#000080',
      borderColor: '#000080'
    },
    { 
      label: 'Have Website', 
      value: stats.withWebsite, 
      subtext: `${stats.totalLeads > 0 ? Math.round((stats.withWebsite / stats.totalLeads) * 100) : 0}% rate`,
      icon: FiGlobe,
      color: '#7C3AED',
      borderColor: '#7C3AED'
    }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        const el = document.querySelector(`#stat-value-${i}`)
        if (el) {
          gsap.fromTo(el,
            { innerText: 0 },
            {
              innerText: card.value,
              duration: 2,
              ease: 'power2.out',
              snap: { innerText: card.label === 'Avg Rating' ? 0.1 : 1 },
              scrollTrigger: {
                trigger: `.stat-card-${i}`,
                start: 'top 80%'
              }
            }
          )
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay: i * 0.1
          }}
          whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
          className={`stat-card-${i} bg-white rounded-xl p-4 relative overflow-hidden`}
          style={{ 
            borderTop: `2px solid ${card.borderColor}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
              {card.label}
            </span>
            <card.icon className="text-lg" style={{ color: card.color }} />
          </div>
          <div className="flex items-baseline gap-1">
            <span 
              id={`stat-value-${i}`}
              className="text-3xl font-bold font-mono"
              style={{ color: '#0A0A0A' }}
            >
              {card.value}
            </span>
          </div>
          <span className="text-xs" style={{ color: '#6B7280' }}>
            {card.subtext}
          </span>
        </motion.div>
      ))}
    </div>
  )
}