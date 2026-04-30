'use client'

export interface IndianLead {
  id: string
  user_id: string
  niche: string
  location: string
  city: string
  state: string
  business_name: string | null
  business_category: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  pincode: string | null
  rating: number | null
  reviews_count: number | null
  google_maps_url: string | null
  place_id: string | null
  social_links: Record<string, string>
  decision_maker_contacts: Array<{ name: string; role: string; email?: string; phone?: string }>
  business_hours: Record<string, string>
  photos_urls: string[]
  gst_number: string | null
  business_type: 'proprietorship' | 'partnership' | 'pvt_ltd' | 'llp' | null
  founded_year: number | null
  employee_count: string | null
  scrape_status: 'pending' | 'scraping' | 'completed' | 'failed'
  scrape_job_id: string | null
  scraped_at: string | null
  created_at: string
  updated_at: string
}

export interface IndianLeadsSession {
  id: string
  user_id: string
  niche: string
  location: string
  total_results: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  error_message: string | null
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface SearchParams {
  niche: string
  location: string
  city: string
  state: string
}

export interface StatsData {
  totalLeads: number
  withEmail: number
  avgRating: number
  withWebsite: number
}