'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { formatIndianPhone } from '@/lib/indian-leads/india-data'
import { formatIndianPhoneNumber } from '@/utils/phoneFormatter'
import LeadDetailModal from './LeadDetailModal'
import { FiSearch, FiDownload, FiFilter, FiChevronDown, FiCopy, FiExternalLink, FiStar, FiMail, FiEye, FiX, FiMessageSquare } from 'react-icons/fi'

export default function LeadsDataTable({ leads, searchParams, selectedLeads = [], onSelectLead, onSelectAll }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [filterBy, setFilterBy] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState(null)
  const [emailPreviewLead, setEmailPreviewLead] = useState(null)
  const tableRef = useRef(null)

  const handleWhatsAppMessage = (lead) => {
    const phone = formatIndianPhoneNumber(lead.phone)
    if (!phone) {
      alert('Invalid phone number')
      return
    }

    // Create a simple WhatsApp message
    const message = `Hi! I found ${lead.business_name} in ${lead.city} and wanted to connect. Would you be open to a quick chat?`
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const leadsPerPage = 20

  const filteredLeads = leads
    .filter(lead => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          lead.business_name?.toLowerCase().includes(query) ||
          lead.business_category?.toLowerCase().includes(query) ||
          lead.city?.toLowerCase().includes(query)
        )
      }
      return true
    })
    .filter(lead => {
      switch (filterBy) {
        case 'hasEmail': return !!lead.email
        case 'hasWebsite': return !!lead.website
        case 'rating4Plus': return (lead.rating || 0) >= 4
        case 'rating4_5Plus': return (lead.rating || 0) >= 4.5
        default: return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return (b.rating || 0) - (a.rating || 0)
        case 'reviews': return (b.reviews_count || 0) - (a.reviews_count || 0)
        case 'name': return (a.business_name || '').localeCompare(b.business_name || '')
        default: return 0
      }
    })

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage)
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  )

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.table-header',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }
      )
      gsap.fromTo('.table-row',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: 'power3.out' }
      )
    }, tableRef)
    return () => ctx.revert()
  }, [currentPage])

  const handleExportCSV = () => {
    const headers = ['Business Name', 'Category', 'Phone', 'Email', 'Website', 'Address', 'City', 'State', 'Rating', 'Reviews']
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        lead.business_name,
        lead.business_category,
        lead.phone,
        lead.email,
        lead.website,
        lead.address,
        lead.city,
        lead.state,
        lead.rating,
        lead.reviews_count
      ].map(val => `"${val || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `indian-leads-${searchParams.niche}-${searchParams.city || searchParams.state}.csv`
    a.click()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const formatReviews = (count) => {
    if (!count) return '-'
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div ref={tableRef} className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#0A0A0A' }}>
              <span>🇮🇳</span>
              Indian Leads
            </h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {searchParams ? `${searchParams.city || searchParams.location} · ${searchParams.niche}` : 'All Leads'} · {leads.length} results found
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 pr-4 rounded-lg text-sm outline-none"
                style={{
                  border: '1px solid #E5E7EB',
                  background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239CA3AF\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\'/%3E%3C/svg%3E") no-repeat 12px center/16px, white',
                  width: '200px'
                }}
              />
            </div>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm outline-none"
              style={{ border: '1px solid #E5E7EB', background: 'white' }}
            >
              <option value="all">All Leads</option>
              <option value="hasEmail">Has Email</option>
              <option value="hasWebsite">Has Website</option>
              <option value="rating4Plus">Rating 4+</option>
              <option value="rating4_5Plus">Rating 4.5+</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm outline-none"
              style={{ border: '1px solid #E5E7EB', background: 'white' }}
            >
              <option value="rating">Sort by Rating</option>
              <option value="reviews">Sort by Reviews</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              style={{
                background: '#FF6B35',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FF8C42'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FF6B35'}
            >
              <FiDownload className="text-sm" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header text-left text-xs font-medium" style={{ color: '#6B7280' }}>
                <th className="pb-3 pr-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length > 0}
                    onChange={onSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="pb-3 pr-4">#</th>
                <th className="pb-3 pr-4">Business Name</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">City</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Rating</th>
                <th className="pb-3 pr-4">Reviews</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedLeads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row border-t cursor-pointer group"
                    style={{ borderColor: '#F3F4F6' }}
                    onClick={(e) => {
                      if (e.target.type !== 'checkbox') setSelectedLead(lead)
                    }}
                    whileHover={{
                      backgroundColor: 'rgba(255,107,53,0.04)',
                      x: 4,
                      transition: { type: 'spring', stiffness: 400, damping: 30 }
                    }}
                  >
                    <td className="py-3 pr-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => onSelectLead(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 pr-4 text-sm" style={{ color: '#6B7280' }}>
                      {(currentPage - 1) * leadsPerPage + i + 1}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-sm" style={{ color: '#0A0A0A' }}>
                        {lead.business_name}
                      </div>
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center gap-1 mt-0.5"
                          style={{ color: '#FF6B35' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink className="text-[10px]" />
                          Website
                        </a>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm" style={{ color: '#6B7280' }}>
                      {lead.business_category || '-'}
                    </td>
                    <td className="py-3 pr-4 text-sm" style={{ color: '#6B7280' }}>
                      {lead.city}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-mono" style={{ color: '#0A0A0A' }}>
                          {formatIndianPhone(lead.phone || '')}
                        </span>
                        {lead.phone && (
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(lead.phone) }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiCopy className="text-xs" style={{ color: '#6B7280' }} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {lead.email ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm" style={{ color: '#0A0A0A' }}>
                            {lead.email.length > 20 ? lead.email.slice(0, 20) + '...' : lead.email}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(lead.email) }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiCopy className="text-xs" style={{ color: '#6B7280' }} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: '#9CA3AF' }}>-</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {lead.rating ? (
                        <div className="flex items-center gap-1">
                          <FiStar className="text-xs" style={{ color: '#F59E0B' }} />
                          <span className="text-sm font-medium" style={{ color: '#0A0A0A' }}>
                            {lead.rating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: '#9CA3AF' }}>-</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm" style={{ color: '#6B7280' }}>
                      {formatReviews(lead.reviews_count || 0)}
                    </td>
                    <td className="py-3 pr-4">
                      {lead.generated_email || lead.ai_cold_email_body ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEmailPreviewLead(lead) }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors"
                          style={{
                            borderColor: '#8B5CF6',
                            color: '#8B5CF6',
                            background: 'rgba(139, 92, 246, 0.05)'
                          }}
                        >
                          <FiEye size={12} />
                          Preview
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>Not Generated</span>
                      )}
                    </td>
                     <td className="py-3">
                       <div className="flex items-center gap-2">
                         {lead.phone && (
                           <button
                             onClick={(e) => { e.stopPropagation(); handleWhatsAppMessage(lead) }}
                             className="p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                             style={{
                               background: 'rgba(37, 211, 102, 0.1)',
                               color: '#25D366'
                             }}
                           >
                             <FiMessageSquare size={12} />
                             WhatsApp
                           </button>
                         )}
                         <button
                           className="p-1.5 rounded-lg text-xs font-medium transition-colors"
                           style={{
                             background: 'rgba(255,107,53,0.1)',
                             color: '#FF6B35'
                           }}
                         >
                           View
                         </button>
                       </div>
                     </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
            <span className="text-sm" style={{ color: '#6B7280' }}>
              Showing {(currentPage - 1) * leadsPerPage + 1} to {Math.min(currentPage * leadsPerPage, filteredLeads.length)} of {filteredLeads.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ border: '1px solid #E5E7EB' }}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ border: '1px solid #E5E7EB' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </AnimatePresence>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {emailPreviewLead && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEmailPreviewLead(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiMail className="text-purple-500" size={18} />
                    <h3 className="font-semibold text-gray-900">Generated Email Preview</h3>
                  </div>
                  <button onClick={() => setEmailPreviewLead(null)} className="p-1 rounded-lg hover:bg-gray-100">
                    <FiX size={18} />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
                  <div className="mb-3">
                    <div className="text-xs text-gray-500">Subject</div>
                    <div className="font-medium text-gray-900">{emailPreviewLead.ai_cold_email_subject || 'No subject'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-500">To</div>
                    <div className="text-sm text-gray-700">{emailPreviewLead.email}</div>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="text-xs text-gray-500 mb-2">Email Body</div>
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                      {emailPreviewLead.generated_email || emailPreviewLead.ai_cold_email_body || 'No email content'}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex gap-3">
                  <button onClick={() => setEmailPreviewLead(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium">Close</button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}