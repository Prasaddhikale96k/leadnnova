'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [profile, setProfile] = useState({
    agency_name: '',
    service_type: '',
    service_description: '',
    phone: '',
    email_signature: ''
  })
  
  const supabase = createClient()

  const serviceTypes = [
    'Social Media Marketing', 'SEO Services', 'Google Ads / PPC',
    'Web Development', 'App Development', 'Content Marketing',
    'Email Marketing', 'Branding & Design', 'Video Marketing',
    'E-commerce Solutions', 'Business Consulting', 'Other'
  ]

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setFetching(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({
          agency_name: data.agency_name || '',
          service_type: data.service_type || '',
          service_description: data.service_description || '',
          phone: data.phone || '',
          email_signature: data.email_signature || ''
        })
      }
    }
    setFetching(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to update settings')
    } else {
      toast.success('Settings updated successfully')
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Settings</h1>
        <p className="text-sm mt-1 text-gray-500">Configure your agency profile for personalized cold emails.</p>
      </div>

      <form onSubmit={handleSave} className="p-6 md:p-8 rounded-2xl glass border-gray-100 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Agency Name</label>
            <input 
              type="text" 
              required
              value={profile.agency_name} 
              onChange={e => setProfile({...profile, agency_name: e.target.value})} 
              className="input-dark" 
              placeholder="e.g. GrowthX Digital"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Service Type</label>
            <select 
              required
              value={profile.service_type} 
              onChange={e => setProfile({...profile, service_type: e.target.value})} 
              className="input-dark"
            >
              <option value="" disabled>Select your primary service</option>
              {serviceTypes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Service Description (used in AI generation & emails)</label>
          <textarea 
            rows="3" 
            value={profile.service_description} 
            onChange={e => setProfile({...profile, service_description: e.target.value})} 
            className="input-dark"
            placeholder="Describe what you do..."
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Phone Number</label>
          <input 
            type="text" 
            value={profile.phone} 
            onChange={e => setProfile({...profile, phone: e.target.value})} 
            className="input-dark" 
            placeholder="+91-XXXXXXXXXX"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Email Signature</label>
          <textarea 
            rows="5" 
            value={profile.email_signature} 
            onChange={e => setProfile({...profile, email_signature: e.target.value})} 
            className="input-dark"
            placeholder="Best Regards,&#10;Your Name&#10;Your Agency"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <FiSave />}
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
