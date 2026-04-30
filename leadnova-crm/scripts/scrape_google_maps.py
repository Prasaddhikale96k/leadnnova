import requests
from bs4 import BeautifulSoup
import json
import sys
import time

def scrape_google_maps(query, max_results=20):
    """Scrape Google Maps using simple HTTP requests"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    # Use Google Maps search URL
    url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract business data from Google Maps page
        # Google embeds data in script tags
        results = []
        
        # Try to find business listings
        # Method 1: Look for place cards
        place_cards = soup.find_all('div', {'class': lambda x: x and 'fontHeadlineSmall' in x})
        
        for card in place_cards[:max_results]:
            try:
                name_elem = card.find('h1') or card.find('h2') or card.find(class_='fontHeadlineSmall')
                name = name_elem.get_text().strip() if name_elem else None
                
                if name and len(name) > 2:
                    # Try to extract rating
                    rating = None
                    rating_elem = card.find(class_='fontDisplaySmall')
                    if rating_elem:
                        try:
                            rating = float(rating_elem.get_text().strip())
                        except:
                            pass
                    
                    # Extract category/address
                    category = ''
                    category_elems = card.find_all(class_='fontBodyMedium')
                    if category_elems:
                        category = category_elems[0].get_text().strip()
                    
                    results.append({
                        'name': name,
                        'rating': rating,
                        'category': category,
                        'query': query
                    })
            except Exception as e:
                continue
        
        # If no results from parsing, return a message
        if not results:
            results = [{
                'message': 'Google Maps requires browser automation. Consider using Apify API or Google Places API instead.',
                'query': query
            }]
        
        return results
        
    except requests.RequestException as e:
        return [{'error': f'Request failed: {str(e)}'}]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scrape_google_maps.py '<query>' [max_results]")
        sys.exit(1)
    
    query = sys.argv[1]
    max_results = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    
    print(f"Scraping: {query}", file=sys.stderr)
    
    results = scrape_google_maps(query, max_results)
    print(json.dumps(results, indent=2, ensure_ascii=False))
