'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
      {/* Animated background dots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-orange-400"
            style={{ top: `${15 + i * 15}%`, left: `${10 + i * 15}%` }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        {/* Header with Spinner */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-4xl"
            >
              🔍
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">Finding Indian Leads</h2>
          </div>
          <p className="text-gray-600">Scraping Google Maps for businesses...</p>
        </div>

        {/* Pulsing Progress Bar */}
        <div className="relative h-3 rounded-full overflow-hidden bg-gray-200 mb-8">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #FF6B35 0%, #FF8C42 50%, #138808 100%)'
            }}
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-4 text-center border border-gray-200"
            >
              <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded mx-auto animate-pulse" />
            </motion.div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Table Header Skeleton */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="px-6 py-4"
              >
                <div className="flex gap-4">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            ⏱️ <strong>Scraping in progress...</strong> this may take 2-3 minutes
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Our scraper is clicking through Google Maps and extracting business details
          </p>
        </motion.div>
      </div>
    </div>
  )
}
