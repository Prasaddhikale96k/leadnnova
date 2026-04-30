import { NextResponse } from 'next/server'
import { createGmailTransporter, sendSingleEmail } from '@/lib/email/nodemailer'

export async function POST() {
  console.log('=== DIRECT TEST ===')
  
  const transporter = createGmailTransporter('leadnovaa001@gmail.com', 'ebrvkexvzzhdapyu')
  
  const result = await sendSingleEmail(transporter, {
    from: 'leadnovaa001@gmail.com',
    fromName: 'LeadNova',
    to: 'leadnovaa001@gmail.com',
    subject: 'Test Email',
    html: '<p>Test email from LeadNova!</p>',
    text: 'Test email from LeadNova!'
  })
  
  console.log('Direct test result:', result)
  return NextResponse.json(result)
}