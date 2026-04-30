import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  const { data: session } = await supabase
    .from('indian_leads_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // If completed, also return leads
  let leads = []
  if (session.status === 'completed') {
    const { data } = await supabase
      .from('indian_leads')
      .select('*')
      .eq('session_id', id)
      .order('rating', { ascending: false })
    leads = data || []
  }

  return NextResponse.json({ session, leads })
}
