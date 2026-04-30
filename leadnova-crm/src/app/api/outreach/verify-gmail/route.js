import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyGmailConnection } from '@/lib/email/nodemailer'

export async function POST(request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { gmailAddress, appPassword, fromName, replyTo } = await request.json()

  const result = await verifyGmailConnection(gmailAddress, appPassword)

  if (result.success) {
    await supabase
      .from('user_email_settings')
      .upsert({
        user_id: user.id,
        gmail_address: gmailAddress,
        gmail_app_password: appPassword,
        from_name: fromName,
        reply_to: replyTo,
        is_gmail_verified: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
  }

  return NextResponse.json(result)
}