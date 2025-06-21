#!/usr/bin/env python3
"""
Fallback scraper that works without Playwright browser dependencies
Uses HTTP requests + BeautifulSoup for sites that don't require full browser automation
"""
import sys
import os
import asyncio
import requests
import re
import base64
import uuid
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Add backend to path
sys.path.append('/app/backend')

from pymongo import MongoClient

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.pulse_auto_market

class FallbackScraper:
    """Fallback scraper for when Playwright doesn't work in container"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
    
    def scrape_dealer_basic(self, dealer_url, max_vehicles=10):
        """Basic scraping without browser automation"""
        print(f"🔍 Scraping {dealer_url} with fallback method...")
        
        try:
            # Try to get the main page
            response = self.session.get(dealer_url, timeout=15)
            if response.status_code != 200:
                print(f"❌ Failed to access {dealer_url}: {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for inventory/vehicle links
            inventory_links = self.find_inventory_links(soup, dealer_url)
            
            vehicles = []
            for link in inventory_links[:3]:  # Try first 3 inventory pages
                try:
                    print(f"   📄 Checking {link}")
                    inv_response = self.session.get(link, timeout=10)
                    if inv_response.status_code == 200:
                        inv_soup = BeautifulSoup(inv_response.content, 'html.parser')
                        page_vehicles = self.extract_vehicles_from_page(inv_soup, dealer_url)
                        vehicles.extend(page_vehicles[:max_vehicles])
                        
                        if len(vehicles) >= max_vehicles:
                            break
                except Exception as e:
                    print(f"   ⚠️ Error scraping {link}: {e}")
                    continue
            
            print(f"✅ Found {len(vehicles)} vehicles from {dealer_url}")
            return vehicles
            
        except Exception as e:
            print(f"❌ Error scraping {dealer_url}: {e}")
            return []
    
    def find_inventory_links(self, soup, base_url):
        """Find potential inventory page links"""
        inventory_keywords = [
            'inventory', 'vehicles', 'cars', 'used', 'search', 'browse'
        ]
        
        links = []
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            text = a_tag.get_text().lower()
            
            # Check if link or text contains inventory keywords
            if any(keyword in text or keyword in href.lower() for keyword in inventory_keywords):
                full_url = urljoin(base_url, href)
                if full_url not in links:
                    links.append(full_url)
        
        return links[:10]  # Limit to 10 potential links
    
    def extract_vehicles_from_page(self, soup, dealer_url):
        """Extract vehicle information from a page"""
        vehicles = []
        
        # Look for vehicle-like containers
        # Try different selectors that might contain vehicle info
        potential_containers = []
        
        # Look for divs with car-related classes
        for div in soup.find_all('div', class_=re.compile(r'(vehicle|car|auto|listing|inventory)', re.I)):
            potential_containers.append(div)
        
        # Look for articles or sections
        for elem in soup.find_all(['article', 'section']):
            potential_containers.append(elem)
        
        # If no specific containers, look for divs with price patterns
        if not potential_containers:
            for div in soup.find_all('div'):
                text = div.get_text()
                if re.search(r'\$[\d,]+', text) and any(make in text.lower() for make in ['ford', 'toyota', 'honda', 'chevrolet']):
                    potential_containers.append(div)
        
        # Process containers
        for container in potential_containers[:20]:  # Limit processing
            vehicle_data = self.extract_vehicle_from_container(container, dealer_url)
            if vehicle_data:
                vehicles.append(vehicle_data)
        
        return vehicles
    
    def extract_vehicle_from_container(self, container, dealer_url):
        """Extract vehicle data from a container element"""
        try:
            text = container.get_text()
            
            # Extract basic info using regex patterns
            vehicle = {
                "id": str(uuid.uuid4()),
                "dealer_url": dealer_url,
                "scraped_at": datetime.utcnow(),
                "status": "active",
                "condition": "used"
            }
            
            # Extract year (4 digits starting with 19 or 20)
            year_match = re.search(r'\b(19|20)\d{2}\b', text)
            if year_match:
                vehicle['year'] = int(year_match.group(0))
            
            # Extract price
            price_match = re.search(r'\$[\d,]+', text)
            if price_match:
                price_str = price_match.group(0).replace('$', '').replace(',', '')
                try:
                    price = float(price_str)
                    if 1000 <= price <= 200000:  # Reasonable price range
                        vehicle['price'] = price
                except:
                    pass
            
            # Extract mileage
            mileage_match = re.search(r'([\d,]+)\s*mile[s]?', text, re.IGNORECASE)
            if mileage_match:
                mileage_str = mileage_match.group(1).replace(',', '')
                try:
                    mileage = int(mileage_str)
                    if 0 <= mileage <= 300000:  # Reasonable mileage range
                        vehicle['mileage'] = mileage
                except:
                    pass
            
            # Extract make and model
            car_makes = ['ford', 'toyota', 'honda', 'chevrolet', 'nissan', 'bmw', 'audi', 'mercedes']
            for make in car_makes:
                if make in text.lower():
                    vehicle['make'] = make.title()
                    
                    # Try to find model after make
                    pattern = rf'{make}\s+([a-zA-Z0-9\-\s]+)'
                    model_match = re.search(pattern, text, re.IGNORECASE)
                    if model_match:
                        model = model_match.group(1).strip()
                        # Clean up model (remove extra words)
                        model = re.split(r'\s+(for|at|in|with|miles)', model, 1)[0]
                        vehicle['model'] = model[:30]  # Limit length
                    break
            
            # Extract dealer name from URL
            domain = urlparse(dealer_url).netloc.replace('www.', '')
            dealer_name = domain.replace('.com', '').replace('.net', '').title()
            vehicle['dealer_name'] = dealer_name
            vehicle['dealer_id'] = str(uuid.uuid4())
            
            # Look for images in the container
            images = []
            for img in container.find_all('img'):
                src = img.get('src') or img.get('data-src')
                if src and not any(skip in src.lower() for skip in ['logo', 'icon', 'banner']):
                    full_url = urljoin(dealer_url, src)
                    # Try to download and convert small images
                    try:
                        img_response = self.session.get(full_url, timeout=5)
                        if img_response.status_code == 200 and len(img_response.content) < 500000:  # Max 500KB
                            content_type = img_response.headers.get('content-type', 'image/jpeg')
                            base64_data = base64.b64encode(img_response.content).decode('utf-8')
                            base64_url = f"data:{content_type};base64,{base64_data}"
                            images.append(base64_url)
                            if len(images) >= 3:  # Max 3 images
                                break
                    except:
                        continue
            
            vehicle['images'] = images
            
            # Only return if we have meaningful data
            if (vehicle.get('make') and vehicle.get('model') and 
                (vehicle.get('price') or vehicle.get('year'))):
                return vehicle
            
        except Exception as e:
            print(f"   ⚠️ Error extracting vehicle: {e}")
        
        return None

def test_fallback_scraper():
    """Test the fallback scraper"""
    scraper = FallbackScraper()
    
    # Test with some basic dealer websites
    test_dealers = [
        "https://memorymotorstn.com",
        "https://tnautotrade.com",
        "https://usautomotors.com"
    ]
    
    total_vehicles = 0
    
    for dealer_url in test_dealers:
        vehicles = scraper.scrape_dealer_basic(dealer_url, max_vehicles=5)
        
        # Save vehicles to database
        for vehicle_data in vehicles:
            try:
                result = db.vehicles.insert_one(vehicle_data)
                print(f"✅ Saved: {vehicle_data.get('year', 'Unknown')} {vehicle_data.get('make', 'Unknown')} {vehicle_data.get('model', 'Unknown')}")
                total_vehicles += 1
            except Exception as e:
                print(f"❌ Error saving vehicle: {e}")
    
    print(f"\n🎉 Fallback scraper added {total_vehicles} vehicles!")
    
    # Final count
    total_count = db.vehicles.count_documents({'status': 'active'})
    print(f"📊 Total vehicles in database: {total_count}")

if __name__ == "__main__":
    test_fallback_scraper()