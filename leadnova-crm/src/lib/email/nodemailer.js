'use client'

import nodemailer from 'nodemailer'

export function createGmailTransporter(gmailAddress, appPassword) {
  const cleanPass = (appPassword || '').replace(/\s/g, '').trim()
  console.log('Creating transporter for:', gmailAddress, 'pass length:', cleanPass.length)
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailAddress,
      pass: cleanPass
    }
  })
  return transporter
}

export async function verifyGmailConnection(gmailAddress, appPassword) {
  try {
    const transporter = createGmailTransporter(gmailAddress, appPassword)
    await new Promise((resolve, reject) => {
      transporter.verify((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    console.log('Gmail verify SUCCESS')
    return { success: true }
  } catch (error) {
    console.error('Gmail verify error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendSingleEmail(transporter, options) {
  console.log('Sending email to:', options.to, 'from:', options.from)
  
  return new Promise((resolve) => {
    transporter.sendMail({
      from: `"${options.fromName}" <${options.from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || options.from
    }, (error, info) => {
      if (error) {
        console.error('Send error:', error)
        resolve({ success: false, error: error.message })
      } else {
        console.log('Send SUCCESS, messageId:', info.messageId)
        resolve({ success: true, messageId: info.messageId })
      }
    })
  })
}