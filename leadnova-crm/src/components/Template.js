'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

export default function Template({ children }) {
  const pathname = usePathname()
  const [showPreloader, setShowPreloader] = useState(false)

  useEffect(() => {
    setShowPreloader(true)
    const timer = setTimeout(() => setShowPreloader(false), 1200)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <AnimatePresence mode="wait">
        {showPreloader && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: '-100%' }}
            exitTransition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
          >
            <div className="relative overflow-hidden">
              <h1 className="text-[100px] md:text-[140px] font-black tracking-tighter leading-none select-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>NOVA</span>
                <motion.span className="absolute inset-0 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(0% 0 0 0)' }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>NOVA</motion.span>
              </h1>
            </div>
            <motion.div className="mt-6 w-32 h-[1px] bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-white/60" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  )
}
