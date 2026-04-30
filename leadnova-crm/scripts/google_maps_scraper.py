"""
LeadNova Google Maps Deep Scraper - Production Ready
=====================================================
Features:
- Clicks each business card to open detail panel
- Extracts full contact details (phone, website, address, email)
- Uses stable data-item-id selectors (rarely changed by Google)
- Playwright Stealth to bypass bot detection
- Human-like delays (1-3 seconds between clicks)
- Supabase integration with upsert (prevents duplicates)
- Real-time progress tracking
"""

import json
import sys
import time
import random
import asyncio
import re
import os
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from playwright_stealth import stealth
from supabase import create_client, Client
import google.generativeai as genai

# ============================================================
# CONFIGURATION
# ============================================================

SUPABASE_URL = os.getenv('SUPABASE_URL', os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://hkrsijknuwyoujtgssrv.supabase.co'))
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
USER_ID = os.getenv('SCRAPE_USER_ID')
SESSION_ID = os.getenv('SCRAPE_SESSION_ID')
PROGRESS_FILE = os.getenv('SCRAPE_PROGRESS_FILE')

MAX_RESULTS_PER_SEARCH = 120  # Google Maps limit

# ============================================================
# SUPABASE INTEGRATION
# ============================================================

def init_supabase():
    """Initialize Supabase client"""
    if not SUPABASE_KEY:
        print("Warning: SUPABASE_SERVICE_ROLE_KEY not set.", file=sys.stderr)
        return None
    
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase initialization error: {e}", file=sys.stderr)
        return None

def upsert_lead(supabase, lead):
    """Upsert lead to Supabase with duplicate prevention"""
    if not supabase:
        return False
    
    try:
        # Check if exists by business_name and address
        existing = supabase.table('indian_leads').select('id').eq(
            'business_name', lead['business_name']
        ).eq('full_address', lead.get('full_address', '')).limit(1).execute()
        
        if existing.data:
            # Update existing
            result = supabase.table('indian_leads').update(lead).eq('id', existing.data[0]['id']).execute()
        else:
            # Insert new
            result = supabase.table('indian_leads').insert(lead).execute()
        
        if result.data is None or len(result.data) == 0:
            return False
            
        return True
    except Exception as e:
        print(f"  ❌ Upsert error for {lead['business_name']}: {e}", file=sys.stderr)
        return False

def update_progress(status, progress, current_step, leads, total_saved):
    """Update the progress file for real-time UI updates"""
    if not PROGRESS_FILE:
        return
    
    try:
        progress_data = {
            'status': status,
            'progress': progress,
            'current_step': current_step,
            'leads': leads[-20:],  # Keep only last 20 for performance
            'total_saved': total_saved,
            'total_leads': len(leads)
        }
        
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(progress_data, f)
    except Exception as e:
        print(f"Progress update error: {e}", file=sys.stderr)

# ============================================================
# GOOGLE MAPS DEEP SCRAPER
# ============================================================

async def deep_scrape_google_maps(query, max_results=MAX_RESULTS_PER_SEARCH, supabase=None, niche='', city=''):
    """
    Deep scrape Google Maps by clicking each business card
    Returns list of businesses with full contact details
    """
    all_businesses = []
    total_saved_count = 0
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-size=1920,1080'
            ]
        )
        
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        )
        
        page = await context.new_page()
        
        # Apply stealth
        try:
            await stealth(page)
        except:
            pass
        
        try:
            search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
            print(f"Navigating to: {search_url}", file=sys.stderr)
            
            await page.goto(search_url, wait_until='domcontentloaded', timeout=60000)
            await page.wait_for_timeout(random.uniform(3000, 5000))
            
            # Step 1: Wait for and scroll the feed
            try:
                await page.wait_for_selector('div[role="feed"]', timeout=10000)
                
                # Scroll to load more results
                for scroll in range(20):
                    await page.evaluate('''
                        () => {
                            const feed = document.querySelector('div[role="feed"]');
                            if (feed) feed.scrollTop += 1200;
                        }
                    ''')
                    
                    await page.wait_for_timeout(random.uniform(1500, 2500))
                    
            except PlaywrightTimeout:
                print("Feed element not found, trying alternative...", file=sys.stderr)
            
            # Step 2: Get all business cards
            cards = await page.query_selector_all('a.hfpxzc')
            if not cards or len(cards) == 0:
                # Fallback selector
                cards = await page.query_selector_all('div[role="article"] a')
            
            print(f"Found {len(cards) if cards else 0} business cards", file=sys.stderr)
            
            if not cards:
                cards = []
            
            # Step 3: Click each card and extract details
            total_cards = min(len(cards), max_results)
            
            # Step 2: Collect ALL card URLs upfront
            cards = await page.query_selector_all('a.hfpxzc')
            if not cards or len(cards) == 0:
                cards = await page.query_selector_all('div[role="article"] a')

            if not cards:
                cards = []

            # Extract URLs from all cards upfront
            card_urls = []
            for card in cards[:max_results]:
                try:
                    href = await card.get_attribute('href')
                    aria_label = await card.get_attribute('aria-label')
                    if href and aria_label and len(aria_label) > 3:
                        card_urls.append({'href': href, 'name': aria_label.split(' · ')[0].strip()})
                except:
                    pass

            print(f"Found {len(card_urls)} business cards with URLs", file=sys.stderr)

            total_cards = len(card_urls)

            # Step 3: Navigate to each card URL directly (faster than clicking/going back)
            for i, card_info in enumerate(card_urls):
                try:
                    print(f"\nProcessing {i+1}/{total_cards}...", file=sys.stderr)

                    business_name = card_info['name']

                    # Navigate directly to the business URL
                    await page.goto(card_info['href'], wait_until='domcontentloaded', timeout=30000)
                    await page.wait_for_timeout(1500)
                    
                    # Wait for panel to load
                    try:
                        await page.wait_for_selector('.DUwDvf', timeout=5000)
                    except PlaywrightTimeout:
                        # Try alternative selector
                        try:
                            await page.wait_for_selector('button[data-item-id="address"]', timeout=3000)
                        except PlaywrightTimeout:
                            print(f"  ⚠️ Panel didn't load for {business_name}, skipping", file=sys.stderr)
                            continue
                    
                    await page.wait_for_timeout(1000)
                    
                    # Extract full details from panel
                    business_data = {
                        'name': business_name,
                        'category': '',
                        'phone': '',
                        'website': '',
                        'address': '',
                        'rating': None,
                        'reviews_count': 0
                    }
                    
                    # Extract category
                    try:
                        cat_elem = await page.query_selector('button.Dq2yT')
                        if not cat_elem:
                            cat_elem = await page.query_selector('.fontBodyMedium')
                        if cat_elem:
                            business_data['category'] = (await cat_elem.inner_text()).strip()
                    except:
                        pass
                    
                    # Extract address
                    try:
                        address_btn = await page.query_selector('button[data-item-id="address"]')
                        if address_btn:
                            address_text = await address_btn.query_selector('.Io6YTe')
                            if address_text:
                                business_data['address'] = (await address_text.inner_text()).strip()
                    except:
                        pass
                    
                    # Extract phone
                    try:
                        phone_btn = await page.query_selector('button[data-item-id^="phone:tel:"]')
                        if phone_btn:
                            phone_text = await phone_btn.query_selector('.Io6YTe')
                            if phone_text:
                                business_data['phone'] = (await phone_text.inner_text()).strip()
                    except:
                        pass
                    
                    # Extract website
                    try:
                        website_link = await page.query_selector('a[data-item-id="authority"]')
                        if website_link:
                            business_data['website'] = await website_link.get_attribute('href')
                    except:
                        pass
                    
                    # Extract rating and reviews
                    try:
                        rating_elem = await page.query_selector('[aria-label*="stars"]')
                        if rating_elem:
                            aria_label = await rating_elem.get_attribute('aria-label')
                            rating_match = re.search(r'(\d+\.?\d*)\s*(star|stars)', aria_label, re.IGNORECASE)
                            if rating_match:
                                business_data['rating'] = float(rating_match.group(1))
                            
                            reviews_match = re.search(r'\((\d+(?:,\d+)?)\)', aria_label)
                            if reviews_match:
                                business_data['reviews_count'] = int(reviews_match.group(1).replace(',', ''))
                    except:
                        pass
                    
                    all_businesses.append(business_data)
                    
                    print(f"  ✓ {business_name}", file=sys.stderr)
                    print(f"    📞 {business_data['phone'] or 'N/A'}", file=sys.stderr)
                    print(f"    🌐 {business_data['website'] or 'N/A'}", file=sys.stderr)
                    print(f"    📍 {business_data['address'] or 'N/A'}", file=sys.stderr)
                    if business_data['rating']:
                        print(f"    ⭐ {business_data['rating']} ({business_data['reviews_count']} reviews)", file=sys.stderr)

                    # Save to Supabase immediately
                    if supabase and USER_ID and SESSION_ID:
                        db_lead = {
                            'user_id': USER_ID,
                            'session_id': SESSION_ID,
                            'niche': niche,
                            'search_location': city,
                            'search_city': city,
                            'search_state': '',
                            'business_name': business_name,
                            'business_category': business_data.get('category', niche),
                            'phone': business_data.get('phone', ''),
                            'email': '',
                            'website': business_data.get('website', ''),
                            'full_address': business_data.get('address', ''),
                            'city': city,
                            'state': '',
                            'country': 'India',
                            'owner_name': '',
                            'rating': business_data.get('rating'),
                            'reviews_count': business_data.get('reviews_count', 0),
                            'google_maps_url': f"https://www.google.com/maps/search/{business_name}+{city}",
                            'place_id': '',
                            'outreach_status': 'not_contacted',
                            'source': 'google_maps_deep_scraper',
                            'scrape_status': 'completed'
                        }
                        success = upsert_lead(supabase, db_lead)
                        if success:
                            print(f"    💾 Saved to database", file=sys.stderr)
                            total_saved_count += 1

                    # Reduced delay: 0.5-1.5 seconds (faster but still human-like)
                    await page.wait_for_timeout(random.uniform(500, 1500))

                    # Navigate back to search results (instead of go_back)
                    await page.goto(search_url, wait_until='domcontentloaded', timeout=30000)
                    await page.wait_for_timeout(random.uniform(500, 1000))
                    
                    # Wait for feed to load
                    try:
                        await page.wait_for_selector('div[role="feed"]', timeout=5000)
                    except:
                        pass
                    
                    # Update progress
                    if (i + 1) % 5 == 0:
                        progress_pct = int((i + 1) / total_cards * 50)  # 0-50% for scraping
                        update_progress(
                            'scraping',
                            progress_pct,
                            f'Scraped {i+1}/{total_cards} businesses...',
                            all_businesses[-5:],
                            len(all_businesses)
                        )
                    
                except Exception as e:
                    print(f"  ❌ Error processing card {i}: {e}", file=sys.stderr)
                    # Try to go back
                    try:
                        await page.go_back()
                        await page.wait_for_timeout(1000)
                    except:
                        pass
                    continue
        
        except Exception as e:
            print(f"Scraping error: {e}", file=sys.stderr)
        finally:
            await browser.close()
    
    # Deduplicate
    seen = set()
    unique_businesses = []
    for b in all_businesses:
        key = f"{b['name']}_{b['address']}".lower().strip()
        if key not in seen:
            seen.add(key)
            unique_businesses.append(b)
    
    print(f"\nTotal unique businesses: {len(unique_businesses)}", file=sys.stderr)
    return unique_businesses[:max_results]

# ============================================================
# MAIN EXECUTION
# ============================================================

async def main():
    """Main entry point"""
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python google_maps_scraper.py '<niche>' '<city>'"}))
        sys.exit(1)
    
    niche = sys.argv[1]
    city = sys.argv[2]
    
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"LeadNova Google Maps Deep Scraper", file=sys.stderr)
    print(f"Niche: {niche} | City: {city}", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)
    
    # Initialize services
    supabase = init_supabase()
    
    # Scrape
    query = f"{niche} in {city}"
    businesses = await deep_scrape_google_maps(query, max_results, supabase, niche, city)
    
    if not businesses or len(businesses) == 0:
        print(json.dumps({"success": False, "error": "No businesses found", "total_leads": 0}))
        sys.exit(0)
    
    # Enrich and save to DB
    success_count = 0
    fail_count = 0
    
    print(f"\nSaving {len(businesses)} businesses to database...", file=sys.stderr)
    print(f"User ID: {USER_ID}, Session ID: {SESSION_ID}", file=sys.stderr)
    print(f"Supabase connected: {supabase is not None}", file=sys.stderr)
    
    update_progress('saving', 50, f'Found {len(businesses)} businesses, saving to database...', [], 0)
    
    for i, biz in enumerate(businesses):
        db_lead = {
            'user_id': USER_ID,
            'session_id': SESSION_ID,
            'niche': niche,
            'search_location': city,
            'search_city': city,
            'search_state': '',
            'business_name': biz['name'],
            'business_category': biz.get('category', niche),
            'phone': biz.get('phone', ''),
            'email': '',  # Google Maps doesn't show email
            'website': biz.get('website', ''),
            'full_address': biz.get('address', ''),
            'city': city,
            'state': '',
            'country': 'India',
            'owner_name': '',
            'rating': biz.get('rating'),
            'reviews_count': biz.get('reviews_count', 0),
            'google_maps_url': f"https://www.google.com/maps/search/{biz['name']}+{city}",
            'place_id': '',
            'outreach_status': 'not_contacted',
            'source': 'google_maps_deep_scraper',
            'scrape_status': 'completed'
        }
        
        # Save to Supabase
        if supabase:
            success = upsert_lead(supabase, db_lead)
            if success:
                success_count += 1
            else:
                fail_count += 1
        
        # Update progress
        if (i + 1) % 5 == 0:
            progress_pct = 50 + int((i + 1) / len(businesses) * 50)  # 50-100%
            update_progress(
                'saving',
                progress_pct,
                f'Saved {success_count}/{len(businesses)} leads...',
                [{
                    'business_name': b['name'],
                    'business_category': b.get('category', ''),
                    'city': city,
                    'rating': b.get('rating'),
                    'reviews_count': b.get('reviews_count', 0),
                    'phone': b.get('phone', ''),
                    'website': b.get('website', '')
                } for b in businesses[max(0, i-4):i+1]],
                success_count
            )
            print(f"  ✓ Saved {i+1}/{len(businesses)}: {biz['name']}", file=sys.stderr)
    
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"✅ Scraping Complete!", file=sys.stderr)
    print(f"Total businesses scraped: {len(businesses)}", file=sys.stderr)
    print(f"Successfully saved to DB: {success_count}", file=sys.stderr)
    print(f"Failed to save: {fail_count}", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)
    
    # Final progress update
    final_leads = [{
        'business_name': b['name'],
        'business_category': b.get('category', ''),
        'city': city,
        'rating': b.get('rating'),
        'reviews_count': b.get('reviews_count', 0),
        'phone': b.get('phone', ''),
        'website': b.get('website', '')
    } for b in businesses[-10:]]
    
    update_progress(
        'completed',
        100,
        f'✅ Done! {success_count} leads saved to database',
        final_leads,
        success_count
    )
    
    # Return result for API to parse
    result = {
        "success": True,
        "total_leads": success_count,
        "scraped": len(businesses),
        "saved": success_count,
        "failed": fail_count
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())
