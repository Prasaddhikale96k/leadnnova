# LeadNova AI CRM

> **AI-Powered Lead Generation & Cold Email Outreach Platform**

LeadNova is a production-ready, AI-powered CRM web application built for agency owners to generate, enrich, score, and manage business leads while running personalized cold email outreach campaigns with automated follow-up sequences.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
  - [Description](#description)
  - [Technology Stack](#technology-stack)
  - [Architecture Pattern](#architecture-pattern)
  - [Project Structure](#project-structure)
- [2. Features & Functionality](#2-features--functionality)
  - [Core Features](#core-features)
  - [User Roles & Authentication](#user-roles--authentication)
  - [Lead Management Pipeline](#lead-management-pipeline)
  - [Email Outreach System](#email-outreach-system)
  - [Follow-Up Automation](#follow-up-automation)
  - [Indian Leads Subsystem](#indian-leads-subsystem)
  - [Analytics & Reporting](#analytics--reporting)
- [3. Modules & Components](#3-modules--components)
  - [Frontend Pages](#frontend-pages)
  - [UI Components](#ui-components)
  - [API Endpoints](#api-endpoints)
  - [Database Schema](#database-schema)
  - [Entity Relationships](#entity-relationships)
- [4. User Guide](#4-user-guide)
  - [Installation & Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
  - [User Workflows](#user-workflows)
  - [Main Pages Overview](#main-pages-overview)
- [5. Technical Details](#5-technical-details)
  - [Dependencies](#dependencies)
  - [AI Integrations](#ai-integrations)
  - [Email System](#email-system)
  - [File Operations](#file-operations)
  - [Real-Time Features](#real-time-features)
- [6. Configuration & Deployment](#6-configuration--deployment)
  - [Configuration Files](#configuration-files)
  - [Development Environment](#development-environment)
  - [Production Deployment](#production-deployment)
  - [Database Setup](#database-setup)
- [7. Troubleshooting](#7-troubleshooting)
- [8. Contributing](#8-contributing)
- [9. License](#9-license)

---

## 1. Project Overview

### Description

**LeadNova AI CRM** is a full-stack web application that enables agency owners to:

1. **Scrape** business leads from Google Maps (with specialized support for Indian businesses)
2. **Enrich** leads with AI-generated insights, scoring, and personalized cold emails
3. **Send** bulk email campaigns with tracking and analytics
4. **Automate** follow-up sequences with AI-generated reply-based emails
5. **Analyze** outreach performance with real-time dashboards and charts

The application features a cinematic, animation-heavy UI with a light-themed "Eclipse" design system, smooth scrolling, and a premium SaaS aesthetic.

---

### Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js (App Router) | 14.2.35 |
| **UI Library** | React | 18.x |
| **Language** | JavaScript (JSX) | ES2022+ |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Authentication** | Supabase Auth (Google OAuth) | Latest |
| **Styling** | Tailwind CSS | 3.4.1 |
| **Animations** | GSAP + ScrollTrigger + TextPlugin | 3.14.2 |
| **Animations** | Framer Motion | 12.38.0 |
| **Smooth Scroll** | Lenis | 1.3.21 |
| **3D Graphics** | Three.js + React Three Fiber + Drei | 0.183.2 / 8.18.0 / 10.7.7 |
| **Charts** | Recharts | 3.8.1 |
| **Icons** | Lucide React + React Icons | 1.8.0 / 5.6.0 |
| **Notifications** | React Hot Toast | 2.6.0 |
| **AI - Groq** | Groq SDK (Llama 3.3 70B) | 1.1.2 |
| **AI - Google** | Google Generative AI (Gemini) | 0.24.1 |
| **AI - OpenAI** | OpenAI SDK (OpenRouter) | 6.33.0 |
| **Email** | Nodemailer (Gmail SMTP) | 8.0.5 |
| **Scraping** | Apify Client | 2.21.0 |
| **Deployment** | Vercel (with cron jobs) | Latest |
| **Proxy** | proxy-agent | 8.0.0 |

---

### Architecture Pattern

LeadNova uses a **Next.js App Router architecture** with the following patterns:

- **Server-Side Rendering (SSR)** with React Server Components
- **Client-Side Components** using `'use client'` directive for interactive UI
- **API Routes** as serverless functions (Next.js Route Handlers)
- **Supabase** for database, authentication, and real-time subscriptions
- **Row Level Security (RLS)** for multi-tenant data isolation
- **Middleware-based routing** and authentication guards
- **Component-based UI** with React hooks (`useState`, `useEffect`, `useMemo`)
- **Direct database queries** from both client and server components (no ORM)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js Client Components (React + Framer Motion)   │   │
│  │  - Pages, UI, Animations, Charts, Modals             │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Browser Client (Auth + DB Queries)         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (Vercel)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware (Auth Guards + Route Protection)          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes (Serverless Functions)                    │   │
│  │  - /api/leads/*  - /api/emails/*  - /api/outreach/*   │   │
│  │  - /api/followup/*  - /api/indian-leads/*             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Server Components (RSC) + Supabase Server Client     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                       │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐  │
│  │ Supabase │  │  Groq    │  │  Apify  │  │  Gmail     │  │
│  │   (DB)   │  │   (AI)   │  │(Scrape) │  │  (SMTP)    │  │
│  └──────────┘  └──────────┘  └─────────┘  └────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐                  │
│  │  Gemini  │  │ OpenAI   │  │ Nodemailer                │
│  │   (AI)   │  │(OpenRouter)│ │(Transport)               │
│  └──────────┘  └──────────┘  └─────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

### Project Structure

```
leadnova-crm/
├── src/
│   ├── middleware.js                    # Supabase SSR auth middleware
│   ├── app/                             # Next.js App Router
│   │   ├── layout.js                    # Root layout (ThemeProvider, SmoothScroll, Toaster)
│   │   ├── page.js                      # Landing page (Hero, Features, Pricing)
│   │   ├── globals.css                  # Global CSS variables & animations
│   │   ├── fonts/                       # Geist font files
│   │   ├── auth/callback/route.js       # Supabase OAuth callback
│   │   ├── onboarding/page.js           # User onboarding wizard
│   │   ├── dashboard/
│   │   │   ├── layout.js                # Dashboard shell (MorphingNav, mobile nav)
│   │   │   ├── page.js                  # Dashboard home (stats, charts, recent leads)
│   │   │   ├── leads/page.js            # Lead management & email generation
│   │   │   ├── indian-leads/page.js     # Indian leads scraping & outreach
│   │   │   ├── outreach/page.js         # Outreach history + Follow-up sequences
│   │   │   ├── analytics/page.js        # Analytics dashboard with charts
│   │   │   └── settings/page.js         # Agency profile settings
│   │   └── api/                         # API Route Handlers
│   │       ├── leads/                   # Lead CRUD, scraping, personalization
│   │       ├── emails/send/             # Email sending via nodemailer
│   │       ├── export/csv/              # CSV export
│   │       ├── indian-leads/            # Indian leads scraping endpoints
│   │       ├── outreach/                # Bulk outreach & Gmail verification
│   │       ├── followup/                # Follow-up scheduling & reply detection
│   │       └── cron/run-followups/      # Vercel cron endpoint
│   ├── components/
│   │   ├── MorphingNav.js               # Auto-hide navigation bar
│   │   ├── Cursor.js                    # Custom animated cursor
│   │   ├── SmoothScroll.js              # Lenis smooth scroll wrapper
│   │   ├── GlobalTransition.js          # Framer Motion page transitions
│   │   ├── NeuralGrid.jsx               # Three.js shader background
│   │   ├── BulkSendCinematic.js         # Cinematic bulk send animation
│   │   ├── GeneratingMailLoader.js      # Email generation loader
│   │   ├── SendingBulkLoader.js         # Bulk sending loader
│   │   ├── email/
│   │   │   ├── BulkSendModal.jsx        # 4-step bulk email modal
│   │   │   └── GmailSetupModal.jsx      # Gmail configuration modal
│   │   ├── followup/
│   │   │   └── FollowUpDashboard.jsx    # Follow-up sequence management
│   │   ├── indian-leads/
│   │   │   ├── IndianLeadsHero.jsx      # Hero section with Chakra SVG
│   │   │   ├── NicheLocationForm.jsx    # Search form (niche/city/state)
│   │   │   ├── LeadsDataTable.jsx       # Sortable/filterable table
│   │   │   ├── ScrapingProgress.jsx     # Real-time progress tracker
│   │   │   ├── StatsCards.jsx           # Summary statistics
│   │   │   ├── BulkActionBar.jsx        # Bulk action toolbar
│   │   │   ├── LeadDetailModal.jsx      # Lead detail popup
│   │   │   └── SetupRequiredBanner.jsx  # Setup required banner
│   │   └── shaders/
│   │       ├── NeuralGrid.jsx           # WebGL shader neural grid
│   │       └── NeuralGridWrapper.jsx    # Wrapper for NeuralGrid
│   ├── context/
│   │   └── ThemeContext.js              # Theme provider (light-mode only)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js                # Supabase browser client
│   │   │   └── server.js                # Supabase server client
│   │   ├── email/nodemailer.js          # Gmail SMTP transport
│   │   ├── groq/
│   │   │   └── email-generator.js       # AI cold email generation (Groq)
│   │   ├── followup/
│   │   │   ├── groq-followup-generator.js  # AI follow-up generation
│   │   │   ├── followup-sender.js       # Follow-up email sender
│   │   │   └── reply-detector.js        # Email reply detection
│   │   ├── indian-leads/
│   │   │   ├── animation-variants.js    # Framer Motion variants
│   │   │   ├── india-data.js            # Indian states/cities/niches
│   │   │   └── supabase-helpers.js      # Supabase query helpers
│   │   └── microinteractions.js         # GSAP micro-interactions
│   └── types/
│       └── indian-leads.ts              # TypeScript interfaces
├── scripts/
│   ├── google_maps_scraper.py           # Python Google Maps scraper
│   ├── scrape_google_maps.py            # Alternative scraper
│   ├── scrape_indian_businesses.py      # Indian business scraper
│   ├── requirements.txt                 # Python dependencies
│   └── run-scraper.js                   # Node.js scraper runner
├── sql/
│   ├── complete-indian-leads-migration.sql  # Full database schema
│   ├── indian-leads-migration.sql           # Initial schema
│   └── review_fire_migration.sql            # Email approval columns
├── package.json                         # Dependencies & scripts
├── next.config.js                       # Next.js configuration
├── tailwind.config.js                   # Tailwind + custom theme
├── vercel.json                          # Vercel cron configuration
├── .env.local                           # Environment variables
└── README.md                            # This file
```

---

## 2. Features & Functionality

### Core Features

| Feature | Description |
|---------|-------------|
| **Lead Scraping** | Bulk scrape up to 30,000 leads via Apify API; specialized Google Maps scraping for Indian businesses |
| **AI Enrichment** | Automatically enrich leads with business insights, scoring, and personalized angles |
| **Email Generation** | AI-generated cold emails using Groq (Llama 3.3 70B), Gemini, or OpenAI (OpenRouter) |
| **Bulk Email Sending** | Send personalized emails in bulk via Gmail SMTP with rate limiting |
| **Follow-Up Automation** | Automated multi-step follow-up sequences with AI-generated replies |
| **Reply Detection** | Monitor Gmail inbox for replies and auto-stop follow-up sequences |
| **Email Tracking** | Track sent, opened, replied, bounced, and converted emails |
| **Analytics Dashboard** | Real-time charts for activity trends, lead quality, top cities, pipeline status |
| **CSV Export** | Export leads to CSV for offline use |
| **User Onboarding** | 2-step wizard for agency setup (name, service type, description, email signature) |
| **Real-Time Updates** | Supabase Realtime subscriptions for live dashboard updates |
| **Cinematic UX** | GSAP timelines, Framer Motion, Three.js shaders, custom cursors, smooth scrolling |

---

### User Roles & Authentication

#### Authentication Flow

```
User visits site
    │
    ├── Not logged in → Sees landing page
    │       │
    │       └── Clicks "Sign In" → Google OAuth → Supabase Auth
    │               │
    │               └── New user? → Create profile → Redirect to /onboarding
    │
    └── Logged in but not onboarded → Redirect to /onboarding
            │
            └── Onboarding complete → Access /dashboard
```

#### User Flow & Permissions

All users have the same role (agency owner) with data isolated via **Supabase Row Level Security (RLS)**:

- Each user can only access their own `leads`, `indian_leads`, `emails`, `campaigns`, etc.
- RLS policy: `USING (auth.uid() = user_id)` on all tables
- Middleware redirects unauthenticated users from `/dashboard` to `/`
- Un-onboarded users are redirected to `/onboarding`

#### Authentication Method

- **Google OAuth** via Supabase Auth (no manual signup/login pages)
- Session managed via HTTP-only cookies
- Supabase middleware handles session validation on every request

---

### Lead Management Pipeline

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. SCRAPE  │ →  │ 2. ENRICH    │ →  │ 3. GENERATE  │ →  │ 4. SEND      │
│  Leads via  │    │ AI Scoring   │    │ Cold Emails  │    │ Bulk Emails  │
│  Apify/GMaps│    │ & Insights   │    │ via Groq AI  │    │ via Gmail    │
└─────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                  │
                                                                  ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│ 7. CONVERT  │ ←  │ 6. FOLLOW-UP │ ←  │ 5. TRACK     │
│ Close Deals │    │ Auto-Sequences│   │ Opens/Replies│
└─────────────┘    └──────────────┘    └──────────────┘
```

**Pipeline Stages:**

1. **Scrape**: Extract leads from Apify (global) or Google Maps (Indian businesses)
2. **Enrich**: AI analyzes each lead, scores quality, identifies needs and opportunities
3. **Generate**: Create personalized cold emails with AI, including subject line and body
4. **Send**: Bulk send via Gmail SMTP with configurable rate limits
5. **Track**: Monitor email opens, replies, bounces, and conversions
6. **Follow-Up**: Automated 3-step follow-up sequence with AI-generated emails
7. **Convert**: Close deals based on lead responses and engagement

---

### Email Outreach System

#### Gmail Integration

- Users configure their own Gmail address + App Password
- Nodemailer transports emails via Gmail SMTP (port 465, SSL)
- Rate limiting: 200/day, 20/hour, 3-minute delay between emails (configurable)
- Email templates include branded headers and unsubscribe footers

#### Email Tracking

Each sent email tracks:
- `status`: `pending`, `sent`, `failed`, `bounced`
- `is_opened`: Boolean + `open_count` + `last_opened_at`
- `is_replied`: Boolean + `replied_at` + `reply_content`
- `followup_count`: Number of follow-ups sent
- `next_followup_at`: Scheduled time for next follow-up
- `gmail_message_id`, `gmail_thread_id`: Gmail API integration

#### Bulk Email Modal Flow

1. **Configure**: Select leads, set AI tone, focus area, sender details
2. **Preview**: Review generated emails before sending
3. **Sending**: Cinematic animation with progress tracking
4. **Complete**: Summary of sent, failed, and skipped emails

---

### Follow-Up Automation

#### How It Works

1. **Schedule**: After initial email, a follow-up sequence is automatically created
2. **Generate**: AI generates follow-up emails based on reply status and tone settings
3. **Send**: Vercel cron job (`/api/cron/run-followups`) runs hourly to send scheduled follow-ups
4. **Detect**: Reply checker monitors Gmail inbox for responses
5. **Stop**: Sequence auto-stops on reply (or optionally on open)

#### Follow-Up Sequence Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Max Follow-Ups | 3 | Maximum emails in sequence |
| Follow-Up 1 Delay | 48 hours | Wait time after initial email |
| Follow-Up 2 Delay | 120 hours | Wait time after 1st follow-up |
| Follow-Up 3 Delay | 240 hours | Wait time after 2nd follow-up |
| Tone 1 | Friendly | Warm check-in |
| Tone 2 | Value-Focused | Additional value proposition |
| Tone 3 | Final Nudge | Last attempt |
| Stop on Reply | true | Halt sequence if lead replies |
| Stop on Open | false | Halt sequence if lead opens |

---

### Indian Leads Subsystem

A dedicated module for scraping and managing **Indian business leads** via Google Maps:

#### Features

- **Niche + Location Search**: Search by business type, city, and state
- **Real-Time Scraping Progress**: Live progress bar during Google Maps scraping
- **Session Management**: Track scraping sessions with stats
- **Enhanced Lead Data**: GST numbers, business hours, photos, social links, coordinates
- **Bulk Email Modal**: 4-step workflow (Configure → Preview → Sending → Complete)
- **Indian Tricolor Theme**: Saffron, white, and green accent dots
- **Starred Leads**: Mark important leads for quick access
- **Tags & Custom Fields**: Flexible metadata storage (JSONB)

#### Scraping Flow

```
User selects niche + city/state
    │
    ▼
API checks scraper setup
    │
    ▼
Creates scraping session (status: pending)
    │
    ▼
Runs Google Maps scraper (Python or Apify)
    │
    ▼
Saves leads to indian_leads table
    │
    ▼
Updates session progress (status: completed)
    │
    ▼
Real-time UI updates via Supabase Realtime
```

---

### Analytics & Reporting

#### Dashboard Metrics

| Metric | Description |
|--------|-------------|
| Total Leads | All leads scraped (global + Indian) |
| Emails Sent | Total outreach emails sent |
| Contacted | Leads that received at least one email |
| Conversion Rate | Replies received / Emails sent |
| Indian Leads | Leads from Indian Google Maps scraping |
| Indian Emails | Emails sent to Indian leads |

#### Charts

| Chart | Type | Data |
|-------|------|------|
| Activity Trends | Area/Line Chart | 7-day history of leads & emails |
| Leads by Business Type | Pie/Donut Chart | Distribution by industry |
| Lead Quality Ratings | Bar Chart | AI-rated lead quality distribution |
| Top Cities | Horizontal Bar Chart | Cities with most leads |
| Pipeline Status | Donut Chart | Lead status breakdown |

#### Daily Analytics Table (`analytics_daily`)

Automatically updated via database triggers on:
- New lead insertion
- Email sent/failed
- Session completed

---

## 3. Modules & Components

### Frontend Pages

#### Public Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Landing Page | Hero with "Find. Enrich. Close.", trust bar, how-it-works, bento features, pricing, testimonials, CTA |
| `/onboarding` | Onboarding Wizard | 2-step form: agency name + service type → description + phone + email signature |
| `/auth/callback` | OAuth Handler | Processes Supabase Google OAuth callback |

#### Dashboard Pages (Protected)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard Home | Welcome greeting, 6 stat cards, activity trends chart, business type donut, recent leads table |
| `/dashboard/leads` | Leads Management | Chat-style lead extraction form, data table with search/filter/pagination, bulk actions, email generation |
| `/dashboard/indian-leads` | Indian Leads | Hero with Chakra SVG, niche/location form, scraping progress, data table, bulk email modal |
| `/dashboard/outreach` | Outreach | Tabbed view: Outreach History table + Follow-Up Sequences dashboard |
| `/dashboard/analytics` | Analytics | Laser scanner reveal effect, binary drift background, 4 charts (trends, quality, cities, pipeline) |
| `/dashboard/settings` | Settings | Agency profile form: name, service type (12 options), description, phone, email signature |

---

### UI Components

#### Navigation & Shell

| Component | File | Purpose |
|-----------|------|---------|
| `MorphingNav` | `src/components/MorphingNav.js` | Auto-hide navigation with GSAP slide-in, user avatar dropdown, Google OAuth button |
| `DashboardLayout` | `src/app/dashboard/layout.js` | Desktop: MorphingNav; Mobile: Bottom tab bar with icons |
| `Middleware` | `src/middleware.js` | Auth protection, onboarding redirect |

#### Animations & Effects

| Component | File | Purpose |
|-----------|------|---------|
| `NovaPreloader` | `src/components/NovaPreloader.js` | 2-second "Initializing Lead Engine" animation |
| `BulkSendCinematic` | `src/components/BulkSendCinematic.js` | Cinematic bulk email sending animation |
| `GeneratingMailLoader` | `src/components/GeneratingMailLoader.js` | Email generation loading animation |
| `SendingBulkLoader` | `src/components/SendingBulkLoader.js` | Bulk sending progress animation |
| `Cursor` | `src/components/Cursor.js` | Custom animated cursor |
| `SmoothScroll` | `src/components/SmoothScroll.js` | Lenis smooth scroll wrapper |
| `NeuralGrid` | `src/components/shaders/NeuralGrid.jsx` | Three.js shader neural grid background |
| `GhostLights` | `src/components/GhostLights.js` | Ambient light background effects |
| `GlobalTransition` | `src/components/GlobalTransition.js` | Framer Motion page transitions |
| `TypewriterPlaceholder` | `src/components/TypewriterPlaceholder.js` | Typewriter text effect for inputs |
| `MagneticButton` | `src/components/MagneticButton.js` | Magnetic hover effect button |
| `LiquidToggle` | `src/components/LiquidToggle.js` | Liquid animation toggle |
| `ScrollProgress` | `src/components/ScrollProgress.js` | Scroll depth indicator |
| `StaggeredCharReveal` | `src/components/StaggeredCharReveal.js` | Character-by-character reveal animation |
| `microinteractions.js` | `src/lib/microinteractions.js` | GSAP utilities: magnetic, ripple, glitch text, parallax, scramble reveal |

#### Modals & Forms

| Component | File | Purpose |
|-----------|------|---------|
| `BulkSendModal` | `src/components/email/BulkSendModal.jsx` | 4-step modal: Configure → Preview → Sending → Complete |
| `GmailSetupModal` | `src/components/email/GmailSetupModal.jsx` | Gmail address + app password configuration |
| `FollowUpDashboard` | `src/components/followup/FollowUpDashboard.jsx` | Follow-up sequences with expandable timelines, reply checking, schedule config |
| `LeadDetailModal` | `src/components/indian-leads/LeadDetailModal.jsx` | Individual lead details popup |

#### Indian Leads Sub-Components

| Component | File | Purpose |
|-----------|------|---------|
| `IndianLeadsHero` | `src/components/indian-leads/IndianLeadsHero.jsx` | Hero with animated Chakra SVG, stat badges |
| `NicheLocationForm` | `src/components/indian-leads/NicheLocationForm.jsx` | Search form for niche/city/state |
| `LeadsDataTable` | `src/components/indian-leads/LeadsDataTable.jsx` | Sortable, filterable leads table |
| `ScrapingProgress` | `src/components/indian-leads/ScrapingProgress.jsx` | Real-time scraping progress display |
| `StatsCards` | `src/components/indian-leads/StatsCards.jsx` | Summary statistics cards |
| `BulkActionBar` | `src/components/indian-leads/BulkActionBar.jsx` | Bottom action bar for bulk operations |
| `SetupRequiredBanner` | `src/components/indian-leads/SetupRequiredBanner.jsx` | Banner when scraper not configured |

---

### API Endpoints

#### Leads API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leads` | Fetch all leads for current user |
| `POST` | `/api/leads` | Create new lead |
| `PATCH` | `/api/leads/[id]` | Update lead by ID |
| `DELETE` | `/api/leads/[id]` | Delete lead by ID |
| `POST` | `/api/leads/scrape` | Bulk scrape leads via Apify |
| `POST` | `/api/leads/personalize` | AI enrichment for selected leads |
| `POST` | `/api/leads/generate-emails` | Generate cold emails via AI |
| `POST` | `/api/leads/verify` | Verify lead data before sending |

#### Email API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/emails/send` | Send emails via nodemailer |

#### Outreach API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/outreach/generate-emails` | Generate outreach emails via AI |
| `POST` | `/api/outreach/send-bulk` | Bulk send outreach emails |
| `POST` | `/api/outreach/verify-gmail` | Verify Gmail credentials |

#### Follow-Up API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/followup/scheduler` | Configure follow-up schedule |
| `POST` | `/api/followup/check-replies` | Detect email replies in Gmail |
| `POST` | `/api/followup/cancel` | Cancel follow-up sequences |
| `GET` | `/api/cron/run-followups` | Vercel cron: send scheduled follow-ups (hourly) |

#### Indian Leads API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/indian-leads/scrape` | Start Google Maps scraping |
| `GET` | `/api/indian-leads/check-setup` | Check scraper setup status |
| `GET` | `/api/indian-leads/session/[id]` | Get scraping session status |
| `GET` | `/api/indian-leads/scrape/progress` | Get real-time scraping progress |

#### Export & Utility API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/export/csv` | Export leads to CSV |
| `GET` | `/api/simple-test` | Test endpoint |
| `POST` | `/api/test-send` | Email test send |
| `POST` | `/api/test-email` | Another email test |

---

### Database Schema

LeadNova uses **Supabase (PostgreSQL)** with **Row Level Security (RLS)** for multi-tenant data isolation.

#### Core Tables

##### 1. `leads` (Global Leads)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to `auth.users(id)`, CASCADE DELETE |
| `company_name` | TEXT | Business name |
| `full_name` | TEXT | Contact person name |
| `email` | TEXT | Contact email |
| `company_phone` | TEXT | Phone number |
| `business_type` | TEXT | Industry/niche |
| `city` | TEXT | City |
| `company_full_address` | TEXT | Full address |
| `rating` | NUMERIC | Google rating |
| `status` | TEXT | `pending_analysis`, `new`, `selected`, `contacted`, `bounced` |
| `is_selected` | BOOLEAN | Selection flag |
| `monthly_revenue` | TEXT | AI-estimated revenue |
| `online_presence` | TEXT | `Poor`, `Average`, `Good` |
| `needs` | TEXT | AI-identified gaps |
| `cold_email` | TEXT | AI-generated cold email draft |
| `email_subject` | TEXT | Generated email subject |
| `email_body` | TEXT | Generated email body |
| `email_verified` | BOOLEAN | Default `FALSE` |
| `email_angle` | TEXT | Email angle used |
| `email_approval_status` | TEXT | Default `pending` |
| `email_status` | TEXT | `invalid`, `verified`, `sent`, `bounced` |
| `email_error` | TEXT | Bounce/error reason |
| `created_at` | TIMESTAMPTZ | Auto-set |
| `updated_at` | TIMESTAMPTZ | Auto-set |

##### 2. `indian_leads` (Indian Leads)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to `auth.users(id)` |
| `session_id` | UUID | Link to scraping session |
| `niche` | TEXT | Business category |
| `search_location`, `search_city`, `search_state` | TEXT | Search context |
| `business_name`, `business_category`, `phone`, `email`, `website` | TEXT | Core data |
| `full_address`, `street`, `city`, `state`, `pincode` | TEXT | Address details |
| `rating`, `reviews_count` | DECIMAL/INT | Google Maps data |
| `google_maps_url`, `place_id`, `latitude`, `longitude` | TEXT/DECIMAL | Location data |
| `business_hours`, `photos_urls`, `social_links` | JSONB | Rich metadata |
| `owner_name`, `decision_maker_email`, `linkedin_url` | TEXT | Enrichment |
| `ai_cold_email_subject`, `ai_cold_email_body`, `ai_cold_email_text` | TEXT | AI content |
| `outreach_status` | TEXT | `not_contacted`, `contacted`, `replied`, `converted` |
| `lead_score` | INTEGER | AI quality score |
| `is_starred`, `tags`, `custom_fields` | BOOLEAN/JSONB | User metadata |
| `created_at`, `updated_at` | TIMESTAMPTZ | Timestamps |

##### 3. `indian_leads_sessions` (Scraping Sessions)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to `auth.users(id)` |
| `niche`, `location`, `city`, `state` | TEXT | Search parameters |
| `total_results`, `leads_with_email`, `leads_with_phone`, `leads_with_website` | INT | Stats |
| `status` | TEXT | `pending`, `running`, `completed`, `failed` |
| `progress_percent`, `current_step` | INT/TEXT | Progress tracking |
| `started_at`, `completed_at` | TIMESTAMPTZ | Timestamps |

##### 4. `outreach_campaigns`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to `auth.users(id)` |
| `session_id` | UUID | FK to `indian_leads_sessions` |
| `campaign_name`, `campaign_type` | TEXT | Campaign details |
| `from_email`, `from_name`, `reply_to` | TEXT | Sender info |
| `ai_tone`, `ai_focus`, `custom_prompt_addition` | TEXT | AI settings |
| `total_emails`, `sent_count`, `failed_count`, `opened_count`, `replied_count`, `converted_count` | INT | Stats |
| `status` | TEXT | `draft`, `running`, `completed`, `failed` |
| `scheduled_at`, `started_at`, `completed_at` | TIMESTAMPTZ | Timestamps |

##### 5. `outreach_emails` (Individual Emails)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id`, `campaign_id`, `lead_id`, `session_id` | UUID | Relations |
| `business_name`, `owner_name`, `to_email` | TEXT | Recipient |
| `subject`, `body_html`, `body_text` | TEXT | Email content |
| `ai_model_used` | TEXT | `llama-3.3-70b-versatile` |
| `status` | TEXT | `pending`, `sent`, `failed` |
| `is_opened`, `open_count`, `last_opened_at` | BOOLEAN/INT/TIMESTAMPTZ | Open tracking |
| `is_replied`, `replied_at`, `reply_content` | BOOLEAN/TIMESTAMPTZ/TEXT | Reply tracking |
| `followup_count`, `next_followup_at` | INT/TIMESTAMPTZ | Follow-up tracking |
| `followup_stopped`, `followup_stop_reason` | BOOLEAN/TEXT | Sequence control |
| `gmail_message_id`, `gmail_thread_id`, `in_reply_to` | TEXT | Gmail headers |
| `unsubscribed`, `unsubscribed_at` | BOOLEAN/TIMESTAMPTZ | Unsubscribe tracking |

##### 6. `followup_emails`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id`, `original_email_id`, `lead_id`, `campaign_id` | UUID | Relations |
| `followup_number` | INTEGER | Sequence position (1, 2, 3) |
| `sequence_type` | TEXT | `friendly`, `value_focused`, `final_nudge` |
| `to_email`, `subject`, `body_html`, `body_text` | TEXT | Email content |
| `status` | TEXT | `scheduled`, `sent`, `failed` |
| `scheduled_for`, `sent_at` | TIMESTAMPTZ | Timing |
| `reply_received`, `reply_received_at` | BOOLEAN/TIMESTAMPTZ | Reply tracking |

##### 7. `followup_schedules`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id`, `campaign_id` | UUID | Relations |
| `is_active` | BOOLEAN | Sequence active flag |
| `max_followups` | INTEGER | Default 3 |
| `followup_1_delay_hours`, `followup_2_delay_hours`, `followup_3_delay_hours` | INT | Delays (48, 120, 240) |
| `followup_1_tone`, `followup_2_tone`, `followup_3_tone` | TEXT | Tones |
| `stop_on_open`, `stop_on_reply` | BOOLEAN | Stop conditions |

##### 8. `user_email_settings`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | UNIQUE FK to `auth.users(id)` |
| `gmail_address`, `gmail_app_password` | TEXT | Gmail credentials |
| `from_name`, `reply_to` | TEXT | Sender details |
| `daily_limit`, `hourly_limit`, `delay_between_emails` | INT | Rate limits (200, 20, 3) |
| `emails_sent_today`, `last_reset_date` | INT/DATE | Daily tracking |
| `default_ai_tone`, `default_focus` | TEXT | AI defaults |
| `is_gmail_verified`, `is_groq_verified` | BOOLEAN | Verification status |

##### 9. `analytics_daily`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id`, `date` | UUID/DATE | UNIQUE constraint |
| `total_leads`, `indian_leads_generated`, `leads_with_email` | INT | Lead stats |
| `emails_sent`, `emails_failed`, `emails_opened`, `emails_replied` | INT | Email stats |
| `converted`, `conversion_rate`, `avg_lead_rating` | INT/DECIMAL | Conversion metrics |

##### 10. `profiles` (User Profiles)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK, matches `auth.users(id)` |
| `is_onboarded` | BOOLEAN | Onboarding status |
| `full_name`, `agency_name`, `service_description` | TEXT | Profile details |

##### 11. `reply_check_logs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to `auth.users(id)` |
| `checked_at` | TIMESTAMPTZ | Check timestamp |
| `emails_checked`, `replies_found`, `followups_triggered` | INT | Check results |
| `status`, `error_message` | TEXT | Status info |

##### 12. `emails` (Simple Email Log)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id`, `lead_id` | UUID | Relations |
| `to_email`, `to_name`, `subject`, `body` | TEXT | Email details |
| `status` | TEXT | `sent`, `failed` |
| `error_message`, `sent_at` | TEXT/TIMESTAMPTZ | Status info |

---

### Entity Relationships

```
auth.users (Supabase Auth)
  │
  ├── 1:N ──► leads
  ├── 1:N ──► indian_leads
  ├── 1:N ──► indian_leads_sessions
  ├── 1:N ──► outreach_campaigns
  ├── 1:N ──► outreach_emails
  ├── 1:1 ──► user_email_settings (UNIQUE)
  ├── 1:N ──► analytics_daily
  ├── 1:N ──► followup_emails
  ├── 1:N ──► followup_schedules
  ├── 1:N ──► reply_check_logs
  └── 1:1 ──► profiles

indian_leads_sessions
  │
  ├── 1:N ──► indian_leads (via session_id)
  └── 1:N ──► outreach_campaigns (via session_id)

outreach_campaigns
  │
  ├── 1:N ──► outreach_emails (via campaign_id)
  └── 1:N ──► followup_schedules (via campaign_id)

outreach_emails
  │
  └── 1:N ──► followup_emails (via original_email_id)
```

---

### Database Triggers

| Trigger | Table | Event | Action |
|---------|-------|-------|--------|
| `trigger_update_analytics_email` | `outreach_emails` | INSERT/UPDATE | Updates `analytics_daily` emails_sent/failed counters |
| `trigger_update_analytics_lead` | `indian_leads` | INSERT | Increments `analytics_daily` indian_leads_generated and total_leads |
| `trigger_update_analytics_session` | `indian_leads_sessions` | UPDATE status='completed' | Updates analytics with session totals |

---

### Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `indian_leads` | `idx_indian_leads_user` | Fast user lookups |
| `indian_leads` | `idx_indian_leads_session` | Session-based queries |
| `indian_leads` | `idx_indian_leads_email` | Email search |
| `indian_leads` | `idx_indian_leads_outreach` | Outreach status filtering |
| `outreach_emails` | `idx_outreach_emails_user` | User email lookups |
| `outreach_emails` | `idx_outreach_emails_status` | Status filtering |
| `outreach_emails` | `idx_outreach_emails_lead` | Lead-based queries |
| `outreach_emails` | `idx_outreach_next_followup` | Follow-up scheduling (compound: next_followup_at, followup_stopped, reply_received) |
| `analytics_daily` | `idx_analytics_user_date` | User + date lookups |
| `followup_emails` | `idx_followup_scheduled` | Scheduled email queries (compound: scheduled_for, status) |
| `followup_emails` | `idx_followup_original` | Original email lookups |

---

## 4. User Guide

### Installation & Setup

#### Prerequisites

- **Node.js** 18+ (recommended: 20.x LTS)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **Supabase** account (free tier available)
- **Google Cloud** project (for OAuth)
- **Gmail** account with App Password
- **Groq** API key (free tier available)
- **Apify** account (optional, for scraping)

#### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leadnova-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` (or create new `.env.local`):
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in the variables (see [Environment Variables](#environment-variables) section below).

4. **Set up Supabase database**
   
   Run the SQL migration in your Supabase SQL editor:
   ```bash
   # Copy the contents of sql/complete-indian-leads-migration.sql
   # Paste into Supabase SQL editor and run
   ```

5. **Configure Google OAuth in Supabase**
   
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth Client ID and Secret
   - Set redirect URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   
   Navigate to `http://localhost:3000` in your browser.

---

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI Providers
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password

# Scraping (Optional)
APIFY_API_KEY=your-apify-api-key

# Security
CRON_SECRET=your-cron-secret-for-followups

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side, **keep secret**) |
| `GROQ_API_KEY` | ✅ | Groq API key for AI email generation (get free key at console.groq.com) |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (alternative AI provider) |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API key (alternative AI provider) |
| `EMAIL_USER` | ✅ | Gmail address for sending emails |
| `EMAIL_PASS` | ✅ | Gmail App Password (not regular password; generate in Google Account → Security → App Passwords) |
| `APIFY_API_KEY` | Optional | Apify API key for web scraping (get at apify.com) |
| `CRON_SECRET` | ✅ | Secret key for Vercel cron job authentication |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Base URL for the application |

---

### User Workflows

#### 1. New User Onboarding

```
1. Visit http://localhost:3000
2. Click "Sign In with Google" in the navbar
3. Complete Google OAuth authentication
4. Redirected to /onboarding (first-time users)
5. Step 1: Enter agency name + select service type from 12 options
6. Step 2: Enter service description, phone number, email signature
7. Click "Complete Setup" → Redirected to /dashboard
```

#### 2. Scraping Leads (Global via Apify)

```
1. Navigate to /dashboard/leads
2. Use the chat-style form:
   - Step 1: Enter business niche/category
   - Step 2: Enter location
   - Step 3: Confirm extraction
3. Click "Generate Leads"
4. Wait for Apify to scrape (progress shown in UI)
5. Leads appear in the Extraction Desk data table
6. Filter, search, and select leads for outreach
```

#### 3. Scraping Indian Leads (Google Maps)

```
1. Navigate to /dashboard/indian-leads
2. Fill in the Niche/Location form:
   - Business niche (e.g., "Restaurant", "Gym", "Salon")
   - City (select from dropdown or type)
   - State (select from dropdown)
3. Click "Start Scraping"
4. Watch real-time progress bar
5. Leads appear in the data table as they're scraped
6. Review stats in StatsCards (total, with email, with phone, with website)
7. Select leads and click "Send Email" for bulk outreach
```

#### 4. AI Enrichment & Email Generation

```
1. Select leads from the data table (checkboxes)
2. Click "Analyze & Personalize"
3. Wait for AI to enrich leads (scoring, needs identification)
4. Click "Generate Emails"
5. AI generates personalized cold emails for each lead
6. Review generated emails in the table
```

#### 5. Sending Bulk Emails

```
1. Select leads with generated emails
2. Click "Send Emails"
3. BulkSendModal opens:
   - Step 1 (Configure): Set AI tone, focus area, sender details
   - Step 2 (Preview): Review emails before sending
   - Step 3 (Sending): Watch cinematic sending animation
   - Step 4 (Complete): View summary of sent/failed/skipped
4. Click "Confirm & Send"
5. Track progress in real-time
6. View results in the Outreach History tab
```

#### 6. Setting Up Follow-Up Sequences

```
1. After sending initial emails, navigate to /dashboard/outreach
2. Switch to "Follow-Up Sequences" tab
3. Click "Configure Follow-Ups"
4. Set parameters:
   - Max follow-ups (1-3)
   - Delay hours for each follow-up
   - Tone for each follow-up (friendly, value-focused, final nudge)
   - Stop conditions (on reply, on open)
5. Click "Save Schedule"
6. Follow-ups are automatically sent by Vercel cron job (hourly)
```

#### 7. Monitoring Analytics

```
1. Navigate to /dashboard/analytics
2. View laser scanner reveal animation
3. Review 4 stat cards at the top
4. Analyze charts:
   - Activity Trends: 7-day line chart of leads & emails
   - Lead Quality: Bar chart of AI-rated lead quality
   - Top Cities: Horizontal bar chart of lead locations
   - Pipeline Status: Donut chart of lead statuses
```

#### 8. Exporting Leads

```
1. Navigate to /dashboard/leads or /dashboard/indian-leads
2. Select leads (or use bulk select)
3. Click "Export CSV"
4. File downloads automatically
```

---

### Main Pages Overview

#### Landing Page (`/`)

- **NovaPreloader**: 2-second "Initializing Lead Engine" animation
- **MagneticGrid**: Canvas-based magnetic grid that distorts on mouse proximity
- **Navbar**: Pill-shaped floating nav with auto-hide on scroll, mobile hamburger menu
- **HeroSection**: "Find. Enrich. Close." animated text, typewriter placeholder search input, suggestion pills
- **TrustBar**: Animated stat counters (30K+ Leads/Run, 87% Email Rate, 700M+ Database)
- **HowItWorks**: 3-step cards (Scrape → AI Scores → Send Campaigns)
- **BentoFeatures**: Asymmetric grid with animated charts, progress bars, mini CRM stats
- **Pricing**: Pricing tier cards
- **Testimonials**: User testimonials carousel
- **CTA**: Final call-to-action section
- **Footer**: Links and branding
- **GhostLights/GhostUI**: Atmospheric background effects

#### Dashboard Home (`/dashboard`)

- Welcome greeting with user name
- **6 Bento Stat Cards**: Total Leads, Emails Sent, Contacted, Conversion Rate, Indian Leads, Indian Emails
- **Activity Trends**: Area chart showing 7-day history
- **Leads by Business Type**: Pie/Donut chart of industry distribution
- **Recent Leads Table**: Last 5 leads with quick actions
- GSAP staggered entrance animations for all elements

#### Leads Page (`/dashboard/leads`)

- **Chat-Style Form**: 3-step conversational UI (Niche → Location → Confirm Extraction)
- **Extraction Desk**: Data table with search, status filter, pagination, bulk selection
- **Action Buttons**: Generate Leads, Analyze/Personalize, Generate Emails, Send Emails, Export CSV
- **Bulk Operations**: Mark selected, delete selected
- **Cinematic Loaders**: SendingBulkLoader, GeneratingMailLoader, BulkSendCinematic
- **Support Chat Widget**: Floating chat icon

#### Indian Leads Page (`/dashboard/indian-leads`)

- **IndianLeadsHero**: Animated hero with Chakra SVG, stat badges
- **NicheLocationForm**: Niche/city/state search form with dropdowns
- **ScrapingProgress**: Real-time progress tracking during scraping
- **LeadsDataTable**: Sortable, filterable table with selection
- **StatsCards**: Summary statistics (total, email, phone, website)
- **BulkActionBar**: Bottom action bar for selected leads
- **BulkSendModal**: 4-step modal (Configure → Preview → Sending → Complete)
- **SetupRequiredBanner**: Displayed if scraper not configured
- **LeadDetailModal**: Individual lead details popup
- Indian tricolor accent colors (saffron, white, green floating dots)

#### Outreach Page (`/dashboard/outreach`)

- **Tab 1: Outreach History**: Table showing all sent emails with business, recipient, subject, status, date
- **Tab 2: Follow-Up Sequences**: FollowUpDashboard with expandable email timelines, reply checking, configuration modal

#### Analytics Page (`/dashboard/analytics`)

- **Laser Scanner Reveal**: GSAP animation that scans across the page
- **Binary Drift Background**: Animated binary numbers
- **4 Stat Cards**: Key metrics
- **4 Chart Cards**:
  - Activity Trends (Line Chart)
  - Lead Quality Ratings (Bar Chart)
  - Top Cities (Horizontal Bar Chart)
  - Pipeline Status (Donut Chart)

#### Settings Page (`/dashboard/settings`)

- **Agency Profile Form**:
  - Agency name
  - Service type (dropdown with 12 options)
  - Service description (textarea)
  - Phone number
  - Email signature
- **Gmail Setup**: Modal for configuring Gmail address and app password
- **AI Settings**: Default tone and focus area

---

## 5. Technical Details

### Dependencies

#### Production Dependencies

```json
{
  "@google/generative-ai": "^0.24.1",
  "@react-three/drei": "^10.7.7",
  "@react-three/fiber": "^8.18.0",
  "@supabase/ssr": "^0.10.0",
  "@supabase/supabase-js": "^2.103.0",
  "@types/nodemailer": "^8.0.0",
  "apify-client": "^2.21.0",
  "framer-motion": "^12.38.0",
  "groq-sdk": "^1.1.2",
  "gsap": "^3.14.2",
  "lenis": "^1.3.21",
  "lucide-react": "^1.8.0",
  "next": "14.2.35",
  "nodemailer": "^8.0.5",
  "openai": "^6.33.0",
  "proxy-agent": "^8.0.0",
  "react": "^18",
  "react-dom": "^18",
  "react-hot-toast": "^2.6.0",
  "react-icons": "^5.6.0",
  "recharts": "^3.8.1",
  "three": "^0.183.2"
}
```

#### Development Dependencies

```json
{
  "eslint": "^8",
  "eslint-config-next": "14.2.35",
  "postcss": "^8",
  "tailwindcss": "^3.4.1",
  "typescript": "^6.0.2"
}
```

#### Python Dependencies (for scrapers)

Located in `scripts/requirements.txt`:
```
requests
beautifulsoup4
selenium
```

---

### AI Integrations

LeadNova integrates with **three AI providers** for email generation and lead enrichment:

#### 1. Groq (Primary)

- **Model**: `llama-3.3-70b-versatile`
- **Use Case**: Cold email generation, follow-up sequences
- **Library**: `groq-sdk`
- **Features**:
  - Personalized email generation based on lead data
  - Configurable tone (professional, friendly, casual, formal)
  - Fallback to template if API fails
  - Token usage tracking
  - Batch processing (5 leads at a time with 1s delay)

**Example: Email Generation**
```javascript
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const completion = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.8,
  max_tokens: 1024
})
```

#### 2. Google Gemini

- **Library**: `@google/generative-ai`
- **Use Case**: Alternative AI provider for email generation
- **API Key**: `GEMINI_API_KEY`

#### 3. OpenAI (via OpenRouter)

- **Library**: `openai`
- **Use Case**: Alternative AI provider
- **API Key**: `OPENROUTER_API_KEY`

#### AI Prompt Engineering

The cold email generation prompt includes:

- **Rules**: No generic templates, reference specific business details, keep subject lines <60 chars, 3-4 short paragraphs, clear CTA, no spam words, sound human
- **Context**: Indian business market, GST references, local city mentions
- **Personalization**: Website presence, ratings, owner name, business category
- **Output Format**: Valid JSON with `subject`, `body_text`, `body_html`

---

### Email System

#### Nodemailer Configuration

```javascript
// src/lib/email/nodemailer.js
import nodemailer from 'nodemailer'

export function createGmailTransporter(gmailAddress, appPassword) {
  const cleanPass = (appPassword || '').replace(/\s/g, '').trim()
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailAddress,
      pass: cleanPass
    }
  })
  return transporter
}
```

#### Email Sending Flow

```
1. User selects leads and clicks "Send Emails"
2. BulkSendModal opens
3. User configures: AI tone, focus, sender details
4. AI generates personalized emails (Groq/Gemini/OpenAI)
5. Nodemailer sends each email via Gmail SMTP:
   - Rate limiting: 3-second delay between emails
   - Retry logic: 3 retries per email
   - Error tracking: Failed emails logged with error message
6. Email records saved to outreach_emails table
7. Database trigger updates analytics_daily
8. Follow-up sequence scheduled (if enabled)
```

#### Email Template Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f9fa;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#FF6B35,#FF8C42);padding:24px 32px;">
      <div style="color:white;font-size:18px;font-weight:700;">Sender Company</div>
      <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-top:4px;">Service Description</div>
    </div>
    <div style="padding:32px;color:#1a1a1a;line-height:1.7;font-size:15px;">
      <!-- AI-generated email body -->
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;font-size:12px;color:#888;">
      <p>Sent via LeadNova · India</p>
      <p>If you don't want to receive these emails, please reply with "unsubscribe"</p>
    </div>
  </div>
</body>
</html>
```

#### Gmail Verification

```bash
# Test Gmail connection via API
POST /api/outreach/verify-gmail
Body: { gmailAddress: "...", appPassword: "..." }
Response: { success: true } or { success: false, error: "..." }
```

---

### File Operations

#### CSV Export

The `/api/export/csv` endpoint generates and downloads CSV files:

```javascript
// Export leads to CSV
GET /api/export/csv?type=leads|indian_leads

// Response: CSV file download
Content-Type: text/csv
Content-Disposition: attachment; filename="leads_2026-04-12.csv"
```

**CSV Columns (Global Leads):**
- company_name, full_name, email, company_phone, business_type, city, rating, status

**CSV Columns (Indian Leads):**
- business_name, business_category, phone, email, website, city, state, rating, reviews_count, outreach_status

---

### Real-Time Features

#### Supabase Realtime

The following tables publish live updates via Supabase Realtime:

- `indian_leads`
- `indian_leads_sessions`
- `outreach_emails`
- `outreach_campaigns`
- `analytics_daily`
- `followup_emails`
- `followup_schedules`

#### Real-Time Subscriptions in UI

```javascript
// Example: Subscribe to indian_leads changes
const subscription = supabase
  .channel('indian_leads_changes')
  .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'indian_leads' },
      (payload) => {
        // Update UI with new lead data
        console.log('Change received!', payload)
      }
  )
  .subscribe()
```

**Use Cases:**
- Real-time scraping progress updates
- Live email sending status
- Follow-up sequence status changes
- Analytics dashboard auto-refresh

---

### Vercel Cron Jobs

#### Follow-Up Automation

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/run-followups",
      "schedule": "0 * * * *"
    }
  ]
}
```

**How it works:**
1. Cron runs hourly (`0 * * * *`)
2. Endpoint: `/api/cron/run-followups`
3. Authenticates via `CRON_SECRET` header
4. Queries `outreach_emails` for emails with `next_followup_at <= NOW()`
5. Generates follow-up email via Groq AI
6. Sends email via Gmail SMTP
7. Updates `followup_emails` table with status
8. Increments `followup_count` on original email
9. Sets `next_followup_at` for next follow-up (if applicable)

---

## 6. Configuration & Deployment

### Configuration Files

#### `package.json`

```json
{
  "name": "leadnova-crm",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",         // Start development server
    "build": "next build",     // Build for production
    "start": "next start",     // Start production server
    "lint": "next lint"        // Run ESLint
  }
}
```

#### `next.config.js`

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },  // Google OAuth avatars
      { protocol: 'https', hostname: '**.supabase.co' },              // Supabase storage
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['proxy-agent'],  // Required for proxy-agent in RSC
  },
}
module.exports = nextConfig
```

#### `tailwind.config.js`

Key customizations:
- **Dark mode**: `class`-based (currently light-mode only)
- **Custom colors**: Eclipse dark/light themes, brand (indigo/purple), accent (cyan, purple, green)
- **Fonts**: Space Grotesk (display), Inter (sans), JetBrains Mono/IBM Plex Mono (mono)
- **Utilities**: Text shadows (glow, cyan, purple), gradient backgrounds, loading/float/pulse animations

#### `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/run-followups",
      "schedule": "0 * * * *"
    }
  ]
}
```

Configures Vercel to run the follow-up automation cron job hourly.

#### `.eslintrc.json`

Standard Next.js ESLint configuration.

#### `jsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Enables `@/` path aliases for imports.

---

### Development Environment

#### Step-by-Step Setup

1. **Install Node.js**
   
   Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/). Verify:
   ```bash
   node -v  # Should be v18.0.0 or higher
   npm -v   # Should be v9.0.0 or higher
   ```

2. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd leadnova-crm
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Supabase**
   
   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Copy your project URL and anon key from Project Settings → API
   
   c. Enable Google OAuth:
      - Go to Authentication → Providers
      - Enable Google
      - Add Google OAuth Client ID and Secret
      - Set redirect URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   
   d. Run SQL migrations:
      - Go to SQL Editor
      - Copy contents of `sql/complete-indian-leads-migration.sql`
      - Paste and run
      - Copy contents of `sql/review_fire_migration.sql`
      - Paste and run

5. **Configure Google OAuth**
   
   a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Create a new project or select existing
   
   c. Enable Google+ API
   
   d. Create OAuth 2.0 credentials:
      - Application type: Web application
      - Authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   
   e. Copy Client ID and Client Secret to Supabase

6. **Create Gmail App Password**
   
   a. Go to your Google Account → Security
   
   b. Enable 2-Step Verification (if not already enabled)
   
   c. Go to App Passwords
   
   d. Generate a new password for "Mail"
   
   e. Copy the 16-character password (remove spaces)

7. **Get API Keys**
   
   a. **Groq**: Sign up at [console.groq.com](https://console.groq.com) → API Keys → Create Key
   
   b. **Gemini**: Sign up at [aistudio.google.com](https://aistudio.google.com) → Get API Key
   
   c. **OpenRouter**: Sign up at [openrouter.ai](https://openrouter.ai) → Keys → Create Key
   
   d. **Apify** (optional): Sign up at [apify.com](https://apify.com) → Settings → API

8. **Create `.env.local`**
   
   Copy the template from the [Environment Variables](#environment-variables) section and fill in your keys.

9. **Run Development Server**
   ```bash
   npm run dev
   ```

10. **Open Application**
    
    Navigate to `http://localhost:3000` in your browser.

---

### Production Deployment

#### Deploy to Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <repository-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   
   a. Go to [vercel.com](https://vercel.com)
   
   b. Click "New Project"
   
   c. Import your GitHub repository
   
   d. Configure environment variables (copy from `.env.local`)
   
   e. Click "Deploy"

3. **Configure Cron Jobs**
   
   Vercel cron jobs are automatically configured from `vercel.json`. Verify in Vercel Dashboard → Project Settings → Cron Jobs.

4. **Set Custom Domain** (optional)
   
   a. Go to Vercel Dashboard → Project Settings → Domains
   
   b. Add your domain
   
   c. Configure DNS records as instructed by Vercel

5. **Update Environment Variables**
   
   Ensure `NEXT_PUBLIC_SITE_URL` is set to your production URL (e.g., `https://leadnova.vercel.app`)

#### Environment Variables for Production

| Variable | Production Value |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (**keep secret**) |
| `GROQ_API_KEY` | Your Groq API key |
| `GEMINI_API_KEY` | Your Gemini API key |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password |
| `APIFY_API_KEY` | Your Apify API key (optional) |
| `CRON_SECRET` | Your cron job secret |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (e.g., `https://leadnova.vercel.app`) |

#### Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database migrations are run in Supabase
- [ ] Google OAuth is configured and working
- [ ] Gmail App Password is verified and working
- [ ] API keys (Groq, Gemini, OpenRouter) are valid
- [ ] Vercel cron job is active and running
- [ ] Custom domain is configured (if applicable)
- [ ] Test lead scraping functionality
- [ ] Test email sending and follow-up automation
- [ ] Test analytics dashboard
- [ ] Test CSV export

---

### Database Setup

#### Running Migrations

1. **Initial Schema**
   
   Run `sql/complete-indian-leads-migration.sql` in Supabase SQL Editor. This creates:
   - All tables (indian_leads, sessions, campaigns, emails, analytics, etc.)
   - Indexes for performance
   - Row Level Security policies
   - Database triggers for analytics updates
   - Realtime publications

2. **Additional Migrations**
   
   Run `sql/review_fire_migration.sql` to add email approval columns to the `leads` table.

3. **Verify Tables**
   
   After running migrations, verify all tables exist in Supabase Dashboard → Table Editor:
   - `leads`
   - `indian_leads`
   - `indian_leads_sessions`
   - `outreach_campaigns`
   - `outreach_emails`
   - `followup_emails`
   - `followup_schedules`
   - `user_email_settings`
   - `analytics_daily`
   - `reply_check_logs`
   - `profiles` (auto-created by Supabase Auth)

#### Supabase Storage (Optional)

If you want to store files (e.g., lead photos, documents):

1. Go to Supabase Dashboard → Storage
2. Create a new bucket (e.g., `lead-files`)
3. Set bucket permissions (public or private)
4. Update API routes to handle file uploads

---

## 7. Troubleshooting

### Common Issues

#### 1. Google OAuth Not Working

**Problem**: Users cannot sign in with Google.

**Solution**:
- Verify Google OAuth is enabled in Supabase Dashboard → Authentication → Providers
- Ensure redirect URL matches: `https://<your-project-ref>.supabase.co/auth/v1/callback`
- Check Google Cloud Console for authorized redirect URIs
- Verify Client ID and Secret are correct in Supabase

#### 2. Emails Not Sending

**Problem**: Bulk email sending fails.

**Solution**:
- Verify Gmail App Password is correct (16 characters, no spaces)
- Ensure 2-Step Verification is enabled on Gmail account
- Test Gmail connection via `/api/outreach/verify-gmail`
- Check Gmail daily sending limits (500 for free accounts, 2000 for Workspace)
- Review error logs in browser console and server logs

#### 3. AI Email Generation Fails

**Problem**: AI returns errors or empty responses.

**Solution**:
- Verify API keys (Groq, Gemini, OpenRouter) are valid and have credits
- Check API rate limits (Groq free tier: 10 requests/minute)
- Review error logs for API rejection reasons
- Fallback: System uses hardcoded template if AI fails

#### 4. Scraping Not Working

**Problem**: Leads not being scraped.

**Solution**:
- Verify Apify API key is valid
- Check Apify actor status and credits
- For Indian leads: Ensure Python scraper dependencies are installed (`scripts/requirements.txt`)
- Review scraping session status in `indian_leads_sessions` table

#### 5. Follow-Ups Not Sending

**Problem**: Automated follow-ups are not being sent.

**Solution**:
- Verify Vercel cron job is active (Vercel Dashboard → Project Settings → Cron Jobs)
- Check `CRON_SECRET` matches in `.env.local` and cron request headers
- Review `followup_emails` table for scheduled emails
- Check `followup_schedules` table for active sequences
- Review cron job logs in Vercel Dashboard → Functions → Logs

#### 6. Real-Time Updates Not Working

**Problem**: Dashboard doesn't update in real-time.

**Solution**:
- Verify Supabase Realtime is enabled for tables (Supabase Dashboard → Database → Replication)
- Check browser console for WebSocket connection errors
- Ensure RLS policies allow read access for current user
- Review network tab for Supabase Realtime subscription requests

---

## 8. Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style

- Use functional components with hooks
- Add `'use client'` directive for client-side components
- Follow existing naming conventions
- Add comments for complex logic
- Handle errors with try-catch blocks
- Include loading states for async operations
- Use toast notifications for user feedback

---

## 9. License

This project is proprietary software. All rights reserved.

---

## Support & Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Groq Docs**: [console.groq.com/docs](https://console.groq.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **GSAP**: [greensock.com/docs](https://greensock.com/docs)
- **Framer Motion**: [framer.com/motion](https://framer.com/motion)

---

**Built with ❤️ by LeadNova Team**