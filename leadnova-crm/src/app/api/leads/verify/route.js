import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { leadIds } = await req.json()
    if (!leadIds || !Array.isArray(leadIds)) {
      return NextResponse.json({ error: 'leadIds array required' }, { status: 400 })
    }

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds)
      .eq('user_id', user.id)

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads found' }, { status: 404 })
    }

    const results = []

    for (const lead of leads) {
      const businessName = lead.company_name || ''
      const email = lead.email || ''
      const insights = lead.needs || ''
      const isUnknown = businessName.toLowerCase().includes('unknown')

      let canSend = true
      let reason = ''
      let refinedBusinessName = businessName

      if (isUnknown && !insights) {
        canSend = false
        reason = 'Unknown business with no Gold Insights'
      }

      const genericPrefixes = ['info@', 'admin@', 'contact@', 'support@', 'hello@', 'sales@']
      const isGenericEmail = genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix))
      if (isGenericEmail && insights && insights.length > 50) {
        canSend = false
        reason = 'Generic email with highly personal insights mismatch'
      }

      if (!email || !email.includes('@') || !email.includes('.')) {
        canSend = false
        reason = 'Invalid email format'
      }

      if (isUnknown && email) {
        try {
          const domain = email.split('@')[1].split('.')[0]
          refinedBusinessName = domain
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
        } catch {
          refinedBusinessName = lead.business_type || 'Local Business'
        }
      }

      const city = lead.city || 'your area'
      const industry = lead.business_type || 'industry'
      const suggestedSubject = isUnknown
        ? `Quick question regarding ${industry} services in ${city}`
        : `Quick question for ${refinedBusinessName} regarding ${city} growth`

      if (canSend) {
        await supabase
          .from('leads')
          .update({
            company_name: refinedBusinessName,
            email_status: 'verified'
          })
          .eq('id', lead.id)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('leads')
          .update({
            email_status: 'invalid',
            email_error: reason
          })
          .eq('id', lead.id)
          .eq('user_id', user.id)
      }

      results.push({
        id: lead.id,
        can_send: canSend,
        refined_business_name: refinedBusinessName,
        reason: reason || 'Passed validation',
        suggested_subject: suggestedSubject
      })
    }

    const validCount = results.filter(r => r.can_send).length
    return NextResponse.json({ success: true, valid: validCount, total: results.length, results })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
