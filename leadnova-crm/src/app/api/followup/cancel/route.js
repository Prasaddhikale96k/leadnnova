'use client'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { originalEmailId, reason } = await request.json()

  const { error } = await supabase
    .from('followup_emails')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('original_email_id', originalEmailId)
    .eq('user_id', user.id)
    .in('status', ['scheduled', 'ready', 'generating'])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase
    .from('outreach_emails')
    .update({
      followup_stopped: true,
      followup_stop_reason: reason || 'manual',
      updated_at: new Date().toISOString()
    })
    .eq('id', originalEmailId)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}