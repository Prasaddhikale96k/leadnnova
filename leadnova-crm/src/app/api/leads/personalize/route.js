import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { leadIds } = await req.json()
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'leadIds array is required.' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key is not configured' }, { status: 500 })
    }

    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds)
      .eq('user_id', user.id)

    if (fetchError || !leads || leads.length === 0) {
      console.error("Fetch leads error:", fetchError)
      throw new Error('Failed to fetch leads')
    }

    const businessProfiles = leads.map((l, idx) => ({
      index: idx,
      id: l.id,
      name: l.company_name || 'Unknown',
      owner: l.full_name || 'Unknown',
      industry: l.business_type || '',
      city: l.city || '',
      address: l.company_full_address || '',
      rating: l.rating || 'N/A'
    }))

    const prompt = `You are a B2B sales automation expert. Analyze this list of business data:
${JSON.stringify(businessProfiles, null, 2)}

For each business, return a structured analysis:
1. monthly_revenue: Estimate Monthly Revenue (e.g. '$10k-$50k').
2. online_presence: Rate as 'Poor', 'Average', or 'Good'.
3. needs: Identify 3 digital gaps (e.g. 'Needs SEO, Modern Website').
4. cold_email: Write a short cold email (under 100 words).
   - Address their city specifically.
   - If Owner Name is provided, start with "Hi [Owner Name],".
   - If Owner Name is "Unknown", start with "Hi [Business Name] Team,".
5. owner_name: If you find a better owner name in context, provide it.

Return ONLY a valid JSON object with a "leads" array. Each object in the array must have: "id", "monthly_revenue", "online_presence", "needs", "cold_email", "owner_name".
Do NOT include any markdown formatting, code fences, or explanatory text. Just the raw JSON object.`

    let enrichedData = []
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
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("OpenRouter API Error:", errorData)
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const rawResponse = data.choices[0].message.content

      console.log("RAW OPENROUTER OUTPUT:", rawResponse)

      let parsed
      try {
        parsed = JSON.parse(rawResponse)
      } catch (parseErr) {
        console.error("JSON Parse Error, attempting cleanup:", parseErr)
        const cleanJson = rawResponse.replace(/```json|```/g, "").trim()
        parsed = JSON.parse(cleanJson)
      }

      enrichedData = parsed.leads || parsed

      if (!Array.isArray(enrichedData)) {
        throw new Error('AI response is not an array')
      }
    } catch (err) {
      console.error("OpenRouter/JSON Error:", err)
      throw new Error('AI processing failed. The AI response could not be parsed.')
    }

    const updates = []
    for (const item of enrichedData) {
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          monthly_revenue: item.monthly_revenue,
          online_presence: item.online_presence,
          needs: item.needs,
          cold_email: item.cold_email,
          full_name: item.owner_name || undefined,
          status: 'new'
        })
        .eq('id', item.id)
        .eq('user_id', user.id)

      if (!updateError) updates.push(item.id)
    }

    return NextResponse.json({ success: true, count: updates.length })
  } catch (error) {
    console.error('Final Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
