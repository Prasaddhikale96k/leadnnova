'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle, FiLoader, FiChevronRight, FiCpu, FiMail, FiZap, FiSend, FiAlertCircle } from 'react-icons/fi'

export default function BulkSendModal({ 
  isOpen, 
  onClose, 
  selectedLeads,
  onGenerate,
  onSend 
}) {
  const [step, setStep] = useState('configure')
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [generatedEmails, setGeneratedEmails] = useState([])
  const [sendingProgress, setSendingProgress] = useState({
    sent: 0, failed: 0, total: 0
  })
  const [config, setConfig] = useState({
    senderService: '',
    senderName: '',
    tone: 'professional',
    delaySeconds: 3
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const progressRef = useRef(null)

  const leadsWithEmail = selectedLeads.filter(l => l.email)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const emails = await onGenerate(config)
      setGeneratedEmails(emails)
      setStep('preview')
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendAll = async () => {
    console.log('=== SEND START ===')
    console.log('Generated emails:', generatedEmails)
    console.log('Email IDs to send:', generatedEmails.map(e => ({ id: e.emailId, leadId: e.leadId, to: e.toEmail })))
    
    setStep('sending')
    setSendingProgress({
      sent: 0,
      failed: 0,
      total: generatedEmails.length
    })

    try {
      // Pass the full email objects, not just IDs
      const result = await onSend(generatedEmails)
      
      console.log('=== SEND RESULT ===', result)
      
      setSendingProgress(prev => ({
        ...prev,
        sent: result.sent || 0,
        failed: result.failed || 0
      }))
    } catch (sendError) {
      console.error('Send error:', sendError)
      setSendingProgress(prev => ({
        ...prev,
        failed: prev.total
      }))
    }
    setStep('complete')
  }

  useEffect(() => {
    if (step === 'sending' && progressRef.current) {
      const percent = sendingProgress.total > 0
        ? (sendingProgress.sent + sendingProgress.failed) / sendingProgress.total * 100
        : 0
      progressRef.current.style.width = `${percent}%`
    }
  }, [sendingProgress, step])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {['configure', 'preview', 'sending', 'complete'].map((s, i) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          s === step ? 'w-6 bg-orange-500' : 
                          ['configure', 'preview', 'sending', 'complete'].indexOf(s) < 
                          ['configure', 'preview', 'sending', 'complete'].indexOf(step) 
                            ? 'w-4 bg-green-400' : 'w-4 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                  <FiX size={18} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <AnimatePresence mode="wait">
                  
                  {step === 'configure' && (
                    <motion.div
                      key="configure"
                      className="space-y-6"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                    >
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">🚀 Send Cold Emails</h2>
                        <p className="text-gray-500 mt-1">
                          <span className="font-semibold text-orange-500">{leadsWithEmail.length}</span> leads with emails ready
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <FiCpu size={14} /> AI Configuration
                        </div>
                        <input
                          value={config.senderService}
                          onChange={e => setConfig(p => ({...p, senderService: e.target.value}))}
                          placeholder="What service are you offering?"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 outline-none text-sm"
                        />
                        <input
                          value={config.senderName}
                          onChange={e => setConfig(p => ({...p, senderName: e.target.value}))}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 outline-none text-sm"
                        />
                        <div className="flex gap-2">
                          {(['professional', 'friendly', 'formal']).map(tone => (
                            <button
                              key={tone}
                              onClick={() => setConfig(p => ({...p, tone}))}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border ${
                                config.tone === tone
                                  ? 'bg-orange-500 text-white border-orange-500'
                                  : 'bg-white text-gray-600 border-gray-200'
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={onClose}
                          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
                        >
                          Cancel
                        </button>
                        <motion.button
                          onClick={handleGenerate}
                          disabled={!config.senderService || !config.senderName || isGenerating}
                          className="flex-2 flex-grow py-3 px-6 rounded-xl bg-gray-900 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isGenerating ? (
                            <><FiLoader size={16} className="animate-spin" /> Generating...</>
                          ) : (
                            <><FiZap size={16} /> Generate & Preview <FiChevronRight size={14} /></>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {step === 'preview' && (
                    <motion.div
                      key="preview"
                      className="space-y-4"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold">Preview Cold Emails</h2>
                          <p className="text-green-600 text-sm flex items-center gap-1">
                            <FiCheckCircle size={14} /> {generatedEmails.length} emails generated - Review before sending
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <button 
                            onClick={() => setCurrentPreviewIndex(p => Math.max(0, p - 1))}
                            disabled={currentPreviewIndex === 0}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          >←</button>
                          <span>Email {currentPreviewIndex + 1} of {generatedEmails.length}</span>
                          <button
                            onClick={() => setCurrentPreviewIndex(p => Math.min(generatedEmails.length - 1, p + 1))}
                            disabled={currentPreviewIndex === generatedEmails.length - 1}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          >→</button>
                        </div>
                      </div>

                      <div className="rounded-xl border-2 border-orange-200 overflow-hidden bg-white">
                        <div className="bg-gradient-to-r from-orange-50 to-green-50 px-4 py-3 border-b border-orange-100">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-semibold">To:</span>
                            <span>{generatedEmails[currentPreviewIndex]?.toEmail}</span>
                          </div>
                          <div className="text-sm font-bold mt-1 text-gray-900">
                            {generatedEmails[currentPreviewIndex]?.subject}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Business: {generatedEmails[currentPreviewIndex]?.businessName}
                          </div>
                        </div>
                        <div className="p-4 text-sm text-gray-700 max-h-80 overflow-y-auto whitespace-pre-wrap bg-white">
                          {generatedEmails[currentPreviewIndex]?.preview}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep('configure')}
                          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium"
                        >
                          ← Back to Configure
                        </button>
                        <motion.button
                          onClick={handleSendAll}
                          className="flex-grow py-3 px-6 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(135deg, #FF6B35, #138808)' }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FiSend size={16} /> Confirm & Send All {generatedEmails.length} Emails
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {step === 'sending' && (
                    <motion.div
                      key="sending"
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                          className="w-12 h-12 rounded-full border-3 border-orange-100 border-t-orange-500 mx-auto mb-4"
                        />
                        <h2 className="text-xl font-bold">Sending Cold Emails...</h2>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{sendingProgress.sent + sendingProgress.failed} / {sendingProgress.total}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            ref={progressRef}
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #FF6B35, #138808)', width: '0%' }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-green-50">
                          <div className="text-2xl font-bold text-green-600">{sendingProgress.sent}</div>
                          <div className="text-xs">Sent</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-red-50">
                          <div className="text-2xl font-bold text-red-600">{sendingProgress.failed}</div>
                          <div className="text-xs">Failed</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-gray-50">
                          <div className="text-2xl font-bold">{sendingProgress.total - sendingProgress.sent - sendingProgress.failed}</div>
                          <div className="text-xs">Pending</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 'complete' && (
                    <motion.div
                      key="complete"
                      className="p-8 text-center space-y-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto text-4xl"
                      >
                        🎉
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold">Campaign Complete!</h2>
                        <p className="text-gray-500">All results saved to Outreach</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50">
                          <div className="text-3xl font-bold text-green-600">{sendingProgress.sent}</div>
                          <div className="text-xs">Sent</div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50">
                          <div className="text-3xl font-bold text-red-600">{sendingProgress.failed}</div>
                          <div className="text-xs">Failed</div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50">
                          <div className="text-3xl font-bold text-orange-500">
                            {Math.round(sendingProgress.sent/sendingProgress.total*100)}%
                          </div>
                          <div className="text-xs">Success</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <a href="/dashboard/outreach" className="flex-1 py-3 rounded-xl border text-center text-sm font-medium">
                          View in Outreach
                        </a>
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium">
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}