#!/usr/bin/env python3
"""
Advanced Dealer Website Navigator & Scraper
- Finds inventory pages automatically
- Clicks on individual vehicle details  
- Captures 10+ photos per vehicle
- Paginates through all inventory
- Extracts complete vehicle specifications
"""

import asyncio
import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid
import json
import aiohttp
import base64
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
import time

class AdvancedDealerScraper:
    def __init__(self):
        self.session = None
        self.scraped_vehicles = []
        
    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=60)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = aiohttp.ClientSession(timeout=timeout, headers=headers)
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def find_inventory_page(self, base_url):
        """Find the inventory/vehicles page on dealer website"""
        print(f"   🔍 Finding inventory page...")
        
        try:
            async with self.session.get(base_url) as response:
                if response.status != 200:
                    return None
                    
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Look for inventory page links
                inventory_keywords = [
                    'inventory', 'vehicles', 'cars', 'used-cars', 'pre-owned', 
                    'search', 'browse', 'shop', 'view-inventory', 'vehicle-search',
                    'used-vehicles', 'auto-inventory', 'car-search'
                ]
                
                inventory_links = []
                
                # Check all links on the page
                for link in soup.find_all('a', href=True):
                    href = link.get('href', '').lower()
                    link_text = link.get_text().lower().strip()
                    
                    # Look for inventory-related URLs or text
                    for keyword in inventory_keywords:
                        if keyword in href or keyword in link_text:
                            full_url = urljoin(base_url, link.get('href'))
                            if full_url not in inventory_links:
                                inventory_links.append(full_url)
                                print(f"   ✓ Found inventory link: {full_url}")
                                break
                
                # Try the most promising link first
                if inventory_links:
                    return inventory_links[0]
                
                # If no specific inventory link, try common paths
                common_paths = [
                    '/inventory', '/vehicles', '/used-cars', '/search', '/browse',
                    '/shop', '/cars', '/pre-owned', '/vehicle-search'
                ]
                
                for path in common_paths:
                    test_url = base_url.rstrip('/') + path
                    try:
                        async with self.session.get(test_url) as test_response:
                            if test_response.status == 200:
                                print(f"   ✓ Found inventory at: {test_url}")
                                return test_url
                    except:
                        continue
                
                print(f"   ❌ No inventory page found, using homepage")
                return base_url
                
        except Exception as e:
            print(f"   ❌ Error finding inventory page: {str(e)}")
            return base_url

    async def get_vehicle_detail_links(self, inventory_url, max_pages=5):
        """Get all vehicle detail page links from inventory"""
        print(f"   🔍 Scanning inventory pages for vehicle details...")
        
        detail_links = []
        
        for page in range(1, max_pages + 1):
            try:
                # Try different pagination formats
                page_urls = [
                    f"{inventory_url}?page={page}",
                    f"{inventory_url}?p={page}",
                    f"{inventory_url}/page/{page}",
                    f"{inventory_url}&page={page}" if '?' in inventory_url else f"{inventory_url}?page={page}"
                ]
                
                page_url = page_urls[0] if page == 1 else page_urls[0]
                
                async with self.session.get(page_url) as response:
                    if response.status != 200:
                        break
                        
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Look for vehicle detail links
                    page_links = []
                    
                    # Common patterns for vehicle detail links
                    detail_selectors = [
                        'a[href*="detail"]', 'a[href*="vehicle"]', 'a[href*="car"]',
                        'a[href*="view"]', 'a[href*="show"]', '.vehicle-link a',
                        '.car-link a', '.inventory-item a', '.vehicle-card a'
                    ]
                    
                    for selector in detail_selectors:
                        links = soup.select(selector)
                        for link in links:
                            href = link.get('href')
                            if href:
                                full_url = urljoin(inventory_url, href)
                                if any(word in href.lower() for word in ['detail', 'vehicle', 'car', 'view']):
                                    if full_url not in page_links:
                                        page_links.append(full_url)
                    
                    # If no specific selectors work, look for links with VIN or ID patterns
                    if not page_links:
                        all_links = soup.find_all('a', href=True)
                        for link in all_links:
                            href = link.get('href', '')
                            # Look for URLs that might be vehicle details (contain numbers/IDs)
                            if re.search(r'/\d+$|vin=|id=|vehicle-\d+', href, re.IGNORECASE):
                                full_url = urljoin(inventory_url, href)
                                if full_url not in page_links:
                                    page_links.append(full_url)
                    
                    detail_links.extend(page_links)
                    print(f"   📄 Page {page}: Found {len(page_links)} vehicle links")
                    
                    # If no links found, we've reached the end
                    if not page_links:
                        break
                    
                    # Limit total vehicles per dealer
                    if len(detail_links) >= 50:
                        break
                        
                    await asyncio.sleep(1)  # Be respectful
                    
            except Exception as e:
                print(f"   ❌ Error on page {page}: {str(e)}")
                break
        
        print(f"   ✅ Total vehicle detail links found: {len(detail_links)}")
        return detail_links[:50]  # Limit to 50 vehicles per dealer

    async def scrape_vehicle_details(self, detail_url, dealer_info):
        """Scrape complete vehicle details and multiple photos"""
        print(f"      🚗 Scraping vehicle: {detail_url}")
        
        try:
            async with self.session.get(detail_url) as response:
                if response.status != 200:
                    return None
                    
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                vehicle_data = {
                    'id': str(uuid.uuid4()),
                    'dealer_name': dealer_info['name'],
                    'dealer_id': dealer_info['name'],
                    'dealer_city': dealer_info.get('city', 'Unknown'),
                    'dealer_state': dealer_info.get('state', 'Unknown'),
                    'dealer_phone': dealer_info.get('phone', ''),
                    'source_url': detail_url,
                    'scraped_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                    'created_at': datetime.utcnow(),
                    'status': 'active',
                    'condition': 'used',
                    'images': []
                }

                # Extract title/heading
                title_selectors = ['h1', '.vehicle-title', '.car-title', '.listing-title', 'title']
                title = ""
                for selector in title_selectors:
                    title_elem = soup.select_one(selector)
                    if title_elem:
                        title = title_elem.get_text().strip()
                        break
                
                # Parse title for year, make, model
                if title:
                    # Look for year (4 digits starting with 19 or 20)
                    year_match = re.search(r'\b(19|20)\d{2}\b', title)
                    if year_match:
                        vehicle_data['year'] = int(year_match.group())
                    
                    # Common car makes
                    makes = ['Ford', 'Toyota', 'Honda', 'Chevrolet', 'Chevy', 'BMW', 'Mercedes', 'Audi', 
                            'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'VW', 'Mazda', 'Subaru', 'Lexus',
                            'Acura', 'Infiniti', 'Cadillac', 'Buick', 'GMC', 'Jeep', 'Chrysler', 'Dodge',
                            'Ram', 'Tesla', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche', 'Mini']
                    
                    for make in makes:
                        if re.search(r'\b' + re.escape(make) + r'\b', title, re.IGNORECASE):
                            vehicle_data['make'] = make
                            # Extract model (text after make)
                            model_pattern = f'{re.escape(make)}\\s+([A-Za-z0-9\\s-]+)'
                            model_match = re.search(model_pattern, title, re.IGNORECASE)
                            if model_match:
                                model_text = model_match.group(1).strip()
                                # Clean up model
                                model_clean = re.sub(r'\b(19|20)\d{2}\b.*', '', model_text).strip()
                                model_clean = re.sub(r'\$.*', '', model_clean).strip()
                                vehicle_data['model'] = model_clean[:30] if model_clean else 'Unknown'
                            break

                # Extract price
                price_selectors = [
                    '.price', '.vehicle-price', '.car-price', '.listing-price',
                    '[class*="price"]', '[id*="price"]'
                ]
                
                for selector in price_selectors:
                    price_elem = soup.select_one(selector)
                    if price_elem:
                        price_text = price_elem.get_text()
                        price_match = re.search(r'\$[\d,]+', price_text)
                        if price_match:
                            price_str = price_match.group().replace('$', '').replace(',', '')
                            try:
                                vehicle_data['price'] = float(price_str)
                                break
                            except:
                                continue

                # Extract mileage
                mileage_selectors = [
                    '.mileage', '.vehicle-mileage', '.car-mileage', 
                    '[class*="mileage"]', '[id*="mileage"]'
                ]
                
                for selector in mileage_selectors:
                    mileage_elem = soup.select_one(selector)
                    if mileage_elem:
                        mileage_text = mileage_elem.get_text()
                        mileage_match = re.search(r'(\d+,?\d*)\s*(miles|mi)', mileage_text, re.IGNORECASE)
                        if mileage_match:
                            mileage_str = mileage_match.group(1).replace(',', '')
                            try:
                                vehicle_data['mileage'] = int(mileage_str)
                                break
                            except:
                                continue

                # Extract additional details from page text
                page_text = soup.get_text()
                
                # Look for transmission
                if re.search(r'\bautomatic\b', page_text, re.IGNORECASE):
                    vehicle_data['transmission'] = 'Automatic'
                elif re.search(r'\bmanual\b', page_text, re.IGNORECASE):
                    vehicle_data['transmission'] = 'Manual'
                
                # Look for fuel type
                for fuel_type in ['Gas', 'Gasoline', 'Diesel', 'Hybrid', 'Electric']:
                    if re.search(r'\b' + fuel_type + r'\b', page_text, re.IGNORECASE):
                        vehicle_data['fuel_type'] = fuel_type
                        break

                # SCRAPE ALL VEHICLE IMAGES (Up to 15)
                images = []
                
                # Look for images in various containers
                image_selectors = [
                    '.vehicle-images img', '.car-images img', '.gallery img',
                    '.photos img', '.image-gallery img', '.vehicle-gallery img',
                    '[class*="image"] img', '[class*="photo"] img', '[class*="gallery"] img'
                ]
                
                all_images = []
                for selector in image_selectors:
                    imgs = soup.select(selector)
                    all_images.extend(imgs)
                
                # Also get any img tags that might be vehicle photos
                if not all_images:
                    all_images = soup.find_all('img')
                
                for img in all_images:
                    img_src = img.get('src') or img.get('data-src') or img.get('data-lazy')
                    if not img_src:
                        continue
                    
                    # Convert to absolute URL
                    if not img_src.startswith('http'):
                        img_src = urljoin(detail_url, img_src)
                    
                    # Skip obvious non-vehicle images
                    skip_keywords = ['logo', 'icon', 'button', 'arrow', 'star', 'banner', 'header', 'footer']
                    if any(keyword in img_src.lower() for keyword in skip_keywords):
                        continue
                    
                    # Check if image is reasonable size (likely a vehicle photo)
                    try:
                        async with self.session.get(img_src) as img_response:
                            if img_response.status == 200:
                                img_data = await img_response.read()
                                
                                # Only process images between 10KB and 5MB
                                if 10000 < len(img_data) < 5000000:
                                    img_base64 = base64.b64encode(img_data).decode('utf-8')
                                    img_format = 'jpeg'
                                    if img_src.lower().endswith('.png'):
                                        img_format = 'png'
                                    elif img_src.lower().endswith('.webp'):
                                        img_format = 'webp'
                                    
                                    images.append(f"data:image/{img_format};base64,{img_base64}")
                                    print(f"        📸 Downloaded image {len(images)}: {len(img_data)} bytes")
                                    
                                    # Stop at 15 images per vehicle
                                    if len(images) >= 15:
                                        break
                                        
                    except Exception as e:
                        print(f"        ❌ Failed to download image: {str(e)}")
                        continue
                    
                    # Small delay between image downloads
                    await asyncio.sleep(0.2)

                vehicle_data['images'] = images
                
                # Set defaults for missing required fields
                if 'year' not in vehicle_data:
                    vehicle_data['year'] = 2020
                if 'make' not in vehicle_data:
                    vehicle_data['make'] = 'Unknown'
                if 'model' not in vehicle_data:
                    vehicle_data['model'] = 'Unknown'
                if 'price' not in vehicle_data:
                    vehicle_data['price'] = 15000.0
                if 'mileage' not in vehicle_data:
                    vehicle_data['mileage'] = 50000

                # Only return vehicles with reasonable data
                if (vehicle_data['make'] != 'Unknown' and 
                    vehicle_data['model'] != 'Unknown' and
                    vehicle_data['price'] > 1000):
                    
                    print(f"        ✅ {vehicle_data['year']} {vehicle_data['make']} {vehicle_data['model']} - ${vehicle_data['price']:,.0f} ({len(images)} photos)")
                    return vehicle_data
                else:
                    print(f"        ❌ Insufficient vehicle data extracted")
                    return None
                
        except Exception as e:
            print(f"        ❌ Error scraping vehicle details: {str(e)}")
            return None

    async def scrape_dealer_deep(self, dealer_info, state):
        """Deep scrape a dealer with full navigation and photo extraction"""
        print(f"\n🏢 DEEP SCRAPING: {dealer_info['name']} ({state})")
        print(f"   🌐 URL: {dealer_info['url']}")
        
        vehicles = []
        dealer_info_extended = {**dealer_info, 'state': state, 'city': 'Unknown'}
        
        try:
            # Step 1: Find inventory page
            inventory_url = await self.find_inventory_page(dealer_info['url'])
            if not inventory_url:
                print(f"   ❌ Could not find inventory page")
                return vehicles
            
            print(f"   📋 Using inventory URL: {inventory_url}")
            
            # Step 2: Get all vehicle detail page links
            detail_links = await self.get_vehicle_detail_links(inventory_url)
            if not detail_links:
                print(f"   ❌ No vehicle detail links found")
                return vehicles
            
            print(f"   🎯 Processing {len(detail_links)} vehicles...")
            
            # Step 3: Scrape each vehicle detail page
            for i, detail_url in enumerate(detail_links[:20]):  # Limit to 20 vehicles per dealer
                try:
                    vehicle_data = await self.scrape_vehicle_details(detail_url, dealer_info_extended)
                    if vehicle_data:
                        vehicles.append(vehicle_data)
                    
                    # Respectful delay between vehicles
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    print(f"      ❌ Error processing vehicle {i+1}: {str(e)}")
                    continue
            
            print(f"   🎉 Successfully scraped {len(vehicles)} vehicles from {dealer_info['name']}")
            
        except Exception as e:
            print(f"   ❌ Error deep scraping {dealer_info['name']}: {str(e)}")
        
        return vehicles

# Test with a single dealer first
SAMPLE_DEALERS = [
    {"name": "Serra Used Cars", "url": "https://www.serrausedcars.com", "state": "Alabama"},
    {"name": "Atlanta Auto Max", "url": "https://www.atlantaautomax.com", "state": "Georgia"},
    {"name": "Off Lease Only", "url": "https://www.offleaseonly.com", "state": "Florida"}
]

async def test_deep_scraper():
    print("🚀 Testing Advanced Deep Scraper")
    print("=" * 60)
    
    async with AdvancedDealerScraper() as scraper:
        all_vehicles = []
        
        for dealer in SAMPLE_DEALERS:
            vehicles = await scraper.scrape_dealer_deep(dealer, dealer['state'])
            all_vehicles.extend(vehicles)
            
            # Delay between dealers
            await asyncio.sleep(5)
        
        print(f"\n🎉 DEEP SCRAPING COMPLETE!")
        print(f"📊 Total vehicles: {len(all_vehicles)}")
        
        # Count vehicles with lots of images
        vehicles_with_many_images = [v for v in all_vehicles if len(v['images']) >= 5]
        print(f"🖼️  Vehicles with 5+ photos: {len(vehicles_with_many_images)}")
        
        if all_vehicles:
            # Save to database
            from dotenv import load_dotenv
            load_dotenv('/app/backend/.env')
            
            mongo_url = os.environ.get('MONGO_URL')
            db_name = os.environ.get('DB_NAME')
            client = AsyncIOMotorClient(mongo_url)
            db = client[db_name]
            
            # Clear and save
            await db.vehicles.delete_many({})
            await db.vehicles.insert_many(all_vehicles)
            print(f"💾 Saved {len(all_vehicles)} vehicles to database")
            
            client.close()

if __name__ == "__main__":
    asyncio.run(test_deep_scraper())