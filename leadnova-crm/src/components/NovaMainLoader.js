'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function NovaMainLoader({ onComplete }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); onComplete?.() }, 2800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          <div className="relative overflow-hidden">
            <h1
              className="text-[120px] md:text-[180px] font-black tracking-tighter leading-none select-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>
                NOVA
              </span>
              <motion.span
                className="absolute inset-0 text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif", clipPath: 'inset(100% 0 0 0)' }}
                animate={{ clipPath: 'inset(0% 0 0 0)' }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              >
                NOVA
              </motion.span>
            </h1>
          </div>

          <motion.p
            initial={{ letterSpacing: '0.5em', opacity: 0 }}
            animate={{ letterSpacing: '0.3em', opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.8 }}
            className="mt-8 text-[10px] md:text-xs font-mono text-white/30 uppercase tracking-widest"
          >
            Igniting Lead Engine
          </motion.p>

          <motion.div className="mt-6 w-48 h-[1px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/60"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.8, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
