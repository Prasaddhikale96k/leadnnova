'use client'

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export async function generateFollowUpEmail(context) {
  const sequenceInstructions = {
    gentle_reminder: `
      This is Follow-up #1 (sent ${context.daysSinceFirstEmail} days after first email).
      Tone: Friendly, light, assume they just missed it.
      Style: Very short (3-4 sentences max). Reference the original email briefly.
      DO NOT be pushy. Just a gentle "bumping this up" style.
      End with: single soft question (e.g., "Does this sound relevant to you?")
    `,
    value_add: `
      This is Follow-up #2 (sent ${context.daysSinceFirstEmail} days after first email).
      Tone: Professional, value-driven.
      Style: Medium length. Add NEW value they haven't heard yet.
      Include: One specific insight, tip, or case study relevant to their ${context.businessCategory} business.
      End with: Clear but soft CTA.
    `,
    final_nudge: `
      This is Follow-up #3 - FINAL email (sent ${context.daysSinceFirstEmail} days after first email).
      Tone: Warm but creating subtle urgency. NOT desperate. Professional.
      Style: Short. This is the "last time I'll bother you" email.
      Key elements:
        - Acknowledge this is your last follow-up
        - Leave the door open for future ("I'll check back in a few months")
        - Offer one final easy action (just reply YES/NO, 30-sec call, etc.)
        - Be gracious and professional even in the goodbye
      NEVER sound bitter or passive-aggressive.
    `
  }

  const openedHint = context.wasEmailOpened 
    ? "Note: They opened the previous email but didn't reply. So they are somewhat interested."
    : ""

  const systemPrompt = `You are an expert cold email copywriter specializing in 
follow-up email sequences for Indian B2B outreach. You write follow-up emails that 
feel human, respectful, and never spammy.

CRITICAL RULES:
- Never copy the original email content
- Each follow-up must feel FRESH and add value
- Sound like a real person, not a template
- Keep it concise - respect their time
- Always include ONE unsubscribe line at bottom: "Reply STOP to opt out"
- NEVER use: "I hope this email finds you well", "As per my last email", "Just checking in"
- India context: Reference Indian business environment when relevant

Return ONLY valid JSON:
{
  "subject": "subject line here (keep as Re: original for threading)",
  "body_text": "plain text version",
  "body_html": "html with <p>, <br>, <strong>, <a> tags only"
}`

  const userPrompt = `Generate follow-up email #${context.followupNumber}:

Business Details:
- Name: ${context.businessName}
- Category: ${context.businessCategory}
- Location: ${context.city}, ${context.state}, India
- Rating: ${context.rating ? `${context.rating}/5` : 'Unknown'}
- Website: ${context.website || 'No website'}

Sender:
- Name: ${context.senderName}
- Service: ${context.senderService}
${context.senderCompany ? `- Company: ${context.senderCompany}` : ''}

Original Email Subject: "${context.originalEmailSubject}"
Days Since First Email: ${context.daysSinceFirstEmail} days
${openedHint}

Follow-up Instructions:
${sequenceInstructions[context.followupType]}

Generate the follow-up email now.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.75,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')
    
    return {
      subject: response.subject || `Re: ${context.originalEmailSubject}`,
      body_html: wrapFollowUpHTML(response.body_html || '', context),
      body_text: response.body_text || '',
      tokens_used: completion.usage?.total_tokens || 0
    }
  } catch (error) {
    console.error('GROQ follow-up generation error:', error)
    throw error
  }
}

function wrapFollowUpHTML(content, context) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;
             background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="color:#1a1a1a;line-height:1.7;font-size:15px;">
      ${content}
    </div>
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #f0f0f0;">
      <p style="color:#9CA3AF;font-size:11px;margin:0;">
        Follow-up ${context.followupNumber} of 3 · Sent via LeadNova
      </p>
      <p style="color:#9CA3AF;font-size:11px;margin:4px 0 0 0;">
        Reply <strong>STOP</strong> to unsubscribe from future emails.
      </p>
    </div>
  </div>
</body>
</html>`
}