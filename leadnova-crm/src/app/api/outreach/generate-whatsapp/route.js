import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBulkWhatsAppMessages } from '@/lib/groq/whatsapp-generator'
import { formatIndianPhoneNumber } from '@/utils/phoneFormatter'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { leadIds, options } = await request.json()

    const { data: leads, error } = await supabase
      .from('indian_leads')
      .select('*')
      .in('id', leadIds)
      .eq('user_id', user.id)
      .not('phone', 'is', null)

    if (error) throw error
    if (!leads?.length) {
      return NextResponse.json({ error: 'No leads with phone numbers found' }, { status: 400 })
    }

    const generatedMessages = await generateBulkWhatsAppMessages(leads, options, (current, total) => {
      console.log(`Generated ${current}/${total} WhatsApp messages`)
    })

    // Update database with generated messages
    for (const msg of generatedMessages) {
      if (msg.leadId) {
        const phone = formatIndianPhoneNumber(msg.phone)
        await supabase
          .from('indian_leads')
          .update({
            whatsapp_message: msg.message,
            whatsapp_phone_formatted: phone,
            whatsapp_generated_at: msg.generated_at,
            whatsapp_ai_model: msg.ai_model_used
          })
          .eq('id', msg.leadId)
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedMessages.length,
      messages: generatedMessages
    })

  } catch (error) {
    console.error('WhatsApp message generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}