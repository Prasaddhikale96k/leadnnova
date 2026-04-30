# Technology Stack
# LeadNova AI CRM

---

## Frontend

### Framework
- Next.js 14 (App Router)
- React 18

### Styling
- Tailwind CSS 3.4
- Custom glassmorphism classes
- Dark/Light mode via class toggle

### UI Libraries
- Framer Motion (animations)
- React Icons (FiIcons from Feather)
- React Hot Toast (notifications)
- Recharts (charts and graphs)

### State Management
- React Context (ThemeContext, AuthContext)
- React useState/useEffect hooks
- No Redux needed (simple state)

---

## Backend

### Runtime
- Next.js API Routes (serverless functions)
- No separate backend server needed

### APIs
- RESTful API design
- JSON request/response format

---

## Database

### Provider
- Supabase (PostgreSQL)
- Free tier: 500MB storage, 50K auth users

### Features Used
- PostgreSQL tables with RLS (Row Level Security)
- Supabase Auth (Google OAuth)
- Supabase Client SDK
- Real-time subscriptions (optional)

---

## AI Service

### Provider
- OpenAI API (gpt-3.5-turbo)

### Usage
- Lead generation: structured JSON output
- Lead scoring: rating based on business potential

### Configuration
- Temperature: 0.8 (creative but realistic)
- Max tokens: 4000
- Response format: JSON array

---

## Email Service

### Provider
- Gmail SMTP via Nodemailer

### Configuration
- Host: smtp.gmail.com
- Port: 587
- Auth: App Password (not regular password)
- Sender: leadnovacrm@gmail.com

### Limits
- 500 emails per day (Gmail free)
- 2000 emails per day (Google Workspace)

---

## Authentication

### Provider
- Supabase Auth

### Method
- Google OAuth 2.0
- JWT session tokens
- Cookie-based session management

### Setup Required
- Google Cloud Console OAuth credentials
- Supabase Google provider configuration

---

## Deployment

### Frontend + API
- Vercel (free tier)
- Automatic deployments from GitHub

### Database
- Supabase Cloud (free tier)

### Domain
- Vercel default: project-name.vercel.app
- Custom domain: optional

---

## Development Tools

### IDE
- Cursor (AI-powered IDE)

### Package Manager
- npm

### Version Control
- Git + GitHub

---

## NPM Packages

### Production Dependencies
```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0",
  "openai": "^4.20.1",
  "nodemailer": "^6.9.7",
  "recharts": "^2.10.3",
  "framer-motion": "^10.16.16",
  "react-icons": "^4.12.0",
  "react-hot-toast": "^2.4.1"
}











