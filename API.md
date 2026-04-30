```markdown
# API Specification
# LeadNova AI CRM
# All APIs are Next.js API Routes (serverless)

---

## Base URL
Development: http://localhost:3000/api
Production: https://your-app.vercel.app/api

---

## Authentication

All API routes (except auth callback) require an authenticated 
Supabase session. Authentication is handled via cookies set by 
Supabase Auth after Google OAuth login.

No manual Authorization header needed — Supabase SSR reads 
cookies automatically.

---

## API 1: Google OAuth Callback
GET /auth/callback?code=xxx

text


Purpose: Handle Google OAuth redirect after login
Flow: Google → Supabase → This route → Redirect to /dashboard
Response: 302 Redirect to /dashboard

---

## API 2: Generate Leads (AI)
POST /api/leads/generate

text


Purpose: Use OpenAI to generate business leads

Request Body:
```json
{
  "business_type": "Restaurant",
  "city": "Mumbai",
  "count": 10
}
Validation:

business_type: required, string, from allowed list
city: required, string, from allowed list
count: required, integer, 1-50
Process:

Verify user authentication
Call OpenAI API with structured prompt
Parse JSON response
Insert leads into database with user_id
Return success count






