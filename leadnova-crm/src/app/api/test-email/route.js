import { NextResponse } from 'next/server'
import { createGmailTransporter, sendSingleEmail } from '@/lib/email/nodemailer'

export async function POST() {
  const transporter = createGmailTransporter('leadnovaa001@gmail.com', 'ebrvkexvzzhdapyu')
  
  const result = await sendSingleEmail(transporter, {
    from: 'leadnovaa001@gmail.com',
    fromName: 'LeadNova Test',
    to: 'leadnovaa001@gmail.com',
    subject: 'Test Email from LeadNova',
    html: '<p>This is a test email.</p>',
    text: 'This is a test email.'
  })
  
  return NextResponse.json(result)
}