'use client'

import { motion } from 'framer-motion'
import { formatIndianPhone } from '@/lib/indian-leads/india-data'
import { FiX, FiPhone, FiMail, FiGlobe, FiMapPin, FiStar, FiLinkedin, FiTwitter, FiFacebook, FiClock, FiExternalLink, FiUser } from 'react-icons/fi'

const businessTypeLabels = {
  proprietorship: 'Proprietorship',
  partnership: 'Partnership',
  pvt_ltd: 'Private Limited',
  llp: 'LLP'
}

export default function LeadDetailModal({ lead, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors"
          style={{ background: '#F3F4F6' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
        >
          <FiX className="text-lg" />
        </button>

        <div className="p-6">
          {/* Header */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
            }}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Business Placeholder */}
            <motion.div
              variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(19,136,8,0.1) 100%)',
                border: '1px solid rgba(255,107,53,0.2)'
              }}
            >
              🏢
            </motion.div>

            {/* Business Name */}
            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
              <h2 className="text-xl font-bold" style={{ color: '#0A0A0A' }}>
                {lead.business_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {lead.rating && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <FiStar className="text-xs" style={{ color: '#F59E0B' }} />
                    <span className="text-sm font-medium" style={{ color: '#F59E0B' }}>
                      {lead.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                {lead.reviews_count && (
                  <span className="text-sm" style={{ color: '#6B7280' }}>
                    ({lead.reviews_count} reviews)
                  </span>
                )}
                {lead.business_category && (
                  <span className="text-sm" style={{ color: '#6B7280' }}>
                    · {lead.business_category}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Contact Info Section */}
            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>
                Contact Info
              </h3>
              <div className="space-y-3">
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                    style={{ background: '#F9FAFB' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  >
                    <FiPhone className="text-lg" style={{ color: '#FF6B35' }} />
                    <span className="text-sm font-mono" style={{ color: '#0A0A0A' }}>
                      {formatIndianPhone(lead.phone)}
                    </span>
                  </a>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                    style={{ background: '#F9FAFB' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  >
                    <FiMail className="text-lg" style={{ color: '#138808' }} />
                    <span className="text-sm" style={{ color: '#0A0A0A' }}>
                      {lead.email}
                    </span>
                  </a>
                )}
                {lead.website && (
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                    style={{ background: '#F9FAFB' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  >
                    <FiGlobe className="text-lg" style={{ color: '#000080' }} />
                    <span className="text-sm" style={{ color: '#0A0A0A' }}>
                      {lead.website}
                    </span>
                    <FiExternalLink className="text-xs" style={{ color: '#6B7280' }} />
                  </a>
                )}
                {lead.address && (
                  <div className="flex items-start gap-3 p-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                    <FiMapPin className="text-lg mt-0.5" style={{ color: '#FF6B35' }} />
                    <span className="text-sm" style={{ color: '#0A0A0A' }}>
                      {lead.address}
                      {lead.pincode && <span className="ml-1">- {lead.pincode}</span>}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Business Info Section */}
            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>
                Business Info
              </h3>
              <div className="space-y-2">
                {lead.business_type && (
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                    <span className="text-sm" style={{ color: '#6B7280' }}>Business Type</span>
                    <span className="text-sm font-medium" style={{ color: '#0A0A0A' }}>
                      {businessTypeLabels[lead.business_type] || lead.business_type}
                    </span>
                  </div>
                )}
                {lead.employee_count && (
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                    <span className="text-sm" style={{ color: '#6B7280' }}>Employees</span>
                    <span className="text-sm font-medium" style={{ color: '#0A0A0A' }}>
                      {lead.employee_count}
                    </span>
                  </div>
                )}
                {lead.founded_year && (
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                    <span className="text-sm" style={{ color: '#6B7280' }}>Founded</span>
                    <span className="text-sm font-medium" style={{ color: '#0A0A0A' }}>
                      {lead.founded_year}
                    </span>
                  </div>
                )}
                {lead.gst_number && (
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                    <span className="text-sm" style={{ color: '#6B7280' }}>GST Number</span>
                    <span className="text-sm font-mono" style={{ color: '#0A0A0A' }}>
                      {lead.gst_number}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Decision Maker Contacts */}
            {lead.decision_maker_contacts && lead.decision_maker_contacts.length > 0 && (
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>
                  Decision Makers
                </h3>
                <div className="space-y-2">
                  {lead.decision_maker_contacts.map((contact, i) => (
                    <div key={i} className="p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <FiUser className="text-sm" style={{ color: '#FF6B35' }} />
                        <span className="text-sm font-medium" style={{ color: '#0A0A0A' }}>
                          {contact.name}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: '#6B7280' }}>{contact.role}</span>
                      {contact.email && (
                        <div className="text-xs mt-1" style={{ color: '#138808' }}>{contact.email}</div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Business Hours */}
            {lead.business_hours && Object.keys(lead.business_hours).length > 0 && (
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>
                  Business Hours
                </h3>
                <div className="space-y-1">
                  {Object.entries(lead.business_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="capitalize" style={{ color: '#6B7280' }}>{day}</span>
                      <span style={{ color: '#0A0A0A' }}>{hours}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Social Links */}
            {lead.social_links && Object.keys(lead.social_links).length > 0 && (
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>
                  Social Presence
                </h3>
                <div className="flex gap-2">
                  {lead.social_links.linkedin && (
                    <a href={lead.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: '#F9FAFB' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    >
                      <FiLinkedin className="text-lg" style={{ color: '#0077B5' }} />
                    </a>
                  )}
                  {lead.social_links.twitter && (
                    <a href={lead.social_links.twitter} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: '#F9FAFB' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    >
                      <FiTwitter className="text-lg" style={{ color: '#1DA1F2' }} />
                    </a>
                  )}
                  {lead.social_links.facebook && (
                    <a href={lead.social_links.facebook} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: '#F9FAFB' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    >
                      <FiFacebook className="text-lg" style={{ color: '#4267B2' }} />
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Google Maps Link */}
            {lead.google_maps_url && (
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm transition-all"
                  style={{ 
                    background: 'rgba(255,107,53,0.1)',
                    color: '#FF6B35',
                    border: '1px solid rgba(255,107,53,0.3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,107,53,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,107,53,0.1)'}
                >
                  <FiMapPin />
                  View on Google Maps
                </a>
              </motion.div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 space-y-3"
          >
            <button
              className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: '#FF6B35' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FF8C42'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FF6B35'}
            >
              <FiMail />
              Start Outreach
            </button>
            <button
              className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
              style={{ 
                background: 'white',
                border: '1px solid #E5E7EB',
                color: '#0A0A0A'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              Save Lead
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}