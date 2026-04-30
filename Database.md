```markdown
# Database Schema
# LeadNova AI CRM
# Provider: Supabase (PostgreSQL)

---

## Table 1: profiles

Purpose: Store agency owner profile information.
Linked to Supabase auth.users table.

| Column              | Type         | Default                          | Notes                          |
|---------------------|-------------|----------------------------------|--------------------------------|
| id                  | UUID         | auth.users(id) FK               | Primary Key, links to auth     |
| full_name           | TEXT         | from Google OAuth                | User's display name            |
| agency_name         | TEXT         | 'My Agency'                      | Agency brand name              |
| service_description | TEXT         | 'Digital Marketing Services'     | Used in email templates        |
| phone               | TEXT         | null                             | Contact phone                  |
| avatar_url          | TEXT         | from Google OAuth                | Profile picture URL            |
| email_signature     | TEXT         | 'Best Regards, LeadNova AI CRM' | Email closing text             |
| created_at          | TIMESTAMPTZ  | NOW()                            | Auto-generated                 |
| updated_at          | TIMESTAMPTZ  | NOW()                            | Auto-updated                   |

### Auto-creation Trigger
When a new user signs up via Google OAuth, a trigger automatically 
creates a profile row with their name and avatar from Google.

---

## Table 2: leads

Purpose: Store all generated business leads.

| Column            | Type         | Default          | Notes                              |
|-------------------|-------------|------------------|------------------------------------|
| id                | UUID         | gen_random_uuid() | Primary Key                       |
| user_id           | UUID         | auth.users FK    | Which agency owner owns this lead  |
| business_name     | TEXT         | NOT NULL         | Name of the business               |
| owner_name        | TEXT         | NOT NULL         | Owner/contact person name          |
| email             | TEXT         | NOT NULL         | Business email address             |
| phone             | TEXT         | null             | Phone number (+91 format)          |
| business_type     | TEXT         | null             | Restaurant, Gym, Salon, etc.       |
| address           | TEXT         | null             | Full street address                |
| city              | TEXT         | null             | City name                          |
| country           | TEXT         | 'India'          | Country                            |
| monthly_revenue   | INTEGER      | null             | Estimated monthly revenue in INR   |
| years_in_business | INTEGER      | null             | How many years old                 |
| online_presence   | TEXT         | null             | strong / moderate / weak           |
| needs             | TEXT         | null             | What services they might need      |
| rating            | INTEGER      | 3                | 1-5 star quality score             |
| status            | TEXT         | 'new'            | new/selected/contacted/converted/rejected |
| is_selected       | BOOLEAN      | false            | Whether agency selected this lead  |
| notes             | TEXT         | null             | Agency owner's personal notes      |
| created_at        | TIMESTAMPTZ  | NOW()            | When lead was generated            |

### Constraints
- rating CHECK (rating >= 1 AND rating <= 5)
- status CHECK IN ('new','selected','contacted','converted','rejected')

### Indexes
- idx_leads_user ON leads(user_id)
- idx_leads_rating ON leads(rating)
- idx_leads_status ON leads(status)

---

## Table 3: emails

Purpose: Log every email sent through the system.

| Column     | Type         | Default          | Notes                          |
|-----------|-------------|------------------|--------------------------------|
| id         | UUID         | gen_random_uuid() | Primary Key                   |
| user_id    | UUID         | auth.users FK    | Who sent the email             |
| lead_id    | UUID         | leads FK         | Which lead received email      |
| to_email   | TEXT         | NOT NULL         | Recipient email address        |
| subject    | TEXT         | NOT NULL         | Email subject line             |
| body       | TEXT         | NOT NULL         | Full email body text           |
| status     | TEXT         | 'sent'           | sent / failed                  |
| sent_at    | TIMESTAMPTZ  | NOW()            | When email was sent            |

### Constraints
- status CHECK IN ('sent','failed')

### Indexes
- idx_emails_lead ON emails(lead_id)

---

## Row Level Security (RLS)

All tables have RLS enabled. Each user can only:
- SELECT their own data (WHERE user_id = auth.uid())
- INSERT their own data (WITH CHECK user_id = auth.uid())
- UPDATE their own data (WHERE user_id = auth.uid())
- DELETE their own data (WHERE user_id = auth.uid())

This ensures complete data isolation between users.

---

## Relationships
auth.users (Supabase managed)
│
├── profiles (1:1)
│
├── leads (1:many)
│ │
│ └── emails (1:many per lead)
│
└── emails (1:many)

text


---

## Complete SQL (Copy-Paste into Supabase SQL Editor)

```sql
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  agency_name TEXT DEFAULT 'My Agency',
  service_description TEXT DEFAULT 'Digital Marketing Services',
  phone TEXT,
  avatar_url TEXT,
  email_signature TEXT DEFAULT 'Best Regards, LeadNova AI CRM',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_type TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'India',
  monthly_revenue INTEGER,
  years_in_business INTEGER,
  online_presence TEXT,
  needs TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 3,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','selected','contacted','converted','rejected')),
  is_selected BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emails
CREATE TABLE emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','failed')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON leads FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own emails" ON emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emails" ON emails FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_leads_rating ON leads(rating);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_emails_lead ON emails(lead_id);