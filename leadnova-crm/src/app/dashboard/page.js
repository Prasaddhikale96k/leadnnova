'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FiUsers, FiMail, FiTrendingUp, FiArrowRight, FiTarget } from 'react-icons/fi'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', color: '#000', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 500, marginBottom: '4px' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000', display: 'inline-block' }} />
            {entry.name}: <span style={{ fontWeight: 700 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardHome() {
  const [stats, setStats] = useState({ total: 0, selected: 0, emails: 0, rate: 0, contacted: 0 })
  const [trendsData, setTrendsData] = useState([])
  const [typeData, setTypeData] = useState([])
  const [recent, setRecent] = useState([])
  const [profile, setProfile] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const cardsRef = useRef([])
  const chartAreaRef = useRef(null)
  const donutRef = useRef(null)
  const recentTableRef = useRef(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)
    const { data: leads } = await supabase.from('leads').select('*').eq('user_id', user.id)
    const { data: emails } = await supabase.from('emails').select('*').eq('user_id', user.id)
    
    // Fetch Indian leads data
    const { data: indianLeads } = await supabase.from('indian_leads').select('*').eq('user_id', user.id)
    const { data: outreachEmails } = await supabase.from('outreach_emails').select('*').eq('user_id', user.id)

    const l = leads || [], e = emails || []
    const indianL = indianLeads || []
    const outreachE = outreachEmails || []
    
    const converted = l.filter(x => x.status === 'converted').length
    const contacted = l.filter(x => x.status === 'contacted').length
    const indianLeadsWithEmail = indianL.filter(x => x.email).length
    const indianEmailsSent = outreachE.filter(x => x.status === 'sent').length
    
    setStats({
      total: l.length,
      selected: l.filter(x => x.is_selected).length,
      emails: e.filter(x => x.status === 'sent').length,
      rate: l.length ? ((converted / l.length) * 100).toFixed(1) : 0,
      contacted,
      indianTotal: indianL.length,
      indianEmails: indianEmailsSent,
      indianWithEmail: indianLeadsWithEmail
    })

    const tData = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const leadsToday = l.filter(x => x.created_at.startsWith(dateStr)).length
      const emailsToday = e.filter(x => x.sent_at.startsWith(dateStr) && x.status === 'sent').length
      tData.push({ date: label, leads: leadsToday, emails: emailsToday })
    }
    setTrendsData(tData)

    const tm = {}; l.forEach(x => { tm[x.business_type] = (tm[x.business_type] || 0) + 1 })
    setTypeData(Object.entries(tm).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 6))
    setRecent(l.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5))

    setTimeout(() => setIsLoaded(true), 100)
  }

  useEffect(() => {
    if (!isLoaded || cardsRef.current.length === 0) return
    const validCards = cardsRef.current.filter(Boolean)
    gsap.fromTo(validCards,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power4.out' }
    )
  }, [isLoaded])

  useEffect(() => {
    if (!isLoaded) return

    if (chartAreaRef.current) {
      const paths = chartAreaRef.current.querySelectorAll('path')
      paths.forEach((path, i) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(path, { strokeDashoffset: 0, duration: 1.5, delay: 0.3 + i * 0.2, ease: 'power2.inOut' })
      })
    }

    if (donutRef.current) {
      const paths = donutRef.current.querySelectorAll('path')
      paths.forEach((path, i) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(path, { strokeDashoffset: 0, duration: 1.2, delay: 0.5 + i * 0.1, ease: 'power2.inOut' })
      })
    }

    if (recentTableRef.current) {
      const rows = recentTableRef.current.querySelectorAll('tr')
      gsap.fromTo(rows, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.6, ease: 'power2.out' })
    }
  }, [isLoaded])

  const bentoCards = [
    { label: 'Total Leads', val: stats.total, icon: FiUsers },
    { label: 'Emails Sent', val: stats.emails + stats.indianEmails, icon: FiMail },
    { label: 'Contacted', val: stats.contacted, icon: FiTarget },
    { label: 'Conversion', val: `${stats.rate}%`, icon: FiTrendingUp },
    { label: '🇮🇳 Indian Leads', val: stats.indianTotal || 0, icon: FiUsers },
    { label: '🇮🇳 Indian Emails', val: stats.indianEmails || 0, icon: FiMail },
  ]

  const COLORS = ['#000', '#4B5563', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#6B7280']
  const borderColor = 'rgba(0,0,0,0.1)'
  const cardBg = 'rgba(0,0,0,0.02)'
  const textPrimary = '#000'
  const textSecondary = 'rgba(0,0,0,0.5)'
  const textMuted = 'rgba(0,0,0,0.25)'
  const accentSoft = 'rgba(0,0,0,0.04)'

  return (
    <div className="py-10 relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
            <p className="text-xs font-mono mt-1" style={{ color: textMuted }}>Lead Engine Active</p>
          </div>
          <button onClick={() => router.push('/dashboard/leads')} className="text-sm !px-4 !py-2 flex items-center gap-2 rounded-xl font-semibold transition-all hover:scale-[1.02]" style={{ background: textPrimary, color: '#fff' }}>
            Generate Leads <FiArrowRight />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {bentoCards.map((c, i) => (
            <div
              key={i}
              ref={el => { cardsRef.current[i] = el }}
              className="p-5 rounded border cursor-default transition-all duration-300 hover:-translate-y-1"
              style={{ opacity: 0, background: cardBg, borderColor }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: textSecondary }}>{c.label}</span>
                <div className="w-8 h-8 rounded flex items-center justify-center text-sm" style={{ background: accentSoft, color: textPrimary }}>
                  <c.icon />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>{c.val}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div
            ref={chartAreaRef}
            className="p-6 rounded border"
            style={{ opacity: isLoaded ? 1 : 0, background: cardBg, borderColor }}
          >
            <h3 className="font-semibold mb-6 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>Activity Trends (Last 7 Days)</h3>
            {trendsData.some(d => d.leads > 0 || d.emails > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
                    </filter>
                  </defs>
                  <XAxis dataKey="date" stroke={textMuted} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" name="New Leads" dataKey="leads" stroke={textPrimary} strokeWidth={2} fill="none" dot={false} activeDot={{ r: 4, fill: textPrimary }} filter="url(#lineShadow)" />
                  <Area type="monotone" name="Emails Sent" dataKey="emails" stroke="#9CA3AF" strokeWidth={1.5} fill="none" dot={false} activeDot={{ r: 4, fill: '#9CA3AF' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-[240px] flex items-center justify-center text-sm" style={{ color: textMuted }}>No activity in the last 7 days</div>}
          </div>

          <div
            ref={donutRef}
            className="p-6 rounded border"
            style={{ opacity: isLoaded ? 1 : 0, background: cardBg, borderColor }}
          >
            <h3 className="font-semibold mb-6 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>Leads by Business Type</h3>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={72} outerRadius={88} strokeWidth={1} stroke="#fff" dataKey="value">
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <text x="50%" y="38%" textAnchor="middle" dominantBaseline="middle" className="uppercase tracking-[0.2em]" fill={textMuted} style={{ fontSize: '9px', fontWeight: 500 }}>
                    LEADS
                  </text>
                  <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="font-bold" fill={textPrimary} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px' }}>
                    {stats.total}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[240px] flex items-center justify-center text-sm" style={{ color: textMuted }}>No data yet</div>}
          </div>
        </div>

        <div
          ref={recentTableRef}
          className="p-6 rounded border"
          style={{ opacity: isLoaded ? 1 : 0, background: cardBg, borderColor }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>Recent Leads</h3>
            <button onClick={() => router.push('/dashboard/leads')} className="text-xs font-medium hover:underline" style={{ color: textPrimary }}>View All &rarr;</button>
          </div>
          {recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ color: textMuted }}>
                  <th className="text-left py-2 px-3 font-medium">Business</th>
                  <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Owner</th>
                  <th className="text-left py-2 px-3 font-medium hidden md:table-cell">City</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {recent.map((l, i) => (
                    <tr key={l.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <td className="py-3 px-3"><div className="font-medium" style={{ color: textPrimary }}>{l.company_name}</div><div className="text-xs" style={{ color: textSecondary }}>{l.business_type}</div></td>
                      <td className="py-3 px-3 hidden sm:table-cell" style={{ color: textSecondary }}>{l.full_name}</td>
                      <td className="py-3 px-3 hidden md:table-cell" style={{ color: textSecondary }}>{l.city}</td>
                      <td className="py-3 px-3"><span className={`px-2 py-1 rounded text-xs font-medium ${
                        l.status === 'new' ? 'bg-black/10 text-black' :
                        l.status === 'selected' ? 'bg-amber-500/10 text-amber-500' :
                        l.status === 'contacted' ? 'bg-purple-500/10 text-purple-500' :
                        l.status === 'converted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center py-12 text-sm" style={{ color: textMuted }}>No leads yet. Go to Leads page and generate some!</p>}
        </div>
      </div>
    </div>
  )
}
