'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 md:w-64 md:h-64" style={{ filter: 'drop-shadow(0 0 20px rgba(193, 255, 114, 0.4))' }}>
      <path 
        d="M21.4399 2.58002L3.10986 10.43C1.86986 10.96 1.87986 12.66 3.13986 13.17L8.03986 15.13L10.0099 20.03C10.5199 21.29 12.2199 21.31 12.7499 20.07L20.5999 1.73002C21.1299 0.49002 19.6199 -1.02998 18.3799 -0.49998L21.4399 2.58002Z" 
        fill="white"
      />
      <path 
        d="M8.03986 15.13L21.4399 2.58002L10.0099 20.03L12.4499 13.94L8.03986 15.13Z" 
        fill="#C1FF72"
        fillOpacity="0.5"
      />
    </svg>
  )
}

export default function BulkSendCinematic({ total = 0, current = 0, leadName = '', onComplete }) {
  const router = useRouter()
  const isComplete = current >= total && total > 0

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onComplete?.()
        router.push('/dashboard/outreach')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, onComplete, router])

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] overflow-hidden flex flex-col items-center justify-center">
      {/* Massive background counter */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <span className="text-[30vw] md:text-[40vw] font-black text-[#111111] leading-none tracking-tighter">
          {String(current).padStart(2, '0')}
        </span>
      </div>

      {/* Paper Plane Flight */}
      <AnimatePresence>
        {current > 0 && current <= total && (
          <motion.div
            key={current}
            className="absolute inset-0 pointer-events-none"
            initial={{ bottom: '-20%', left: '-20%', opacity: 0, rotate: -45 }}
            animate={{
              bottom: ['-20%', '120%'],
              left: ['-20%', '120%'],
              opacity: [0, 1, 1, 0],
              rotate: [-45, -35],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeIn',
              opacity: {
                times: [0, 0.1, 0.8, 1],
              },
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <PaperPlaneIcon />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status text - bottom center */}
      <div className="absolute bottom-12 md:bottom-16 text-center px-6">
        <motion.p
          key={leadName}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm md:text-base font-medium text-gray-500"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Dispatching outreach to: <span className="text-gray-300">{leadName || '...'}</span>
        </motion.p>
        <p className="text-[10px] text-gray-700 uppercase tracking-[0.25em] mt-2 font-mono">
          {current} of {total} sent
        </p>
      </div>
    </div>
  )
}
