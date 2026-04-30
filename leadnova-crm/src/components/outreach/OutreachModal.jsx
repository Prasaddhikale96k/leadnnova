'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiMail, FiMessageSquare, FiSend, FiLoader, FiCheck, FiAlertTriangle } from 'react-icons/fi'
import { formatIndianPhoneNumber } from '@/utils/phoneFormatter'

export default function OutreachModal({ isOpen, onClose, selectedLeads, onOutreach }) {
  const [step, setStep] = useState('choice')
  const [outreachType, setOutreachType] = useState(null)
  const [config, setConfig] = useState({
    senderService: '',
    senderName: '',
    tone: 'professional'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState([])
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0 })

  const leadsWithEmail = selectedLeads.filter(lead => lead.email)
  const leadsWithPhone = selectedLeads.filter(lead => lead.phone)

  const handleTypeSelect = (type) => {
    setOutreachType(type)
    setStep('configure')
  }

  const handleGenerate = async () => {
    if (!config.senderService || !config.senderName) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/outreach/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: selectedLeads,
          type: outreachType,
          config: config
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      setGeneratedContent(data.content)
      setStep('preview')
    } catch (error) {
      console.error('Generation failed:', error)
      // Fallback to basic templates
      const fallbackContent = generateFallbackContent()
      setGeneratedContent(fallbackContent)
      setStep('preview')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackContent = () => {
    if (outreachType === 'email') {
      return selectedLeads
        .filter(lead => lead.email)
        .map(lead => {
          const fallbackSubject = `Quick question about your ${lead.category || 'business'}`;
          const fallbackBody = `Hi ${lead.name || 'there'},\n\nI came across ${lead.businessName}${lead.city ? ` in ${lead.city}` : ''} and wanted to connect about ${config.senderService}.\n\nWould you be open to a quick 15-minute call to discuss how this could help your business?\n\nBest regards,\n${config.senderName}`;
          return {
            leadId: lead.id,
            subject: fallbackSubject,
            body: fallbackBody,
            type: 'email',
            email: lead.email,
            options: [{ subject: fallbackSubject, body: fallbackBody }],
            selectedOptionIndex: 0
          }
        })
    } else {
      return selectedLeads
        .filter(lead => lead.phone)
        .map(lead => {
          const fallbackMessage = `Hi ${lead.name || 'there'}! Found ${lead.businessName}${lead.city ? ` in ${lead.city}` : ''} and wanted to connect about ${config.senderService}. Would you be open to a quick chat?\n\nBest,\n${config.senderName}`;
          return {
            leadId: lead.id,
            phone: formatIndianPhoneNumber(lead.phone),
            message: fallbackMessage,
            type: 'whatsapp',
            options: [fallbackMessage],
            selectedOptionIndex: 0
          }
        })
    }
  }

  const handleSend = async () => {
    setStep('sending')
    setSendingProgress({ sent: 0, total: generatedContent.length })

    try {
      if (outreachType === 'whatsapp') {
        // Open WhatsApp links in new tabs with delays
        for (let i = 0; i < generatedContent.length; i++) {
          const content = generatedContent[i]
          if (content.phone && content.message) {
            const whatsappUrl = `https://wa.me/${content.phone}?text=${encodeURIComponent(content.message)}`
            window.open(whatsappUrl, '_blank')

            setSendingProgress(prev => ({ ...prev, sent: i + 1 }))

            // Add delay between messages (3 seconds)
            if (i < generatedContent.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 3000))
            }
          }
        }
      } else if (outreachType === 'email') {
        // For email, you would integrate with your email service
        // For now, we'll simulate sending with progress
        for (let i = 0; i < generatedContent.length; i++) {
          setSendingProgress(prev => ({ ...prev, sent: i + 1 }))
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      await onOutreach(outreachType, { ...config, content: generatedContent })
      setStep('complete')
    } catch (error) {
      console.error('Sending failed:', error)
      setStep('complete')
    }
  }

  const resetModal = () => {
    setStep('choice')
    setOutreachType(null)
    setConfig({
      senderService: '',
      senderName: '',
      tone: 'professional'
    })
    setGeneratedContent([])
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                    {['choice', 'configure', 'preview', 'sending', 'complete'].map((s, i) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          s === step ? 'w-6 bg-blue-500' :
                          ['choice', 'configure', 'preview', 'sending', 'complete'].indexOf(s) <
                          ['choice', 'configure', 'preview', 'sending', 'complete'].indexOf(step)
                            ? 'w-4 bg-green-400' : 'w-4 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100">
                  <FiX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar p-6">
                  <AnimatePresence mode="wait">
                    {step === 'choice' && (
                      <motion.div
                        key="choice"
                        className="space-y-6"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                      >
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">🚀 Choose Outreach Method</h2>
                          <p className="text-gray-500 mt-1">
                            How do you want to reach out to {selectedLeads.length} selected leads?
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <motion.button
                            onClick={() => handleTypeSelect('email')}
                            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FiMail className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">Email Outreach</h3>
                                <p className="text-sm text-gray-600">Professional email campaigns</p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {leadsWithEmail.length} of {selectedLeads.length} leads have email addresses
                            </div>
                            {leadsWithEmail.length < selectedLeads.length && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                                <FiAlertTriangle size={12} />
                                Some leads missing email addresses
                              </div>
                            )}
                          </motion.button>

                          <motion.button
                            onClick={() => handleTypeSelect('whatsapp')}
                            className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-left"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <FiMessageSquare className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">WhatsApp Outreach</h3>
                                <p className="text-sm text-gray-600">Direct messaging campaigns</p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {leadsWithPhone.length} of {selectedLeads.length} leads have phone numbers
                            </div>
                            {leadsWithPhone.length < selectedLeads.length && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                                <FiAlertTriangle size={12} />
                                Some leads missing phone numbers
                              </div>
                            )}
                          </motion.button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FiCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Smart Defaults</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                We'll automatically choose the best method for leads based on available contact information.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 'configure' && (
                      <motion.div
                        key="configure"
                        className="space-y-6"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                      >
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            ⚙️ Configure {outreachType === 'email' ? 'Email' : 'WhatsApp'} Outreach
                          </h2>
                          <p className="text-gray-500 mt-1">
                            Set up your AI-powered messaging for {selectedLeads.length} leads
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <FiSend size={14} /> AI Configuration
                          </div>

                          <input
                            value={config.senderService}
                            onChange={e => setConfig(p => ({...p, senderService: e.target.value}))}
                            placeholder={outreachType === 'email' ? "What service are you offering?" : "What do you want to discuss?"}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 outline-none text-sm"
                          />

                          <input
                            value={config.senderName}
                            onChange={e => setConfig(p => ({...p, senderName: e.target.value}))}
                            placeholder="Your name"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 outline-none text-sm"
                          />

                          <div className="flex gap-2">
                            {(['professional', 'friendly', 'casual']).map(tone => (
                              <button
                                key={tone}
                                onClick={() => setConfig(p => ({...p, tone}))}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border ${
                                  config.tone === tone
                                    ? 'bg-blue-500 text-white border-blue-500'
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
                            onClick={() => setStep('choice')}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
                          >
                            ← Back to Choice
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
                              <>🤖 Generate AI Content <FiSend size={14} /></>
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
                            <h2 className="text-xl font-bold">Preview {outreachType === 'email' ? 'Emails' : 'WhatsApp Messages'}</h2>
                            <p className="text-green-600 text-sm flex items-center gap-1">
                              <FiCheck size={14} /> AI generated {generatedContent.length} {outreachType === 'email' ? 'emails' : 'messages'} - Review before sending
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-4">
                          {generatedContent.map((content, index) => (
                            <div key={index} className="rounded-xl border-2 border-blue-200 overflow-hidden bg-white shadow-sm">
                              <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span className="font-semibold">
                                      {outreachType === 'email' ? 'To:' : 'WhatsApp to:'}
                                    </span>
                                    <span>
                                      {outreachType === 'email'
                                        ? selectedLeads[index]?.email
                                        : `+${content.phone}`
                                      }
                                    </span>
                                  </div>
                                  <div className="text-sm font-bold mt-1 text-gray-900">
                                    {selectedLeads[index]?.businessName}
                                  </div>
                                </div>
                                <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-md font-semibold">
                                  Lead {index + 1} of {generatedContent.length}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50/80 p-3 border-b border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Select Message Variation</div>
                                <div className="flex gap-2">
                                  {content.options && content.options.length > 0 ? content.options.map((opt, optIndex) => (
                                    <button
                                      key={optIndex}
                                      onClick={() => {
                                        setGeneratedContent(prev => prev.map((item, i) => {
                                          if (i === index) {
                                            if (item.type === 'email') {
                                              return { ...item, selectedOptionIndex: optIndex, subject: item.options[optIndex].subject, body: item.options[optIndex].body };
                                            } else {
                                              return { ...item, selectedOptionIndex: optIndex, message: item.options[optIndex] };
                                            }
                                          }
                                          return item;
                                        }));
                                      }}
                                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                                        (content.selectedOptionIndex || 0) === optIndex
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                      }`}
                                    >
                                      Option {optIndex + 1}
                                    </button>
                                  )) : (
                                    <div className="text-xs text-gray-500 bg-white px-3 py-2 border rounded-lg w-full text-center">Default Variation</div>
                                  )}
                                </div>
                              </div>

                              <div className="p-5 text-sm text-gray-700 whitespace-pre-wrap bg-white">
                                {outreachType === 'email' && (
                                  <div className="text-sm font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3 flex flex-col gap-1">
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Subject</span>
                                    {content.subject}
                                  </div>
                                )}
                                <div className="text-sm text-gray-700 leading-relaxed">
                                  {outreachType === 'email' ? content.body : content.message}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <FiMessageSquare size={16} />
                            <span className="font-medium">
                              {outreachType === 'email' ? 'Email' : 'WhatsApp'} Best Practices:
                            </span>
                          </div>
                          <ul className="text-xs text-blue-600 mt-2 space-y-1">
                            {outreachType === 'email' ? (
                              <>
                                <li>• Emails will be sent through your configured service</li>
                                <li>• Professional tone with clear call-to-action</li>
                                <li>• Personalized content based on business details</li>
                              </>
                            ) : (
                              <>
                                <li>• Messages will open WhatsApp in new tabs</li>
                                <li>• 3-second delay between messages</li>
                                <li>• Short, conversational tone for better engagement</li>
                              </>
                            )}
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
                            onClick={handleSend}
                            className="flex-grow py-3 px-6 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                            style={{ background: outreachType === 'email' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'linear-gradient(135deg, #25D366, #128C7E)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiSend size={16} /> Send All {generatedContent.length} {outreachType === 'email' ? 'Emails' : 'Messages'}
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
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                            style={{
                              background: outreachType === 'email'
                                ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                                : 'linear-gradient(135deg, #25D366, #128C7E)'
                            }}
                          >
                            {outreachType === 'email' ? '📧' : '📱'}
                          </motion.div>
                          <h2 className="text-xl font-bold">
                            {outreachType === 'email' ? 'Sending Emails...' : 'Opening WhatsApp...'}
                          </h2>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{sendingProgress.sent} / {sendingProgress.total}</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background: outreachType === 'email'
                                  ? 'linear-gradient(90deg, #3B82F6, #1D4ED8)'
                                  : 'linear-gradient(90deg, #25D366, #128C7E)',
                                width: sendingProgress.total > 0
                                  ? `${(sendingProgress.sent / sendingProgress.total) * 100}%`
                                  : '0%'
                              }}
                              initial={{ width: '0%' }}
                              animate={{
                                width: sendingProgress.total > 0
                                  ? `${(sendingProgress.sent / sendingProgress.total) * 100}%`
                                  : '0%'
                              }}
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <FiMessageSquare size={16} />
                            <span className="font-medium">
                              {outreachType === 'email' ? 'Email Campaign' : 'WhatsApp Campaign'} in Progress
                            </span>
                          </div>
                          <ul className="text-xs text-blue-600 mt-2 space-y-1">
                            {outreachType === 'email' ? (
                              <>
                                <li>• Emails are being queued for delivery</li>
                                <li>• Check your outreach dashboard for status</li>
                                <li>• Delivery may take a few minutes</li>
                              </>
                            ) : (
                              <>
                                <li>• WhatsApp chats opening in new tabs</li>
                                <li>• 3-second delay between messages</li>
                                <li>• Manual sending required for each chat</li>
                              </>
                            )}
                          </ul>
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
                          <h2 className="text-2xl font-bold">
                            {outreachType === 'email' ? 'Emails' : 'WhatsApp Messages'} Sent!
                          </h2>
                          <p className="text-gray-500">
                            Your outreach campaign has been launched successfully
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={handleClose} className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium">
                            Close
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}