# Feature Specification
# LeadNova AI CRM

---

## Feature 1: Authentication

### Description
Users sign in using their Google account. No manual registration 
or password setup required.

### Implementation
- Google OAuth via Supabase Authentication
- One-click sign in on landing page
- Auto-create user profile on first login
- JWT session management handled by Supabase
- Protected routes redirect to landing if not authenticated
- Logout functionality in sidebar

### User Experience
- User clicks "Sign in with Google" on landing page
- Google popup appears for account selection
- After authentication, redirected to /dashboard
- If already logged in, landing page redirects to /dashboard

---

## Feature 2: AI Lead Generation

### Description
Agency owner selects a business type and city. AI generates 
realistic business leads with contact details and quality ratings.

### Implementation
- OpenAI GPT-3.5-turbo generates structured JSON data
- Each lead contains: business_name, owner_name, email, phone, 
  address, monthly_revenue, years_in_business, online_presence, needs
- AI assigns 1-5 star rating based on client potential
- Generated leads are stored in Supabase database
- User can generate 1-50 leads at a time

### Business Types Available
Restaurant, Gym, Salon, Real Estate, E-commerce, Education, 
Healthcare, Hotel, Retail Store, SaaS, Construction, Fashion, 
Travel Agency, Photography, Auto Dealer

### Cities Available
Mumbai, Delhi, Bangalore, Hyderabad, Pune, Chennai, Kolkata, 
Ahmedabad, Jaipur, Lucknow, Chandigarh, Indore, Kochi, Surat, Nagpur

### Rating Logic
- 5 Stars: High revenue + weak online presence + clear needs
- 4 Stars: Good revenue + moderate presence + some needs
- 3 Stars: Average revenue + average presence
- 2 Stars: Low revenue or unclear needs
- 1 Star: Very small business or no clear opportunity

---

## Feature 3: Lead Management Dashboard

### Description
Main dashboard showing all generated leads in a table format 
with filtering, searching, and bulk action capabilities.

### Features
- Lead table with columns: Business, Owner, Email, City, Rating, Status
- Search by business name, owner name, or city
- Filter by rating (1-5 stars)
- Filter by status (new, selected, contacted, converted, rejected)
- Checkbox selection for bulk actions
- Select all / deselect all
- Pagination for large datasets

### Bulk Actions
- Mark as Selected (changes status to "selected")
- Send Cold Email (opens email composer modal)
- Delete (removes selected leads)

---

## Feature 4: Cold Email Outreach

### Description
Agency owner can send personalized cold emails to selected leads. 
Emails are sent from the LeadNova email account.

### Implementation
- Nodemailer with Gmail SMTP
- Email sent from: leadnovacrm@gmail.com
- Template variables: {{owner_name}}, {{business_name}}, 
  {{business_type}}, {{city}}
- Variables are replaced with actual lead data before sending
- Each email is logged in the database with status
- Bulk sending supported (send to multiple leads at once)

### Email Composer Modal
- Editable subject line (pre-filled with template)
- Editable email body (pre-filled with template)
- Template uses agency's service description from settings
- Shows count of recipients
- Send button with loading state

### Email Tracking
- Status: sent / failed
- Timestamp of when email was sent
- Viewable in Outreach page

---

## Feature 5: Analytics Dashboard

### Description
Visual dashboard showing key metrics and charts about leads 
and outreach performance.

### Metrics Displayed
- Total Leads count
- Selected Leads count
- Emails Sent count
- Conversion Rate percentage

### Charts
- Leads by Rating (bar chart)
- Leads by Business Type (pie chart)
- Lead Status Distribution (pie chart)
- Leads by City (horizontal bar chart)
- Daily Trends - leads and emails over last 7 days (line chart)

---

## Feature 6: CSV Export

### Description
Agency owner can export all leads to a CSV file for external 
use in Excel, Google Sheets, or other tools.

### CSV Columns
Business Name, Owner, Email, Phone, Business Type, City, 
Rating, Status, Monthly Revenue, Online Presence, Needs, Created At

---

## Feature 7: Settings Page

### Description
Agency owner configures their agency details which are used 
in email templates.

### Configurable Fields
- Agency Name
- Service Description (used in cold email body)
- Phone Number
- Email Signature

---

## Feature 8: Dark/Light Mode

### Description
Toggle between dark theme and light theme. Preference saved 
in localStorage.

### Dark Theme
- Background: #0a0a0f
- Cards: #12121a with glassmorphism
- Text: white
- Accent: blue (#3b82f6)

### Light Theme
- Background: #f8fafc
- Cards: white with subtle shadows
- Text: dark gray
- Accent: blue (#3b82f6)

---

## Feature 9: Responsive Design

### Description
Application works on desktop, tablet, and mobile devices.

### Mobile Adaptations
- Sidebar collapses to hamburger menu
- Tables scroll horizontally
- Modals are full-width on mobile
- Cards stack vertically

---

## Feature 10: Outreach History

### Description
Dedicated page showing all sent emails with status and details.

### Table Columns
- Business Name
- Recipient Email
- Subject
- Status (Sent/Failed)
- Sent At (timestamp) 