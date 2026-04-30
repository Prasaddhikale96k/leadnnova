'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, MapPin, Phone, Mail, Star, Database,
  Terminal, Search, Activity, CheckCircle2
} from 'lucide-react'

// Animated Counter Component
function AnimatedCounter({ value, duration = 0.8 }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue
    const diff = value - startValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(startValue + diff * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{displayValue > 0 ? displayValue : '—'}</span>
}

// Typewriter Log Entry
function TypewriterLog({ log, delay = 0 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-2 font-mono text-xs ${log.type === 'success' ? 'text-emerald-600' :
        log.type === 'error' ? 'text-red-600' :
          'text-slate-600'
        }`}
    >
      <span className="text-slate-400 shrink-0">[{log.time}]</span>
      <span>{log.message}</span>
    </motion.div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, isActive, delay = 0 }) {
  const colorClasses = {
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', borderHover: 'hover:border-orange-400', icon: 'text-orange-500', activeBg: 'bg-orange-100' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', borderHover: 'hover:border-blue-400', icon: 'text-blue-500', activeBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', border: 'border-green-200', borderHover: 'hover:border-green-400', icon: 'text-green-500', activeBg: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', borderHover: 'hover:border-purple-400', icon: 'text-purple-500', activeBg: 'bg-purple-100' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', borderHover: 'hover:border-yellow-400', icon: 'text-yellow-600', activeBg: 'bg-yellow-100' },
    red: { bg: 'bg-red-50', border: 'border-red-200', borderHover: 'hover:border-red-400', icon: 'text-red-500', activeBg: 'bg-red-100' },
  }

  const colors = colorClasses[color] || colorClasses.orange

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={`relative p-4 rounded-xl border transition-all duration-200 cursor-default ${isActive ? `${colors.activeBg} ${colors.border} shadow-md` : `bg-white ${colors.border}`
        } ${colors.borderHover}`}
    >
      {isActive && (
        <motion.div
          className={`absolute inset-0 rounded-xl ${colors.bg}`}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${colors.icon}`} />
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{label}</span>
        </div>
        <div className={`text-2xl font-semibold ${value > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
          <AnimatedCounter value={value} />
        </div>
      </div>
    </motion.div>
  )
}

// Progress Bar with Comet Effect
function ProgressBar({ progress }) {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      width: `${progress}%`,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    })
  }, [progress, controls])

  return (
    <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <motion.div
        animate={controls}
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 rounded-full"
        style={{ width: '0%' }}
      />
      {/* Comet glow effect */}
      <motion.div
        className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-orange-400 to-transparent blur-sm"
        animate={{
          left: `${Math.max(0, progress - 10)}%`,
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          left: { type: 'spring', stiffness: 100, damping: 20 },
          opacity: { duration: 2, repeat: Infinity }
        }}
      />
    </div>
  )
}

// Main Component
export default function ScrapingProgress({ sessionId, searchParams, onComplete, onCancel, onError }) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('🚀 Initializing scraper...')
  const [scrapedLeads, setScrapedLeads] = useState([])
  const [totalSaved, setTotalSaved] = useState(0)
  const [status, setStatus] = useState('running')
  const [logs, setLogs] = useState([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [stats, setStats] = useState({
    businessesFound: 0,
    phonesExtracted: 0,
    websitesFound: 0,
    ratingsCaptured: 0,
    emailsGenerated: 0,
    citiesExtracted: 0
  })
  const [isScrapingActive, setIsScrapingActive] = useState(true)
  const [activeStat, setActiveStat] = useState(null)
  const containerRef = useRef(null)
  const logsEndRef = useRef(null)
  const supabase = createClient()
  const lastCountRef = useRef(0)

  console.log('[SCRAPING] Premium Light UI mounted')

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Phase-based progress estimation
  useEffect(() => {
    if (!isScrapingActive) return

    const phases = [
      { time: 0, step: '🌐 Initializing browser with stealth mode...', progress: 5 },
      { time: 10, step: '🔍 Navigating to Google Maps...', progress: 10 },
      { time: 25, step: '⚡ Bypassing bot detection systems...', progress: 15 },
      { time: 40, step: `📍 Searching for "${searchParams?.niche} in ${searchParams?.city || searchParams?.location}"...`, progress: 20 },
      { time: 60, step: '📜 Scrolling through search results...', progress: 25 },
      { time: 90, step: '👆 Extracting first business details...', progress: 35 },
      { time: 120, step: '📊 Extracting business details...', progress: 45 },
      { time: 180, step: '🔄 Processing batch 1... Businesses being saved to database', progress: 60 },
      { time: 240, step: '🔄 Processing batch 2... Data extraction in progress', progress: 75 },
      { time: 300, step: '💾 Saving leads to Supabase database...', progress: 90 },
    ]

    const checkPhase = setInterval(() => {
      for (let i = phases.length - 1; i >= 0; i--) {
        if (elapsedTime >= phases[i].time) {
          if (progress < phases[i].progress) {
            console.log(`[SCRAPING] Phase: ${phases[i].step} (${phases[i].progress}%)`)
            setCurrentStep(phases[i].step)
            setProgress(phases[i].progress)
          }
          break
        }
      }
    }, 1000)

    return () => clearInterval(checkPhase)
  }, [elapsedTime, isScrapingActive, searchParams, progress])

  // Poll Supabase for real-time updates
  useEffect(() => {
    if (!sessionId || !isScrapingActive) {
      console.log('[SCRAPING] Polling stopped')
      return
    }

    console.log('[SCRAPING] Starting polling for session:', sessionId)

    const pollInterval = setInterval(async () => {
      try {
        const { data: leads, error, count } = await supabase
          .from('indian_leads')
          .select('*', { count: 'exact', head: false })
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('[SCRAPING] Supabase error:', error)
          return
        }

        console.log(`[SCRAPING] Poll: ${count || 0} leads`)

        if (count > 0 && count !== lastCountRef.current) {
          const newLeadsCount = count
          console.log(`[SCRAPING] New leads: ${newLeadsCount}`)
          lastCountRef.current = newLeadsCount

          const estimatedProgress = Math.min(100, (newLeadsCount / 20) * 100)
          setProgress(estimatedProgress)
          setTotalSaved(newLeadsCount)
          setCurrentStep(`📊 Scraping in progress... ${newLeadsCount} leads found`)

          if (leads && leads.length > 0) {
            const newStats = {
              businessesFound: newLeadsCount,
              phonesExtracted: leads.filter(l => l.phone).length,
              websitesFound: leads.filter(l => l.website).length,
              ratingsCaptured: leads.filter(l => l.rating).length,
              emailsGenerated: leads.filter(l => l.email).length,
              citiesExtracted: new Set(leads.map(l => l.city)).size
            }

            if (newStats.phonesExtracted > stats.phonesExtracted) setActiveStat('phones')
            else if (newStats.emailsGenerated > stats.emailsGenerated) setActiveStat('emails')
            else if (newStats.ratingsCaptured > stats.ratingsCaptured) setActiveStat('ratings')
            else setActiveStat('businesses')

            setStats(newStats)
            setScrapedLeads(leads)

            leads.slice(0, 5).forEach(lead => {
              if (!logs.some(l => l.message.includes(lead.business_name))) {
                setLogs(prev => [...prev.slice(-50), {
                  type: 'success',
                  message: `✓ ${lead.business_name}`,
                  time: new Date().toLocaleTimeString()
                }])

                if (lead.phone) {
                  setLogs(prev => [...prev.slice(-50), {
                    type: 'info',
                    message: `  📞 ${lead.phone}`,
                    time: new Date().toLocaleTimeString()
                  }])
                }
              }
            })
          }
        }

        const { data: sessions } = await supabase
          .from('indian_leads_sessions')
          .select('status')
          .eq('id', sessionId)
          .single()

        if (sessions?.status === 'completed') {
          console.log('[SCRAPING] Complete!')
          clearInterval(pollInterval)
          setIsScrapingActive(false)
          setCurrentStep('✅ Scraping complete! All leads saved.')
          setProgress(100)

          setLogs(prev => [...prev, {
            type: 'success',
            message: `✅ ${lastCountRef.current} leads saved to database`,
            time: new Date().toLocaleTimeString()
          }])

          setTimeout(() => onComplete(), 2000)
        }

        if (sessions?.status === 'failed') {
          console.log('[SCRAPING] Failed!')
          clearInterval(pollInterval)
          setIsScrapingActive(false)
          onError?.(sessions.error_message || 'Scraping failed')
        }

      } catch (err) {
        console.error('[SCRAPING] Error:', err.message)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [sessionId, isScrapingActive, onComplete, onError, stats, logs])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const searchQuery = `${searchParams?.niche} in ${searchParams?.city || searchParams?.location}`

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Activity className="w-6 h-6 text-orange-500" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                Live Scraper
                <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                  v2.0
                </span>
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Extracting from Google Maps: <span className="text-slate-800 font-medium">{searchQuery}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Elapsed</div>
              <div className="text-lg font-mono text-slate-900 font-semibold">{formatTime(elapsedTime)}</div>
            </div>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">{currentStep}</span>
            <span className="text-slate-500 font-mono font-semibold">{Math.round(progress)}%</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          icon={Building2}
          label="Businesses"
          value={stats.businessesFound}
          color="orange"
          isActive={activeStat === 'businesses'}
          delay={0}
        />
        <StatCard
          icon={MapPin}
          label="Cities"
          value={stats.citiesExtracted}
          color="blue"
          isActive={activeStat === 'cities'}
          delay={0.05}
        />
        <StatCard
          icon={Phone}
          label="Phones"
          value={stats.phonesExtracted}
          color="green"
          isActive={activeStat === 'phones'}
          delay={0.1}
        />
        <StatCard
          icon={Mail}
          label="Emails"
          value={stats.emailsGenerated}
          color="purple"
          isActive={activeStat === 'emails'}
          delay={0.15}
        />
        <StatCard
          icon={Star}
          label="Ratings"
          value={stats.ratingsCaptured}
          color="yellow"
          isActive={activeStat === 'ratings'}
          delay={0.2}
        />
        <StatCard
          icon={Database}
          label="Saved"
          value={totalSaved}
          color="red"
          isActive={totalSaved > 0}
          delay={0.25}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Streaming Log Window */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Live Activity</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
          <div className="p-4 h-64 overflow-y-auto space-y-1.5 bg-slate-900">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-xs font-mono flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  ⚙️
                </motion.div>
                Initializing... Please wait 2-5 minutes
              </div>
            ) : (
              logs.map((log, idx) => (
                <TypewriterLog key={idx} log={log} delay={0} />
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Recent Leads</span>
              {scrapedLeads.length > 0 && (
                <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {scrapedLeads.length}
                </span>
              )}
            </div>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div className="p-4 h-64 overflow-y-auto space-y-2 bg-white">
            {scrapedLeads.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Waiting for data...
              </div>
            ) : (
              <AnimatePresence>
                {scrapedLeads.slice(0, 8).map((lead, idx) => (
                  <motion.div
                    key={lead.id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 bg-white border border-slate-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-slate-900 truncate">
                          {lead.business_name}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lead.business_category} · {lead.city}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5 shrink-0">
                        {lead.phone && (
                          <div className="text-xs text-green-600 font-mono font-medium">{lead.phone}</div>
                        )}
                        {lead.rating && (
                          <div className="text-xs text-orange-600 font-medium">⭐ {lead.rating}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-xs text-orange-800 text-center">
          💡 Extracting <span className="font-medium">Category</span>, <span className="font-medium">City</span>, <span className="font-medium">Phone</span>, <span className="font-medium">Email</span>, <span className="font-medium">Rating</span>, and <span className="font-medium">Reviews</span> — Takes 2-5 minutes
        </p>
      </div>
    </div>
  )
}
