-- Review & Fire Workflow Migration
-- Adds per-lead AI email storage and approval tracking

-- Add new columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_subject TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_body TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_angle TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_approval_status TEXT DEFAULT 'pending';

-- Backfill: existing leads with cold_email get 'pending' status
UPDATE leads SET email_body = cold_email, email_approval_status = 'pending'
WHERE cold_email IS NOT NULL AND email_body IS NULL;

-- Backfill: leads already contacted get 'approved'
UPDATE leads SET email_approval_status = 'approved', email_verified = true
WHERE status = 'contacted' AND cold_email IS NOT NULL;

-- Add indexes for filtering approved emails
CREATE INDEX IF NOT EXISTS idx_leads_email_verified ON leads(email_verified);
CREATE INDEX IF NOT EXISTS idx_leads_approval_status ON leads(email_approval_status);
