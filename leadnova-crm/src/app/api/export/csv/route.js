import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: leads } = await supabase.from('leads').select('*').eq('user_id', user.id).order('rating', { ascending: false })

  const headers = ['Business Name','Owner','Email','Phone','Business Type','City','Address','Rating','Status','Monthly Revenue','Online Presence','Needs','Created At']
  const rows = (leads || []).map(l => [
    l.company_name, l.full_name, l.email, l.company_phone, l.business_type, l.city, l.company_full_address,
    l.rating, l.status, l.monthly_revenue, l.online_presence, l.needs,
    new Date(l.created_at).toLocaleDateString()
  ])

  const esc = v => `"${String(v || '').replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leadnova-leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
