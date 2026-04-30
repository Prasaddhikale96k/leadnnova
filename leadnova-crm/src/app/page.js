'use client'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useInView } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FiArrowRight, FiLoader, FiSearch, FiCheck, FiMail, FiBarChart2, FiUsers, FiSend, FiTarget, FiStar, FiMenu, FiX, FiPlay, FiCpu } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import GhostUI from '@/components/GhostUI'
import GhostLights from '@/components/GhostLights'

gsap.registerPlugin(ScrollTrigger, TextPlugin)

const EASE = [0.16, 1, 0.3, 1]

function getTheme() {
  return {
    bg: '#FFFFFF',
    bgSecondary: '#F7F7F7',
    card: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: 'rgba(0,0,0,0.5)',
    textMuted: 'rgba(0,0,0,0.25)',
    border: 'rgba(0,0,0,0.1)',
    borderHover: 'rgba(0,0,0,0.3)',
    gridLine: 'rgba(0,0,0,0.04)',
    gridGlow: 'rgba(0,0,0,0.15)',
    accent: '#000000',
    accentSoft: 'rgba(0,0,0,0.04)',
    btnPrimary: '#000000',
    btnPrimaryText: '#FFFFFF',
    scanLine: 'rgba(0,0,0,0.1)',
    glowBg: 'rgba(0,0,0,0.03)',
  }
}

function CountUp({ end, duration = 2, prefix = '', suffix = '', theme }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    const obj = { val: 0 }
    gsap.to(obj, { val: end, duration, ease: 'power2.out', onUpdate: () => { ref.current.textContent = prefix + Math.floor(obj.val).toLocaleString() + suffix } })
  }, [inView, end, duration, prefix, suffix])
  return <span ref={ref}>0</span>
}

function NovaPreloader({ onComplete, theme }) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); onComplete?.() }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])
  return (
    <AnimatePresence>
      {loading && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: theme.bg }}>
          <div className="relative overflow-hidden">
            <h1 className="text-[100px] md:text-[160px] font-black tracking-[-0.04em] leading-none select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              <span className="text-transparent" style={{ WebkitTextStroke: `2px ${theme.textMuted}` }}>NOVA</span>
              <motion.span className="absolute inset-0" style={{ clipPath: 'inset(100% 0 0 0)', color: theme.textPrimary }} animate={{ clipPath: 'inset(0% 0 0 0)' }} transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}>NOVA</motion.span>
            </h1>
          </div>
          <motion.p initial={{ letterSpacing: '0.5em', opacity: 0 }} animate={{ letterSpacing: '0.2em', opacity: 1 }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }} className="mt-6 text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.textMuted }}>Initializing Lead Engine</motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MagneticGrid({ theme }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const spacing = 100
    const glowRadius = 200

    const resize = () => { canvas.width = window.innerWidth; canvas.height = document.body.scrollHeight }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY } }
    window.addEventListener('mousemove', handleMouse)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const lineColor = theme.gridLine
      const glowColor = theme.gridGlow

      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath()
        for (let y = 0; y < canvas.height; y += 2) {
          const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2)
          const bow = dist < glowRadius ? Math.sin((1 - dist / glowRadius) * Math.PI) * 8 : 0
          const alpha = dist < glowRadius ? 0.04 + (1 - dist / glowRadius) * 0.12 : 0.04
          ctx.strokeStyle = `rgba(0,0,0,${alpha})`
          if (y === 0) ctx.moveTo(x + bow, y)
          else ctx.lineTo(x + bow, y)
        }
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 2) {
          const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2)
          const bow = dist < glowRadius ? Math.sin((1 - dist / glowRadius) * Math.PI) * 8 : 0
          const alpha = dist < glowRadius ? 0.04 + (1 - dist / glowRadius) * 0.12 : 0.04
          ctx.strokeStyle = `rgba(0,0,0,${alpha})`
          if (x === 0) ctx.moveTo(x, y + bow)
          else ctx.lineTo(x, y + bow)
        }
        ctx.stroke()
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouse) }
  }, [theme])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, height: '100vh' }} />
}

const typewriterPhrases = ['Search for... web designers in London', 'Search for... CTOs in Fintech', 'Search for... Founders in Nashik', 'Search for... SaaS startups in NYC']

function TypewriterPlaceholder({ theme }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    let phraseIndex = 0
    let charIndex = 0
    let deleting = false
    let timeout

    const type = () => {
      const current = typewriterPhrases[phraseIndex]
      if (!deleting) {
        ref.current.textContent = current.substring(0, charIndex + 1)
        charIndex++
        if (charIndex === current.length) {
          timeout = setTimeout(() => { deleting = true; type() }, 2000)
          return
        }
        timeout = setTimeout(type, 60)
      } else {
        ref.current.textContent = current.substring(0, charIndex - 1)
        charIndex--
        if (charIndex === 0) {
          deleting = false
          phraseIndex = (phraseIndex + 1) % typewriterPhrases.length
          timeout = setTimeout(type, 300)
          return
        }
        timeout = setTimeout(type, 30)
      }
    }
    type()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <span ref={ref} className="font-mono text-sm" style={{ color: theme.textMuted }} />
  )
}

function Navbar({ loaded, theme, onSignIn, user, authLoading }) {
  const navRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious()
    if (latest > prev && latest > 150) setVisible(false)
    else setVisible(true)
  })
  useEffect(() => {
    if (!loaded || !navRef.current) return
    gsap.fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 })
  }, [loaded])
  const links = ['Features', 'How It Works', 'Pricing']
  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] hidden md:block" style={{ width: 'max-content' }}>
        <motion.nav ref={navRef} initial={{ y: -100 }} animate={{ y: visible ? 0 : -100 }} transition={{ duration: 0.4, ease: EASE }} className="flex items-center justify-between rounded-full border backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.1)', padding: '0.75rem 2rem', gap: '2rem' }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 font-bold tracking-tight text-sm whitespace-nowrap" style={{ color: theme.textPrimary }}>
            LeadNova <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.textPrimary }} />
          </button>
          <div className="flex items-center gap-6" style={{ color: theme.textSecondary }}>
            {links.map(l => (
              <button key={l} onClick={() => { const el = document.getElementById(l.toLowerCase().replace(/\s+/g, '-')); el?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm font-medium transition-colors whitespace-nowrap" style={{ color: theme.textSecondary }} onMouseEnter={e => e.currentTarget.style.color = theme.textPrimary} onMouseLeave={e => e.currentTarget.style.color = theme.textSecondary}>{l}</button>
            ))}
          </div>
          {user ? (
            <button onClick={() => router.push('/dashboard')} className="px-4 py-1.5 rounded-full text-sm font-bold transition-all hover:scale-105 whitespace-nowrap" style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}>Dashboard</button>
          ) : (
            <button onClick={onSignIn} className="px-4 py-1.5 rounded-full text-sm font-bold transition-all hover:scale-105 whitespace-nowrap" style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}>{authLoading ? 'Connecting...' : 'Try Now'}</button>
          )}
        </motion.nav>
      </div>
      <div className="fixed top-4 left-4 right-4 z-[1000] md:hidden flex items-center justify-between px-4 py-3 rounded-2xl backdrop-blur-2xl border" style={{ background: 'rgba(255,255,255,0.9)', borderColor: theme.border }}>
        <span className="font-bold text-sm" style={{ color: theme.textPrimary }}>LeadNova</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: theme.textPrimary }}><FiMenu className="w-5 h-5" /></button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-16 left-4 right-4 z-[999] p-4 rounded-2xl border md:hidden" style={{ background: 'rgba(255,255,255,0.95)', borderColor: theme.border }}>
            <div className="flex flex-col gap-3">
              {links.map(l => (
                <button key={l} onClick={() => { setMobileOpen(false); const el = document.getElementById(l.toLowerCase().replace(/\s+/g, '-')); el?.scrollIntoView({ behavior: 'smooth' }) }} className="text-left py-2 text-sm font-medium" style={{ color: theme.textSecondary }}>{l}</button>
              ))}
              <button onClick={onSignIn} className="px-4 py-2 rounded-full text-sm font-bold text-center" style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}>Try Now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function HeroSection({ loaded, query, setQuery, isProcessing, handleQuerySubmit, theme, onSignIn }) {
  const containerRef = useRef(null)
  const words = ['Find.', 'Enrich.', 'Close.']
  useEffect(() => {
    if (!loaded) return
    gsap.fromTo('.hero-word', { opacity: 0, y: 60, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.15, duration: 0.8, ease: 'power3.out', delay: 0.4 })
    gsap.fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.9 })
    gsap.fromTo('.hero-search', { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: EASE, delay: 1 })
    gsap.fromTo('.hero-pills', { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out', delay: 1.3 })
  }, [loaded])
  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo('.scan-line', { y: 0, opacity: 0.4 }, { y: '100vh', opacity: 0, duration: 3, repeat: -1, ease: 'none', delay: 2 })
  }, [])
  const suggestions = ['web designers in London', 'CTOs in fintech', 'Verified emails only', 'SaaS founders NYC']
  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20" style={{ background: theme.bg, overflow: 'visible' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: theme.glowBg }} />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: theme.glowBg }} />
        <div className="scan-line absolute left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.scanLine}, transparent)` }} />
      </div>
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
        <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border" style={{ background: theme.accentSoft, borderColor: theme.border }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.textPrimary }} />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.textSecondary }}>SYSTEM_READY · ONLINE</span>
        </motion.div>
        <h1 className="text-[64px] md:text-[96px] font-black leading-[0.9] tracking-[-0.04em] mb-6" style={{ fontFamily: "'Inter', sans-serif", color: theme.textPrimary }}>
          {words.map((w, i) => (
            <span key={i} className="hero-word inline-block mr-4">{w}</span>
          ))}
        </h1>
        <p className="hero-sub text-lg md:text-xl max-w-xl mx-auto mb-10" style={{ color: theme.textSecondary, lineHeight: 1.7 }}>AI-powered lead generation that scrapes, enriches, and sends personalized campaigns at scale.</p>
        <form onSubmit={handleQuerySubmit} className="hero-search group relative mb-6 max-w-2xl mx-auto">
          <div className="relative flex items-center rounded-full border transition-all duration-500" style={{ background: 'transparent', borderColor: theme.border, backdropFilter: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div className="pl-5 pr-2" style={{ color: theme.textMuted }}><FiSearch className="w-5 h-5" /></div>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} className="flex-1 px-2 py-5 bg-transparent text-lg font-medium outline-none" style={{ color: theme.textPrimary }} placeholder="" />
            {!query && <div className="absolute left-14 right-32 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden"><TypewriterPlaceholder theme={theme} /></div>}
            <button type="submit" className="mr-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-[1.02]" style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}>{isProcessing ? <FiLoader className="animate-spin" /> : <span className="flex items-center gap-2">Execute <FiArrowRight className="w-4 h-4" /></span>}</button>
          </div>
        </form>
        <div className="hero-pills flex flex-wrap justify-center gap-2 mb-16">
          {suggestions.map((s, i) => (
            <button key={i} type="button" onClick={() => setQuery(s)} className="px-4 py-2 text-xs rounded-full border transition-all duration-300 hover:scale-105" style={{ borderColor: theme.border, color: theme.textSecondary }}>{s}</button>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustBar({ theme }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.trust-stat'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' })
  }, [inView])
  const logos = ['Stripe', 'Notion', 'Linear', 'Vercel', 'Supabase', 'Apify', 'HubSpot']
  return (
    <section ref={ref} className="py-16 px-6 border-y -mt-[15vh]" style={{ background: theme.bgSecondary, borderColor: theme.border }}>
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs font-mono uppercase tracking-widest mb-8" style={{ color: theme.textMuted }}>Trusted by growth teams at</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10" style={{ opacity: 0.4 }}>
          {logos.map((l, i) => <span key={i} className="text-sm font-bold tracking-wider" style={{ color: theme.textSecondary }}>{l}</span>)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ val: 30000, label: 'Leads/Run', suffix: '+' }, { val: 87, label: 'Email Rate', suffix: '%' }, { val: 700, label: 'Database', suffix: 'M+' }, { val: 100, label: 'AI-Powered', suffix: '%' }].map((s, i) => (
            <div key={i} className="trust-stat text-center p-4">
              <div className="text-3xl md:text-4xl font-black" style={{ color: theme.textPrimary }}><CountUp end={s.val} suffix={s.suffix} theme={theme} /></div>
              <div className="text-[10px] font-mono uppercase tracking-widest mt-2" style={{ color: theme.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks({ theme }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.step-card'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out' })
    gsap.fromTo(ref.current.querySelector('.connector'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, delay: 0.5, ease: 'power3.out' })
  }, [inView])
  const steps = [
    { num: '01', icon: '🔍', title: 'Scrape 10 Verified Leads', desc: 'Enter your niche & location. Our AI queries 700M+ verified contacts via Apify. Up to 87% email coverage.' },
    { num: '02', icon: '🤖', title: 'AI Scores & Enriches', desc: 'AI analyzes company size, revenue, intent signals and ranks leads by conversion probability.' },
    { num: '03', icon: '📨', title: 'Send Campaigns', desc: 'AI writes unique cold emails per lead. Schedule bulk sends, track opens & replies in CRM.' },
  ]
  return (
    <section id="how-it-works" ref={ref} className="py-24 px-6 -mt-[15vh]" style={{ background: theme.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>HOW IT WORKS</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]" style={{ color: theme.textPrimary }}>Three steps to a full pipeline</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="connector absolute top-16 left-[33%] right-[33%] h-px hidden md:block" style={{ background: theme.textPrimary, opacity: 0.15 }} />
          {steps.map((s, i) => (
            <motion.div key={i} className="step-card relative p-8 rounded-2xl border transition-all duration-300" style={{ background: theme.card, borderColor: theme.border }} whileHover={{ y: -4, borderColor: theme.borderHover }}>
              <div className="text-5xl font-mono font-bold mb-6" style={{ color: theme.textMuted, opacity: 0.3 }}>{s.num}</div>
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: theme.textPrimary }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BentoFeatures({ theme }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.bento-card'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' })
  }, [inView])
  return (
    <section id="features" ref={ref} className="py-24 px-6 -mt-[15vh]" style={{ background: theme.bgSecondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>FEATURES</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]" style={{ color: theme.textPrimary }}>Everything you need to scale</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div className="bento-card md:col-span-2 p-8 rounded-2xl border" style={{ background: theme.card, borderColor: theme.border }} whileHover={{ y: -4, borderColor: theme.borderHover }}>
            <div className="text-6xl md:text-7xl font-black mb-2" style={{ color: theme.textPrimary }}>10</div>
            <p className="text-lg mb-4" style={{ color: theme.textSecondary }}>Leads per single run</p>
            <div className="flex gap-1 items-end h-16">
              {[40, 65, 50, 80, 70, 90, 60, 85, 75, 95, 70, 88].map((h, i) => (
                <motion.div key={i} className="flex-1 rounded-t" style={{ background: theme.textPrimary, opacity: 0.15 + (h / 100) * 0.5, height: `${h}%` }} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }} />
              ))}
            </div>
            <span className="inline-block mt-4 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider" style={{ background: theme.accentSoft, color: theme.textSecondary }}>Powered by Apify</span>
          </motion.div>
          <motion.div className="bento-card p-8 rounded-2xl border flex flex-col items-center justify-center" style={{ background: theme.card, borderColor: theme.border }} whileHover={{ y: -4, borderColor: theme.borderHover }}>
            <div className="relative w-28 h-28 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" stroke={theme.accentSoft} strokeWidth="8" fill="none" />
                <motion.circle cx="50" cy="50" r="40" stroke={theme.textPrimary} strokeWidth="8" fill="none" strokeLinecap="round" initial={{ strokeDasharray: 251, strokeDashoffset: 251 }} whileInView={{ strokeDashoffset: 33 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-black" style={{ color: theme.textPrimary }}>87%</div>
            </div>
            <p className="text-sm text-center" style={{ color: theme.textSecondary }}>Email Verification Rate</p>
          </motion.div>
          <motion.div className="bento-card p-8 rounded-2xl border" style={{ background: theme.card, borderColor: theme.border }} whileHover={{ y: -4, borderColor: theme.borderHover }}>
            <div className="flex items-center gap-2 mb-4"><FiBarChart2 style={{ color: theme.textSecondary }} /> <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>AI Scoring Engine</span></div>
            {[{ name: 'CEO Tech', score: 89 }, { name: 'Founder SaaS', score: 73 }, { name: 'VP Sales', score: 67 }].map((l, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-xs mb-1"><span style={{ color: theme.textSecondary }}>{l.name}</span><span style={{ color: theme.textPrimary }}>{l.score}%</span></div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: theme.accentSoft }}>
                  <motion.div className="h-full rounded-full" style={{ background: theme.textPrimary }} initial={{ width: 0 }} whileInView={{ width: `${l.score}%` }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.8 }} />
                </div>
              </div>
            ))}
          </motion.div>
          <motion.div className="bento-card p-8 rounded-2xl border" style={{ background: theme.card, borderColor: theme.border }} whileHover={{ y: -4, borderColor: theme.borderHover }}>
            <div className="flex items-center gap-2 mb-4"><FiUsers style={{ color: theme.textSecondary }} /> <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>Real-time CRM</span></div>
            <div className="flex gap-2 text-center">
              {[{ label: 'New', val: 12 }, { label: 'Contacted', val: 8 }, { label: 'Replied', val: 3 }, { label: 'Closed', val: 1 }].map((s, i) => (
                <div key={i} className="flex-1 p-2 rounded-lg" style={{ background: theme.accentSoft }}>
                  <div className="text-lg font-bold" style={{ color: theme.textPrimary }}><CountUp end={s.val} theme={theme} /></div>
                  <div className="text-[8px] font-mono uppercase" style={{ color: theme.textMuted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="bento-card md:col-span-2 p-8 rounded-2xl border" style={{ background: theme.card, borderColor: theme.border }} whileHover={{ y: -4, borderColor: theme.borderHover }}>
            <div className="flex items-center gap-2 mb-4"><FiMail style={{ color: theme.textSecondary }} /> <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>AI Email Writer</span></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ background: theme.accentSoft }}>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Lead Info</p>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>CTO @ Tech Startup</p>
                <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>Series A · 45 employees · SF</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: theme.accentSoft }}>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>AI Email Preview</p>
                <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>Hey, congrats on the Series A! Saw you're expanding into EU markets...</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: theme.accentSoft, color: theme.textSecondary }}>Regenerate</span>
                  <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: theme.textPrimary, color: theme.bg }}>Send Now</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function AIAnalysis({ theme }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.ai-feature'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out' })
    gsap.fromTo(ref.current.querySelector('.intel-card'), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' })
  }, [inView])
  const features = ['Company growth signals analyzed', 'LinkedIn activity monitoring', 'Hiring intent detection', 'Revenue estimation via AI', 'Department expansion tracking', 'Technology stack detection']
  return (
    <section ref={ref} className="py-24 px-6" style={{ background: theme.bg }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>AI ANALYSIS</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] mb-6" style={{ color: theme.textPrimary }}>AI that reads between the lines</h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: theme.textSecondary }}>Our AI analyzes intent signals, hiring patterns, and company growth to score your leads.</p>
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="ai-feature flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: theme.accentSoft }}><FiCheck className="w-3 h-3" style={{ color: theme.textPrimary }} /></div>
                <span className="text-sm" style={{ color: theme.textSecondary }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="intel-card p-6 rounded-2xl border" style={{ background: theme.card, borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-4"><FiTarget style={{ color: theme.textSecondary }} /> <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>Lead Intelligence</span></div>
          <div className="space-y-3 mb-6">
            {[{ icon: '👤', text: 'Lead Profile' }, { icon: '🏢', text: 'Tech Company Inc' }, { icon: '📈', text: 'Just raised $5M' }, { icon: '🔔', text: 'Hiring 3 SDRs' }, { icon: '🌐', text: 'Visited pricing 3x this week' }].map((d, i) => (
              <motion.div key={i} className="flex items-center gap-3 text-sm" style={{ color: theme.textSecondary }} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.1 }}>{d.icon} {d.text}</motion.div>
            ))}
          </div>
          <div className="p-4 rounded-xl" style={{ background: theme.accentSoft }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>AI Score: 94/100</span>
              <span className="text-sm"></span>
            </div>
            <p className="text-xs" style={{ color: theme.textSecondary }}>"High buying intent"</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function EmailPersonalization({ theme }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const emailRef = useRef(null)
  useEffect(() => {
    if (!inView || !emailRef.current) return
    const text = `Hey,\n\nCongrats on the recent funding! Saw you're expanding into new markets — that's exactly when outbound at scale becomes critical.\n\nWe've helped 3 similar companies in your space add 200+ qualified meetings in 90 days.\n\nWould love to share how.\n\nBest,\nLeadNova Team`
    gsap.to(emailRef.current, { duration: 4, text: text, ease: 'none', delay: 0.5 })
  }, [inView])
  return (
    <section ref={ref} className="py-24 px-6" style={{ background: theme.bgSecondary }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>AI EMAIL WRITER</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] mb-4" style={{ color: theme.textPrimary }}>Cold emails that feel warm</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>AI studies each lead's background, company news, and LinkedIn activity to craft hyper-personalized outreach.</p>
        </div>
        <div className="p-6 rounded-2xl border" style={{ background: theme.card, borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <span className="text-xs" style={{ color: theme.textMuted }}>Generating email for:</span>
            <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>CTO @ Tech Startup</span>
          </div>
          <pre ref={emailRef} className="text-sm leading-relaxed whitespace-pre-wrap font-sans min-h-[180px]" style={{ color: theme.textSecondary }} />
          <span className="inline-block w-2 h-5 animate-pulse" style={{ background: theme.textPrimary }} />
          <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
            {['Copy', 'Edit', 'Send Now', 'Regenerate'].map((a, i) => (
              <button key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105" style={{ borderColor: theme.border, color: theme.textSecondary }}>{a}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
          {[{ val: '3.2x', label: 'Higher Reply Rate' }, { val: '47%', label: 'Open Rate' }, { val: '2min', label: 'Per Email Saved' }].map((s, i) => (
            <div key={i}>
              <div className="text-2xl font-black" style={{ color: theme.textPrimary }}>{s.val}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: theme.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CRMPipeline({ theme }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.kanban-col'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' })
  }, [inView])
  const columns = [{ label: 'NEW', count: 847 }, { label: 'CONTACTED', count: 234 }, { label: 'REPLIED', count: 89 }, { label: 'MEETING', count: 23 }, { label: 'CLOSED', count: 11 }]
  const names = ['Alex Rivera', 'Sam Chen', 'Jordan Lee', 'Morgan Kim', 'Casey Park']
  return (
    <section ref={ref} className="py-24 px-6" style={{ background: theme.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>CRM PIPELINE</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]" style={{ color: theme.textPrimary }}>Your entire pipeline, one place</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {columns.map((col, i) => (
            <div key={i} className="kanban-col p-4 rounded-xl" style={{ background: theme.card }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: theme.textSecondary }}>{col.label}</span>
                <span className="text-xs font-bold" style={{ color: theme.textPrimary }}><CountUp end={col.count} theme={theme} /></span>
              </div>
              <div className="space-y-2">
                {names.slice(0, 2).map((n, j) => (
                  <div key={j} className="p-2 rounded-lg" style={{ background: theme.accentSoft }}>
                    <div className="text-xs font-medium truncate" style={{ color: theme.textPrimary }}>{n}</div>
                    <div className="text-[9px]" style={{ color: theme.textMuted }}>CEO · TechCo</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials({ theme }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.testimonial-card'), { opacity: 0, y: 40, rotation: 1 }, { opacity: 1, y: 0, rotation: 0, stagger: 0.12, duration: 0.7, ease: 'back.out(1.4)' })
  }, [inView])
  const testimonials = [
    { quote: 'LeadNova filled our pipeline in a week. The AI scoring is fire.', name: 'Marcus Johnson', role: 'CEO @ ScaleUp' },
    { quote: 'Went from 0 to 50 meetings in 30 days using the scraper.', name: 'Priya Patel', role: 'Founder @ GrowthLab' },
    { quote: 'The AI emails write themselves. Replies jumped from 2% to 34%.', name: 'David Kim', role: 'Head of Sales @ CloudBase' },
    { quote: 'Best lead gen tool we have ever used. Period.', name: 'Alex Rivera', role: 'VP Marketing @ TechFlow' },
    { quote: 'Saved us 20 hours per week on manual prospecting.', name: 'Morgan Kim', role: 'COO @ TechNova' },
    { quote: 'The email personalization is indistinguishable from human-written.', name: 'Jordan Lee', role: 'CMO @ LaunchPad' },
  ]
  return (
    <section ref={ref} className="py-24 px-6" style={{ background: theme.bgSecondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>SOCIAL PROOF</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]" style={{ color: theme.textPrimary }}>See how <span style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>10K+</span> teams close smarter</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div key={i} className="testimonial-card p-6 rounded-2xl border" style={{ background: theme.card, borderColor: theme.border }} whileHover={{ y: -4, borderColor: theme.borderHover }}>
              <div className="flex gap-0.5 mb-4">{Array(5).fill(0).map((_, j) => <FiStar key={j} className="w-4 h-4" style={{ color: theme.textPrimary }} />)}</div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: theme.textSecondary }}>"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: theme.textPrimary, color: theme.bg }}>{t.name[0]}</div>
                <div>
                  <div className="text-sm font-medium" style={{ color: theme.textPrimary }}>{t.name}</div>
                  <div className="text-xs" style={{ color: theme.textMuted }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing({ theme, onSignIn }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.pricing-card'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out' })
  }, [inView])
  const plans = [
    { name: 'STARTER', price: 'Free', features: ['100 leads', 'Basic filters', '1 campaign'], cta: 'Get Started', popular: false },
    { name: 'GROWTH', price: '$49', period: '/mo', features: ['100 leads/mo', 'All filters', 'AI email writer', 'CRM pipeline', '5 campaigns'], cta: 'Start Trial', popular: true },
    { name: 'ENTERPRISE', price: 'Custom', features: ['10 leads/run', 'Unlimited', 'Full CRM', 'API access', 'Priority support'], cta: 'Contact Sales', popular: false },
  ]
  return (
    <section id="pricing" ref={ref} className="py-24 px-6" style={{ background: theme.bg }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>PRICING</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]" style={{ color: theme.textPrimary }}>Start free. Scale fast.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <motion.div key={i} className={`pricing-card relative p-8 rounded-2xl border transition-all duration-300 ${p.popular ? 'scale-[1.02]' : ''}`} style={{ background: theme.card, borderColor: p.popular ? theme.borderHover : theme.border, boxShadow: p.popular ? `0 0 60px ${theme.accentSoft}` : 'none' }} whileHover={{ y: -4, scale: p.popular ? 1.02 : 1.01 }}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: theme.textPrimary, color: theme.bg }}>Most Popular</div>}
              <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: theme.textMuted }}>{p.name}</div>
              <div className="text-4xl font-black mb-6" style={{ color: theme.textPrimary }}>{p.price}{p.period && <span className="text-lg font-normal" style={{ color: theme.textMuted }}>{p.period}</span>}</div>
              <div className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm"><FiCheck className="w-4 h-4 shrink-0" style={{ color: theme.textPrimary }} /> <span style={{ color: theme.textSecondary }}>{f}</span></div>
                ))}
              </div>
              <button onClick={onSignIn} className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]" style={{ background: p.popular ? theme.textPrimary : theme.accentSoft, color: p.popular ? theme.bg : theme.textPrimary, border: p.popular ? 'none' : `1px solid ${theme.border}` }}>{p.cta}</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA({ theme, onSignIn }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    const tl = gsap.timeline()
    tl.fromTo(ref.current.querySelector('.cta-label'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
    tl.fromTo(ref.current.querySelectorAll('.cta-word'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 }, '-=0.2')
    tl.fromTo(ref.current.querySelector('.cta-sub'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
    tl.fromTo(ref.current.querySelector('.cta-buttons'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
  }, [inView])
  const headlineWords = ['Your', 'next', '1,000', 'customers', 'are', 'already', 'out', 'there.']
  return (
    <section ref={ref} className="relative py-32 px-6 text-center" style={{ background: theme.bg }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(${theme.gridGlow} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="relative z-10 max-w-4xl mx-auto">
        <p className="cta-label text-xs font-mono uppercase tracking-widest mb-6" style={{ color: theme.textMuted }}>READY TO SCALE?</p>
        <h2 className="text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.9] mb-6">
          {headlineWords.map((w, i) => <span key={i} className="cta-word inline-block mr-3" style={{ color: theme.textPrimary }}>{w} </span>)}
        </h2>
        <p className="cta-sub text-lg max-w-xl mx-auto mb-10" style={{ color: theme.textSecondary }}>Let AI find them, enrich them, and write their emails. You just hit send.</p>
        <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onSignIn} className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}>Start Scraping Free <FiArrowRight className="w-5 h-5" /></button>
          <button className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 border transition-all hover:scale-[1.02]" style={{ borderColor: theme.border, color: theme.textPrimary }}><FiPlay className="w-4 h-4" /> Watch Demo</button>
        </div>
        <p className="mt-6 text-xs" style={{ color: theme.textMuted }}>No credit card · 100 free leads · Setup in 2 min</p>
      </div>
    </section>
  )
}

function Footer({ router, theme }) {
  const cols = [{ title: 'Product', links: ['Features', 'Pricing', 'API Docs', 'CRM'] }, { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] }, { title: 'Legal', links: ['Privacy', 'Terms', 'GDPR', 'Cookies'] }, { title: 'Connect', links: ['Twitter', 'LinkedIn', 'GitHub', 'Discord'] }]
  return (
    <footer className="py-16 px-6 border-t" style={{ background: theme.bgSecondary, borderColor: theme.border }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold" style={{ background: theme.textPrimary, color: theme.bg }}>NV</div><span className="text-lg font-bold" style={{ color: theme.textPrimary }}>LeadNova</span></div>
            <p className="text-sm" style={{ color: theme.textSecondary }}>The Agentic Outreach Engine.</p>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>{col.title}</h4>
              <div className="flex flex-col gap-2">
                {col.links.map(l => <button key={l} className="text-sm text-left transition-colors" style={{ color: theme.textSecondary }} onMouseEnter={e => e.currentTarget.style.color = theme.textPrimary} onMouseLeave={e => e.currentTarget.style.color = theme.textSecondary}>{l}</button>)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8" style={{ borderTop: `1px solid ${theme.border}` }}>
          <p className="text-xs" style={{ color: theme.textMuted }}>© 2026 LeadNova · Made with ❤️ for sales teams</p>
          <div className="flex items-center gap-2 mt-2 md:mt-0"><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.textPrimary }} /><span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>All systems operational</span></div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  const theme = getTheme()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getUser()
  }, [supabase])

  const handleSignIn = useCallback(async () => {
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) console.log('Login failed:', error.message)
    setAuthLoading(false)
  }, [supabase])

  const handleQuerySubmit = useCallback((e) => {
    e.preventDefault()
    if (query.trim()) {
      setIsProcessing(true)
      setTimeout(() => { setIsProcessing(false); router.push(`/dashboard?search=${encodeURIComponent(query)}`) }, 1500)
    }
  }, [query, router])

  return (
    <div style={{ background: theme.bg, minHeight: '100vh' }}>
      <NovaPreloader onComplete={() => setLoaded(true)} theme={theme} />
      <GhostUI theme={theme} />
      <GhostLights />
      <Navbar loaded={loaded} theme={theme} onSignIn={handleSignIn} />
      <HeroSection loaded={loaded} query={query} setQuery={setQuery} isProcessing={isProcessing} handleQuerySubmit={handleQuerySubmit} theme={theme} onSignIn={handleSignIn} />
      <TrustBar theme={theme} />
      <HowItWorks theme={theme} />
      <BentoFeatures theme={theme} />
      <AIAnalysis theme={theme} />
      <EmailPersonalization theme={theme} />
      <CRMPipeline theme={theme} />
      <Testimonials theme={theme} />
      <Pricing theme={theme} onSignIn={handleSignIn} />
      <FinalCTA theme={theme} onSignIn={handleSignIn} />
      <Footer router={router} theme={theme} />
    </div>
  )
}
