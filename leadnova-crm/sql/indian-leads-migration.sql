-- Indian Leads Database Schema for Supabase

-- Create indian_leads table
CREATE TABLE IF NOT EXISTS indian_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Search Parameters
  niche TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  
  -- Business Data from Google Maps Scraper
  business_name TEXT,
  business_category TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  pincode TEXT,
  rating DECIMAL(2,1),
  reviews_count INTEGER,
  google_maps_url TEXT,
  place_id TEXT,
  
  -- Enrichment Data
  social_links JSONB DEFAULT '{}',
  decision_maker_contacts JSONB DEFAULT '[]',
  business_hours JSONB DEFAULT '{}',
  photos_urls JSONB DEFAULT '[]',
  
  -- India Specific Fields
  gst_number TEXT,
  business_type TEXT,
  founded_year INTEGER,
  employee_count TEXT,
  
  -- Metadata
  scrape_status TEXT DEFAULT 'pending',
  scrape_job_id TEXT,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create search sessions table
CREATE TABLE IF NOT EXISTS indian_leads_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  niche TEXT NOT NULL,
  location TEXT NOT NULL,
  total_results INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE indian_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE indian_leads_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can CRUD own indian leads" ON indian_leads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own sessions" ON indian_leads_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE indian_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE indian_leads_sessions;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_indian_leads_user_id ON indian_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_indian_leads_session_id ON indian_leads(scrape_job_id);
CREATE INDEX IF NOT EXISTS idx_indian_leads_city_state ON indian_leads(city, state);
CREATE INDEX IF NOT EXISTS idx_indian_leads_sessions_user_id ON indian_leads_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_indian_leads_sessions_status ON indian_leads_sessions(status);