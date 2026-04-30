'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { INDIAN_STATES, POPULAR_NICHES, POPULAR_CITIES, getCitiesForState } from '@/lib/indian-leads/india-data'

export default function NicheLocationForm({ onSubmit }) {
  const [niche, setNiche] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [useCustomLocation, setUseCustomLocation] = useState(false)
  const [cities, setCities] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    if (state) {
      setCities(getCitiesForState(state))
    }
  }, [state])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.form-step',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.3 }
      )
      gsap.fromTo('.form-tag',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.05, duration: 0.4, delay: 0.6 }
      )
    }, formRef)
    return () => ctx.revert()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!niche) return

    setIsSubmitting(true)

    const data = {
      niche,
      location: useCustomLocation ? customLocation : (city ? `${city}, ${state}` : state),
      city: useCustomLocation ? '' : city,
      state: useCustomLocation ? '' : state
    }

    console.log('[FORM] Submitting form with data:', data)

    // Call onSubmit immediately (don't wait)
    onSubmit(data)
    // Keep isSubmitting true to show loading state
  }

  const handleNicheSelect = (nicheLabel) => {
    setNiche(nicheLabel)
  }

  const handleCityQuickSelect = (cityName) => {
    setUseCustomLocation(true)
    setCustomLocation(cityName)
  }

  return (
    <div ref={formRef} className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        style={{ borderLeft: '3px solid #FF6B35' }}>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🇮🇳</span>
          <h2 className="text-lg font-semibold" style={{ color: '#0A0A0A' }}>
            INDIA LEAD EXTRACTION PROTOCOL
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Niche */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="form-step mb-6"
          >
            <label className="block text-sm font-medium mb-2" style={{ color: '#0A0A0A' }}>
              <span className="mr-2">🏢</span>
              What type of businesses are you targeting?
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Web Designers, Restaurants, CA Firms..."
              className="w-full h-14 px-4 pl-12 rounded-xl text-sm outline-none transition-all"
              style={{
                border: '1.5px solid #E5E7EB',
                background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239CA3AF\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\'/%3E%3C/svg%3E") no-repeat 16px center/20px, white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FF6B35'
                e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB'
                e.target.style.boxShadow = 'none'
              }}
            />

            {/* Popular Niches */}
            <div className="mt-3">
              <p className="text-xs mb-2" style={{ color: '#6B7280' }}>Popular Niches:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_NICHES.slice(0, 8).map((item, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => handleNicheSelect(item.label)}
                    className="form-tag px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      border: '1px solid #E5E7EB',
                      color: niche === item.label ? '#FF6B35' : '#6B7280',
                      background: niche === item.label ? 'rgba(255,107,53,0.08)' : 'white'
                    }}
                    whileHover={{ scale: 1.05, borderColor: '#FF6B35' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.emoji} {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Step 2: Location */}
          <AnimatePresence>
            {niche && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="form-step mb-6"
              >
                <label className="block text-sm font-medium mb-3" style={{ color: '#0A0A0A' }}>
                  <span className="mr-2">📍</span>
                  Target Location in India
                </label>

                {!useCustomLocation ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <select
                        value={state}
                        onChange={(e) => { setState(e.target.value); setCity('') }}
                        className="w-full h-14 px-4 rounded-xl text-sm outline-none transition-all"
                        style={{
                          border: '1.5px solid #E5E7EB',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF6B35'
                          e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'
                        }}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s.code} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={!state}
                        className="w-full h-14 px-4 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
                        style={{
                          border: '1.5px solid #E5E7EB',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF6B35'
                          e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'
                        }}
                      >
                        <option value="">Select City</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="e.g. Connaught Place, New Delhi"
                      className="w-full h-14 px-4 pl-12 rounded-xl text-sm outline-none transition-all"
                      style={{
                        border: '1.5px solid #E5E7EB',
                        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239CA3AF\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z\'/%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M15 11a3 3 0 11-6 0 3 3 0 016 0z\'/%3E%3C/svg%3E") no-repeat 16px center/20px, white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF6B35'
                        e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setUseCustomLocation(!useCustomLocation)}
                  className="text-xs font-medium mb-4 transition-colors"
                  style={{ color: '#FF6B35' }}
                >
                  {useCustomLocation ? '← Select from dropdown' : '— OR type custom location —'}
                </button>

                {/* Popular Cities */}
                <div>
                  <p className="text-xs mb-2" style={{ color: '#6B7280' }}>Popular Cities:</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_CITIES.map((c, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        onClick={() => handleCityQuickSelect(c)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          border: '1px solid #E5E7EB',
                          color: customLocation === c ? '#FF6B35' : '#6B7280',
                          background: customLocation === c ? 'rgba(255,107,53,0.08)' : 'white'
                        }}
                        whileHover={{ scale: 1.05, borderColor: '#FF6B35' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!niche || isSubmitting}
            className="w-full h-14 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #138808 100%)',
              opacity: (!niche || isSubmitting) ? 0.5 : 1,
              cursor: (!niche || isSubmitting) ? 'not-allowed' : 'pointer'
            }}
            whileHover={niche && !isSubmitting ? { scale: 1.02, boxShadow: '0 8px 30px rgba(255,107,53,0.4)' } : {}}
            whileTap={niche && !isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              <>
                🚀 Start Extracting Leads
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  )
}