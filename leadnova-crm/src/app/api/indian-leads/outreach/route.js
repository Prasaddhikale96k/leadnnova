import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { formatIndianPhoneNumber } from '@/utils/phoneFormatter'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { leadIds, messages, config } = await request.json()

    if (!leadIds?.length || !messages?.length) {
      return NextResponse.json({ error: 'Missing required parameters: leadIds, messages' }, { status: 400 })
    }

    // Verify all leads belong to this user
    const { data: leads, error: leadsError } = await supabase
      .from('indian_leads')
      .select('id, business_name, owner_name, phone')
      .in('id', leadIds)
      .eq('user_id', user.id)

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    if (!leads || leads.length !== leadIds.length) {
      return NextResponse.json({ error: 'Some leads not found or unauthorized' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const records = []

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i]
      const messageData = messages[i] || {}
      const messageText = messageData.message || `Hi! I found ${lead.business_name} and wanted to connect about ${config?.senderService || 'our services'}. Would you be open to a quick chat?`

      // Format phone number
      const formattedPhone = formatIndianPhoneNumber(lead.phone)

      records.push({
        user_id: user.id,
        lead_id: lead.id,
        business_name: lead.business_name || '',
        owner_name: lead.owner_name || '',
        to_email: formattedPhone,
        subject: 'WhatsApp Outreach',
        body_html: messageText,
        body_text: messageText,
        ai_model_used: messageData.ai_model_used || 'manual',
        status: 'sent',
        sent_at: now,
        generated_at: now
      })
    }

    // Insert all outreach records
    const { error: insertError } = await supabase
      .from('outreach_emails')
      .insert(records)

    if (insertError) {
      console.error('Error inserting outreach records:', insertError)
      return NextResponse.json({ error: 'Failed to save outreach history' }, { status: 500 })
    }

    // Optionally update indian_leads outreach_status
    await supabase
      .from('indian_leads')
      .update({ outreach_status: 'contacted', email_sent_at: now })
      .in('id', leadIds)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, count: records.length })

  } catch (error) {
    console.error('Outreach log error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
