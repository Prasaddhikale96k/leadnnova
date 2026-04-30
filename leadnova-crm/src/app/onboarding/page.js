'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { FiArrowRight, FiZap } from 'react-icons/fi'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    agency_name: '',
    service_type: '',
    service_description: '',
    phone: '',
    email_signature: '',
  })
  const supabase = createClient()
  const router = useRouter()
  const { isDark } = useTheme()

  const serviceTypes = [
    'Social Media Marketing', 'SEO Services', 'Google Ads / PPC',
    'Web Development', 'App Development', 'Content Marketing',
    'Email Marketing', 'Branding & Design', 'Video Marketing',
    'E-commerce Solutions', 'Business Consulting', 'Other',
  ]

  const handleComplete = async () => {
    if (!form.agency_name.trim()) return toast.error('Agency name is required')
    if (!form.service_type) return toast.error('Select your service type')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      ...form,
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (error) {
      toast.error('Failed to save. Try again.')
      setLoading(false)
      return
    }
    toast.success('Welcome to LeadNova! 🚀')
    router.push('/dashboard')
  }

  const inputClass = isDark ? 'input-dark' : 'input-light'

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-lg p-8 rounded-3xl ${isDark ? 'bg-dark-card border border-dark-border' : 'bg-white border border-gray-200 shadow-lg'}`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center font-extrabold text-white text-sm">LN</div>
          <span className="text-xl font-bold">Lead<span className="text-brand-400">Nova</span></span>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-brand-500' : isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-2">Welcome! Let&apos;s set up your agency 👋</h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tell us about your agency so we can personalize your experience.</p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Agency Name *</label>
                <input value={form.agency_name} onChange={e => setForm({ ...form, agency_name: e.target.value })}
                  placeholder="e.g., GrowthX Digital" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">What service do you provide? *</label>
                <div className="grid grid-cols-2 gap-2">
                  {serviceTypes.map(s => (
                    <button key={s} onClick={() => setForm({ ...form, service_type: s })}
                      className={`text-left text-sm px-3 py-2.5 rounded-xl border transition-all
                        ${form.service_type === s
                          ? 'bg-brand-500/10 border-brand-500/50 text-brand-400'
                          : isDark ? 'border-white/10 text-gray-400 hover:border-white/20' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => {
                if (!form.agency_name.trim()) return toast.error('Enter agency name')
                if (!form.service_type) return toast.error('Select service type')
                setStep(2)
              }} className="btn-primary w-full flex items-center justify-center gap-2">
                Next <FiArrowRight />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-2">Almost done! 🎯</h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>These details will be used in your cold email templates.</p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Describe your services (for cold emails)</label>
                <textarea value={form.service_description} onChange={e => setForm({ ...form, service_description: e.target.value })}
                  placeholder="e.g., We help businesses grow through social media marketing, content creation, and paid advertising campaigns"
                  rows={3} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91-9876543210" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Signature</label>
                <textarea value={form.email_signature} onChange={e => setForm({ ...form, email_signature: e.target.value })}
                  placeholder={`Best Regards,\nYour Name\n${form.agency_name || 'Your Agency'}\n${form.phone || '+91-XXXXXXXXXX'}`}
                  rows={4} className={inputClass} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className={`btn-secondary flex-1 ${isDark ? 'border border-white/10 text-gray-400 hover:bg-white/5' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  Back
                </button>
                <button onClick={handleComplete} disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiZap /> Launch Dashboard</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
