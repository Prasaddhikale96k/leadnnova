'use client'
import { motion } from 'framer-motion'

export default function GeneratingMailLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Three shimmer bars */}
      <div className="w-full max-w-sm space-y-3">
        {[
          { width: '100%', delay: 0 },
          { width: '75%', delay: 0.15 },
          { width: '60%', delay: 0.3 },
        ].map((bar, i) => (
          <div key={i} className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: bar.width,
                background: 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 25%, #f3f4f6 50%, #d1d5db 75%, #e5e7eb 100%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: bar.delay }}
            />
          </div>
        ))}
      </div>

      {/* Typing dots */}
      <div className="flex items-center gap-1.5 mt-5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">
        AI is researching lead pain points...
      </p>
    </div>
  )
}
