# Product Requirement Document (PRD)
# LeadNova AI CRM

## Project Name
LeadNova AI CRM

## Version
1.0.0

## Last Updated
2025

---

## 1. Problem Statement

Agency owners (digital marketing, SEO, social media, web development agencies) 
struggle to find potential business clients. Currently they:

- Manually search Google, JustDial, IndiaMART for businesses
- Spend hours collecting business contact information
- Write individual cold emails by hand
- Have no system to track which leads are high quality
- Lose potential clients due to slow and unorganized outreach

This wastes 15-20 hours per week on lead generation alone.

## 2. Solution

LeadNova AI CRM is an AI-powered lead generation and cold outreach platform 
that allows agency owners to:

1. Select a business type (e.g., Restaurant, Gym, Salon)
2. Select a city (e.g., Mumbai, Delhi, Bangalore)
3. AI generates realistic business leads with contact details
4. AI assigns a 1-5 star quality rating to each lead
5. Agency owner selects the best leads
6. Agency owner sends personalized cold emails in one click
7. System tracks all emails sent and lead status

## 3. Target Users

- Digital marketing agency owners
- Freelance marketers
- SEO/SEM agency owners
- Social media marketing agencies
- Web development agencies
- Small business consultants
- Any service provider looking for B2B clients

## 4. Core User Story

"As an agency owner, I want to generate a list of potential business 
clients in a specific city and industry, score them by quality, and 
send personalized cold emails — all from one dashboard."

## 5. User Flow
Landing Page
↓
Sign in with Google (one-click)
↓
Dashboard (overview stats + charts)
↓
Settings (set agency name + service description)
↓
Leads Page → Click "Generate Leads"
↓
Select business type + city + count
↓
AI generates leads with ratings
↓
Agency owner filters and selects best leads
↓
Click "Send Cold Email"
↓
Customize email template
↓
Emails sent automatically via LeadNova email
↓
Track in Outreach page
↓
Export leads as CSV


## 6. Success Metrics

- Agency owner can generate 50 leads in under 2 minutes
- Cold emails are personalized with business name and owner name
- Dashboard shows real-time analytics
- System handles 1000+ leads per user
- Email delivery success rate above 90%

## 7. Constraints

- Free tier OpenAI API (gpt-3.5-turbo) for lead generation
- Gmail SMTP for email sending (500 emails/day limit)
- Supabase free tier (500MB database, 50K auth users)
- Vercel free tier for deployment

## 8. Out of Scope (v1)

- Real-time business data from Google Maps API
- WhatsApp messaging integration
- Payment processing
- Team/multi-user collaboration
- Email open tracking
- CRM pipeline management



