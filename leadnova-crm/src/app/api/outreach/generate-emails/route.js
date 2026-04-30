import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateColdEmail } from '@/lib/groq/email-generator'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { leadIds, campaignId, options } = await request.json()

    const { data: leads, error } = await supabase
      .from('indian_leads')
      .select('*')
      .in('id', leadIds)
      .eq('user_id', user.id)
      .not('email', 'is', null)

    if (error) throw error
    if (!leads?.length) {
      return NextResponse.json({ error: 'No leads with emails found' }, { status: 400 })
    }

    const { data: emailSettings } = await supabase
      .from('user_email_settings')
      .select('groq_api_key, from_name, gmail_address')
      .eq('user_id', user.id)
      .single()

    const generatedEmails = []

    for (const lead of leads) {
      const generated = await generateColdEmail(
        {
          business_name: lead.business_name,
          business_category: lead.business_category,
          city: lead.city || lead.search_city,
          state: lead.state || lead.search_state,
          rating: lead.rating,
          reviews_count: lead.reviews_count,
          website: lead.website,
          owner_name: lead.owner_name,
          niche: lead.niche
        },
        {
          ...options,
          senderName: emailSettings?.from_name || options.senderName
        }
      )

      const { data: emailRecord } = await supabase
        .from('outreach_emails')
        .insert({
          user_id: user.id,
          campaign_id: campaignId,
          lead_id: lead.id,
          session_id: lead.session_id,
          business_name: lead.business_name,
          owner_name: lead.owner_name,
          to_email: lead.email,
          subject: generated.subject,
          body_html: generated.body_html,
          body_text: generated.body_text,
          ai_model_used: 'llama-3.3-70b-versatile',
          ai_completion_tokens: generated.tokens_used,
          status: 'ready',
          generated_at: new Date().toISOString()
        })
        .select()
        .single()

      await supabase
        .from('indian_leads')
        .update({
          ai_cold_email_subject: generated.subject,
          ai_cold_email_body: generated.body_html,
          ai_generated_at: new Date().toISOString()
        })
        .eq('id', lead.id)

      generatedEmails.push({
        leadId: lead.id,
        emailId: emailRecord?.id,
        campaignId: campaignId,
        businessName: lead.business_name,
        toEmail: lead.email,
        subject: generated.subject,
        preview: generated.body_text.substring(0, 150) + '...',
        body_html: generated.body_html,
        body_text: generated.body_text,
        ai_model_used: 'llama-3.3-70b-versatile',
        generated_at: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      generated: generatedEmails.length,
      emails: generatedEmails
    })

  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}