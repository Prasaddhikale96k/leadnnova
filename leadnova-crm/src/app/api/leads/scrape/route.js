import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'

export const maxDuration = 300

const apify = new ApifyClient({ token: process.env.APIFY_API_KEY })

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { niche, location, count } = await req.json()
    if (!niche || !location || !count) {
      return NextResponse.json({ error: 'Niche, location, and count are required fields.' }, { status: 400 })
    }
    
    const limit = Math.min(parseInt(count), 100)

    if (!process.env.APIFY_API_KEY) {
      return NextResponse.json({ error: 'Apify API key is not configured' }, { status: 500 })
    }

    console.log("Triggering Apify Google Maps/B2B Scraper...")
    console.log("Niche:", niche, "Location:", location, "Limit:", limit)
    
    let run
    try {
      console.log("Apify: Starting leads-scraper-ppe with token:", process.env.APIFY_API_KEY?.substring(0, 10) + "...")
      run = await apify.actor("peakydev/leads-scraper-ppe").call({
        company_keywords: [niche],
        contact_location: [location],
        fetch_count: limit,
        file_name: "Prospects",
        email_status: ["validated", "unknown"]
      }, { waitSecs: 240 })
      console.log("Apify: Actor run completed:", JSON.stringify(run).substring(0, 200))
    } catch (apifyError) {
      console.error("Apify Actor Error:", apifyError)
      return NextResponse.json({ 
        error: `Apify scraping failed: ${apifyError.message}. Check your API key and actor ID.`,
        details: apifyError.stack
      }, { status: 500 })
    }

    console.log("Apify run finished! Fetching dataset...")
    const { items } = await apify.dataset(run.defaultDatasetId).listItems()
    
    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No places found matching query." })
    }

    const newLeads = items.map((item) => {
      const ownerName = item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.jobTitle || 'Unknown Owner'
      const companyName = item.companyName || item.businessName || item.name || 'Unknown Business'
      const email = item.email || item.emailAddress || ''
      const phone = item.phone || item.phoneNumber || item.companyPhone || ''
      const city = item.city || item.location || location
      const address = item.address || item.fullAddress || ''
      const businessType = item.industry || item.category || item.companyIndustry || niche
      
      return {
        user_id: user.id,
        company_name: companyName,
        full_name: ownerName,
        email: email,
        company_phone: phone,
        business_type: businessType,
        city: city,
        company_full_address: address,
        status: 'pending_analysis',
        is_selected: false,
        rating: item.rating || 0
      }
    })

    const { data: insertedData, error } = await supabase
      .from('leads')
      .insert(newLeads)
      .select()

    if (error) {
      console.error("Supabase Database Insert Error:", error)
      throw new Error('Failed to save scraped data into the CRM database')
    }

    return NextResponse.json({ 
      success: true, 
      count: insertedData.length,
      leads: insertedData
    })

  } catch (error) {
    console.error('Lead Scraping Error:', error)
    return NextResponse.json({ error: error.message || 'Error occurred while scraping leads via Apify' }, { status: 500 })
  }
}
