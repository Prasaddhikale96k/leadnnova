'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEye, FiEyeOff, FiCheckCircle, FiExternalLink, FiLoader, FiShield } from 'react-icons/fi'

export default function GmailSetupModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [form, setForm] = useState({
    gmail: '',
    appPassword: '',
    fromName: '',
    replyTo: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)
    setError('')
    
    try {
      const response = await fetch('/api/outreach/verify-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmailAddress: form.gmail,
          appPassword: form.appPassword,
          fromName: form.fromName,
          replyTo: form.replyTo
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess(form.gmail)
          onClose()
        }, 1500)
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-lg">📧</div>
                  <div>
                    <h2 className="font-bold text-gray-900">Gmail Setup</h2>
                    <p className="text-xs text-gray-500">Secure email via App Password</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                    <FiShield size={12} /> How to get App Password:
                  </div>
                  <ol className="text-xs text-blue-700 space-y-1 ml-3 list-decimal">
                    <li>Go to Google Account → Security</li>
                    <li>Enable 2-Step Verification</li>
                    <li>Search "App Passwords" in settings</li>
                    <li>Create new → Select "Mail"</li>
                  </ol>
                  <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    Open Google Settings <FiExternalLink size={10} />
                  </a>
                </div>

                <div className="space-y-3">
                  <input type="email" placeholder="Gmail Address" value={form.gmail} onChange={e => setForm(p => ({...p, gmail: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm" />
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="App Password (xxxx xxxx xxxx xxxx)" value={form.appPassword} onChange={e => setForm(p => ({...p, appPassword: e.target.value}))} className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-mono" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>
                  </div>
                  <input placeholder="Display Name (e.g. 'Rahul from Company')" value={form.fromName} onChange={e => setForm(p => ({...p, fromName: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm" />
                </div>

                {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">⚠️ {error}</motion.div>}
                {success && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl p-3"><FiCheckCircle size={16} /> Gmail connected!</motion.div>}

                <div className="flex gap-3 pt-2">
                  <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium">Cancel</button>
                  <motion.button onClick={handleVerify} disabled={!form.gmail || !form.appPassword || !form.fromName || isVerifying} className="flex-grow py-3 px-6 rounded-xl bg-gray-900 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50" whileHover={{ scale: 1.02, backgroundColor: '#FF6B35' }} whileTap={{ scale: 0.98 }}>
                    {isVerifying ? <><FiLoader size={16} className="animate-spin" /> Verifying...</> : <><FiCheckCircle size={16} /> Verify & Save</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}