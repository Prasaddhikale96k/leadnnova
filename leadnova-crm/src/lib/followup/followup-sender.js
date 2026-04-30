'use client'

import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'
import { generateFollowUpEmail } from './groq-followup-generator'

export async function processAndSendFollowUp(followupId, config) {
  const supabase = createClient()
  
  const { data: followup, error: fetchError } = await supabase
    .from('followup_emails')
    .select(`
      *,
      original_email:outreach_emails!original_email_id(
        id, subject, body_text, gmail_message_id, gmail_thread_id,
        reply_received, followup_stopped, unsubscribed,
        to_email, business_name, sent_at
      ),
      lead:indian_leads!lead_id(
        business_name, business_category, city, state, 
        rating, website, niche
      )
    `)
    .eq('id', followupId)
    .single()

  if (fetchError || !followup) {
    return { success: false, error: 'Follow-up not found' }
  }

  const original = followup.original_email
  const lead = followup.lead

  if (original?.reply_received) {
    await cancelFollowUp(followupId, 'replied', supabase)
    return { success: false, error: 'Reply already received - cancelled' }
  }
  
  if (original?.followup_stopped) {
    await cancelFollowUp(followupId, 'sequence_stopped', supabase)
    return { success: false, error: 'Follow-up sequence stopped' }
  }
  
  if (original?.unsubscribed) {
    await cancelFollowUp(followupId, 'unsubscribed', supabase)
    return { success: false, error: 'Recipient unsubscribed' }
  }

  const daysSinceFirstEmail = Math.floor(
    (Date.now() - new Date(original?.sent_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  let emailContent = {
    subject: followup.subject,
    body_html: followup.body_html,
    body_text: followup.body_text
  }

  if (followup.body_html === 'PENDING_GENERATION' || !followup.body_html || followup.body_html?.startsWith('PENDING')) {
    await supabase
      .from('followup_emails')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', followupId)

    const generated = await generateFollowUpEmail({
      businessName: lead?.business_name || followup.business_name,
      businessCategory: lead?.business_category || 'Business',
      city: lead?.city || 'India',
      state: lead?.state || '',
      rating: lead?.rating,
      website: lead?.website,
      senderName: config.fromName,
      senderService: lead?.niche || 'our services',
      followupNumber: followup.followup_number,
      followupType: followup.sequence_type,
      daysSinceFirstEmail,
      originalEmailSubject: original?.subject || 'your inquiry',
    })

    emailContent = {
      subject: followup.subject.startsWith('Re:') 
        ? followup.subject 
        : `Re: ${original?.subject}`,
      body_html: generated.body_html,
      body_text: generated.body_text
    }

    await supabase
      .from('followup_emails')
      .update({
        subject: emailContent.subject,
        body_html: emailContent.body_html,
        body_text: emailContent.body_text,
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', followupId)
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmailAddress,
      pass: config.appPassword.replace(/\s/g, '')
    }
  })

  try {
    await supabase
      .from('followup_emails')
      .update({ status: 'sending', updated_at: new Date().toISOString() })
      .eq('id', followupId)

    const mailOptions = {
      from: `"${config.fromName}" <${config.gmailAddress}>`,
      to: followup.to_email,
      subject: emailContent.subject,
      html: emailContent.body_html,
      text: emailContent.body_text,
      replyTo: config.replyTo || config.gmailAddress,
      references: [
        original?.gmail_message_id,
        followup.in_reply_to
      ].filter(Boolean).join(' '),
      inReplyTo: original?.gmail_message_id || followup.in_reply_to,
      headers: {
        'X-Mailer': 'LeadNova Follow-up System',
        'X-Follow-Up-Number': String(followup.followup_number),
        'X-Campaign-ID': followup.campaign_id || '',
        'X-LeadNova-FollowUp': 'true'
      }
    }

    if (original?.gmail_thread_id) {
      mailOptions.headers['X-GM-THRID'] = original.gmail_thread_id
    }

    const info = await transporter.sendMail(mailOptions)
    const now = new Date().toISOString()

    await supabase
      .from('followup_emails')
      .update({
        status: 'sent',
        gmail_message_id: info.messageId,
        sent_at: now,
        updated_at: now
      })
      .eq('id', followupId)

    await supabase
      .from('outreach_emails')
      .update({
        followup_count: (original?.followup_count || 0) + 1,
        last_followup_sent_at: now,
        updated_at: now
      })
      .eq('id', original?.id)

    if (followup.followup_number >= 3) {
      await supabase
        .from('outreach_emails')
        .update({
          followup_stopped: true,
          followup_stop_reason: 'max_reached',
          updated_at: now
        })
        .eq('id', original?.id)
    }

    return { success: true }
    
  } catch (error) {
    const errMsg = error.message || 'Send failed'
    
    await supabase
      .from('followup_emails')
      .update({
        status: 'failed',
        error_message: errMsg,
        retry_count: (followup.retry_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', followupId)

    return { success: false, error: errMsg }
  }
}

async function cancelFollowUp(followupId, reason, supabase) {
  await supabase
    .from('followup_emails')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', followupId)
}