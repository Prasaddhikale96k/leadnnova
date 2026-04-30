import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export async function generateWhatsAppMessage(lead, options) {
  const toneInstructions = {
    professional: "formal, respectful, business-like tone suitable for WhatsApp",
    friendly: "warm, approachable, conversational tone",
    casual: "relaxed, friendly, like talking to a peer"
  }

  const systemPrompt = `You are an expert sales copywriter. Write a highly personalized, short, and professional WhatsApp message (max 50 words). Do not use placeholders like [Name]; use the actual data provided. Tone: ${toneInstructions[options.tone] || toneInstructions.professional}.

Rules:
- Keep message under 50 words total
- Sound human and authentic
- Reference specific business details (name, location, category)
- Include clear call-to-action
- No spam-like language
- End with sender's name
- Use Indian business context when relevant

Return ONLY the message text, no JSON or formatting.`

  const userPrompt = `Lead Name: ${lead.business_name || 'Business Owner'}, Category: ${lead.business_category || 'Business'}, City: ${lead.city || 'Location'}, My Service: ${options.senderService}, My Name: ${options.senderName}. Write a message that mentions their specific business and location to build trust.`

  let response
  let completion

  try {
    completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b', // Using the specified model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    })
    response = completion.choices[0].message.content?.trim()
  } catch (apiError) {
    console.warn('GROQ API failed for WhatsApp message, trying alternative model:', apiError.message)

    // Try alternative model if the specified one fails
    try {
      completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
      response = completion.choices[0].message.content?.trim()
    } catch (fallbackError) {
      console.warn('Fallback model also failed, using template:', fallbackError.message)
      response = null
    }
  }

  // If API fails, use fallback template
  if (!response) {
    let message = `Hi ${lead.owner_name || 'there'}!\n\n`

    if (options.tone === 'professional') {
      message += `I came across ${lead.business_name} in ${lead.city} and was impressed by your business. `
    } else if (options.tone === 'friendly') {
      message += `Loved seeing ${lead.business_name} in ${lead.city}! `
    } else {
      message += `Hey! Found ${lead.business_name} in ${lead.city} and thought you might be interested. `
    }

    message += `I'm offering ${options.senderService}. Would you be open to a quick chat?\n\nBest,\n${options.senderName}`
    response = message.trim()
  }

  return {
    message: response,
    tokens_used: completion?.usage?.total_tokens || 0,
    model_used: completion?.model || 'fallback'
  }
}

export async function generateBulkWhatsAppMessages(leads, options, onProgress) {
  const results = []

  const batchSize = 5 // Smaller batch size for WhatsApp messages
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (lead) => {
        try {
          const message = await generateWhatsAppMessage(lead, options)
          return {
            leadId: lead.id,
            businessName: lead.business_name,
            phone: lead.phone,
            message: message.message,
            ai_model_used: message.model_used,
            tokens_used: message.tokens_used,
            generated_at: new Date().toISOString()
          }
        } catch (error) {
          console.error(`Failed to generate WhatsApp message for ${lead.business_name}:`, error)
          // Return fallback message
          return {
            leadId: lead.id,
            businessName: lead.business_name,
            phone: lead.phone,
            message: `Hi! I found ${lead.business_name} in ${lead.city} and wanted to connect about ${options.senderService}. Would you be open to a quick chat?\n\nBest,\n${options.senderName}`,
            ai_model_used: 'error-fallback',
            tokens_used: 0,
            generated_at: new Date().toISOString()
          }
        }
      })
    )

    results.push(...batchResults)
    onProgress?.(Math.min(i + batchSize, leads.length), leads.length)
  }

  return results
}