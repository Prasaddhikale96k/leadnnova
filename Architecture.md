```markdown
# System Architecture
# LeadNova AI CRM

---

## Architecture Type
Monolithic Next.js Application with Serverless API Routes

---

## System Diagram
┌─────────────────────────────────────────────┐
│ CLIENT (Browser) │
│ │
│ Next.js Frontend (React Components) │
│ ├── Landing Page (/) │
│ ├── Dashboard (/dashboard) │
│ ├── Leads (/dashboard/leads) │
│ ├── Outreach (/dashboard/outreach) │
│ ├── Analytics (/dashboard/analytics) │
│ └── Settings (/dashboard/settings) │
│ │
│ State: React Context (Theme, Auth) │
│ HTTP: Fetch API │
│ Charts: Recharts │
│ Animations: Framer Motion │
└──────────────┬──────────────────────────────┘
│ HTTPS
▼
┌─────────────────────────────────────────────┐
│ NEXT.JS API ROUTES (Serverless) │
│ │
│ /api/leads/generate → OpenAI + Supabase │
│ /api/leads → Supabase CRUD │
│ /api/leads/[id] → Supabase CRUD │
│ /api/emails/send → Nodemailer + Supa │
│ /api/export/csv → Supabase + CSV │
│ /api/analytics → Supabase Queries │
│ /auth/callback → Supabase Auth │
│ │
│ Middleware: Auth check, redirects │
└──────┬─────────┬──────────┬─────────────────┘
│ │ │
▼ ▼ ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│ Supabase │ │ OpenAI │ │ Gmail │
│ │ │ API │ │ SMTP │
│ PostgreSQL│ │ │ │ │
│ Auth │ │ GPT-3.5│ │Nodemailer│
│ RLS │ │ turbo │ │ │
└──────────┘ └────────┘ └──────────┘

text


---

## Data Flow: Lead Generation
User clicks "Generate Leads"
↓
Frontend sends POST /api/leads/generate
{business_type, city, count}
↓
API Route verifies auth via Supabase cookies
↓
API Route calls OpenAI API with structured prompt
↓
OpenAI returns JSON array of business leads
↓
API Route parses JSON and adds user_id
↓
API Route inserts leads into Supabase (leads table)
↓
API Route returns {success: true, count: N}
↓
Frontend refreshes lead list from Supabase
↓
Leads displayed in table with ratings

text


---

## Data Flow: Cold Email
User selects leads (checkboxes) and clicks "Send Cold Email"
↓
Email modal opens with pre-filled template
↓
User edits subject/body and clicks Send
↓
Frontend sends POST /api/emails/send
{leads[], subject, body}
↓
API Route loops through each lead
↓
For each lead:
Replace {{owner_name}} and {{business_name}}
↓
Nodemailer sends email via Gmail SMTP
↓
Insert email log into Supabase (emails table)
↓
Status: sent or failed
↓
API Route returns {sent: N, failed: M}
↓
Frontend updates lead status to "contacted"
↓
Toast notification: "5 emails sent!"

text


---

## Authentication Flow
User clicks "Sign in with Google" on Landing Page
↓
Supabase SDK initiates Google OAuth
↓
Google login popup appears
↓
User selects Google account
↓
Google redirects to Supabase callback URL
↓
Supabase creates/updates auth.users record
↓
Trigger fires: creates profiles record
↓
Supabase redirects to /auth/callback
↓
/auth/callback exchanges code for session
↓
Session stored in secure cookies
↓
Redirect to /dashboard
↓
Middleware checks cookies on every request
↓
If no session → redirect to landing page

text


---

## File Structure
leadnova-crm/
├── src/
│ ├── app/
│ │ ├── layout.js (root layout)
│ │ ├── page.js (landing page)
│ │ ├── auth/callback/route.js (OAuth callback)
│ │ ├── dashboard/
│ │ │ ├── layout.js (sidebar layout)
│ │ │ ├── page.js (dashboard home)
│ │ │ ├── leads/page.js (leads management)
│ │ │ ├── outreach/page.js (email history)
│ │ │ ├── analytics/page.js (charts)
│ │ │ └── settings/page.js (agency config)
│ │ └── api/
│ │ ├── leads/
│ │ │ ├── generate/route.js
│ │ │ ├── route.js
│ │ │ └── [id]/route.js
│ │ ├── emails/send/route.js
│ │ ├── export/csv/route.js
│ │ └── analytics/route.js
│ ├── lib/
│ │ └── supabase/
│ │ ├── client.js (browser client)
│ │ └── server.js (server client)
│ ├── context/
│ │ └── ThemeContext.js
│ └── middleware.js (auth middleware)
├── project-docs/ (all documentation)
├── .env.local (secrets)
├── tailwind.config.js
├── next.config.js
└── package.json







