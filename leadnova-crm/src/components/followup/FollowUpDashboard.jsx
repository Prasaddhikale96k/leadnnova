'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { FiRefreshCw, FiCheckCircle, FiClock, FiXCircle, FiSettings, FiPause, FiChevronDown, FiMessageCircle, FiAlertCircle } from 'react-icons/fi'

export default function FollowUpDashboard() {
  const [sequences, setSequences] = useState([])
  const [isCheckingReplies, setIsCheckingReplies] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState(null)
  const [stats, setStats] = useState({
    active: 0, replied: 0, scheduled: 0, sent: 0, successRate: 0
  })
  const [expandedId, setExpandedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    is_active: true,
    max_followups: 3,
    followup_1_delay_hours: 48,
    followup_2_delay_hours: 120,
    followup_3_delay_hours: 240,
    followup_1_tone: 'friendly',
    followup_2_tone: 'value_focused',
    followup_3_tone: 'final_nudge',
    stop_on_reply: true,
    stop_on_open: false
  })
  
  const supabase = createClient()

  useEffect(() => {
    fetchSequences()
    fetchConfig()
    
    const sub = supabase
      .channel('followup-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'followup_emails'
      }, () => fetchSequences())
      .subscribe()

    return () => { sub.unsubscribe() }
  }, [])

  const fetchSequences = async () => {
    const { data: originalEmails } = await supabase
      .from('outreach_emails')
      .select(`
        id, to_email, business_name, subject, sent_at,
        status, reply_received, followup_count, 
        followup_stopped, next_followup_at, unsubscribed
      `)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(50)

    if (!originalEmails) return

    const sequencePromises = originalEmails.map(async (email) => {
      const { data: followups } = await supabase
        .from('followup_emails')
        .select('*')
        .eq('original_email_id', email.id)
        .order('followup_number', { ascending: true })

      let status = 'active'
      if (email.reply_received) status = 'replied'
      else if (email.followup_stopped) status = 'stopped'
      else if (followups?.every(f => f.status === 'sent')) status = 'completed'

      return { originalEmail: email, followups: followups || [], status }
    })

    const allSequences = await Promise.all(sequencePromises)
    const withFollowUps = allSequences.filter(s => s.followups.length > 0)
    setSequences(withFollowUps)

    setStats({
      active: withFollowUps.filter(s => s.status === 'active').length,
      replied: withFollowUps.filter(s => s.status === 'replied').length,
      scheduled: withFollowUps.reduce((acc, s) => 
        acc + s.followups.filter(f => f.status === 'scheduled').length, 0),
      sent: withFollowUps.reduce((acc, s) => 
        acc + s.followups.filter(f => f.status === 'sent').length, 0),
      successRate: withFollowUps.length > 0
        ? Math.round(withFollowUps.filter(s => s.status === 'replied').length / 
            withFollowUps.length * 100)
        : 0
    })

    setIsLoading(false)
  }

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/followup/scheduler')
      const data = await res.json()
      if (data.schedule) setConfig(data.schedule)
    } catch (e) {}
  }

  const handleCheckReplies = async () => {
    setIsCheckingReplies(true)
    try {
      const res = await fetch('/api/followup/check-replies', { method: 'POST' })
      const data = await res.json()
      setLastCheckTime(new Date())
      if (data.repliesFound > 0) fetchSequences()
    } catch (error) {
      console.error('Reply check failed:', error)
    } finally {
      setIsCheckingReplies(false)
    }
  }

  const handleCancelSequence = async (originalEmailId) => {
    await fetch('/api/followup/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalEmailId, reason: 'manual' })
    })
    fetchSequences()
  }

  const handleSaveConfig = async () => {
    await fetch('/api/followup/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    setShowConfig(false)
  }

  const getFollowUpStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <FiCheckCircle size={14} className="text-green-500" />
      case 'failed': return <FiXCircle size={14} className="text-red-500" />
      case 'cancelled': return <FiXCircle size={14} className="text-gray-400" />
      case 'sending': return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><FiRefreshCw size={14} className="text-blue-500" /></motion.div>
      case 'scheduled': return <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}><FiClock size={14} className="text-orange-400" /></motion.div>
      default: return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200" />
    }
  }

  const formatScheduledTime = (scheduledFor) => {
    if (!scheduledFor) return ''
    const date = new Date(scheduledFor)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffMs < 0) return 'Overdue'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `In ${diffDays} days`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <FiRefreshCw className="text-orange-500 w-6 h-6" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleCheckReplies}
            disabled={isCheckingReplies}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-60"
            whileHover={{ scale: 1.02, backgroundColor: '#FF6B35' }}
            whileTap={{ scale: 0.98 }}
          >
            {isCheckingReplies ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><FiRefreshCw size={14} /></motion.div> : <FiRefreshCw size={14} />}
            Check Replies Now
          </motion.button>

          <motion.button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium bg-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSettings size={14} />
            Configure Schedule
          </motion.button>
        </div>

        {lastCheckTime && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-400">
            Last checked: {lastCheckTime.toLocaleTimeString()}
          </motion.span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Active Sequences', value: stats.active, color: '#FF6B35' },
          { label: 'Replied', value: stats.replied, color: '#10B981' },
          { label: 'Scheduled', value: stats.scheduled, color: '#6366F1' },
          { label: 'Follow-ups Sent', value: stats.sent, color: '#F59E0B' },
          { label: 'Reply Rate', value: `${stats.successRate}%`, color: '#138808' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            style={{ borderLeftColor: stat.color, borderLeftWidth: '3px' }}
            whileHover={{ y: -2 }}
          >
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Email Sequences</h3>

        <AnimatePresence>
          {sequences.map((sequence, index) => (
            <motion.div
              key={sequence.originalEmail.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${sequence.status === 'replied' ? 'border-green-100' : sequence.status === 'stopped' ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}
            >
              <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setExpandedId(expandedId === sequence.originalEmail.id ? null : sequence.originalEmail.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${sequence.status === 'replied' ? 'bg-green-500' : sequence.status === 'stopped' ? 'bg-gray-400' : sequence.status === 'active' ? 'bg-orange-400' : 'bg-gray-300'} ${sequence.status === 'active' && 'animate-pulse'}`} />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {sequence.originalEmail.business_name || 'Unknown Business'}
                      {sequence.status === 'replied' && <span className="ml-2 text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">💬 Replied!</span>}
                      {sequence.status === 'stopped' && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Stopped</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{sequence.originalEmail.to_email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-1.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sequence.followups.filter(f => f.status === 'sent').length}/{sequence.followups.length} sent</span>
                    {sequence.followups.find(f => f.status === 'scheduled') && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">Next: {formatScheduledTime(sequence.followups.find(f => f.status === 'scheduled')?.scheduled_for)}</span>}
                  </div>
                  <motion.div animate={{ rotate: expandedId === sequence.originalEmail.id ? 180 : 0 }}><FiChevronDown size={16} className="text-gray-400" /></motion.div>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === sequence.originalEmail.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100 px-4 pb-4 pt-3">
                    <div className="space-y-3 ml-2">
                      <div className="flex items-start gap-3">
                        <FiCheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">Initial Cold Email</div>
                          <div className="text-xs text-gray-400">Sent {new Date(sequence.originalEmail.sent_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      </div>

                      {sequence.status === 'replied' && (
                        <div className="flex items-start gap-3">
                          <FiMessageCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm font-medium text-green-700">Reply Received! 🎉</div>
                        </div>
                      )}

                      {sequence.followups.map((followup, fIdx) => (
                        <div key={followup.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">{getFollowUpStatusIcon(followup.status)}{fIdx < sequence.followups.length - 1 && <div className="w-px h-8 bg-gray-200 mt-1" />}</div>
                          <div className="pb-2 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-800">Follow-up #{followup.followup_number}</div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${followup.status === 'sent' ? 'bg-green-50 text-green-700' : followup.status === 'scheduled' ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{followup.status}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {followup.status === 'sent' && followup.sent_at ? `Sent ${new Date(followup.sent_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : followup.status === 'scheduled' ? `Scheduled: ${formatScheduledTime(followup.scheduled_for)}` : followup.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {sequence.status === 'active' && (
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                        <motion.button onClick={() => handleCancelSequence(sequence.originalEmail.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-100" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <FiPause size={12} /> Stop Sequence
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isLoading && sequences.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FiClock size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No follow-up sequences yet</p>
            <p className="text-xs mt-1">Send cold emails to start automatic follow-up sequences</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfig && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfig(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">⚙️ Follow-Up Schedule</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure automatic follow-up timing</p>
                </div>
                <div className="p-6 space-y-5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Enable Auto Follow-ups</div>
                      <div className="text-xs text-gray-500">Automatically send follow-ups when no reply</div>
                    </div>
                    <div onClick={() => setConfig(p => ({...p, is_active: !p.is_active}))} className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${config.is_active ? 'bg-orange-500' : 'bg-gray-200'}`}>
                      <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm mt-0.5" animate={{ x: config.is_active ? 26 : 2 }} />
                    </div>
                  </label>
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Follow-up Timing</div>
                    {[{ num: 1, key: 'followup_1_delay_hours', label: 'Follow-up 1' }, { num: 2, key: 'followup_2_delay_hours', label: 'Follow-up 2' }, { num: 3, key: 'followup_3_delay_hours', label: 'Follow-up 3' }].map(item => (
                      <div key={item.key} className="flex items-center gap-3">
                        <div className="flex-1 text-sm text-gray-700">{item.label}</div>
                        <input type="number" value={Math.floor(config[item.key] / 24)} onChange={e => setConfig(p => ({...p, [item.key]: parseInt(e.target.value) * 24}))} className="w-16 px-2 py-1.5 text-center rounded-lg border border-gray-200 text-sm focus:border-orange-400 outline-none" min={1} max={30} />
                        <span className="text-xs text-gray-500">days</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <FiAlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Max 3 follow-ups per lead. Every email includes an unsubscribe option.</p>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button onClick={() => setShowConfig(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <motion.button onClick={handleSaveConfig} className="flex-grow py-3 px-6 rounded-xl bg-gray-900 text-white text-sm font-medium" whileHover={{ scale: 1.02, backgroundColor: '#FF6B35' }} whileTap={{ scale: 0.98 }}>Save Schedule</motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}