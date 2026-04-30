'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiMail, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ReviewSidebar({ lead, profile, isOpen, onClose, onApprove, onRegenerate }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [hasEdited, setHasEdited] = useState(false)
  const [originalSubject, setOriginalSubject] = useState('')
  const [originalBody, setOriginalBody] = useState('')

  useEffect(() => {
    if (lead) {
      const s = lead.email_subject || `Quick question about ${lead.company_name}`
      const b = lead.email_body || ''
      setSubject(s)
      setBody(b)
      setOriginalSubject(s)
      setOriginalBody(b)
      setHasEdited(false)
    }
  }, [lead])

  useEffect(() => {
    if (subject !== originalSubject || body !== originalBody) {
      setHasEdited(true)
    } else {
      setHasEdited(false)
    }
  }, [subject, body, originalSubject, originalBody])

  if (!lead) return null

  const approvalStatus = hasEdited ? 'edited' : 'approved'

  const handleSave = async () => {
    if (!subject.trim() || !body.trim()) return toast.error('Subject and body required')
    setSaving(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ email_subject: subject, email_body: body }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('Failed to save')
      onApprove(lead.id, subject, body, approvalStatus)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = () => {
    onRegenerate(lead.id)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-white/10"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <FiMail className="text-brand-500" />
                  Review AI Email
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lead.company_name} &middot; {lead.full_name || 'Unknown'} &middot; {lead.city || 'Unknown'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                <FiX className="text-lg text-gray-500" />
              </button>
            </div>

            {/* Lead Info Cards */}
            <div className="p-4 space-y-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20">
              <div className="flex gap-2 flex-wrap">
                {lead.monthly_revenue && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                    {lead.monthly_revenue}
                  </span>
                )}
                {lead.online_presence && (
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    lead.online_presence.toLowerCase().includes('poor') ? 'bg-red-500/10 text-red-500' :
                    lead.online_presence.toLowerCase().includes('average') ? 'bg-amber-500/10 text-amber-500' :
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {lead.online_presence} Presence
                  </span>
                )}
                {lead.email_angle && (
                  <span className="px-2 py-1 rounded-lg bg-brand-500/10 text-brand-500 text-[10px] font-bold uppercase">
                    {lead.email_angle} angle
                  </span>
                )}
                {hasEdited && (
                  <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase">
                    Edited (Manual)
                  </span>
                )}
              </div>
              {lead.needs && (
                <p className="text-[11px] text-gray-500 italic">{lead.needs}</p>
              )}
            </div>

            {/* Editable Email Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">
                  Subject Line
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">
                  Email Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none leading-relaxed"
                  placeholder="Email body..."
                />
              </div>
              <div className="text-[10px] text-gray-400 flex items-center justify-between">
                <span>{body.split(/\s+/).filter(Boolean).length}/100 words</span>
                {hasEdited && (
                  <span className="text-blue-500 font-semibold">Changes detected &rarr; will mark as Edited (Manual)</span>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                  hasEdited
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheck /> {hasEdited ? 'Save as Edited (Manual)' : 'Mark as Approved'}
                  </>
                )}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerate}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <FiRefreshCw /> Regenerate
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <FiX /> Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
