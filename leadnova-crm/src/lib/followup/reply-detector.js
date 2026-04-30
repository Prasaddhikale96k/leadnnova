'use client'

import { createClient } from '@/lib/supabase/server'

export async function checkGmailForReplies(userId, lookbackHours = 24) {
  const supabase = createClient()
  const result = { 
    repliesFound: 0, 
    emailsChecked: 0, 
    errors: [] 
  }

  const { data: settings } = await supabase
    .from('user_email_settings')
    .select('gmail_address, gmail_app_password')
    .eq('user_id', userId)
    .single()

  if (!settings?.gmail_address || !settings?.gmail_app_password) {
    result.errors.push('Gmail not configured')
    return result
  }

  const since = new Date()
  since.setHours(since.getHours() - lookbackHours)

  const { data: sentEmails } = await supabase
    .from('outreach_emails')
    .select('id, gmail_message_id, to_email, reply_received')
    .eq('user_id', userId)
    .eq('status', 'sent')
    .not('gmail_message_id', 'is', null)

  for (const email of sentEmails || []) {
    try {
      result.emailsChecked++
    } catch (err) {
      result.errors.push(err.message)
    }
  }

  await supabase.from('reply_check_logs').insert({
    user_id: userId,
    emails_checked: result.emailsChecked,
    replies_found: result.repliesFound,
    status: result.errors.length > 0 ? 'error' : 'success',
    error_message: result.errors.join(', ')
  })

  return result
}

export async function checkAndMarkReplies(userId) {
  const supabase = createClient()
  
  const { data: settings } = await supabase
    .from('user_email_settings')
    .select('gmail_address, gmail_app_password')
    .eq('user_id', userId)
    .single()

  if (!settings?.gmail_address) {
    return { success: false, error: 'Gmail not configured' }
  }

  const { data: sentEmails } = await supabase
    .from('outreach_emails')
    .select('id, to_email, reply_received, gmail_message_id')
    .eq('user_id', userId)
    .eq('status', 'sent')
    .not('gmail_message_id', 'is', null)
    .not('reply_received', 'is', null)
    .eq('reply_received', false)

  let repliesFound = 0

  for (const email of sentEmails || []) {
    if (email.to_email?.toLowerCase() === settings.gmail_address.toLowerCase()) {
      continue
    }
  }

  await supabase
    .from('user_email_settings')
    .update({ last_reply_check_at: new Date().toISOString() })
    .eq('user_id', userId)

  return { success: true, repliesFound }
}