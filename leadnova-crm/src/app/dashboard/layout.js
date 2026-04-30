'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FiHome, FiUsers, FiMail, FiBarChart2, FiSettings, FiMapPin, FiUpload } from 'react-icons/fi'
import MorphingNav from '@/components/MorphingNav'

const nav = [
  { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { href: '/dashboard/leads', icon: FiUsers, label: 'Leads' },
  { href: '/dashboard/indian-leads', icon: FiMapPin, label: 'Indian' },
  { href: '/dashboard/custom-import', icon: FiUpload, label: 'Import' },
  { href: '/dashboard/outreach', icon: FiMail, label: 'Outreach' },
  { href: '/dashboard/analytics', icon: FiBarChart2, label: 'Analytics' },
  { href: '/dashboard/settings', icon: FiSettings, label: 'Settings' },
]

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user || null
        if (cancelled) return
        if (!user) {
          router.push('/')
          return
        }
        setUser(user)
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (!cancelled && data) setProfile(data)
      } catch (err) {
        console.error('Auth error:', err)
        if (!cancelled) router.push('/')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    checkAuth()

    return () => { cancelled = true }
  }, [router])

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF', color: '#000000' }}>
      <MorphingNav userName={profile?.full_name || 'User'} />

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-1" style={{ background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-around">
          {nav.map(item => {
            const active = path === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center gap-0.5 py-1 px-3 transition-colors"
                style={{ color: active ? '#000000' : 'rgba(0,0,0,0.35)' }}
              >
                <item.icon className="text-lg" />
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {children}
        </div>
      </main>
    </div>
  )
}
