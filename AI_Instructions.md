```markdown
# AI Instructions
# LeadNova AI CRM
# Master Prompt for AI Code Generation

---

## Context

You are building a production-ready AI-powered CRM system called 
"LeadNova AI CRM". Read ALL files in the /project-docs folder 
before generating any code.

---

## Project Summary

LeadNova AI CRM is a web application for agency owners to:
1. Generate business leads using AI (OpenAI GPT-3.5-turbo)
2. Score leads automatically (1-5 stars)
3. Send personalized cold emails to selected leads
4. Track outreach history
5. View analytics and charts
6. Export leads as CSV

---

## Technical Decisions (LOCKED - Do not change)

- Framework: Next.js 14 with App Router
- Database: Supabase (PostgreSQL with RLS)
- Auth: Google OAuth via Supabase Auth (NO manual signup/login)
- AI: OpenAI API (gpt-3.5-turbo)
- Email: Nodemailer with Gmail SMTP
- Styling: Tailwind CSS with dark/light mode
- Charts: Recharts
- Animations: Framer Motion
- Notifications: React Hot Toast
- Icons: React Icons (Feather icons - Fi prefix)
- Deployment: Vercel

---

## Code Requirements

### Architecture
- All API logic in Next.js API Routes (/app/api/)
- No separate backend server
- Supabase client for browser, Supabase server for API routes
- Middleware for auth protection

### UI Requirements
- Premium SaaS look with glassmorphism
- Dark mode (default) + Light mode toggle
- Blue color scheme (#3b82f6 primary)
- Smooth animations on page load and interactions
- Responsive design (mobile, tablet, desktop)
- Sidebar navigation for dashboard pages

### Code Style
- Functional components with hooks
- 'use client' directive where needed
- Clean, modular, well-commented code
- Error handling with try-catch blocks
- Loading states for all async operations
- Toast notifications for user feedback

---

## Generation Order

Generate code in this exact order:

1. Environment configuration (.env.local template)
2. Supabase client setup (lib/supabase/client.js and server.js)
3. Middleware (src/middleware.js)
4. Theme context (src/context/ThemeContext.js)
5. Root layout (src/app/layout.js)
6. Landing page (src/app/page.js)
7. Auth callback (src/app/auth/callback/route.js)
8. Dashboard layout with sidebar (src/app/dashboard/layout.js)
9. Dashboard home page (src/app/dashboard/page.js)
10. Leads page (src/app/dashboard/leads/page.js)
11. Outreach page (src/app/dashboard/outreach/page.js)
12. Analytics page (src/app/dashboard/analytics/page.js)
13. Settings page (src/app/dashboard/settings/page.js)
14. API: Generate leads (src/app/api/leads/generate/route.js)
15. API: CRUD leads (src/app/api/leads/route.js)
16. API: Lead by ID (src/app/api/leads/[id]/route.js)
17. API: Send emails (src/app/api/emails/send/route.js)
18. API: Export CSV (src/app/api/export/csv/route.js)
19. API: Analytics (src/app/api/analytics/route.js)
20. Tailwind config
21. Global CSS
22. Package.json

---

## Critical Notes

1. NO manual signup/login pages - Google OAuth only
2. ALL data isolated per user via Supabase RLS
3. Emails sent from leadnovacrm@gmail.com
4. OpenAI prompt must return valid JSON array
5. Template variables {{owner_name}} and {{business_name}} 
   must be replaced before sending email
6. Dark mode is the DEFAULT theme
7. All dashboard pages share the sidebar layout
8. Charts should handle empty data gracefully
9. Generate modal and Email modal are within the Leads page
10. CSV export downloads file directly (no page navigation)












