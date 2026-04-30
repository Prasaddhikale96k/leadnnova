import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export const maxDuration = 300

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { niche, city, state, location, maxResults = 50, useGridSearch = false } = await request.json()

  if (!niche || !location) {
    return NextResponse.json({ error: 'Niche and location are required' }, { status: 400 })
  }

  const searchLocation = city ? `${city}, ${state || 'India'}` : location

  // Create session in DB first
  const { data: session, error: sessionError } = await supabase
    .from('indian_leads_sessions')
    .insert({
      user_id: user.id,
      niche,
      location: searchLocation,
      city,
      state,
      search_query: `${niche} in ${searchLocation}`,
      status: 'running',
      progress_percent: 10,
      current_step: 'Starting Playwright scraper...'
    })
    .select()
    .single()

  if (sessionError) {
    console.error('Session creation error:', sessionError)
    return NextResponse.json({ error: sessionError.message }, { status: 500 })
  }

  // Create progress file for real-time updates
  const progressDir = path.join(process.cwd(), 'tmp')

  if (!fs.existsSync(progressDir)) {
    fs.mkdirSync(progressDir, { recursive: true })
  }

  // Initialize progress file with actual session ID
  const actualProgressFile = path.join(process.cwd(), 'tmp', `scrape-${session.id}.json`)

  fs.writeFileSync(actualProgressFile, JSON.stringify({
    status: 'running',
    progress: 0,
    current_step: 'Starting scraper...',
    leads: [],
    total_saved: 0
  }))

  try {
    await supabase
      .from('indian_leads_sessions')
      .update({
        current_step: 'Running Google Maps scraper (this takes 2-3 minutes)...',
        progress_percent: 10
      })
      .eq('id', session.id)

    console.log('[SCRAPER API] Session created, starting scraper...')

    // Run Playwright scraper with user context
    const scraperPath = path.join(process.cwd(), 'scripts', 'simple_google_maps_scraper.py')

    // Pass environment variables to Python script
    const env = {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      SCRAPE_USER_ID: user.id,
      SCRAPE_SESSION_ID: session.id,
      SCRAPE_PROGRESS_FILE: actualProgressFile,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hkrsijknuwyoujtgssrv.supabase.co',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hkrsijknuwyoujtgssrv.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
    }

    console.log('[SCRAPER API] Running scraper with:', {
      userId: user.id,
      sessionId: session.id,
      supabaseUrl: env.SUPABASE_URL,
      hasServiceKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
      hasGeminiKey: !!env.GEMINI_API_KEY,
      progressFile: actualProgressFile,
      scraperPath
    })

    // Windows-compatible command
    const { stdout, stderr } = await execAsync(
      `python "${scraperPath}" "${niche}" "${city || location}"`,
      {
        timeout: 300000, // 5 minutes max
        maxBuffer: 50 * 1024 * 1024, // 50MB
        env,
        shell: true,
        windowsHide: true
      }
    )

    console.log('Scraper completed. Stderr length:', stderr?.length || 0)

    await supabase
      .from('indian_leads_sessions')
      .update({
        current_step: 'Processing results...',
        progress_percent: 80
      })
      .eq('id', session.id)

    // Parse results - scraper already saved to DB, but return count
    let leadsCount = 0
    let scraperSuccess = false

    try {
      const jsonStart = stdout.lastIndexOf('{')
      const jsonEnd = stdout.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const result = JSON.parse(stdout.slice(jsonStart, jsonEnd + 1))
        leadsCount = result.total_leads || 0
        scraperSuccess = result.success === true
        console.log(`Scraper result: ${leadsCount} leads, success=${scraperSuccess}`)
      }
    } catch (parseError) {
      console.warn('Could not parse scraper output, fetching from DB...', parseError)
    }

    // Fetch actual count from DB
    const { count, error: countError } = await supabase
      .from('indian_leads')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)

    if (countError) {
      console.error('Error counting leads:', countError)
    }

    console.log(`Found ${count || 0} leads in DB for session ${session.id}`)

    // Use DB count as source of truth
    leadsCount = count || leadsCount

    // Mark session complete
    await supabase
      .from('indian_leads_sessions')
      .update({
        status: 'completed',
        total_results: leadsCount,
        progress_percent: 100,
        current_step: `✅ Done! ${leadsCount} leads saved.`,
        completed_at: new Date().toISOString()
      })
      .eq('id', session.id)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      searchQuery: `${niche} in ${searchLocation}`,
      leadsCount: leadsCount,
      message: `Successfully scraped ${leadsCount} leads`
    })

  } catch (error) {
    console.error('Scraper error:', error)

    await supabase
      .from('indian_leads_sessions')
      .update({
        status: 'failed',
        error_message: error.message,
        current_step: '❌ Scraping failed',
        progress_percent: 0
      })
      .eq('id', session.id)

    return NextResponse.json({
      error: error.message || 'Failed to scrape leads',
      sessionId: session.id
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Indian Leads Playwright Scraping API',
    usage: 'POST with { niche, location, city, state, maxResults, useGridSearch }',
    features: ['Playwright Stealth', 'AI Warmth Scorer', 'Ghost Lead Detection', 'Grid Search']
  })
}
