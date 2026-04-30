# UI/UX Design Specification
# LeadNova AI CRM

---

## Design System

### Color Palette

#### Dark Mode
- Background: #0a0a0f
- Card Background: #12121a
- Border: #1e1e2e
- Glass: rgba(255, 255, 255, 0.05) with backdrop-blur
- Glass Border: rgba(255, 255, 255, 0.1)

#### Light Mode
- Background: #f8fafc
- Card Background: #ffffff
- Border: #e2e8f0
- Glass: rgba(243, 244, 246, 0.8) with backdrop-blur
- Glass Border: #e5e7eb

#### Brand Colors
- Primary: #3b82f6 (blue-500)
- Primary Hover: #2563eb (blue-600)
- Primary Light: #60a5fa (blue-400)
- Primary BG: rgba(59, 130, 246, 0.1)

#### Status Colors
- Success: #22c55e (green)
- Warning: #f59e0b (amber)
- Error: #ef4444 (red)
- Info: #06b6d4 (cyan)
- Purple: #8b5cf6

#### Text Colors (Dark Mode)
- Primary: #ffffff
- Secondary: #94a3b8
- Muted: #64748b

#### Text Colors (Light Mode)
- Primary: #0f172a
- Secondary: #64748b
- Muted: #94a3b8

### Typography
- Font Family: Inter (Google Fonts)
- Heading Sizes: text-5xl, text-3xl, text-xl
- Body: text-sm, text-base
- Font Weights: 400, 500, 600, 700, 800, 900

### Border Radius
- Small: 8px (rounded-lg)
- Medium: 12px (rounded-xl)
- Large: 16px (rounded-2xl)

### Shadows
- Card: 0 8px 32px rgba(0, 0, 0, 0.3)
- Button: 0 4px 15px rgba(59, 130, 246, 0.25)
- Button Hover: 0 8px 25px rgba(59, 130, 246, 0.4)

### Animations
- Page transitions: fadeInUp (framer-motion)
- Card hover: scale(1.02) + shadow increase
- Staggered list: each item delays 0.1s
- Loading: spinner animation
- Modal: scale from 0.9 to 1

---

## Page Layouts

### Page 1: Landing Page (/)
┌─────────────────────────────────────────────┐
│ [LN] LeadNova.ai [Sign in →] │
├─────────────────────────────────────────────┤
│ │
│ 🚀 AI-Powered Lead Generation CRM │
│ │
│ Generate & Convert │
│ Leads Automatically (gradient text) │
│ │
│ Subtitle text explaining the product │
│ │
│ [🔵 Get Started with Google] │
│ │
├─────────────────────────────────────────────┤
│ │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│ │AI Lead │ │Smart │ │Cold │ │Dash │ │
│ │Gen │ │Scoring │ │Email │ │board │ │
│ │ │ │ │ │ │ │ │ │
│ └────────┘ └────────┘ └────────┘ └──────┘ │
│ │
├─────────────────────────────────────────────┤
│ © 2025 LeadNova AI CRM │
└─────────────────────────────────────────────┘

text


### Page 2: Dashboard (/dashboard)
┌──────────┬──────────────────────────────────┐
│ │ Dashboard │
│ [LN] ├──────────────────────────────────┤
│ │ │
│ Dashboard│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──┐│
│ Leads │ │Total │ │Select│ │Email │ │% ││
│ Outreach │ │Leads │ │ed │ │Sent │ │ ││
│ Analytics│ └──────┘ └──────┘ └──────┘ └──┘│
│ Settings │ │
│ │ ┌──────────────┐ ┌────────────┐ │
│ │ │ Bar Chart │ │ Pie Chart │ │
│ [☀/🌙] │ │ Rating Dist │ │ Biz Types │ │
│ │ └──────────────┘ └────────────┘ │
│ [User] │ │
│ [Logout] │ ┌────────────────────────────┐ │
│ │ │ Recent Leads Table │ │
│ │ └────────────────────────────┘ │
└──────────┴──────────────────────────────────┘

text


### Page 3: Leads (/dashboard/leads)
┌──────────┬──────────────────────────────────┐
│ │ Leads [CSV] [+ Generate] │
│ Sidebar ├──────────────────────────────────┤
│ │ [🔍 Search] [Rating▼] [Status▼] │
│ ├──────────────────────────────────┤
│ │ [3 selected] [✓Mark] [📧] [🗑] │
│ ├──────────────────────────────────┤
│ │ ☐ Business Owner Email ⭐ St│
│ │ ☑ TastyBite Rahul r@.. ⭐⭐⭐⭐⭐│
│ │ ☑ FitGym Priya p@.. ⭐⭐⭐⭐ │
│ │ ☐ ShopEasy Amit a@.. ⭐⭐⭐ │
│ │ ... │
│ ├──────────────────────────────────┤
│ │ Showing 25 of 150 leads │
└──────────┴──────────────────────────────────┘

text


### Page 4: Generate Modal
┌────────────────────────────┐
│ 🚀 Generate Leads with AI │
│ [X] │
├────────────────────────────┤
│ │
│ Business Type │
│ [Restaurant ▼] │
│ │
│ City │
│ [Mumbai ▼] │
│ │
│ Number of Leads │
│ [10 ] │
│ │
│ [🔵 Generate 10 Leads] │
│ │
└────────────────────────────┘

text


### Page 5: Email Modal
┌──────────────────────────────────┐
│ 📧 Send Cold Email (5 leads) │
│ [X] │
├──────────────────────────────────┤
│ │
│ Subject │
│ [Grow your business with us 🚀]│
│ │
│ Email Body │
│ ┌──────────────────────────┐ │
│ │ Hi {{owner_name}}, │ │
│ │ │ │
│ │ I came across │ │
│ │ {{business_name}} and... │ │
│ │ │ │
│ │ We specialize in... │ │
│ │ │ │
│ │ Best regards, │ │
│ │ Agency Name │ │
│ └──────────────────────────┘ │
│ │
│ ⚡ From: leadnovacrm@gmail.com │
│ │
│ [🔵 Send 5 Email(s)] │
│ │
└──────────────────────────────────┘

text


### Page 6: Outreach (/dashboard/outreach)
┌──────────┬──────────────────────────────────┐
│ │ 📧 Outreach History │
│ Sidebar ├──────────────────────────────────┤
│ │ Business To Subject St │
│ │ TastyBite r@.. Grow.. ✅Sent│
│ │ FitGym p@.. Grow.. ✅Sent│
│ │ ShopBad x@.. Grow.. ❌Fail│
│ │ ... │
└──────────┴──────────────────────────────────┘

text


### Page 7: Analytics (/dashboard/analytics)
┌──────────┬──────────────────────────────────┐
│ │ 📊 Analytics │
│ Sidebar ├──────────────────────────────────┤
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│ │ │150 │ │89 │ │3.8 │ │12 │ │
│ │ │Lead│ │Mail│ │Avg │ │Conv│ │
│ │ └────┘ └────┘ └────┘ └────┘ │
│ │ │
│ │ ┌─────────────┐ ┌───────────┐ │
│ │ │ Line Chart │ │ Bar Chart │ │
│ │ │ Daily Trend │ │ Ratings │ │
│ │ └─────────────┘ └───────────┘ │
│ │ │
│ │ ┌─────────────┐ ┌───────────┐ │
│ │ │ Pie Chart │ │ Bar Chart │ │
│ │ │ Status │ │ Cities │ │
│ │ └─────────────┘ └───────────┘ │
└──────────┴──────────────────────────────────┘

text


### Page 8: Settings (/dashboard/settings)
┌──────────┬──────────────────────────────────┐
│ │ ⚙️ Settings │
│ Sidebar ├──────────────────────────────────┤
│ │ ┌──────────────────────────┐ │
│ │ │ Agency Name │ │
│ │ │ [GrowthX Digital ] │ │
│ │ │ │ │
│ │ │ Service You Provide │ │
│ │ │ [Social Media, SEO... ] │ │
│ │ │ │ │
│ │ │ Phone Number │ │
│ │ │ [+91-XXXXXXXXXX ] │ │
│ │ │ │ │
│ │ │ Email Signature │ │
│ │ │ [Best Regards,... ] │ │
│ │ │ │ │
│ │ │ [🔵 Save Settings] │ │
│ │ └──────────────────────────┘ │
└──────────┴──────────────────────────────────┘








