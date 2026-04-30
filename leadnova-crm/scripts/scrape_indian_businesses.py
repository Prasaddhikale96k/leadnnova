import requests
from bs4 import BeautifulSoup
import json
import sys
import time
import random

def scrape_justdial(query, city, max_results=30):
    """Scrape JustDial for Indian businesses"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    search_query = query.replace(' ', '+')
    url = f"https://www.justdial.com/{city}/{search_query}"
    
    results = []
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # JustDial business listings
        listings = soup.find_all('section', {'class': 'col-sm-25'})
        
        for listing in listings[:max_results]:
            try:
                # Business name
                name_elem = listing.find('a', {'class': 'lng_cont_name'})
                name = name_elem.get_text(strip=True) if name_elem else ''
                
                # Phone
                phone_elem = listing.find('span', {'class': 'mobilesv'})
                phone = phone_elem.get('data-mobile') if phone_elem else ''
                
                # Address
                address_elem = listing.find('address')
                address = address_elem.get_text(strip=True) if address_elem else ''
                
                # Rating
                rating_elem = listing.find('span', {'class': 'start'})
                rating = None
                if rating_elem:
                    try:
                        rating = float(rating_elem.get_text().strip())
                    except:
                        pass
                
                if name:
                    results.append({
                        'name': name,
                        'phone': phone,
                        'address': address,
                        'rating': rating,
                        'source': 'justdial',
                        'city': city
                    })
                
                time.sleep(random.uniform(0.5, 1.5))  # Rate limit
                
            except Exception as e:
                continue
        
    except Exception as e:
        print(f"JustDial error: {str(e)}", file=sys.stderr)
    
    return results

def scrape_indiamart(query, max_results=30):
    """Scrape IndiaMART for businesses"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
    
    search_query = query.replace(' ', '+')
    url = f"https://dir.indiamart.com/search.mp?ss={search_query}"
    
    results = []
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # IndiaMART supplier listings
        suppliers = soup.find_all('div', {'class': 'clgmrp'})
        
        for supplier in suppliers[:max_results]:
            try:
                # Company name
                name_elem = supplier.find('a', {'class': 'ctgryNm'})
                name = name_elem.get_text(strip=True) if name_elem else ''
                
                # Contact info
                contact_elem = supplier.find('div', {'class': 'contact'})
                contact = contact_elem.get_text(strip=True) if contact_elem else ''
                
                # Location
                loc_elem = supplier.find('div', {'class': 'Addrs'})
                location = loc_elem.get_text(strip=True) if loc_elem else ''
                
                if name:
                    results.append({
                        'name': name,
                        'contact': contact,
                        'location': location,
                        'source': 'indiamart'
                    })
                
                time.sleep(random.uniform(0.5, 1.0))
                
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"IndiaMART error: {str(e)}", file=sys.stderr)
    
    return results

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scrape_indian_businesses.py '<query>' '<city>' [max_results]")
        sys.exit(1)
    
    query = sys.argv[1]
    city = sys.argv[2].lower().replace(' ', '-')
    max_results = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    
    print(f"Scraping Indian business directories for: {query} in {city}", file=sys.stderr)
    
    all_results = []
    
    # Try JustDial first
    print("Scraping JustDial...", file=sys.stderr)
    justdial_results = scrape_justdial(query, city, max_results)
    all_results.extend(justdial_results)
    print(f"JustDial: {len(justdial_results)} results", file=sys.stderr)
    
    # Try IndiaMART
    print("Scraping IndiaMART...", file=sys.stderr)
    indiamart_results = scrape_indiamart(query, max_results)
    all_results.extend(indiamart_results)
    print(f"IndiaMART: {len(indiamart_results)} results", file=sys.stderr)
    
    print(f"\nTotal: {len(all_results)} businesses found", file=sys.stderr)
    print(json.dumps(all_results, indent=2, ensure_ascii=False))
