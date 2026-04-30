'use client'
import { motion, AnimatePresence } from 'framer-motion'

export default function SendingBulkLoader({ current = 0, total = 0, sending = false }) {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <AnimatePresence>
      {sending && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[9999]"
        >
          {/* Thin progress line */}
          <div className="h-[2px] bg-gray-100 w-full overflow-hidden">
            <motion.div
              className="h-full bg-black"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Pulsing glow effect */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />

          {/* Floating status pill */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-lg flex items-center gap-3"
          >
            {/* Paper plane icon */}
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.div>
            <span className="text-xs font-medium text-gray-700">
              Sending <span className="font-bold text-black">{current}</span> of <span className="font-bold text-black">{total}</span>
            </span>
            <div className="w-16 h-[2px] bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-black rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
