import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
  const { to, subject, body } = await request.json() || {}
  
  console.log('=== SIMPLE TEST ===')
  console.log('To:', to || 'leadnovaa001@gmail.com')
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'leadnovaa001@gmail.com',
      pass: 'ebrvkexvzzhdapyu'
    },
    tls: {
      rejectUnauthorized: true
    }
  })
  
  try {
    const info = await transporter.sendMail({
      from: 'LeadNova <leadnovaa001@gmail.com>',
      to: to || 'leadnovaa001@gmail.com',
      subject: subject || 'Test',
      html: `<p>${body || 'Test'}</p>`
    })
    
    console.log('SUCCESS:', info.messageId)
    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error) {
    console.error('FAILED:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}