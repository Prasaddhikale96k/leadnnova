'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createClient } from '@/lib/supabase/client'
import IndianLeadsHero from '@/components/indian-leads/IndianLeadsHero'
import NicheLocationForm from '@/components/indian-leads/NicheLocationForm'
import ScrapingProgress from '@/components/indian-leads/ScrapingProgress'
import LeadsDataTable from '@/components/indian-leads/LeadsDataTable'
import StatsCards from '@/components/indian-leads/StatsCards'
import BulkActionBar from '@/components/indian-leads/BulkActionBar'
import WhatsAppBulkSendModal from '@/components/whatsapp/WhatsAppBulkSendModal'
import { formatIndianPhoneNumber } from '@/utils/phoneFormatter'
import SetupRequiredBanner from '@/components/indian-leads/SetupRequiredBanner'

gsap.registerPlugin(ScrollTrigger)

export default function IndianLeadsPage() {
  const [pageState, setPageState] = useState('checking')
  const [sessionId, setSessionId] = useState(null)
  const [searchParams, setSearchParams] = useState(null)
  const [leads, setLeads] = useState([])
  const [selectedLeads, setSelectedLeads] = useState([])
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [leadsWithEmail, setLeadsWithEmail] = useState(0)
  const [isScraperReady, setIsScraperReady] = useState(false)

  const mainRef = useRef(null)
  const supabase = createClient()

  useEffect(() => {
    checkScraperSetup()

    // Timeout fallback: if still checking after 5 seconds, show form
    const timeout = setTimeout(() => {
      setPageState(prev => {
        if (prev === 'checking') {
          console.warn('Setup check timed out, showing form')
          setIsScraperReady(true)
          return 'form'
        }
        return prev
      })
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.floating-dot-saffron',
        { y: 0, opacity: 0.3 },
        { y: -20, opacity: 0.6, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.5 }
      )
      gsap.fromTo('.floating-dot-green',
        { y: 0, opacity: 0.3 },
        { y: 20, opacity: 0.6, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.3 }
      )
    }, mainRef)

    return () => ctx.revert()
  }, [])

  const checkScraperSetup = async () => {
    try {
      const res = await fetch('/api/indian-leads/check-setup')
      const data = await res.json()
      setIsScraperReady(data.isReady)

      if (data.isReady) {
        const hasLeads = await fetchLeads()
        // Only show results if we have leads, otherwise stay on form
        if (hasLeads) {
          setPageState('results')
        } else {
          setPageState('form')
        }
      } else {
        setPageState('setup-required')
      }
    } catch (error) {
      console.error('Failed to check scraper setup:', error)
      // Fallback: assume ready and show form
      setIsScraperReady(true)
      setPageState('form')
    }
  }

  const fetchLeads = async () => {
    const { data } = await supabase
      .from('indian_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    console.log('fetchLeads - Total leads from DB:', data?.length || 0)

    if (data && data.length > 0) {
      setLeads(data)
      setLeadsWithEmail(data.filter(l => l.email).length)
      return true // Has leads
    } else {
      setLeads([])
      setLeadsWithEmail(0)
      return false // No leads
    }
  }

  const handleFormSubmit = async (data) => {
    console.log('[SCRAPING] Form submitted, starting scraping process...')
    setSearchParams(data)
    setPageState('scraping')

    // Create session ID immediately for UI display
    const tempSessionId = `session-${Date.now()}`
    setSessionId(tempSessionId)
    console.log('[SCRAPING] Set temporary session ID:', tempSessionId)

    try {
      // Set 5-minute timeout (scraper takes 2-5 minutes)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes

      console.log('[SCRAPING] Calling scrape API...')
      const response = await fetch('/api/indian-leads/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: data.niche,
          city: data.city,
          state: data.state,
          location: data.location,
          maxResults: 100
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const result = await response.json()

      console.log('[SCRAPING] API Response:', result)

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Scraping failed')
      }

      // Update with real session ID from API
      if (result.sessionId) {
        console.log('[SCRAPING] Updating session ID to:', result.sessionId)
        setSessionId(result.sessionId)
      }
    } catch (error) {
      console.error('[SCRAPING] Error:', error)
      if (error.name === 'AbortError') {
        handleScrapingError('Scraping timed out (5 minutes). Please try a more specific search.')
      } else {
        handleScrapingError(error.message)
      }
    }
  }

  const handleScrapingComplete = async () => {
    console.log('Scraping complete, fetching leads...')
    const hasLeads = await fetchLeads()
    if (hasLeads) {
      setPageState('results')
    } else {
      setPageState('form')
    }
    setSessionId(null)
  }

  const handleScrapingError = (errorMessage) => {
    console.error('Scraping failed:', errorMessage)
    setPageState('form')
  }

  const handleCancel = () => {
    setPageState(isScraperReady ? 'form' : 'setup-required')
    setSessionId(null)
    setSearchParams(null)
  }

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(l => l.id))
    }
  }

  const handleGenerateWhatsAppMessages = async (config) => {
    const selected = leads.filter(l => selectedLeads.includes(l.id) && l.phone)

    if (selected.length === 0) {
      throw new Error('No leads with phone numbers selected')
    }

    try {
      const response = await fetch('/api/outreach/generate-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: selected.map(l => l.id),
          options: config
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate WhatsApp messages')
      }

      // Refresh leads to get updated data
      await fetchLeads()

      return data.messages

    } catch (apiError) {
      console.error('WhatsApp message generation failed:', apiError)

      // Fallback: Generate basic template messages
      const fallbackMessages = selected.map((lead, index) => {
        const phone = formatIndianPhoneNumber(lead.phone)
        if (!phone) return null

        return {
          leadId: lead.id,
          messageId: `fallback-${index}-${Date.now()}`,
          businessName: lead.business_name,
          phone: phone,
          message: `Hi! I found ${lead.business_name} in ${lead.city} and wanted to connect about ${config.senderService}. Would you be open to a quick chat?\n\nBest,\n${config.senderName}`,
          ai_model_used: 'fallback',
          generated_at: new Date().toISOString()
        }
      }).filter(Boolean)

      // Still save fallback messages to database
      if (fallbackMessages.length > 0) {
        const supabase = createClient()
        for (const msg of fallbackMessages) {
          await supabase
            .from('indian_leads')
            .update({
              whatsapp_message: msg.message,
              whatsapp_phone_formatted: msg.phone,
              whatsapp_generated_at: msg.generated_at,
              whatsapp_ai_model: msg.ai_model_used
            })
            .eq('id', msg.leadId)
        }
        await fetchLeads()
      }

      return fallbackMessages
    }
  }

  const handleSendWhatsAppMessages = async (generatedMessageList) => {
    console.log('handleSendWhatsAppMessages called with:', generatedMessageList)

    if (!generatedMessageList || generatedMessageList.length === 0) {
      return { sent: 0, failed: 0, total: 0 }
    }

    // For WhatsApp, we just return the messages - the modal handles the sending
    return {
      sent: generatedMessageList.length,
      failed: 0,
      total: generatedMessageList.length,
      messages: generatedMessageList
    }
  }

  const handleExport = () => {
    const selected = leads.filter(l => selectedLeads.includes(l.id))
    const headers = ['Business Name', 'Category', 'Phone', 'Email', 'Website', 'City', 'State', 'Rating']
    const csvContent = [
      headers.join(','),
      ...selected.map(lead => [
        lead.business_name,
        lead.business_category,
        lead.phone,
        lead.email,
        lead.website,
        lead.city,
        lead.state,
        lead.rating
      ].map(val => `"${val || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `indian-leads-${Date.now()}.csv`
    a.click()
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-[#FAFAFA] relative overflow-x-hidden">
      {/* Full-screen overlay during scraping */}
      {pageState === 'scraping' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-white/60 z-50 pointer-events-none"
        />
      )}

      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #FF9933 33%, #FFFFFF 33% 66%, #138808 66%)' }}
        />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`saffron-${i}`}
            className="absolute w-3 h-3 rounded-full bg-orange-400 floating-dot-saffron"
            style={{ top: `${20 + i * 15}%`, right: `${10 + i * 8}%` }}
            animate={{ x: [0, 10, 0], y: [0, -15, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`green-${i}`}
            className="absolute w-2 h-2 rounded-full bg-green-500 floating-dot-green"
            style={{ top: `${30 + i * 12}%`, left: `${5 + i * 6}%` }}
            animate={{ x: [0, -10, 0], y: [0, 15, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}
      </div>

      <IndianLeadsHero />

      <div className="max-w-5xl mx-auto px-4 pb-20 relative z-10">
        <AnimatePresence mode="wait">
          {pageState === 'checking' && (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mb-4"></div>
              <p className="text-gray-500">Checking scraper setup...</p>
            </motion.div>
          )}

          {pageState === 'setup-required' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SetupRequiredBanner onCheckAgain={checkScraperSetup} />
            </motion.div>
          )}

          {pageState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <NicheLocationForm onSubmit={handleFormSubmit} />
              {leads.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={async () => {
                      await fetchLeads()
                      setPageState('results')
                    }}
                    className="text-sm text-orange-500 hover:underline"
                  >
                    📊 View your {leads.length} previously scraped leads
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {pageState === 'scraping' && (
            <motion.div
              key="scraping"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <ScrapingProgress
                sessionId={sessionId}
                searchParams={searchParams}
                onComplete={handleScrapingComplete}
                onCancel={handleCancel}
                onError={handleScrapingError}
              />
            </motion.div>
          )}

          {pageState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Generate New Leads Button */}
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">📊 Your Leads</h2>
                <button
                  onClick={() => {
                    setPageState('form')
                    setSelectedLeads([])
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span className="text-lg">🔍</span>
                  Generate New Leads
                </button>
              </div>

              <StatsCards leads={leads} />
              <LeadsDataTable
                leads={leads}
                searchParams={searchParams}
                selectedLeads={selectedLeads}
                onSelectLead={handleSelectLead}
                onSelectAll={handleSelectAll}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BulkActionBar
        selectedCount={selectedLeads.length}
        phoneableCount={leads.filter(l => selectedLeads.includes(l.id) && l.phone).length}
        onGenerateMessages={() => setShowBulkModal(true)}
        onExport={handleExport}
        onClear={() => setSelectedLeads([])}
      />

      <WhatsAppBulkSendModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedLeads={leads.filter(l => selectedLeads.includes(l.id))}
        onGenerate={handleGenerateWhatsAppMessages}
        onSend={handleSendWhatsAppMessages}
      />
    </div>
  )
}