'use client'
import { motion } from 'framer-motion'

export default function NovaPreloader({ isLoading = true, progress = 0 }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      {/* Radial grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl"
      />

      {/* NOVA text with shimmer */}
      <motion.div
        animate={{ scale: isLoading ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <h1 className="text-6xl md:text-8xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-indigo-400 to-gray-100"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            backgroundSize: '200% 100%',
            animation: 'shimmer 2.5s linear infinite',
            textShadow: isLoading ? '0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.1)' : 'none',
          }}
        >
          NOVA
        </h1>

        {/* Light streak overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'streak 2s ease-in-out infinite',
            mixBlendMode: 'overlay',
          }}
        />
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-[10px] uppercase tracking-[0.4em] text-gray-500 font-medium"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        AI Lead Generation
      </motion.p>

      {/* Ultra-thin progress bar */}
      <div className="mt-8 w-48 h-[1px] bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #6366F1, #818CF8, #6366F1)',
            boxShadow: '0 0 10px rgba(99,102,241,0.5)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
