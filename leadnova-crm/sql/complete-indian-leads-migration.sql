-- ============================================
-- COMPLETE INDIAN LEADS SYSTEM DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: INDIAN LEADS (Main leads storage)
-- ============================================
CREATE TABLE IF NOT EXISTS indian_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,

  -- Search Context
  niche TEXT NOT NULL,
  search_location TEXT NOT NULL,
  search_city TEXT,
  search_state TEXT,

  -- Core Business Data (from Google Maps Scraper)
  business_name TEXT,
  business_category TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  full_address TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',

  -- Google Maps Data
  rating DECIMAL(2,1),
  reviews_count INTEGER DEFAULT 0,
  google_maps_url TEXT,
  place_id TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Business Details
  business_hours JSONB DEFAULT '{}',
  photos_urls JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',
  price_range TEXT,
  is_claimed BOOLEAN DEFAULT false,
  is_permanently_closed BOOLEAN DEFAULT false,

  -- Enrichment
  owner_name TEXT,
  decision_maker_email TEXT,
  linkedin_url TEXT,

  -- AI Generated Content
  ai_cold_email_subject TEXT,
  ai_cold_email_body TEXT,
  ai_cold_email_text TEXT,
  ai_generated_at TIMESTAMPTZ,
  generated_email TEXT,

  -- Outreach Status
  outreach_status TEXT DEFAULT 'not_contacted',
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  reply_received_at TIMESTAMPTZ,
  outreach_notes TEXT,

  -- Lead Quality
  lead_score INTEGER DEFAULT 0,
  is_starred BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  source TEXT DEFAULT 'google_maps_scraper',
  scrape_status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 2: SCRAPING SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS indian_leads_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  niche TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  search_query TEXT,

  total_results INTEGER DEFAULT 0,
  leads_with_email INTEGER DEFAULT 0,
  leads_with_phone INTEGER DEFAULT 0,
  leads_with_website INTEGER DEFAULT 0,

  status TEXT DEFAULT 'pending',
  progress_percent INTEGER DEFAULT 0,
  current_step TEXT,
  error_message TEXT,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 3: OUTREACH CAMPAIGNS
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES indian_leads_sessions(id),

  campaign_name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'indian_leads',

  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  reply_to TEXT,

  ai_tone TEXT DEFAULT 'professional',
  ai_focus TEXT,
  custom_prompt_addition TEXT,

  total_emails INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,

  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 4: OUTREACH EMAILS (Individual email records)
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES outreach_campaigns(id),
  lead_id UUID REFERENCES indian_leads(id) ON DELETE CASCADE,
  session_id UUID,

  business_name TEXT,
  owner_name TEXT,
  to_email TEXT NOT NULL,

  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  ai_model_used TEXT DEFAULT 'llama-3.3-70b-versatile',
  ai_prompt_tokens INTEGER,
  ai_completion_tokens INTEGER,

  status TEXT DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  message_id TEXT,
  thread_id TEXT,
  tracking_pixel_id UUID DEFAULT uuid_generate_v4(),
  is_opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  is_replied BOOLEAN DEFAULT false,
  replied_at TIMESTAMPTZ,
  is_converted BOOLEAN DEFAULT false,

  generated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 5: USER EMAIL SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS user_email_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  gmail_address TEXT,
  gmail_app_password TEXT,
  from_name TEXT,
  reply_to TEXT,

  daily_limit INTEGER DEFAULT 200,
  hourly_limit INTEGER DEFAULT 20,
  delay_between_emails INTEGER DEFAULT 3,
  emails_sent_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,

  groq_api_key TEXT,
  default_ai_tone TEXT DEFAULT 'professional',
  default_focus TEXT,

  is_gmail_verified BOOLEAN DEFAULT false,
  is_groq_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 6: DAILY ANALYTICS SNAPSHOTS
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  total_leads INTEGER DEFAULT 0,
  indian_leads_generated INTEGER DEFAULT 0,
  leads_with_email INTEGER DEFAULT 0,

  emails_sent INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,

  converted INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  avg_lead_rating DECIMAL(3,1) DEFAULT 0,

  UNIQUE(user_id, date),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_indian_leads_user ON indian_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_indian_leads_session ON indian_leads(session_id);
CREATE INDEX IF NOT EXISTS idx_indian_leads_email ON indian_leads(email);
CREATE INDEX IF NOT EXISTS idx_indian_leads_outreach ON indian_leads(outreach_status);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_user ON outreach_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_status ON outreach_emails(status);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_lead ON outreach_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics_daily(user_id, date);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE indian_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE indian_leads_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_data" ON indian_leads;
DROP POLICY IF EXISTS "own_data" ON indian_leads_sessions;
DROP POLICY IF EXISTS "own_data" ON outreach_campaigns;
DROP POLICY IF EXISTS "own_data" ON outreach_emails;
DROP POLICY IF EXISTS "own_data" ON user_email_settings;
DROP POLICY IF EXISTS "own_data" ON analytics_daily;

CREATE POLICY "own_data" ON indian_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON indian_leads_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON outreach_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON outreach_emails FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON user_email_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON analytics_daily FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE indian_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE indian_leads_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE outreach_emails;
ALTER PUBLICATION supabase_realtime ADD TABLE outreach_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_daily;

-- ============================================
-- FUNCTION: Update analytics on email sent
-- ============================================
CREATE OR REPLACE FUNCTION update_analytics_on_email()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_daily (user_id, date, emails_sent, emails_failed)
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    CASE WHEN NEW.status = 'sent' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    emails_sent = analytics_daily.emails_sent + 
      CASE WHEN NEW.status = 'sent' AND OLD.status != 'sent' THEN 1 ELSE 0 END,
    emails_failed = analytics_daily.emails_failed + 
      CASE WHEN NEW.status = 'failed' AND OLD.status != 'failed' THEN 1 ELSE 0 END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_analytics_email ON outreach_emails;
CREATE TRIGGER trigger_update_analytics_email
AFTER INSERT OR UPDATE ON outreach_emails
FOR EACH ROW EXECUTE FUNCTION update_analytics_on_email();

-- ============================================
-- FUNCTION: Update analytics on new lead
-- ============================================
CREATE OR REPLACE FUNCTION update_analytics_on_lead()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_daily (user_id, date, indian_leads_generated, total_leads)
  VALUES (NEW.user_id, CURRENT_DATE, 1, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    indian_leads_generated = analytics_daily.indian_leads_generated + 1,
    total_leads = analytics_daily.total_leads + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_analytics_lead ON indian_leads;
CREATE TRIGGER trigger_update_analytics_lead
AFTER INSERT ON indian_leads
FOR EACH ROW EXECUTE FUNCTION update_analytics_on_lead();

-- ============================================
-- FUNCTION: Update analytics on new session
-- ============================================
CREATE OR REPLACE FUNCTION update_analytics_on_session()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_daily (user_id, date, indian_leads_generated, total_leads, leads_with_email)
  VALUES (
    NEW.user_id, 
    CURRENT_DATE, 
    NEW.total_results, 
    NEW.total_results,
    NEW.leads_with_email
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    indian_leads_generated = analytics_daily.indian_leads_generated + NEW.total_results,
    total_leads = analytics_daily.total_leads + NEW.total_results,
    leads_with_email = analytics_daily.leads_with_email + NEW.leads_with_email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_analytics_session ON indian_leads_sessions;
CREATE TRIGGER trigger_update_analytics_session
AFTER UPDATE OF status ON indian_leads_sessions
FOR EACH ROW 
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_analytics_on_session();

-- ============================================
-- FOLLOW-UP EMAIL TABLES (from Cursor prompt)
-- ============================================

ALTER TABLE outreach_emails 
ADD COLUMN IF NOT EXISTS reply_received BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reply_received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reply_content TEXT,
ADD COLUMN IF NOT EXISTS followup_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_followup_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_followup_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS followup_stopped BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_stop_reason TEXT,
ADD COLUMN IF NOT EXISTS gmail_message_id TEXT,
ADD COLUMN IF NOT EXISTS gmail_thread_id TEXT,
ADD COLUMN IF NOT EXISTS in_reply_to TEXT,
ADD COLUMN IF NOT EXISTS email_opened BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_open_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS followup_emails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_email_id UUID REFERENCES outreach_emails(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES indian_leads(id) ON DELETE CASCADE,
  campaign_id UUID,
  followup_number INTEGER NOT NULL,
  sequence_type TEXT NOT NULL,
  to_email TEXT NOT NULL,
  business_name TEXT,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  ai_model_used TEXT DEFAULT 'llama-3.3-70b-versatile',
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  in_reply_to TEXT,
  references_header TEXT,
  status TEXT DEFAULT 'scheduled',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  reply_received BOOLEAN DEFAULT false,
  reply_received_at TIMESTAMPTZ,
  email_opened BOOLEAN DEFAULT false,
  open_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followup_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID,
  is_active BOOLEAN DEFAULT true,
  max_followups INTEGER DEFAULT 3,
  followup_1_delay_hours INTEGER DEFAULT 48,
  followup_2_delay_hours INTEGER DEFAULT 120,
  followup_3_delay_hours INTEGER DEFAULT 240,
  followup_1_tone TEXT DEFAULT 'friendly',
  followup_2_tone TEXT DEFAULT 'value_focused',
  followup_3_tone TEXT DEFAULT 'final_nudge',
  sender_service TEXT,
  sender_name TEXT,
  stop_on_open BOOLEAN DEFAULT false,
  stop_on_reply BOOLEAN DEFAULT true,
  check_replies_enabled BOOLEAN DEFAULT true,
  last_reply_check_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reply_check_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  emails_checked INTEGER DEFAULT 0,
  replies_found INTEGER DEFAULT 0,
  followups_triggered INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_followup_scheduled ON followup_emails(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_followup_original ON followup_emails(original_email_id);
CREATE INDEX IF NOT EXISTS idx_outreach_next_followup ON outreach_emails(next_followup_at, followup_stopped, reply_received);

ALTER TABLE followup_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_check_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_data" ON followup_emails FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON followup_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON reply_check_logs FOR ALL USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE followup_emails;
ALTER PUBLICATION supabase_realtime ADD TABLE followup_schedules;