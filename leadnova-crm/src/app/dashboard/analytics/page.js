'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FiUsers, FiMail, FiStar, FiTrendingUp } from 'react-icons/fi'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import gsap from 'gsap'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ total_leads: 0, emails_sent: 0, avg_rating: 0, converted: 0 })
  const [trendsData, setTrendsData] = useState([])
  const [ratingData, setRatingData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [cityData, setCityData] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanComplete, setScanComplete] = useState(false)
  const [animatedTrends, setAnimatedTrends] = useState([])
  const [animatedRatings, setAnimatedRatings] = useState([])
  const [animatedStatus, setAnimatedStatus] = useState([])
  const [animatedCities, setAnimatedCities] = useState([])

  const pageRef = useRef(null)
  const laserRef = useRef(null)
  const binaryRef = useRef(null)
  const chartCardsRef = useRef([])

  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (loading || !pageRef.current) return

    const ctx = gsap.context(() => {
      const cards = chartCardsRef.current.filter(Boolean)

      gsap.set(cards, { filter: 'blur(25px)', opacity: 0.3 })

      const laser = laserRef.current
      if (laser) {
        const tl = gsap.timeline({
          onComplete: () => {
            setScanComplete(true)
            gsap.to(cards, {
              filter: 'blur(0px)',
              opacity: 1,
              duration: 0.6,
              stagger: 0.15,
              ease: 'power2.out'
            })
          }
        })

        tl.fromTo(laser,
          { y: 0, opacity: 1 },
          { y: '100vh', duration: 2.5, ease: 'power1.inOut' }
        )
      }

      const binaryContainer = binaryRef.current
      if (binaryContainer) {
        const binaryStrings = Array.from({ length: 30 }, () =>
          Array.from({ length: 50 }, () => Math.round(Math.random())).join('')
        )

        binaryStrings.forEach((str, i) => {
          const el = document.createElement('div')
          el.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            font-size: 10px;
            font-family: monospace;
            opacity: 0.03;
            color: #000;
            white-space: nowrap;
          `
          el.textContent = str
          binaryContainer.appendChild(el)

          gsap.fromTo(el,
            { y: '100vh' },
            {
              y: '-100vh',
              duration: 15 + Math.random() * 20,
              repeat: -1,
              ease: 'none',
              delay: Math.random() * 10,
            }
          )
        })
      }
    }, pageRef)

    return () => ctx.revert()
  }, [loading])

  const animateChartData = () => {
    if (trendsData.length > 0) {
      const zeroTrends = trendsData.map(d => ({ ...d, leads: 0, emails: 0 }))
      setAnimatedTrends(zeroTrends)

      const tl = gsap.timeline()
      trendsData.forEach((d, i) => {
        const obj = { leads: 0, emails: 0 }
        tl.to(obj, {
          leads: d.leads,
          emails: d.emails,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: () => {
            setAnimatedTrends(prev => {
              const next = [...prev]
              next[i] = { ...next[i], leads: Math.round(obj.leads), emails: Math.round(obj.emails) }
              return next
            })
          }
        }, i * 0.08)
      })
    }

    if (ratingData.length > 0) {
      const zeroRatings = ratingData.map(d => ({ ...d, count: 0 }))
      setAnimatedRatings(zeroRatings)

      ratingData.forEach((d, i) => {
        const obj = { count: 0 }
        gsap.to(obj, {
          count: d.count,
          duration: 0.6,
          ease: 'power2.out',
          delay: i * 0.1,
          onUpdate: () => {
            setAnimatedRatings(prev => {
              const next = [...prev]
              next[i] = { ...next[i], count: Math.round(obj.count) }
              return next
            })
          }
        })
      })
    }

    if (cityData.length > 0) {
      const zeroCities = cityData.map(d => ({ ...d, count: 0 }))
      setAnimatedCities(zeroCities)

      cityData.forEach((d, i) => {
        const obj = { count: 0 }
        gsap.to(obj, {
          count: d.count,
          duration: 0.6,
          ease: 'power2.out',
          delay: i * 0.12,
          onUpdate: () => {
            setAnimatedCities(prev => {
              const next = [...prev]
              next[i] = { ...next[i], count: Math.round(obj.count) }
              return next
            })
          }
        })
      })
    }

    if (statusData.length > 0) {
      const zeroStatus = statusData.map(d => ({ ...d, value: 0 }))
      setAnimatedStatus(zeroStatus)

      statusData.forEach((d, i) => {
        const obj = { value: 0 }
        gsap.to(obj, {
          value: d.value,
          duration: 0.8,
          ease: 'power2.out',
          delay: i * 0.15,
          onUpdate: () => {
            setAnimatedStatus(prev => {
              const next = [...prev]
              next[i] = { ...next[i], value: Math.round(obj.value) }
              return next
            })
          }
        })
      })
    }
  }

  useEffect(() => {
    if (scanComplete) {
      animateChartData()
    }
  }, [scanComplete, trendsData, ratingData, cityData, statusData])

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: leads } = await supabase.from('leads').select('*').eq('user_id', user.id)
    const { data: emails } = await supabase.from('emails').select('*').eq('user_id', user.id)

    const l = leads || []
    const e = emails || []

    const converted = l.filter(x => x.status === 'converted').length
    const totalRating = l.reduce((sum, current) => sum + current.rating, 0)

    setStats({
      total_leads: l.length,
      emails_sent: e.filter(x => x.status === 'sent').length,
      avg_rating: l.length > 0 ? (totalRating / l.length).toFixed(1) : 0,
      converted: converted
    })

    const ratings = [1, 2, 3, 4, 5].map(r => ({ name: `${r}★`, count: l.filter(x => x.rating === r).length }))
    setRatingData(ratings)

    const sMap = {}
    l.forEach(x => { sMap[x.status] = (sMap[x.status] || 0) + 1 })
    setStatusData(Object.entries(sMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })))

    const cMap = {}
    l.forEach(x => { cMap[x.city] = (cMap[x.city] || 0) + 1 })
    setCityData(Object.entries(cMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 5))

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

    setLoading(false)
  }

  const cards = [
    { label: 'Total Leads', val: stats.total_leads, icon: FiUsers, col: 'text-gray-800', bg: 'bg-gray-100' },
    { label: 'Emails Sent', val: stats.emails_sent, icon: FiMail, col: 'text-gray-800', bg: 'bg-gray-100' },
    { label: 'Average Rating', val: stats.avg_rating, icon: FiStar, col: 'text-gray-800', bg: 'bg-gray-100' },
    { label: 'Converted', val: stats.converted, icon: FiTrendingUp, col: 'text-gray-800', bg: 'bg-gray-100' },
  ]

  const COLORS = ['#000', '#4B5563', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#6B7280']
  const tipStyle = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#000' }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></span>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="space-y-6 max-w-7xl mx-auto relative">
      {/* Binary Drift Background */}
      <div ref={binaryRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0" />

      {/* Laser Scanner */}
      {!scanComplete && (
        <div
          ref={laserRef}
          className="fixed left-0 right-0 h-[1px] bg-white z-[9999]"
          style={{
            boxShadow: '0 0 15px white, 0 0 30px rgba(255,255,255,0.5)',
          }}
        />
      )}

      <div className="relative z-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Analytics</h1>
        <p className="text-sm mt-1 text-gray-500">Track your lead generation and outreach performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="p-5 rounded-2xl glass border-gray-100">
            <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.col} flex items-center justify-center text-lg mb-4`}>
              <c.icon />
            </div>
            <p className="text-sm font-medium mb-1 text-gray-500">{c.label}</p>
            <p className="text-2xl md:text-3xl font-bold">{c.val}</p>
          </div>
        ))}
      </div>

        <div className="grid lg:grid-cols-2 gap-5">
        <div ref={el => { chartCardsRef.current[0] = el }} className="chart-card p-6 rounded-2xl glass border-gray-100">
          <h3 className="font-semibold mb-6 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Activity Trends (Last 7 Days)</h3>
          {stats.total_leads > 0 || stats.emails_sent > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={animatedTrends.length > 0 ? animatedTrends : trendsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" name="New Leads" dataKey="leads" stroke="#000" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Emails Sent" dataKey="emails" stroke="#6B7280" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center text-sm text-gray-500">No activity in the last 7 days</div>}
        </div>

        <div ref={el => { chartCardsRef.current[1] = el }} className="chart-card p-6 rounded-2xl glass border-gray-100">
          <h3 className="font-semibold mb-6 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Lead Quality (Ratings)</h3>
          {ratingData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={animatedRatings.length > 0 ? animatedRatings : ratingData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: '#0000000a' }} />
                <Bar dataKey="count" name="Leads" fill="#000" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center text-sm text-gray-500">No leads rated yet</div>}
        </div>

        <div ref={el => { chartCardsRef.current[2] = el }} className="chart-card p-6 rounded-2xl glass border-gray-100">
          <h3 className="font-semibold mb-6 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Top Cities</h3>
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={animatedCities.length > 0 ? animatedCities : cityData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: '#0000000a' }} />
                <Bar dataKey="count" name="Leads" fill="#6B7280" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center text-sm text-gray-500">No city data available</div>}
        </div>

        <div ref={el => { chartCardsRef.current[3] = el }} className="chart-card p-6 rounded-2xl glass border-gray-100">
          <h3 className="font-semibold mb-6 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Lead Pipeline Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={animatedStatus.length > 0 ? animatedStatus : statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={3} strokeWidth={2} dataKey="value">
                  {(animatedStatus.length > 0 ? animatedStatus : statusData).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tipStyle} />
                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" fill="#000" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stats.total_leads}
                </text>
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] uppercase tracking-widest" fill="#999">
                  Total Leads
                </text>
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center text-sm text-gray-500">No status data available</div>}
        </div>
      </div>
      </div>
    </div>
  )
}
