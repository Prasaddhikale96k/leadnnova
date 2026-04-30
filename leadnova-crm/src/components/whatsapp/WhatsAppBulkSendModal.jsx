'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle, FiLoader, FiChevronRight, FiCpu, FiMessageSquare, FiZap, FiSend, FiAlertCircle } from 'react-icons/fi'

export default function WhatsAppBulkSendModal({
  isOpen,
  onClose,
  selectedLeads,
  onGenerate,
  onSend
}) {
  const [step, setStep] = useState('configure')
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [generatedMessages, setGeneratedMessages] = useState([])
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
  const [isSendingAnimation, setIsSendingAnimation] = useState(false)
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false)
  const progressRef = useRef(null)

  const leadsWithPhone = selectedLeads.filter(l => {
    if (!l.phone) return false
    const cleaned = l.phone.replace(/[\s\-\(\)\[\]\{\}\+\.]/g, '').replace(/^0+/, '')
    return cleaned.length >= 10 && /^\d+$/.test(cleaned)
  })

  const handleGenerate = async () => {
    setIsGenerating(true)
    setIsGeneratingMessages(true)
    try {
      const messages = await onGenerate(config)
      setGeneratedMessages(messages)
      setStep('preview')
    } catch (error) {
      console.error('Generation failed:', error)
      // Still try to show preview even if some failed
      setStep('preview')
    } finally {
      setIsGenerating(false)
      setIsGeneratingMessages(false)
    }
  }

  const handleSendAll = async () => {
    console.log('=== WHATSAPP SEND START ===')
    console.log('Generated messages:', generatedMessages)

    setStep('sending')
    setSendingProgress({
      sent: 0,
      failed: 0,
      total: generatedMessages.length
    })

    try {
      // Start sending animation
      setIsSendingAnimation(true)

      // Send messages with delay between each
      for (let i = 0; i < generatedMessages.length; i++) {
        const message = generatedMessages[i]
        const cleanedPhone = message.phone.replace(/[\s\-\(\)\[\]\{\}\+\.]/g, '').replace(/^0+/, '')
        const phoneWithCountryCode = cleanedPhone.startsWith('91') ? cleanedPhone : '91' + cleanedPhone
        const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message.message)}`

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank')

        // Update progress
        setSendingProgress(prev => ({
          ...prev,
          sent: i + 1
        }))

        // Add delay between messages (3 seconds default)
        if (i < generatedMessages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, config.delaySeconds * 1000))
        }
      }

      // Stop animation after all messages are sent
      setTimeout(() => {
        setIsSendingAnimation(false)
      }, 1500)

      // Log outreach to database
      try {
        const leadIds = generatedMessages.map(m => m.leadId)
        await fetch('/api/indian-leads/outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadIds,
            messages: generatedMessages,
            config: config
          })
        })
        console.log('Outreach history saved for', generatedMessages.length, 'leads')
      } catch (logError) {
        console.error('Failed to log outreach history:', logError)
        // Continue anyway - don't block UI
      }

      setStep('complete')
    } catch (sendError) {
      console.error('Send error:', sendError)
      setSendingProgress(prev => ({
        ...prev,
        failed: prev.total
      }))
      setStep('complete')
    }
  }

  useEffect(() => {
    if (step === 'sending' && progressRef.current) {
      const percent = sendingProgress.total > 0
        ? (sendingProgress.sent + sendingProgress.failed) / sendingProgress.total * 100
        : 0
      progressRef.current.style.width = `${percent}%`
    }
  }, [sendingProgress, step])

  // Reset modal when closed
  useEffect(() => {
    if (!isOpen) {
      setStep('configure')
      setGeneratedMessages([])
      setSendingProgress({ sent: 0, failed: 0, total: 0 })
      setIsSendingAnimation(false)
    }
  }, [isOpen])

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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {['configure', 'preview', 'sending', 'complete'].map((s, i) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          s === step ? 'w-6 bg-green-500' :
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

              <div className="flex-1 overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar p-6">
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
                        <h2 className="text-2xl font-bold text-gray-900">📱 Send Cold WhatsApp Messages</h2>
                        <p className="text-gray-500 mt-1">
                          <span className="font-semibold text-green-500">{leadsWithPhone.length}</span> leads with phone numbers ready
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 outline-none text-sm"
                        />
                        <input
                          value={config.senderName}
                          onChange={e => setConfig(p => ({...p, senderName: e.target.value}))}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 outline-none text-sm"
                        />
                        <div className="flex gap-2">
                          {(['professional', 'friendly', 'casual']).map(tone => (
                            <button
                              key={tone}
                              onClick={() => setConfig(p => ({...p, tone}))}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border ${
                                config.tone === tone
                                  ? 'bg-green-500 text-white border-green-500'
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
                          <h2 className="text-xl font-bold">Preview WhatsApp Messages</h2>
                          <p className="text-green-600 text-sm flex items-center gap-1">
                            <FiCheckCircle size={14} /> {generatedMessages.length} messages generated - Review before sending
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <button
                            onClick={() => setCurrentPreviewIndex(p => Math.max(0, p - 1))}
                            disabled={currentPreviewIndex === 0}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          >←</button>
                          <span>Message {currentPreviewIndex + 1} of {generatedMessages.length}</span>
                          <button
                            onClick={() => setCurrentPreviewIndex(p => Math.min(generatedMessages.length - 1, p + 1))}
                            disabled={currentPreviewIndex === generatedMessages.length - 1}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          >→</button>
                        </div>
                      </div>

                      <div className="rounded-xl border-2 border-green-200 overflow-hidden bg-white">
                        <div className="bg-gradient-to-r from-green-50 to-green-50 px-4 py-3 border-b border-green-100">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-semibold">To:</span>
                            <span>+{(() => {
                            const phone = generatedMessages[currentPreviewIndex]?.phone || ''
                            const cleaned = phone.replace(/[\s\-\(\)\[\]\{\}\+\.]/g, '').replace(/^0+/, '')
                            return cleaned.startsWith('91') ? cleaned : '91' + cleaned
                          })()}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Business: {generatedMessages[currentPreviewIndex]?.businessName}
                          </div>
                        </div>
                        <div className="p-4 text-sm text-gray-700 min-h-[120px] bg-white flex items-center justify-center">
                          {isGeneratingMessages && !generatedMessages[currentPreviewIndex]?.message ? (
                            <div className="flex flex-col items-center gap-3 text-gray-500">
                              <FiLoader className="animate-spin text-xl" />
                              <span className="text-xs">AI is generating your message...</span>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap w-full">
                              {generatedMessages[currentPreviewIndex]?.message || 'Message not available'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <FiMessageSquare size={16} />
                          <span className="font-medium">WhatsApp Best Practices:</span>
                        </div>
                        <ul className="text-xs text-green-600 mt-2 space-y-1">
                          <li>• Messages will open WhatsApp in new tabs</li>
                          <li>• {config.delaySeconds} second delay between messages</li>
                          <li>• Keep messages short and personal for better response rates</li>
                        </ul>
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
                          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FiSend size={16} /> Confirm & Send All {generatedMessages.length} Messages
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
                        {isSendingAnimation ? (
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                            className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl"
                          >
                            <FiSend className="text-green-600" />
                          </motion.div>
                        ) : (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            className="w-12 h-12 rounded-full border-3 border-green-100 border-t-green-500 mx-auto mb-4"
                          />
                        )}
                        <h2 className="text-xl font-bold">
                          {isSendingAnimation ? 'Opening WhatsApp...' : 'Sending WhatsApp Messages...'}
                        </h2>
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
                            style={{
                              background: 'linear-gradient(90deg, #25D366, #128C7E)',
                              width: '0%'
                            }}
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
                        ✅
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold">WhatsApp Messages Sent!</h2>
                        <p className="text-gray-500">All WhatsApp chats have been opened in new tabs</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50">
                          <div className="text-3xl font-bold text-green-600">{sendingProgress.sent}</div>
                          <div className="text-xs">Messages Sent</div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50">
                          <div className="text-3xl font-bold text-red-600">{sendingProgress.failed}</div>
                          <div className="text-xs">Failed</div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50">
                          <div className="text-3xl font-bold text-green-500">
                            {Math.round(sendingProgress.sent/sendingProgress.total*100)}%
                          </div>
                          <div className="text-xs">Success Rate</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium">
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
                </div>
              </div>

              {/* Sticky Footer */}
              {step === 'preview' && (
                <div className="flex-shrink-0 border-t border-gray-100 p-6 bg-white">
                  <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={() => setStep('configure')}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium"
                    >
                      ← Back to Configure
                    </button>
                    <motion.button
                      onClick={handleSendAll}
                      disabled={isGeneratingMessages || generatedMessages.length === 0}
                      className="flex-grow py-3 px-6 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiSend size={16} /> Confirm & Send All {generatedMessages.length} Messages
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}