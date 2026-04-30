'use client'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processAndSendFollowUp } from '@/lib/followup/followup-sender'

export async function GET() {
  const authHeader = process.env.CRON_SECRET
  const result = {
    repliesChecked: 0,
    repliesFound: 0,
    followupsSent: 0,
    followupsFailed: 0,
    errors: []
  }

  try {
    const supabase = createClient()

    const { data: activeUsers } = await supabase
      .from('user_email_settings')
      .select('user_id, gmail_address, gmail_app_password, from_name, reply_to')
      .eq('is_gmail_verified', true)

    if (!activeUsers?.length) {
      return NextResponse.json({ message: 'No active users', results: result })
    }

    for (const userSettings of activeUsers) {
      try {
        const now = new Date().toISOString()
        
        const { data: dueFollowUps } = await supabase
          .from('followup_emails')
          .select('id, followup_number, to_email, original_email_id')
          .eq('user_id', userSettings.user_id)
          .in('status', ['scheduled', 'ready'])
          .lte('scheduled_for', now)
          .eq('reply_received', false)
          .order('scheduled_for', { ascending: true })
          .limit(50)

        if (!dueFollowUps?.length) {
          continue
        }

        for (const followup of dueFollowUps) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const sendResult = await processAndSendFollowUp(followup.id, {
            gmailAddress: userSettings.gmail_address,
            appPassword: userSettings.gmail_app_password,
            fromName: userSettings.from_name || 'LeadNova User',
            replyTo: userSettings.reply_to
          })

          if (sendResult.success) {
            result.followupsSent++
          } else {
            result.followupsFailed++
            result.errors.push(sendResult.error)
          }
        }

      } catch (userError) {
        result.errors.push(`User ${userSettings.user_id}: ${userError.message}`)
      }
    }

    return NextResponse.json({ success: true, results: result })

  } catch (error) {
    return NextResponse.json({ error: error.message, results: result }, { status: 500 })
  }
}