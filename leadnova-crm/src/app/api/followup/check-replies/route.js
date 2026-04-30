'use client'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGmailForReplies } from '@/lib/followup/reply-detector'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: settings } = await supabase
    .from('user_email_settings')
    .select('gmail_address, gmail_app_password')
    .eq('user_id', user.id)
    .single()

  if (!settings?.gmail_address) {
    return NextResponse.json({ error: 'Gmail not configured' }, { status: 400 })
  }

  try {
    const result = await checkGmailForReplies(user.id, 48)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}