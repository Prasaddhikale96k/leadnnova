import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export async function generateColdEmail(lead, options) {
  const toneInstructions = {
    professional: "formal, respectful, business-like tone",
    friendly: "warm, approachable, conversational tone",
    casual: "relaxed, friendly, like talking to a peer",
    formal: "highly formal, corporate language"
  }

  const systemPrompt = `You are an expert cold email copywriter specializing in 
B2B outreach for Indian businesses. You write highly personalized, 
conversion-focused cold emails that feel human and authentic.

Rules:
- Never use generic templates
- Reference specific details about the business (location, ratings, category)
- Keep subject lines under 60 characters
- Email body: 3-4 short paragraphs
- Include a clear single CTA
- No spam trigger words
- Sound human, not AI-generated
- Use Indian business context (mention GST, Indian market, etc. when relevant)
- Tone: ${toneInstructions[options.tone] || toneInstructions.professional}

Return ONLY valid JSON in this exact format:
{
  "subject": "email subject here",
  "body_text": "plain text version", 
  "body_html": "html version with <p>, <br>, <strong> tags only"
}`

  const userPrompt = `Generate a cold email for this Indian business:

Business Details:
- Name: ${lead.business_name}
- Category: ${lead.business_category}
- Location: ${lead.city}, ${lead.state}, India
- Google Rating: ${lead.rating ? `${lead.rating}/5 (${lead.reviews_count} reviews)` : 'Not available'}
- Website: ${lead.website || 'No website found'}
- Owner: ${lead.owner_name || 'Business Owner'}

What I'm Offering:
- Service: ${options.senderService}
- My Name: ${options.senderName}
${options.senderCompany ? `- Company: ${options.senderCompany}` : ''}
${options.focus ? `- Focus: ${options.focus}` : ''}

${lead.website ?
      `Personalization hint: They have a website, reference that you checked it.` :
      `Personalization hint: They don't have a website - this is an opportunity.`
    }

${lead.rating && lead.rating >= 4 ?
      `Personalization hint: They have excellent ratings - compliment this genuinely.` :
      lead.rating && lead.rating < 3.5 ?
        `Personalization hint: Focus on how you can help them improve their online presence.` : ''
    }

${options.customAddition || ''}`

  let response
  let completion

  try {
    completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1024
    })
    response = JSON.parse(completion.choices[0].message.content || '{}')
  } catch (apiError) {
    console.warn('GROQ API failed, using fallback template:', apiError.message)
    response = {
      subject: `Quick question about your ${lead.business_category} business`,
      body_text: `Hi ${lead.owner_name || 'Owner'},\n\nI came across ${lead.business_name} in ${lead.city}, ${lead.state} and was impressed by what you're doing. ${lead.rating ? `With a ${lead.rating} rating, it's clear you take quality seriously.` : ''}\n\nI'm reaching out because I believe we could help you grow your business even further. Would you be open to a quick 15-minute call to discuss how we're helping similar businesses in ${lead.city}?\n\nBest regards,\n${options.senderName}`,
      body_html: `<p>Hi ${lead.owner_name || 'Owner'},</p><p>I came across ${lead.business_name} in ${lead.city}, ${lead.state} and was impressed by what you're doing. ${lead.rating ? `With a ${lead.rating} rating, it's clear you take quality seriously.` : ''}</p><p>I'm reaching out because I believe we could help you grow your business even further. Would you be open to a quick 15-minute call to discuss how we're helping similar businesses in ${lead.city}?</p><p>Best regards,<br>${options.senderName}</p>`
    }
    completion = { usage: { total_tokens: 150 } }
  }

  if (!response) {
    response = {
      subject: `Quick question about your ${lead.business_category} business`,
      body_text: `Hi ${lead.owner_name || 'Owner'},\n\nI came across ${lead.business_name} and would love to connect.\n\nBest,\n${options.senderName}`,
      body_html: `<p>Hi ${lead.owner_name || 'Owner'},</p><p>I came across ${lead.business_name} and would love to connect.</p><p>Best,<br>${options.senderName}</p>`
    }
  }

  return {
    subject: response.subject || 'Quick question about your business',
    body_html: wrapEmailHTML(response.body_html || '', lead, options),
    body_text: response.body_text || '',
    tokens_used: completion?.usage?.total_tokens || 0
  }
}

function wrapEmailHTML(content, lead, options) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lead.business_name}</title>
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f9fa;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow-hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#FF6B35,#FF8C42);padding:24px 32px;">
      <div style="color:white;font-size:18px;font-weight:700;">${options.senderCompany || options.senderName}</div>
      <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-top:4px;">${options.senderService}</div>
    </div>
    <div style="padding:32px;color:#1a1a1a;line-height:1.7;font-size:15px;">${content}</div>
    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;font-size:12px;color:#888;">
      <p>Sent via LeadNova · India</p>
      <p style="margin-top:8px;">If you don't want to receive these emails, please reply with "unsubscribe"</p>
    </div>
  </div>
</body>
</html>`
}

export async function generateBulkEmails(leads, options, onProgress) {
  const results = new Map()

  const batchSize = 10
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async (lead) => {
        try {
          const email = await generateColdEmail(lead, options)
          results.set(lead.business_name, email)
        } catch (error) {
          console.error(`Failed to generate email for ${lead.business_name}:`, error)
        }
      })
    )

    onProgress?.(Math.min(i + batchSize, leads.length), leads.length)
  }

  return results
}