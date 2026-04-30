import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'
import { formatIndianPhoneNumber } from '@/utils/phoneFormatter'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { leads, type, config } = await request.json()

    if (!leads?.length || !type || !config) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const generatedContent = []

    for (const lead of leads) {
      try {
        if (type === 'email') {
          const content = await generateEmail(lead, config)
          generatedContent.push({
            leadId: lead.id,
            type: 'email',
            subject: content.subject,
            body: content.body,
            options: content.emailOptions,
            email: lead.email,
            selectedOptionIndex: 0
          })
        } else if (type === 'whatsapp') {
          const content = await generateWhatsApp(lead, config)
          generatedContent.push({
            leadId: lead.id,
            type: 'whatsapp',
            message: content.message,
            options: content.messageOptions,
            phone: content.phone,
            selectedOptionIndex: 0
          })
        }
      } catch (error) {
        console.error(`Failed to generate content for lead ${lead.id}:`, error)
        // Add fallback content
        if (type === 'email' && lead.email) {
          const fallbackSubject = `Quick question about your ${lead.category || 'business'}`;
          const fallbackBody = `Hi ${lead.name || 'there'},\n\nI came across ${lead.businessName} and wanted to connect about ${config.senderService}.\n\nWould you be open to a quick chat?\n\nBest regards,\n${config.senderName}`;
          generatedContent.push({
            leadId: lead.id,
            type: 'email',
            subject: fallbackSubject,
            body: fallbackBody,
            options: [{ subject: fallbackSubject, body: fallbackBody }],
            email: lead.email,
            selectedOptionIndex: 0
          })
        } else if (type === 'whatsapp' && lead.phone) {
          const phone = formatIndianPhoneNumber(lead.phone)
          const fallbackMessage = `Hi ${lead.name || 'there'}! Found ${lead.businessName} and wanted to connect about ${config.senderService}. Would you be open to a quick chat?\n\nBest,\n${config.senderName}`;
          generatedContent.push({
            leadId: lead.id,
            type: 'whatsapp',
            message: fallbackMessage,
            options: [fallbackMessage],
            phone: phone,
            selectedOptionIndex: 0
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedContent.length,
      content: generatedContent
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function generateEmail(lead, config) {
  const systemPrompt = `You are an expert cold email copywriter. Write highly personalized, professional cold emails (under 200 words).

Rules:
- Professional tone suitable for business communication
- Reference specific business details (name, category, city)
- Include clear call-to-action
- Keep subject line under 60 characters
- Email body: 4-5 short paragraphs
- Sound human, not AI-generated
- Output EXACTLY 3 different variations of the email.
- Option 1: Direct approach.
- Option 2: Value-first approach.
- Option 3: Compliment-based approach.

Return ONLY valid JSON in this exact format, with no other text or explanation:
{
  "variations": [
    {
      "subject": "email subject 1",
      "body": "email body 1"
    },
    {
      "subject": "email subject 2",
      "body": "email body 2"
    },
    {
      "subject": "email subject 3",
      "body": "email body 3"
    }
  ]
}`

  const userPrompt = `Generate cold email variations for:

Business: ${lead.businessName}
Contact: ${lead.name || 'Owner/Manager'}
Category: ${lead.category || 'Business'}
City: ${lead.city || 'Location'}
Service Offering: ${config.senderService}
Sender Name: ${config.senderName}

Make it personalized and professional. Return exactly 3 variations in the JSON schema requested.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const responseText = completion.choices[0].message.content || '{"variations":[]}';
    let variations = [];
    try {
      const parsed = JSON.parse(responseText);
      variations = parsed.variations || parsed;
      if (!Array.isArray(variations)) {
        variations = [variations];
      }
    } catch (e) {
      console.warn("Failed to parse email variations JSON:", e, responseText);
      variations = [{
        subject: `Question about your ${lead.category || 'business'}`,
        body: responseText
      }];
    }

    if (variations.length === 0) {
      variations = [{
        subject: `Question about your ${lead.category || 'business'}`,
        body: `Hi ${lead.name || 'there'},\n\nI came across ${lead.businessName} and wanted to connect about ${config.senderService}.\n\nBest regards,\n${config.senderName}`
      }];
    }

    return {
      subject: variations[0].subject,
      body: variations[0].body,
      emailOptions: variations
    }
  } catch (error) {
    throw new Error(`Groq API failed: ${error.message}`)
  }
}

async function generateWhatsApp(lead, config) {
  const systemPrompt = `You are an expert cold outreach copywriter specializing in B2B for Indian businesses.

I want you to write a highly unique, natural, and professional cold message for the target company.

Rules:
- Never use the same structure or opening line as previous versions
- Make every message feel fresh and human (avoid corporate/salesy tone)
- Keep it short (maximum 5-6 lines)
- Personalize it using the firm name and city
- Mention a relevant benefit for their industry (e.g. client acquisition, online reputation, Google ranking, professional image, etc.) based on the requested service.
- End with a soft, low-pressure call to action
- Always sign off with "Best," or "Regards," followed by "${config.senderName}"
- Use natural Indian English tone suitable for professionals
- Provide EXACTLY 3 different variations:
  Variation 1: Start with a sincere compliment.
  Variation 2: Start with a relevant question.
  Variation 3: Start with a mini story/insight.

Return the output ONLY as a valid JSON object. Do not include any explanation.
Format:
{
  "variations": [
    "message variation 1",
    "message variation 2",
    "message variation 3"
  ]
}`

  const userPrompt = `Company: ${lead.businessName}${lead.category ? `, ${lead.category}` : ''}${lead.city ? `, ${lead.city}` : ''}
My name: ${config.senderName}
Service: ${config.senderService}

Generate 3 unique variations mapping to the JSON format.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    })

    const responseText = completion.choices[0].message.content?.trim() || '{"variations":[]}';
    let variations = [];
    try {
      const parsed = JSON.parse(responseText);
      variations = parsed.variations || parsed;
      if (!Array.isArray(variations)) variations = [JSON.stringify(variations)];
    } catch (e) {
      console.warn("Failed to parse whatsapp variations JSON:", e, responseText);
      variations = [responseText];
    }
    
    if (variations.length === 0) {
      variations = [
        `Hi ${lead.name || 'there'}! Found ${lead.businessName} and wanted to connect about ${config.senderService}. Would you be open to a quick chat?\n\nBest,\n${config.senderName}`
      ];
    }

    return {
      message: variations[0],
      messageOptions: variations,
      phone: formatIndianPhoneNumber(lead.phone)
    }
  } catch (error) {
    throw new Error(`Groq API failed: ${error.message}`)
  }
}