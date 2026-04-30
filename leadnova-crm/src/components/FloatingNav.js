'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { FiUser } from 'react-icons/fi'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/outreach', label: 'Outreach' },
  { href: '/dashboard/analytics', label: 'Analytics' },
]

export default function FloatingNav({ profile, onLogout }) {
  const router = useRouter()
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)'])
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)'])
  const navShadow = useTransform(scrollY, [0, 80], ['0 0 0 rgba(0,0,0,0)', '0 2px 12px rgba(0,0,0,0.04)'])

  return (
    <motion.nav
      style={{
        backgroundColor: navBg,
        borderColor: navBorder,
        boxShadow: navShadow,
      }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 md:px-6 py-3 border transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-4 md:gap-8">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-black flex items-center justify-center text-white text-[10px] font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NV</div>
          <span className="text-sm font-bold tracking-tight text-black hidden sm:block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>LeadNova</span>
        </button>

        <div className="hidden md:flex items-center gap-6 text-xs text-gray-500">
          {navLinks.map(link => {
            const active = pathname === link.href
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`font-medium transition-colors ${
                  active ? 'text-black' : 'hover:text-black'
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 flex items-center justify-center text-gray-500">
              <FiUser className="text-xs" />
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[100px]">{profile?.full_name || 'User'}</span>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-gray-400 hover:text-black transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
