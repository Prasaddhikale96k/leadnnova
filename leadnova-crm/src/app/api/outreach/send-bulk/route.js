import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error:', authError?.message)
    console.error('Request headers:', Object.fromEntries(request.headers.entries()))
    return NextResponse.json({ error: 'Unauthorized', sent: 0, failed: 0 }, { status: 401 })
  }

  const body = await request.json()
  const { leads } = body

  console.log('=== SEND-BULK ===')
  console.log('User:', user.id, 'Leads:', leads?.length)

  if (!leads || leads.length === 0) {
    return NextResponse.json({ error: 'No leads', sent: 0, failed: 0 })
  }

  const { data: settings } = await supabase
    .from('user_email_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('Settings:', settings)

  // Use user settings or fallback to environment variables
  const gmailAddress = settings?.gmail_address || process.env.EMAIL_USER
  const gmailPassword = settings?.gmail_app_password || process.env.EMAIL_PASS
  const fromName = settings?.from_name || 'LeadNova'

  console.log('Gmail:', gmailAddress, 'has pass:', !!gmailPassword)

  if (!gmailPassword) {
    return NextResponse.json({ error: 'Email not configured. Please set up Gmail in settings.', sent: 0, failed: 0 })
  }

  if (!gmailAddress) {
    return NextResponse.json({ error: 'Gmail address not set. Please configure in settings.', sent: 0, failed: 0 })
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: gmailAddress,
      pass: gmailPassword.replace(/\s/g, '')
    }
  })

  let sent = 0
  let failed = 0
  const now = new Date().toISOString()

  for (const lead of leads) {
    console.log('Sending to:', lead.email)

    if (!lead.email) {
      failed++
      continue
    }

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${gmailAddress}>`,
        to: lead.email,
        subject: lead.ai_cold_email_subject || `Quick question`,
        html: lead.generated_email || '<p>Hi!</p>'
      })

      console.log('✓ Sent:', lead.email)

      // Save to emails table (for Outreach History tab)
      await supabase.from('emails').insert({
        user_id: user.id,
        lead_id: lead.id || null,
        to_email: lead.email,
        to_name: lead.business_name || lead.owner_name || '',
        subject: lead.ai_cold_email_subject || '',
        body: lead.generated_email || '',
        status: 'sent',
        sent_at: now
      })

      // Save to outreach_emails table (for Follow-Up Sequences tab)
      if (lead.emailId || lead.campaign_id) {
        await supabase.from('outreach_emails').insert({
          user_id: user.id,
          campaign_id: lead.campaign_id || null,
          lead_id: lead.id || null,
          session_id: lead.session_id || null,
          business_name: lead.business_name || '',
          owner_name: lead.owner_name || '',
          to_email: lead.email,
          subject: lead.ai_cold_email_subject || '',
          body_html: lead.generated_email || '',
          body_text: lead.body_text || lead.preview || '',
          ai_model_used: lead.ai_model_used || 'llama-3.3-70b-versatile',
          status: 'sent',
          sent_at: now,
          generated_at: lead.generated_at || now
        })
      }

      sent++
    } catch (err) {
      console.error('✗ Failed:', lead.email, err.message)
      console.error('Full error:', err)
      failed++
    }
  }

  console.log('DONE:', { sent, failed })
  const response = NextResponse.json({ success: true, sent, failed, total: leads.length })
  console.log('Returning response:', { success: true, sent, failed, total: leads.length })
  return response
}