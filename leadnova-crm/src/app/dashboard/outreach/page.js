'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { FiMail, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import FollowUpDashboard from '@/components/followup/FollowUpDashboard'

const TABS = [
  { id: 'history', label: '📤 Outreach History' },
  { id: 'followups', label: '🔄 Follow-Up Sequences' }
]

export default function OutreachPage() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('history')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch regular emails
    const { data: emailsData } = await supabase
      .from('emails')
      .select('*, leads(company_name, full_name)')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })

    // Fetch Indian leads outreach from outreach_emails
    const { data: indianOutreachData } = await supabase
      .from('outreach_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })

    // Get set of lead IDs that already have entries in emails table (regular leads)
    // to avoid duplicate display since regular leads are already in emails.
    const regularLeadIds = new Set((emailsData || []).map(e => e.lead_id).filter(Boolean))

    // Filter out any outreach_emails records that correspond to regular leads
    // Only include outreach_emails where lead_id is NOT in regular leads (i.e., Indian leads)
    const filteredIndianOutreach = (indianOutreachData || []).filter(r => !regularLeadIds.has(r.lead_id))

    // Normalize Indian outreach records to match display structure
    const normalizedIndian = filteredIndianOutreach.map(record => ({
      id: record.id,
      // Use business_name and owner_name directly
      leads: {
        company_name: record.business_name,
        full_name: record.owner_name
      },
      to_email: record.to_email,
      subject: record.subject,
      body: record.body_html || record.body_text || '',
      status: record.status,
      sent_at: record.sent_at,
      // Mark as Indian source for UI hints
      _source: 'indian'
    }))

    // Combine: regular emails already have leads(company_name, full_name) structure
    const allRecords = [...(emailsData || []), ...normalizedIndian]
      .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))

    setEmails(allRecords)
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Outreach</h1>
          <p className="text-sm mt-1 text-gray-500">Track all your sent cold emails and follow-up sequences.</p>
        </div>
      </div>

      <div className="px-1">
        <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              whileTap={{ scale: 0.97 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl glass border-gray-100">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></span>
            </div>
          ) : emails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-left py-3 px-4 font-medium">Business / Recipient</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">To Email</th>
                    <th className="text-left py-3 px-4 font-medium">Subject</th>
                    <th className="text-left py-3 px-4 font-medium text-center">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-right hidden sm:table-cell">Sent At</th>
                  </tr>
                </thead>
                   <tbody>
                   {emails.map((email, idx) => (
                     <tr key={email.id || idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                       <td className="py-4 px-4">
                         <div className="font-semibold">{email.leads?.company_name || 'Unknown'}</div>
                         <div className="text-xs text-gray-500">{email.leads?.full_name || email.to_name || 'Unknown'}</div>
                       </td>
                       <td className="py-4 px-4 hidden md:table-cell">
                         {email._source === 'indian' ? `📱 ${email.to_email}` : email.to_email}
                       </td>
                       <td className="py-4 px-4 max-w-xs truncate" title={email.subject}>{email.subject}</td>
                       <td className="py-4 px-4 flex justify-center">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                           email.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                         }`}>
                           {email.status === 'sent' ? <FiCheckCircle /> : <FiXCircle />}
                           {email.status}
                         </span>
                       </td>
                       <td className="py-4 px-4 text-xs text-right hidden sm:table-cell text-gray-500">
                         {formatDate(email.sent_at)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <FiMail className="mx-auto text-4xl mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-1">No emails sent yet</h3>
              <p className="text-sm text-gray-500">Select leads from the Leads page to start your outreach.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'followups' && (
        <div className="pb-8">
          <FollowUpDashboard />
        </div>
      )}
    </div>
  )
}