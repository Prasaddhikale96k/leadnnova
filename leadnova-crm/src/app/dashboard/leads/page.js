'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FiSearch, FiDownload, FiPlus, FiMail, FiTrash2, FiCheckSquare, FiX, FiSend, FiChevronLeft, FiChevronRight, FiMessageSquare, FiShield, FiDatabase, FiArrowDown, FiArrowUp, FiCpu } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import gsap from 'gsap'
import SendingBulkLoader from '@/components/SendingBulkLoader'
import GeneratingMailLoader from '@/components/GeneratingMailLoader'
import BulkSendCinematic from '@/components/BulkSendCinematic'

const TYPEWRITER_PHRASES = [
  'web designers in London',
  'CTOs in fintech',
  'founders in Dubai',
  'SaaS startups in NYC',
]

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [generating, setGenerating] = useState(false)
  const [showGenModal, setShowGenModal] = useState(false)
  const [genForm, setGenForm] = useState({ niche: '', location: '', count: 10 })

  const [personalizing, setPersonalizing] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([{ role: 'assistant', text: 'Hi! I am your AI Support Assistant. Need help with the pipeline?' }])

  const [sending, setSending] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0, sending: false })
  const [tone, setTone] = useState('Professional')
  const [generatingEmails, setGeneratingEmails] = useState(false)
  const [showCinematic, setShowCinematic] = useState(false)
  const [cinematicData, setCinematicData] = useState({ total: 0, current: 0, leadName: '' })

  const [isAtTable, setIsAtTable] = useState(false)
  const [chatStep, setChatStep] = useState(0)
  const [nicheInput, setNicheInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [missionConfirmed, setMissionConfirmed] = useState(false)
  const [systemAnalyzing, setSystemAnalyzing] = useState(false)

  const deckRef = useRef(null)
  const gridRef = useRef(null)
  const sentinelRef = useRef(null)
  const typewriterRef = useRef(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    loadApp()
  }, [])

  useEffect(() => {
    let timeout
    let phraseIdx = 0
    let charIdx = 0
    let deleting = false
    const el = typewriterRef.current
    if (!el) return

    const type = () => {
      const current = TYPEWRITER_PHRASES[phraseIdx]
      if (!deleting) {
        el.textContent = current.substring(0, charIdx + 1)
        charIdx++
        if (charIdx === current.length) {
          timeout = setTimeout(() => { deleting = true; type() }, 2000)
          return
        }
        timeout = setTimeout(type, 60)
      } else {
        el.textContent = current.substring(0, charIdx - 1)
        charIdx--
        if (charIdx === 0) {
          deleting = false
          phraseIdx = (phraseIdx + 1) % TYPEWRITER_PHRASES.length
          timeout = setTimeout(type, 300)
          return
        }
        timeout = setTimeout(type, 30)
      }
    }
    type()
    return () => clearTimeout(timeout)
  }, [])

  const loadApp = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }
    const { data: pData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (pData) setProfile(pData)
    await fetchLeads()
  }

  const fetchLeads = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }
    const { data } = await supabase.from('leads').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(100)
    if (data) setLeads(data)
    setLoading(false)
  }

  const handleGenerate = async () => {
    if (!genForm.niche.trim() || !genForm.location.trim()) return toast.error('Niche and location required')
    setGenerating(true)
    const toastId = toast.loading('Stage 1: Bulk Scraping via Apify... (Fast)')
    try {
      const res = await fetch('/api/leads/scrape', {
        method: 'POST', body: JSON.stringify(genForm), headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unknown error occurred')
      toast.success(`Success! Scraped ${data.count} Leads.`, { id: toastId })
      setShowGenModal(false)
      fetchLeads()
    } catch (err) {
      toast.error(err.message || 'Scraping failed', { id: toastId })
    }
    setGenerating(false)
  }

  const handlePersonalize = async () => {
    if (selectedIds.size === 0) return toast.error('No leads selected')
    setPersonalizing(true)
    const toastId = toast.loading(`Stage 2: AI is analyzing ${selectedIds.size} businesses...`)
    try {
      const leadIds = Array.from(selectedIds)
      const res = await fetch('/api/leads/personalize', {
        method: 'POST',
        body: JSON.stringify({ leadIds }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Enriched & Generated ${data.count} Cold Mails!`, { id: toastId })
      setSelectedIds(new Set())
      fetchLeads()
    } catch (err) {
      toast.error(err.message || 'Personalization failed', { id: toastId })
    }
    setPersonalizing(false)
  }

  const handleSendEmails = async () => {
    setSending(true)
    setSendProgress({ current: 0, total: 0, sending: true })
    const approvedLeads = leads.filter(l => l.email_verified && (l.email_body || l.cold_email) && l.email_status !== 'bounced' && l.email_status !== 'invalid')
    if (approvedLeads.length === 0) return toast.error('No approved emails to send.')
    const verifyToast = toast.loading('Running data integrity check...')
    try {
      const leadIds = approvedLeads.map(l => l.id)
      const verifyRes = await fetch('/api/leads/verify', {
        method: 'POST',
        body: JSON.stringify({ leadIds }),
        headers: { 'Content-Type': 'application/json' }
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error)
      toast.dismiss(verifyToast)
      toast.success(`Verified: ${verifyData.valid}/${verifyData.total} leads passed`)
      const validLeads = approvedLeads.filter(l => {
        const result = verifyData.results.find(r => r.id === l.id)
        return result && result.can_send
      })
      if (validLeads.length === 0) return toast.error('All leads failed verification.')

      setShowCinematic(true)
      setCinematicData({ total: validLeads.length, current: validLeads.length, leadName: validLeads[0]?.company_name || '' })

      const res = await fetch('/api/emails/send', {
        method: 'POST', body: JSON.stringify({ leads: validLeads }), headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success(`Sent: ${data.sent}, Failed: ${data.failed}, Skipped: ${data.skipped}`)
      setShowEmailModal(false)
      setSelectedIds(new Set())
      fetchLeads()
    } catch (err) {
      toast.error(err.message || 'Failed to send emails')
    } finally {
      setSending(false)
      setSendProgress({ current: 0, total: 0, sending: false })
    }
  }

  const handleGenerateEmails = async () => {
    if (selectedIds.size === 0) return toast.error('No leads selected')
    setGeneratingEmails(true)
    const toastId = toast.loading('AI is generating personalized emails...')
    try {
      const leadIds = Array.from(selectedIds)
      const res = await fetch('/api/leads/generate-emails', {
        method: 'POST',
        body: JSON.stringify({ leadIds, tone }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.dismiss(toastId)
      toast.success(`Generated ${data.count} AI email drafts!`)
      setSelectedIds(new Set())
      fetchLeads()
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(err.message || 'Email generation failed')
    }
    setGeneratingEmails(false)
  }

  const toggleApproval = async (lead) => {
    const newVerified = !lead.email_verified
    const { error } = await supabase.from('leads').update({ email_verified: newVerified }).eq('id', lead.id)
    if (error) return toast.error(`Failed: ${error.message}`)
    fetchLeads()
  }

  const toggleSelect = id => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedLeads.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginatedLeads.map(l => l.id)))
  }

  const bulkMarkSelected = async () => {
    const ids = Array.from(selectedIds)
    const { error } = await supabase.from('leads').update({ status: 'selected', is_selected: true }).in('id', ids)
    if (error) return toast.error('Error updating leads')
    toast.success('Leads marked as selected')
    setSelectedIds(new Set())
    fetchLeads()
  }

  const bulkDelete = async () => {
    if (!confirm('Delete selected leads?')) return
    const ids = Array.from(selectedIds)
    for (const id of ids) await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    toast.success('Leads deleted')
    setSelectedIds(new Set())
    fetchLeads()
  }

  const handleSupportChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }])
    const query = chatInput
    setChatInput('')
    setTimeout(() => {
      let response = "I've logged your request."
      if (query.toLowerCase().includes('personalize')) response = "Select leads, then click 'Analyze Leads'."
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }])
    }, 1000)
  }

  const handleNicheSubmit = (e) => {
    e.preventDefault()
    if (!nicheInput.trim()) return
    setGenForm(prev => ({ ...prev, niche: nicheInput }))
    setChatStep(1)
  }

  const handleLocationSubmit = (e) => {
    e.preventDefault()
    if (!locationInput.trim()) return
    setGenForm(prev => ({ ...prev, location: locationInput }))
    setChatStep(2)
  }

  const handleMissionConfirm = () => {
    setMissionConfirmed(true)
    setSystemAnalyzing(true)
    setTimeout(() => {
      setSystemAnalyzing(false)
    }, 2000)
  }

  const toggleLeadsConsole = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.inOut', duration: 1.2 } })

    tl.to(deckRef.current, { yPercent: isAtTable ? 0 : -50 }, 0)
    tl.to(gridRef.current, { yPercent: isAtTable ? 0 : -30 }, 0)

    setIsAtTable(!isAtTable)
  }

  const filteredLeads = leads.filter(l => {
    const searchString = (l.company_name || '') + (l.full_name || '') + (l.email || '') + (l.city || '') + (l.needs || '') + (l.business_type || '')
    const matchesSearch = searchString.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter ? l.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1
  const paginatedLeads = filteredLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const approvedCount = leads.filter(l => l.email_verified && (l.email_body || l.cold_email)).length

  return (
    <div className="relative h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Layer 1: Fixed Motion Grid */}
      <div ref={gridRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, opacity: sending ? 0.12 : 'var(--grid-opacity)' }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--grid-stroke)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {sending && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'var(--send-pulse)' }}
          />
        )}
      </div>

      {/* Layer 3: Main Deck (200vh container) */}
      <div ref={deckRef} className="relative" style={{ height: '200vh', zIndex: 10 }}>
        {/* FRAME 1: Command Center */}
        <div className="h-screen flex flex-col items-center justify-center relative">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-muted)' }}>LEAD EXTRACTION PROTOCOL</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
              Define Your Target
            </h1>
          </div>

          <div className="w-full max-w-lg px-4">
            <AnimatePresence mode="wait">
              {chatStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="border rounded-2xl backdrop-blur-xl p-6"
                  style={{ background: 'transparent', borderColor: 'var(--glass-border)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FiCpu className="text-lg" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>AI: Identify the Niche</span>
                  </div>
                  <form onSubmit={handleNicheSubmit}>
                    <div className="relative mb-4">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-faint)' }}>Search for... </span>
                      <span ref={typewriterRef} className="absolute left-[90px] top-1/2 -translate-y-1/2 text-sm font-mono" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <input
                      type="text"
                      value={nicheInput}
                      onChange={e => setNicheInput(e.target.value)}
                      placeholder="e.g. Web Designers, Marketing Agencies..."
                      className="w-full bg-transparent border-b text-lg font-medium py-3 outline-none placeholder:opacity-20"
                      style={{ color: 'var(--text-primary)', borderColor: 'var(--border-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
                      autoFocus
                    />
                    <div className="flex justify-end mt-4">
                      <button type="submit" className="px-6 py-2 rounded-full text-sm font-bold transition-all hover:scale-105" style={{ background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-text)' }}>
                        Confirm Niche
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {chatStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="border rounded-2xl backdrop-blur-xl p-6"
                  style={{ background: 'transparent', borderColor: 'var(--glass-border)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FiCpu className="text-lg" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>AI: Identify the Location</span>
                  </div>
                  <div className="mb-4 px-3 py-2 rounded text-xs font-mono border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    NICHE: {nicheInput.toUpperCase()}
                  </div>
                  <form onSubmit={handleLocationSubmit}>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={e => setLocationInput(e.target.value)}
                      placeholder="e.g. London, New York, Austin..."
                      className="w-full bg-transparent border-b text-lg font-medium py-3 outline-none placeholder:opacity-20"
                      style={{ color: 'var(--text-primary)', borderColor: 'var(--border-accent)', fontFamily: "'Space Grotesk', sans-serif" }}
                      autoFocus
                    />
                    <div className="flex justify-end mt-4">
                      <button type="submit" className="px-6 py-2 rounded-full text-sm font-bold transition-all hover:scale-105" style={{ background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-text)' }}>
                        Confirm Location
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {chatStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="border rounded-2xl backdrop-blur-xl p-6"
                  style={{ background: 'transparent', borderColor: 'var(--glass-border)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FiCpu className="text-lg" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>AI: Confirm Extraction</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-mono px-3 py-2 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <span>TARGET</span>
                      <span style={{ color: 'var(--text-primary)' }}>{nicheInput}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono px-3 py-2 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <span>LOCATION</span>
                      <span style={{ color: 'var(--text-primary)' }}>{locationInput}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono px-3 py-2 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <span>EST. LEADS</span>
                      <span style={{ color: 'var(--text-primary)' }}>10</span>
                    </div>
                  </div>
                  {!missionConfirmed ? (
                    <button
                      onClick={handleMissionConfirm}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-text)' }}
                    >
                      CONFIRM EXTRACTION
                    </button>
                  ) : systemAnalyzing ? (
                    <div className="text-center py-3">
                      <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>SYSTEM_ANALYZING...</span>
                      <div className="mt-2 w-32 mx-auto h-px overflow-hidden rounded" style={{ background: 'var(--border)' }}>
                        <motion.div className="h-full" style={{ background: 'var(--text-primary)' }} initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2, ease: 'easeInOut' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>MISSION CONFIRMED</span>
                      <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>Click the arrow to begin extraction</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FRAME 2: Extraction Desk */}
        <div className="h-screen flex flex-col p-6 relative" style={{ opacity: 1 }}>
          {/* Header */}
          <div className="flex items-center justify-between py-6 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <div>
              <h1 className="text-lg font-bold font-mono tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
                EXTRACTION_DESK <span style={{ color: 'var(--text-faint)' }}>//</span> <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{loading ? 'DATA_STREAM_INITIALIZING...' : 'DATA_STREAM_ACTIVE'}</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <a href="/api/export/csv" className="px-4 py-2 rounded-xl text-xs font-mono border flex items-center gap-2 transition-all hover:bg-white/5" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                <FiDownload /> EXPORT_SHEET
              </a>
              <button onClick={() => setShowGenModal(true)} className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all hover:scale-[1.02]" style={{ background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-text)' }}>
                <FiPlus /> EXTRACT_MORE
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap gap-4 items-center py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full bg-transparent border rounded-xl py-2 pl-10 pr-4 text-xs font-mono outline-none placeholder:opacity-20" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent border rounded-xl py-2 px-4 text-xs font-mono outline-none" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
              <option value="">ALL_STATUSES</option>
              <option value="pending_analysis">PENDING_AI</option>
              <option value="new">ENRICHED</option>
              <option value="selected">SELECTED</option>
              <option value="contacted">CONTACTED</option>
            </select>
            {(search || statusFilter) && (
              <button onClick={() => { setSearch(''); setStatusFilter('') }} className="text-xs font-mono transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
                CLEAR_FILTERS
              </button>
            )}
          </div>

          {/* Selection Bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap items-center justify-between gap-4 py-3 border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full border flex items-center justify-center font-mono text-[10px]" style={{ borderColor: 'var(--border-accent)', color: 'var(--text-primary)' }}>{selectedIds.size}</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>LEADS_SELECTED</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePersonalize} disabled={personalizing} className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${personalizing ? 'opacity-50' : 'hover:scale-[1.02]'}`} style={{ background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-text)' }}>
                    {personalizing ? <span className="w-3 h-3 rounded-full animate-spin" style={{ border: '2px solid var(--btn-solid-text)', borderTopColor: 'transparent', opacity: 0.4 }} /> : <><FiShield /> ANALYZE</>}
                  </button>
                  <button onClick={handleGenerateEmails} disabled={generatingEmails} className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${generatingEmails ? 'opacity-50' : 'hover:scale-[1.02]'}`} style={{ background: 'var(--btn-ghost-bg)', color: 'var(--btn-ghost-text)' }}>
                    {generatingEmails ? <span className="w-3 h-3 rounded-full animate-spin" style={{ border: '2px solid var(--btn-ghost-text)', borderTopColor: 'transparent', opacity: 0.4 }} /> : <><FiMail /> GEN_EMAILS</>}
                  </button>
                  <button onClick={bulkMarkSelected} className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02]" style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}><FiCheckSquare /> MARK_READY</button>
                  <button onClick={() => setShowEmailModal(true)} className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02]" style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}><FiMail /> SEND_{approvedCount}</button>
                  <button onClick={bulkDelete} className="p-1.5 rounded-lg transition-all hover:scale-[1.02]" style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)' }}><FiTrash2 /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <div className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="overflow-x-auto overflow-y-auto flex-1 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
              {loading ? (
                <div className="h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <span className="w-6 h-6 rounded-full animate-spin block mx-auto mb-4" style={{ border: '2px solid var(--text-faint)', borderTopColor: 'var(--text-secondary)' }}></span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>INITIALIZING_DATA_STREAM...</span>
                    <div className="mt-6 space-y-2 w-96">
                      {[...Array(5)].map((_, i) => (
                        <motion.div key={i} className="h-px rounded" style={{ background: 'var(--skeleton)' }}
                          animate={{ opacity: [0.2, 0.5, 0.2] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : paginatedLeads.length > 0 ? (
                <div className="min-w-[1600px]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[9px] uppercase tracking-[0.15em] sticky top-0" style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <tr>
                        <th className="p-3 w-10"><input type="checkbox" checked={paginatedLeads.length > 0 && selectedIds.size === paginatedLeads.length} onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded cursor-pointer" style={{ accentColor: 'var(--text-primary)' }} /></th>
                        <th className="p-3 font-medium">BUSINESS_NAME</th>
                        <th className="p-3 font-medium">OWNER</th>
                        <th className="p-3 font-medium">EMAIL</th>
                        <th className="p-3 font-medium">PHONE</th>
                        <th className="p-3 font-medium">TYPE</th>
                        <th className="p-3 font-medium">CITY</th>
                        <th className="p-3 font-medium">GOLD_INSIGHTS</th>
                        <th className="p-3 font-medium">COLD_MAIL</th>
                        <th className="p-3 font-medium">APPROVED</th>
                        <th className="p-3 font-medium">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLeads.map((l, i) => (
                        <motion.tr
                          key={l.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b transition-all duration-200"
                          style={{ borderColor: 'var(--border-subtle)', background: i % 2 === 0 ? 'var(--row-alt)' : 'transparent' }}
                          whileHover={{ boxShadow: '0 0 20px var(--hover-glow)' }}
                        >
                          <td className="p-3"><input type="checkbox" checked={selectedIds.has(l.id)} onChange={() => toggleSelect(l.id)} className="w-3.5 h-3.5 rounded cursor-pointer" style={{ accentColor: 'var(--text-primary)' }} /></td>
                          <td className="p-3">
                            <div className="font-bold text-xs" style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>{l.company_name}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>{l.full_name || '—'}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-[11px] truncate w-36" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>{l.email || '—'}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-faint)' }}>{l.company_phone || '—'}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>{l.business_type || '—'}</span>
                          </td>
                          <td className="p-3">
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{l.city}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1 min-w-[140px]">
                              {l.monthly_revenue ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold border w-fit" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--text-primary)' }} />
                                  [REV: {l.monthly_revenue}]
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono" style={{ color: 'var(--text-faint)' }}>[PENDING_AI]</span>
                              )}
                              {l.online_presence && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono border w-fit" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                  [PRESENCE: {l.online_presence.toUpperCase()}]
                                </span>
                              )}
                              {l.needs && (
                                <span className="text-[9px] font-mono line-clamp-2" style={{ color: 'var(--text-muted)' }}>[INTENT: {l.needs.substring(0, 30)}...]</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="min-w-[200px] max-w-[240px]">
                              {(l.email_body || l.cold_email) ? (
                                <div className="text-[10px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                                  {l.email_body || l.cold_email}
                                </div>
                              ) : (
                                <span className="text-[9px] font-mono" style={{ color: 'var(--text-faint)' }}>[NO_EMAIL]</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center">
                              {(l.email_body || l.cold_email) ? (
                                <button onClick={() => toggleApproval(l)} className="w-5 h-5 rounded flex items-center justify-center transition-colors">
                                  {l.email_verified ? (
                                    <svg className="w-4 h-4" style={{ color: 'var(--text-primary)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                  ) : (
                                    <svg className="w-4 h-4" style={{ color: 'var(--text-faint)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                  )}
                                </button>
                              ) : (
                                <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>—</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-widest border" style={{
                              borderColor: l.status === 'pending_analysis' ? 'var(--border-subtle)' : l.status === 'new' ? 'var(--border)' : l.status === 'selected' ? 'var(--border)' : 'var(--border-subtle)',
                              color: 'var(--text-secondary)'
                            }}>{l.status === 'pending_analysis' ? 'STAGE_1_OK' : l.status}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col justify-center items-center text-center">
                  <FiDatabase className="text-3xl mb-3" style={{ color: 'var(--text-faint)' }} />
                  <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>NO_LEADS_POPULATED</p>
                  <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-faint)' }}>Use EXTRACT_MORE to begin Stage 1 scraping.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredLeads.length > 0 && (
              <div className="flex justify-between items-center py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>LeadNova_AI_CRM_v2.0</div>
                <div className="flex gap-2 items-center">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded transition-colors hover:bg-white/5" style={{ color: page === 1 ? 'var(--text-faint)' : 'var(--text-muted)' }}><FiChevronLeft /></button>
                  <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>{page}/{totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1 rounded transition-colors hover:bg-white/5" style={{ color: page === totalPages ? 'var(--text-faint)' : 'var(--text-muted)' }}><FiChevronRight /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layer 4: Sentinel Toggle (Always On) */}
      <button
        ref={sentinelRef}
        onClick={toggleLeadsConsole}
        className="fixed z-[1000] w-[50px] h-[50px] rounded-full border backdrop-blur-xl flex items-center justify-center cursor-pointer hover:border-white/40 transition-all"
        style={{
          right: '2.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          borderColor: 'var(--glass-border)',
          background: 'var(--glass-bg)',
        }}
      >
        <motion.div animate={{ rotate: isAtTable ? 0 : 180 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
          {isAtTable ? (
            <FiArrowUp className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <FiArrowDown className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          )}
        </motion.div>
      </button>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--overlay)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl border shadow-2xl" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>EXTRACT_LEADS</h3>
                  <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>Stage 1: Bulk Scraper (Apify)</p>
                </div>
                <button onClick={() => setShowGenModal(false)} className="hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}><FiX className="text-xl" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Niche</label>
                  <input type="text" value={genForm.niche} onChange={e => setGenForm({ ...genForm, niche: e.target.value })} className="w-full bg-transparent border rounded-xl py-2.5 px-4 text-xs font-mono outline-none" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} placeholder="e.g. Plumbers, HVAC..." />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Location</label>
                  <input type="text" value={genForm.location} onChange={e => setGenForm({ ...genForm, location: e.target.value })} className="w-full bg-transparent border rounded-xl py-2.5 px-4 text-xs font-mono outline-none" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} placeholder="e.g. Austin, Texas..." />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Max Count</label>
                  <input type="number" min="1" max="100" value={genForm.count} onChange={e => setGenForm({ ...genForm, count: parseInt(e.target.value) })} className="w-full bg-transparent border rounded-xl py-2.5 px-4 text-xs font-mono outline-none" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <button onClick={handleGenerate} disabled={generating} className="w-full mt-4 py-3 rounded-xl text-xs font-mono font-bold flex justify-center items-center gap-2 transition-all hover:scale-[1.02]" style={{ background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-text)' }}>
                  {generating ? <span className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--btn-solid-text)', borderTopColor: 'transparent', opacity: 0.4 }} /> : <>START_BULK_SCRAPE</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--overlay)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl border shadow-2xl" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold font-mono flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><FiSend /> SEND_APPROVED</h3>
                  <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{approvedCount} emails ready</p>
                </div>
                <button onClick={() => setShowEmailModal(false)} className="p-2 rounded-full transition-colors hover:bg-white/5"><FiX style={{ color: 'var(--text-muted)' }} /></button>
              </div>
              <div className="space-y-4">
                {sendProgress.sending && (
                  <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span style={{ color: 'var(--text-secondary)' }}>SENDING...</span>
                      <span style={{ color: 'var(--text-primary)' }}>{sendProgress.current}/{sendProgress.total}</span>
                    </div>
                    <div className="w-full rounded-full h-1" style={{ background: 'var(--skeleton)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }} className="h-1 rounded-full" style={{ background: 'var(--text-primary)' }} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Tone</label>
                  <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-transparent border rounded-xl py-2.5 px-4 text-xs font-mono outline-none" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                    <option value="Professional" style={{ background: 'var(--bg-secondary)' }}>Professional</option>
                    <option value="Friendly" style={{ background: 'var(--bg-secondary)' }}>Friendly</option>
                    <option value="Direct" style={{ background: 'var(--bg-secondary)' }}>Direct</option>
                  </select>
                </div>
                <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>Only toggled-ON emails will be sent.</p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button onClick={() => setShowEmailModal(false)} className="text-xs font-mono transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>CANCEL</button>
                  <button onClick={handleSendEmails} disabled={sending || sendProgress.sending} className="px-6 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all hover:scale-[1.02]" style={{ background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-text)' }}>
                    {sending || sendProgress.sending ? <span className="w-3 h-3 rounded-full animate-spin" style={{ border: '2px solid var(--btn-solid-text)', borderTopColor: 'transparent', opacity: 0.4 }} /> : `SEND_${approvedCount}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loaders */}
      <SendingBulkLoader current={sendProgress.current} total={sendProgress.total} sending={sendProgress.sending} />

      <AnimatePresence>
        {generatingEmails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9998] flex items-center justify-center" style={{ background: 'var(--overlay)' }}>
            <div className="rounded border shadow-2xl p-8 max-w-sm w-full mx-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <GeneratingMailLoader />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCinematic && (
        <BulkSendCinematic total={cinematicData.total} current={cinematicData.current} leadName={cinematicData.leadName} onComplete={() => setShowCinematic(false)} />
      )}

      {/* Support Chat */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="w-80 h-96 mb-4 rounded-2xl shadow-2xl flex flex-col overflow-hidden border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="p-4 flex justify-between items-center border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="font-bold text-xs font-mono flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><FiShield /> AI_ASSISTANT</span>
                <button onClick={() => setChatOpen(false)} style={{ color: 'var(--text-muted)' }}><FiX /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-xl text-[11px] font-mono max-w-[85%] ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none border'}`}
                      style={{ background: msg.role === 'user' ? 'var(--btn-solid-bg)' : 'transparent', color: msg.role === 'user' ? 'var(--btn-solid-text)' : 'var(--text-secondary)', borderColor: 'var(--glass-border)' }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSupportChat} className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask..." className="flex-1 bg-transparent border rounded-xl py-2 px-3 text-[10px] font-mono outline-none" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                <button type="submit" className="p-2 rounded-xl" style={{ background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-text)' }}><FiSend /></button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setChatOpen(!chatOpen)} className="w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-lg transition-transform hover:scale-110" style={{ background: chatOpen ? 'var(--glass-bg-hover)' : 'var(--btn-solid-bg)', color: chatOpen ? 'var(--text-primary)' : 'var(--btn-solid-text)', border: chatOpen ? '1px solid var(--border)' : 'none' }}>
          {chatOpen ? <FiX /> : <FiMessageSquare />}
        </button>
      </div>
    </div>
  )
}
