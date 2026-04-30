import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

const LEAK_KEYWORDS = [
  'subject line:', 'here is your', 'prompt:', 'instructions:',
  'respond with the json', 'no preamble', 'do not include any',
  'return only a valid json', 'campaign goal:', 'write a highly personalized',
  'you are nova', 'role:', 'task:', 'guidelines:',
  'angle:', 'the hook:', 'the connection:',
  'return only', 'output a clean json', 'format:',
  'system prompt', 'max 8 words', 'max tokens', 'openrouter', 'api key',
  'return a structured analysis', 'return ONLY', 'Respond with the JSON object only',
  'json structure:', 'output requirement:', 'campaign constraints:',
  'output format', 'niche adaptation', 'pre-send auditor'
]

function hasInstructionLeak(text) {
  if (!text) return true
  const lower = text.toLowerCase()
  return LEAK_KEYWORDS.some(kw => lower.includes(kw))
}

function resolveBusinessName(lead) {
  const raw = lead.company_name || ''
  const isUnknown = raw.toLowerCase().includes('unknown')
  if (!isUnknown && raw.trim()) return raw
  const email = lead.email || ''
  if (email) {
    try {
      const domain = email.split('@')[1].split('.')[0]
      return domain.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    } catch { }
  }
  return lead.business_type || 'Local Business'
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { leads } = await request.json()

    if (!leads?.length) {
      return NextResponse.json({ error: 'Missing leads data' }, { status: 400 })
    }

    let sent = 0, failed = 0, skipped = 0, blocked = 0
    const results = []

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i]

      if (!lead.email || !lead.email.includes('@')) {
        skipped++
        results.push({ lead_id: lead.id, status: 'skipped', reason: 'no_email' })
        await supabase.from('leads').update({ email_status: 'invalid' }).eq('id', lead.id)
        continue
      }

      if (lead.email_status === 'bounced' || lead.email_status === 'invalid') {
        skipped++
        results.push({ lead_id: lead.id, status: 'skipped', reason: 'previously_bounced' })
        continue
      }

      const pSubject = lead.email_subject || `Quick question about ${resolveBusinessName(lead)}`
      const pBody = lead.email_body || lead.cold_email

      if (!pBody) {
        skipped++
        results.push({ lead_id: lead.id, status: 'skipped', reason: 'no_email_body' })
        continue
      }

      if (hasInstructionLeak(pSubject) || hasInstructionLeak(pBody)) {
        console.warn(`Instruction leak detected for ${lead.company_name} - blocking send`)
        await supabase.from('leads').update({ email_verified: false }).eq('id', lead.id)
        blocked++
        results.push({ lead_id: lead.id, status: 'blocked', reason: 'instruction_leak' })
        continue
      }

      if (pSubject.toLowerCase().includes('unknown')) {
        console.warn(`Subject contains 'Unknown' for ${lead.company_name} - blocking send`)
        blocked++
        results.push({ lead_id: lead.id, status: 'blocked', reason: 'unknown_in_subject' })
        continue
      }

      const htmlBody = pBody.split('\n').map(line => {
        if (line.startsWith('✅')) return `<p style="color:#22c55e;margin:4px 0;">${line}</p>`
        if (line.trim() === '') return '<br/>'
        return `<p style="margin:4px 0;color:#333;">${line}</p>`
      }).join('')

      try {
        await transporter.sendMail({
          from: `"LeadNova AI" <${process.env.EMAIL_USER}>`,
          to: lead.email,
          subject: pSubject,
          text: pBody,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            ${htmlBody}
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="font-size:11px;color:#999;">Sent via LeadNova AI CRM</p>
          </div>`,
        })

        await supabase.from('emails').insert({
          user_id: user.id,
          lead_id: lead.id,
          to_email: lead.email,
          to_name: lead.full_name || lead.company_name,
          subject: pSubject,
          body: pBody,
          status: 'sent',
        })

        await supabase.from('leads').update({ status: 'contacted', email_status: 'sent' }).eq('id', lead.id)
        sent++
        results.push({ lead_id: lead.id, status: 'sent', subject: pSubject })
      } catch (emailErr) {
        const isBounce = emailErr.message.includes('550') || emailErr.message.includes('Recipient') || emailErr.message.includes('not found') || emailErr.message.includes('does not exist')

        await supabase.from('emails').insert({
          user_id: user.id,
          lead_id: lead.id,
          to_email: lead.email,
          to_name: lead.full_name || lead.company_name,
          subject: pSubject,
          body: pBody,
          status: 'failed',
          error_message: emailErr.message,
        })

        if (isBounce) {
          await supabase.from('leads').update({
            status: 'bounced',
            email_status: 'bounced',
            email_error: 'Recipient Not Found - 550 Bounce'
          }).eq('id', lead.id)
          console.warn(`Bounce recorded for ${lead.email} - marked as bounced`)
        }

        failed++
        results.push({ lead_id: lead.id, status: 'failed', error: emailErr.message })
      }
    }

    return NextResponse.json({ success: true, sent, failed, skipped, blocked, results })
  } catch (e) {
    console.error('Email route error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
