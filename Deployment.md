```markdown
# Deployment Guide
# LeadNova AI CRM

---

## Prerequisites

Before deployment, ensure you have:

1. ✅ GitHub account with project repository
2. ✅ Supabase project with database schema deployed
3. ✅ Google Cloud Console project with OAuth credentials
4. ✅ Gmail account (leadnovacrm@gmail.com) with App Password
5. ✅ OpenAI account with API key
6. ✅ Vercel account

---

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to supabase.com
2. Click "New Project"
3. Name: leadnova-crm
4. Database Password: (save this somewhere safe)
5. Region: closest to your users
6. Click "Create Project"

### 1.2 Run Database Schema
1. Go to SQL Editor (left sidebar)
2. Click "New Query"
3. Paste the complete SQL from Database.md
4. Click "Run"
5. Verify tables created in Table Editor

### 1.3 Configure Google Auth
1. Go to Authentication → Providers
2. Find Google → Enable
3. Enter Client ID from Google Cloud Console
4. Enter Client Secret from Google Cloud Console
5. Save

### 1.4 Set Redirect URLs
1. Go to Authentication → URL Configuration
2. Site URL: http://localhost:3000 (for development)
3. Redirect URLs: add http://localhost:3000/auth/callback
4. Save

### 1.5 Copy Keys
1. Go to Project Settings → API
2. Copy: Project URL
3. Copy: anon/public key
4. Copy: service_role key (keep secret!)

---

## Step 2: Google Cloud Setup

### 2.1 Create OAuth Credentials
1. Go to console.cloud.google.com
2. Create new project: "LeadNova CRM"
3. Go to APIs & Services → OAuth consent screen
4. User Type: External
5. App name: LeadNova AI CRM
6. Save

### 2.2 Create Client ID
1. Go to Credentials → Create Credentials → OAuth Client ID
2. Application type: Web application
3. Name: LeadNova Web
4. Authorized redirect URIs:
   - https://YOUR_PROJECT.supabase.co/auth/v1/callback
5. Create
6. Copy Client ID and Client Secret

---

## Step 3: Gmail App Password

1. Sign into leadnovacrm@gmail.com
2. Go to myaccount.google.com
3. Security → 2-Step Verification → Enable
4. Go back to Security
5. Search "App passwords"
6. Select app: Mail
7. Select device: Other → Name: "LeadNova CRM"
8. Generate
9. Copy the 16-character password
10. Save it for .env.local

---

## Step 4: Local Development

### 4.1 Clone and Install
```bash
git clone https://github.com/YOUR_USERNAME/leadnova-crm.git
cd leadnova-crm
npm install







