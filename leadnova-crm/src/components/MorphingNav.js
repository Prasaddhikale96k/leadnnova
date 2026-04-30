'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
]

const authLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/indian-leads', label: 'Indian Leads', badge: '🇮🇳' },
  { href: '/dashboard/outreach', label: 'Outreach' },
  { href: '/dashboard/analytics', label: 'Analytics' },
]

function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function MorphingNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    gsap.fromTo(nav, { yPercent: -150 }, { yPercent: 0, duration: 0.8, ease: 'back.out(1.4)', delay: 0.2 })

    let lastScrollY = 0
    let ticking = false

    const scrollHandler = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          gsap.to(nav, { yPercent: -150, duration: 0.3, ease: 'power2.inOut' })
        } else {
          gsap.to(nav, { yPercent: 0, duration: 0.3, ease: 'power2.out' })
        }
        lastScrollY = currentScrollY
        ticking = false
      })
    }

    window.addEventListener('scroll', scrollHandler, { passive: true })
    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        supabase.from('profiles').select('*').eq('id', u.id).single().then(({ data }) => {
          if (data) setProfile(data)
        })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) setProfile(data)
        })
      } else {
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('[data-profile-dropdown]')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  const links = user ? authLinks : publicLinks

  return (
    <div ref={navRef} className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] hidden md:block" style={{ width: 'max-content' }}>
      <nav className="flex items-center justify-between rounded-full border backdrop-blur-xl"
        style={{
          background: 'rgba(255,255,255,0.6)',
          borderColor: 'rgba(0,0,0,0.1)',
          padding: '0.75rem 2rem',
          gap: '2rem',
        }}
      >
        <button onClick={() => router.push(user ? '/dashboard' : '/')} className="text-[15px] font-bold tracking-tight whitespace-nowrap shrink-0"
          style={{ color: '#000000' }}>
          LeadNova
        </button>

        <div className="flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className="text-[14px] font-medium whitespace-nowrap transition-colors duration-150 flex items-center gap-1.5"
                style={{
                  color: isActive ? '#000000' : 'rgba(0,0,0,0.35)',
                  fontWeight: isActive ? 700 : 500,
                }}
                onMouseEnter={(e) => { if (!isActive) e.target.style.color = '#000000' }}
                onMouseLeave={(e) => { if (!isActive) e.target.style.color = 'rgba(0,0,0,0.35)' }}
              >
                {link.badge && <span>{link.badge}</span>}
                {link.label}
                {link.href === '/dashboard/indian-leads' && (
                  <span className="ml-1 text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">NEW</span>
                )}
              </button>
            )
          })}
        </div>

        {user ? (
          <div className="relative shrink-0" data-profile-dropdown>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-500"
              style={{
                background: '#000000',
                color: '#FFFFFF',
                border: '1px solid #000000',
              }}
            >
              {getInitials(profile?.full_name)}
            </button>

            {dropdownOpen && (
              <div className="absolute top-11 right-0 w-48 rounded-xl shadow-2xl py-1.5"
                style={{
                  background: '#F9F9F9',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <button
                  onClick={() => { setDropdownOpen(false); router.push('/dashboard/settings') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(0,0,0,0.02)'; e.target.style.color = '#000000' }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#6B7280' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Settings
                </button>
                <div className="h-px mx-2" style={{ background: 'rgba(0,0,0,0.1)' }} />
                <button
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    router.push('/')
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'rgba(0,0,0,0.35)' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(0,0,0,0.02)'; e.target.style.color = '#000000' }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(0,0,0,0.35)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={handleLogin} className="text-[14px] font-medium px-5 py-2.5 rounded-full transition-colors duration-150 whitespace-nowrap shrink-0"
            style={{ background: '#000000', color: '#FFFFFF' }}>
            Try Now
          </button>
        )}
      </nav>
    </div>
  )
}
