"""
LeadNova Google Maps Scraper - Fixed to Scrape 10 Leads
========================================================
Changes:
- Collects all business URLs upfront (avoids click/back issues)
- Navigates directly to each business (faster, more reliable)
- Better scrolling to load more results
- Extracts from aria-label for business name
- Saves user's niche as category
"""

import json
import sys
import time
import random
import os
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service
from supabase import create_client, Client

# ============================================================
# CONFIGURATION
# ============================================================

SUPABASE_URL = os.getenv('SUPABASE_URL', os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://hkrsijknuwyoujtgssrv.supabase.co'))
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
USER_ID = os.getenv('SCRAPE_USER_ID')
SESSION_ID = os.getenv('SCRAPE_SESSION_ID')
PROGRESS_FILE = os.getenv('SCRAPE_PROGRESS_FILE')

MAX_RESULTS = 10  # Always scrape exactly 10 leads

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

def save_lead(supabase, lead):
    """Save lead to Supabase with duplicate check"""
    if not supabase:
        return False

    try:
        # Check for duplicate by business name
        existing = supabase.table('indian_leads').select('id').eq(
            'business_name', lead['business_name']
        ).limit(1).execute()

        if existing.data and len(existing.data) > 0:
            print(f"    ⚠️ Duplicate skipped: {lead['business_name']}", file=sys.stderr)
            return False

        result = supabase.table('indian_leads').insert(lead).execute()
        if result.data and len(result.data) > 0:
            return True
        return False
    except Exception as e:
        print(f"  ❌ Error saving {lead['business_name']}: {e}", file=sys.stderr)
        return False

def update_progress(status, progress, current_step, total_saved):
    """Update the progress file"""
    if not PROGRESS_FILE:
        return

    try:
        progress_data = {
            'status': status,
            'progress': progress,
            'current_step': current_step,
            'total_saved': total_saved
        }

        with open(PROGRESS_FILE, 'w') as f:
            json.dump(progress_data, f)
    except Exception as e:
        print(f"Progress update error: {e}", file=sys.stderr)

def extract_email_from_text(text):
    """Extract email from any text using regex"""
    if not text:
        return ''
    # Match standard email pattern
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    matches = re.findall(email_pattern, text)
    # Filter out common false positives
    valid_emails = [e for e in matches if not any(x in e.lower() for x in ['google', 'example', 'test'])]
    return valid_emails[0] if valid_emails else ''

# ============================================================
# GOOGLE MAPS SCRAPER
# ============================================================

def scrape_google_maps(query, max_results=MAX_RESULTS, supabase=None, niche='', city=''):
    """
    Google Maps scraper - navigates directly to each business URL
    """
    all_businesses = []
    total_saved_count = 0

    # Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
    chrome_options.add_experimental_option('useAutomationExtension', False)

    driver = None

    try:
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 15)

        search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        print(f"Searching: {search_url}", file=sys.stderr)

        # Navigate to search
        driver.get(search_url)
        time.sleep(random.uniform(4, 6))

        # Scroll multiple times to load more results
        print("Scrolling to load more results...", file=sys.stderr)
        for scroll_num in range(10):  # Scroll 10 times
            driver.execute_script('''
                const feed = document.querySelector('div[role="feed"]');
                if (feed) feed.scrollBy(0, 1500);
            ''')
            time.sleep(random.uniform(1.5, 2.5))

            # Check how many cards we have
            cards = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/maps/place/"]')
            print(f"  After scroll {scroll_num + 1}: Found {len(cards)} cards", file=sys.stderr)

            if len(cards) >= max_results * 2:
                print(f"  ✓ Loaded enough results ({len(cards)} cards)", file=sys.stderr)
                break

        # Get all business card URLs
        print("\nCollecting business URLs...", file=sys.stderr)
        business_urls = []
        seen_urls = set()

        # Primary selector - Google Maps business cards
        cards = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/maps/place/"]')
        print(f"Found {len(cards)} total cards", file=sys.stderr)

        for card in cards:
            try:
                href = card.get_attribute('href')
                aria_label = card.get_attribute('aria-label')

                if href and '/maps/place/' in href and href not in seen_urls:
                    # Extract business name from aria-label or href
                    if aria_label and len(aria_label) > 3:
                        business_name = aria_label.split(' · ')[0].strip()
                        if len(business_name) > 2 and business_name.lower() not in ['results', 'more', 'view', 'share']:
                            business_urls.append({
                                'url': href,
                                'name': business_name
                            })
                            seen_urls.add(href)
            except Exception as e:
                print(f"  Error extracting card info: {e}", file=sys.stderr)
                continue

        print(f"\nCollected {len(business_urls)} unique business URLs", file=sys.stderr)

        if len(business_urls) == 0:
            print("No business URLs found!", file=sys.stderr)
            return [], 0

        # Limit to max_results
        urls_to_process = business_urls[:max_results]
        print(f"Processing {len(urls_to_process)} businesses...\n", file=sys.stderr)
        update_progress('scraping', 15, f'Extracting {len(urls_to_process)} businesses...', 0)

        # Navigate to each business directly (no clicking, no going back)
        for i, business_info in enumerate(urls_to_process):
            try:
                print(f"[{i+1}/{len(urls_to_process)}] {business_info['name']}", file=sys.stderr)

                # Navigate directly to business page
                driver.get(business_info['url'])
                time.sleep(random.uniform(2, 3))

                # Wait for page to load
                try:
                    wait.until(EC.presence_of_element_located((By.TAG_NAME, 'h1')))
                except TimeoutException:
                    print(f"  ⚠️ Page didn't load, skipping", file=sys.stderr)
                    continue

                # Extract business data
                business_data = {
                    'name': business_info['name'],
                    'category': niche,  # Use user's niche
                    'phone': '',
                    'website': '',
                    'email': '',
                    'address': '',
                    'rating': 0,
                    'reviews_count': 0
                }

                # Get full page text for extraction
                try:
                    body = driver.find_element(By.TAG_NAME, 'body')
                    page_text = body.text
                except:
                    page_text = ''

                # Extract phone number
                phone_patterns = [
                    r'\+?\d[\d\s-]{7,}',
                    r'\d{3}[\s-]\d{3}[\s-]\d{4}',
                    r'\d{5}[\s-]\d{5}'
                ]
                for pattern in phone_patterns:
                    phone_match = re.search(pattern, page_text)
                    if phone_match:
                        phone = phone_match.group(0).strip()
                        # Validate it looks like a phone number
                        if len(re.sub(r'\D', '', phone)) >= 8:
                            business_data['phone'] = phone
                            break

                # Extract website
                try:
                    website_elem = driver.find_element(By.CSS_SELECTOR, 'a[data-item-id="authority"]')
                    website = website_elem.get_attribute('href')
                    if website and 'google.com/maps' not in website:
                        business_data['website'] = website
                except:
                    # Try any link that looks like a website
                    links = driver.find_elements(By.TAG_NAME, 'a')
                    for link in links:
                        try:
                            href = link.get_attribute('href')
                            if href and 'google.com' not in href.lower() and ('http' in href or 'www' in href):
                                if not href.startswith('mailto:') and not href.startswith('tel:'):
                                    business_data['website'] = href
                                    break
                        except:
                            continue

                # Extract email from page text
                email = extract_email_from_text(page_text)
                if email:
                    business_data['email'] = email
                    print(f"  📧 Email found: {email}", file=sys.stderr)

                # Extract address
                try:
                    address_elem = driver.find_element(By.CSS_SELECTOR, 'button[data-item-id="address"] .Io6YTe')
                    business_data['address'] = address_elem.text.strip()
                except:
                    # Try to find address in page text
                    address_patterns = [
                        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z][a-z]+)?\s+\d{5,6})'
                    ]
                    for pattern in address_patterns:
                        addr_match = re.search(pattern, page_text)
                        if addr_match:
                            business_data['address'] = addr_match.group(0).strip()
                            break

                # Extract rating and reviews
                try:
                    # Try to find rating element
                    rating_elem = driver.find_element(By.CSS_SELECTOR, 'span.fontDisplayMedium')
                    rating_text = rating_elem.text.strip()
                    rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                    if rating_match:
                        business_data['rating'] = float(rating_match.group(1))
                except:
                    pass

                # Extract reviews count
                try:
                    reviews_elem = driver.find_element(By.CSS_SELECTOR, '[aria-label*="review"]')
                    aria_label = reviews_elem.get_attribute('aria-label')
                    reviews_match = re.search(r'\((\d+(?:,\d+)?)\s*reviews?\)', aria_label, re.IGNORECASE)
                    if reviews_match:
                        business_data['reviews_count'] = int(reviews_match.group(1).replace(',', ''))
                except:
                    # Try from page text
                    reviews_text_match = re.search(r'\((\d+(?:,\d+)?)\)', page_text)
                    if reviews_text_match:
                        business_data['reviews_count'] = int(reviews_text_match.group(1).replace(',', ''))

                # If no rating found, try aria-label
                if business_data['rating'] == 0:
                    try:
                        rating_container = driver.find_element(By.CSS_SELECTOR, '[aria-label*="stars"]')
                        aria_label = rating_container.get_attribute('aria-label')
                        rating_match = re.search(r'(\d+\.?\d*)', aria_label)
                        if rating_match:
                            business_data['rating'] = float(rating_match.group(1))
                    except:
                        pass

                all_businesses.append(business_data)

                print(f"  ✓ Name: {business_data['name']}", file=sys.stderr)
                print(f"    📞 {business_data['phone'] or 'N/A'}", file=sys.stderr)
                print(f"    📧 {business_data['email'] or 'N/A'}", file=sys.stderr)
                print(f"    🌐 {business_data['website'] or 'N/A'}", file=sys.stderr)
                print(f"    ⭐ {business_data['rating'] or 'N/A'} ({business_data['reviews_count']} reviews)", file=sys.stderr)

                # Save to Supabase
                if supabase and USER_ID and SESSION_ID:
                    db_lead = {
                        'user_id': USER_ID,
                        'session_id': SESSION_ID,
                        'niche': niche,
                        'search_location': city,
                        'search_city': city,
                        'search_state': '',
                        'business_name': business_data['name'],
                        'business_category': niche,
                        'phone': business_data['phone'],
                        'email': business_data['email'],
                        'website': business_data['website'],
                        'full_address': business_data['address'],
                        'city': city,
                        'state': '',
                        'country': 'India',
                        'owner_name': '',
                        'rating': business_data['rating'] if business_data['rating'] > 0 else None,
                        'reviews_count': business_data['reviews_count'],
                        'google_maps_url': business_info['url'],
                        'place_id': '',
                        'outreach_status': 'not_contacted',
                        'source': 'google_maps_scraper',
                        'scrape_status': 'completed'
                    }
                    success = save_lead(supabase, db_lead)
                    if success:
                        print(f"    💾 Saved to database", file=sys.stderr)
                        total_saved_count += 1

                # Update progress
                progress_pct = int(((i + 1) / len(urls_to_process)) * 100)
                update_progress(
                    'scraping',
                    progress_pct,
                    f'Scraped {i+1}/{len(urls_to_process)} businesses...',
                    total_saved_count
                )

            except Exception as e:
                print(f"  ❌ Error: {e}", file=sys.stderr)
                continue

    except Exception as e:
        print(f"\nScraping error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
    finally:
        if driver:
            driver.quit()

    # Deduplicate
    seen_names = set()
    unique_businesses = []
    for b in all_businesses:
        name_key = b['name'].lower().strip()
        if name_key not in seen_names and len(name_key) > 2:
            seen_names.add(name_key)
            unique_businesses.append(b)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"Total scraped: {len(unique_businesses)}", file=sys.stderr)
    print(f"Saved to DB: {total_saved_count}", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)

    return unique_businesses[:max_results], total_saved_count

# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    """Main entry point"""
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python simple_google_maps_scraper.py '<niche>' '<city>'"}))
        sys.exit(1)

    niche = sys.argv[1]
    city = sys.argv[2]

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"LeadNova Google Maps Scraper", file=sys.stderr)
    print(f"Niche: {niche} | City: {city}", file=sys.stderr)
    print(f"Target: {MAX_RESULTS} leads", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    # Initialize Supabase
    supabase = init_supabase()
    print(f"Supabase connected: {supabase is not None}", file=sys.stderr)
    print(f"User ID: {USER_ID}", file=sys.stderr)
    print(f"Session ID: {SESSION_ID}", file=sys.stderr)

    # Update progress
    update_progress('scraping', 10, 'Starting scraper...', 0)

    # Scrape
    query = f"{niche} in {city}"
    businesses, saved_count = scrape_google_maps(query, MAX_RESULTS, supabase, niche, city)

    if not businesses or len(businesses) == 0:
        result = {"success": False, "error": "No businesses found", "total_leads": 0}
        print(json.dumps(result))
        sys.exit(0)

    # Final progress update
    update_progress(
        'completed',
        100,
        f'✅ Done! {saved_count} leads saved',
        saved_count
    )

    # Return result
    result = {
        "success": True,
        "total_leads": saved_count,
        "scraped": len(businesses),
        "saved": saved_count
    }

    print(json.dumps(result))

if __name__ == "__main__":
    main()
