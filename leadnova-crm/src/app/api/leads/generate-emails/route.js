import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 300

const ANGLES = [
  'Problem-focused (Based on their gaps)',
  'Local-competition focused',
  'Future-growth focused',
  'Compliment-first',
  'Speed-focused (Quick technical fix)'
]

const LEAK_KEYWORDS = [
  'subject line:', 'here is your', 'prompt:', 'instructions:',
  'respond with the json', 'no preamble', 'do not include any',
  'return only a valid json', 'campaign goal:', 'write a highly personalized',
  'you are nova', 'role:', 'task:', 'guidelines:',
  'angle:', 'the hook:', 'the connection:',
  'return only', 'output a clean json', 'format:',
  'system prompt', 'max 8 words', 'max tokens', 'openrouter', 'api key',
  'return a structured analysis', 'return ONLY', 'Respond with the JSON object only',
  'json structure:', 'output requirement:', 'campaign constraints:',
  'output format', 'niche adaptation', 'pre-send auditor'
]

function hasInstructionLeak(text) {
  if (!text) return true
  const lower = text.toLowerCase()
  return LEAK_KEYWORDS.some(kw => lower.includes(kw))
}

function getIndustryHook(industry) {
  const ind = (industry || '').toLowerCase()
  if (ind.includes('plumb') || ind.includes('clean') || ind.includes('hvac') || ind.includes('electric')) {
    return { category: 'service', hook: 'Local Booking Volume', keywords: ['emergency leads', 'Google Maps ranking', 'local service calls'] }
  }
  if (ind.includes('photograph') || ind.includes('photo studio') || ind.includes('wedding') || ind.includes('design') || ind.includes('creative')) {
    return { category: 'creative', hook: 'Visual Conversion & Portfolio', keywords: ['gallery load speeds', 'booking friction', 'aesthetic', 'conversion'] }
  }
  if (ind.includes('export') || ind.includes('import') || ind.includes('manufactur') || ind.includes('wholesale')) {
    return { category: 'b2b', hook: 'Global Reach & Digital Trust', keywords: ['supply chain visibility', 'international buyer trust', 'digital presence'] }
  }
  return { category: 'general', hook: 'Digital Growth', keywords: ['online visibility', 'customer acquisition', 'digital presence'] }
}

function getNicheInstructions(category, industry, city, insights) {
  const instructions = {
    service: `This is a service-based business (${industry} in ${city}). Focus on "Local Booking Volume" and how they're losing emergency leads to competitors who rank higher on Google Maps. Pain point: ${insights}.`,
    creative: `This is a creative business (${industry} in ${city}). Focus on "Visual Conversion & Portfolio." Mention how their aesthetic deserves better digital presentation. Pain point: ${insights}. Use words like "gallery load speeds," "booking friction," and "conversion."`,
    b2b: `This is a B2B/export business (${industry} in ${city}). Focus on "Global Reach & Digital Trust." Emphasize supply chain visibility and international buyer trust. Pain point: ${insights}.`,
    general: `This is a ${industry} business in ${city}. Focus on digital growth and customer acquisition. Pain point: ${insights}.`
  }
  return instructions[category] || instructions.general
}

function resolveBusinessName(lead) {
  const raw = lead.company_name || ''
  const isUnknown = raw.toLowerCase().includes('unknown')

  if (!isUnknown && raw.trim()) return raw

  const email = lead.email || ''
  if (email) {
    try {
      const domain = email.split('@')[1].split('.')[0]
      return domain
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    } catch {}
  }

  return lead.business_type || 'Local Business'
}

function getSDRPrompt(lead, profile, angle, tone) {
  const businessName = resolveBusinessName(lead)
  const isUnknownOriginal = (lead.company_name || '').toLowerCase().includes('unknown')
  const ownerName = lead.full_name || 'Unknown'
  const city = lead.city || 'your area'
  const industry = lead.business_type || 'industry'
  const insights = lead.needs || 'improve digital presence'
  const senderName = profile.full_name || 'Prasad Dikle'
  const senderCompany = profile.agency_name || 'LeadNova'
  const specialty = profile.service_description || 'AI-powered business growth and digital presence'
  const addressLine = ownerName === 'Unknown' ? `Team ${businessName}` : ownerName

  const { category, hook, keywords } = getIndustryHook(industry)
  const nicheInstructions = getNicheInstructions(category, industry, city, insights)

  const angleInstructions = {
    'Problem-focused (Based on their gaps)': `Angle: Problem-focused. Open with a direct observation about their specific gap: ${insights}.`,
    'Local-competition focused': `Angle: Local-competition focused. Mention how other ${industry} businesses in ${city} are already optimizing online.`,
    'Future-growth focused': `Angle: Future-growth focused. Paint a picture of scaling their ${industry} business and capturing more market share in ${city}.`,
    'Compliment-first': `Angle: Compliment-first. Start with a genuine observation about something they do well, then pivot to the opportunity.`,
    'Speed-focused (Quick technical fix)': `Angle: Speed-focused. Emphasize that this is a quick fix with immediate ROI for their ${industry} business.`
  }

  const subjectHint = isUnknownOriginal
    ? `IMPORTANT: The business name was unknown. Use "${city} ${industry} team" or "${industry} services in ${city}" in the subject line. NEVER use the word "Unknown".`
    : `Include "${businessName}" or "${city}" in the subject line.`

  return `You are 'Nova', the lead generation agent for ${senderCompany}.

Sender Identity (Use these exactly):
- Name: ${senderName}
- Company: ${senderCompany}
- Specialty: ${specialty}

Recipient Data:
- Business Name: ${businessName}
- Owner: ${addressLine}
- Niche/Industry: ${industry}
- Location: ${city}
- Pain Point: ${insights}

Task: Generate a highly personalized cold email.

The Hook: Reference a specific challenge related to ${industry} in ${city}.
The Connection: Link "${insights}" to how ${senderCompany} can solve it.
The Persona: Use a ${tone} tone.
No Placeholders: You are strictly forbidden from using brackets like [Your Name]. You MUST use "${senderName}" and "${senderCompany}" directly in the signature.

Niche Adaptation Logic:
${nicheInstructions}
Key focus: "${hook}". Use relevant keywords: ${keywords.join(', ')}.

${angleInstructions[angle] || angleInstructions['Problem-focused (Based on their gaps)']}

Rules:
- Max 100 words. 3-4 sentences total.
- No fluff: Do not start with "I hope this finds you well" or "My name is...". Start directly with an observation about their business.
- Vary sentence structure so this doesn't look like a template.
- End with a low-friction question.
- NEVER use the word "Unknown" anywhere in the subject line or body.
${subjectHint}

Output Format (JSON Only):
{"subject": "A punchy, 5-7 word subject line", "body": "Hi ${addressLine},\\n\\n[Personalized Content]\\n\\nBest,\\n${senderName}\\n${senderCompany}"}`
}

async function generateEmailForLead(lead, profile, tone) {
  const angleIndex = Math.floor(Math.random() * ANGLES.length)
  const angle = ANGLES[angleIndex]
  const prompt = getSDRPrompt(lead, profile, angle, tone || 'Professional')

  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    attempts++
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'LeadNova CRM'
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-3-super-120b-a12b:free',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          max_tokens: 350,
          temperature: 0.85
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        console.error('OpenRouter error:', errData)
        return null
      }

      const data = await response.json()
      const raw = data.choices[0].message.content

      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        const clean = raw.replace(/```json|```/g, '').trim()
        parsed = JSON.parse(clean)
      }

      const subject = parsed.subject || ''
      const body = parsed.body || ''

      if (hasInstructionLeak(subject) || hasInstructionLeak(body)) {
        console.warn(`Leak detected for ${lead.company_name}, attempt ${attempts}. Retrying...`)
        continue
      }

      if (!body || body.length < 20) {
        console.warn(`Body too short for ${lead.company_name}, attempt ${attempts}. Retrying...`)
        continue
      }

      if (body.includes('[Your Name]') || body.includes('[Company]') || body.includes('{{sender_name}}')) {
        console.warn(`Placeholder leak for ${lead.company_name}, attempt ${attempts}. Retrying...`)
        continue
      }

      return { subject, body, angle }
    } catch (err) {
      console.error('AI generation failed:', lead.company_name, err)
      if (attempts === maxAttempts) return null
    }
  }

  console.error(`All ${maxAttempts} attempts failed for ${lead.company_name}`)
  return null
}

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { leadIds, tone } = await req.json()
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'leadIds array is required' }, { status: 400 })
    }

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const profile = profileData || {}

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds)
      .eq('user_id', user.id)

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads found' }, { status: 404 })
    }

    const results = []
    for (const lead of leads) {
      const generated = await generateEmailForLead(lead, profile, tone || 'Professional')
      if (generated) {
        await supabase
          .from('leads')
          .update({
            email_subject: generated.subject,
            email_body: generated.body,
            email_angle: generated.angle,
            email_verified: false
          })
          .eq('id', lead.id)
          .eq('user_id', user.id)

        results.push({ id: lead.id, success: true, angle: generated.angle })
      } else {
        results.push({ id: lead.id, success: false })
      }
    }

    const successCount = results.filter(r => r.success).length
    return NextResponse.json({ success: true, count: successCount, results })
  } catch (error) {
    console.error('Generate emails error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
