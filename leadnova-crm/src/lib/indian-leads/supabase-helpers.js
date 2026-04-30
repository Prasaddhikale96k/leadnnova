'use client'
import { createClient } from '@/lib/supabase/client'

export const createScrapingSession = async (params) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('indian_leads_sessions')
    .insert({
      user_id: user.id,
      niche: params.niche,
      location: params.city ? `${params.city}, ${params.state}` : params.location,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return null
  }

  return data
}

export const updateSessionStatus = async (sessionId, status, totalResults) => {
  const supabase = createClient()
  
  const updates = { status }
  if (totalResults !== undefined) {
    updates.total_results = totalResults
  }
  if (status === 'completed' || status === 'failed') {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('indian_leads_sessions')
    .update(updates)
    .eq('id', sessionId)

  if (error) {
    console.error('Error updating session:', error)
  }
}

export const saveLead = async (lead) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('indian_leads')
    .insert({
      user_id: user.id,
      ...lead
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving lead:', error)
    return null
  }

  return data
}

export const saveLeads = async (leads) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const leadsWithUser = leads.map(lead => ({
    user_id: user.id,
    ...lead
  }))

  const { data, error } = await supabase
    .from('indian_leads')
    .insert(leadsWithUser)
    .select()

  if (error) {
    console.error('Error saving leads:', error)
    return []
  }

  return data || []
}

export const getLeadsBySession = async (sessionId) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('indian_leads')
    .select('*')
    .eq('scrape_job_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return data || []
}

export const getSessionById = async (sessionId) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('indian_leads_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return data
}

export const deleteLead = async (leadId) => {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('indian_leads')
    .delete()
    .eq('id', leadId)

  if (error) {
    console.error('Error deleting lead:', error)
    return false
  }

  return true
}

export const subscribeToSessionUpdates = (sessionId, callback) => {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'indian_leads_sessions',
      filter: `id=eq.${sessionId}`
    }, callback)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export const subscribeToNewLeads = (sessionId, callback) => {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`leads-${sessionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'indian_leads',
      filter: `scrape_job_id=eq.${sessionId}`
    }, (payload) => callback(payload.new))
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}