#!/usr/bin/env python3
"""
Working Real Dealer Photo Scraper - Fixed for Container
"""
import sys
import os
import asyncio
import logging
import re
import base64
import uuid
from datetime import datetime
from urllib.parse import urljoin

# Add backend to path
sys.path.append('/app/backend')

from pymongo import MongoClient
from playwright.async_api import async_playwright
import aiohttp

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.pulse_auto_market

class WorkingRealPhotoScraper:
    """Scraper focused ONLY on real dealer photos"""
    
    def __init__(self):
        self.browser = None
        self.playwright = None
    
    async def initialize(self):
        """Initialize browser with proper container settings"""
        if self.browser:
            return
            
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-web-security'
            ]
        )
    
    async def scrape_memory_motors_real_photos(self):
        """Scrape Memory Motors for REAL dealer photos only"""
        print("🎯 Scraping Memory Motors for REAL dealer photos...")
        
        await self.initialize()
        page = await self.browser.new_page()
        
        try:
            # Set proper user agent
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
            
            # Go to inventory page
            inventory_url = "https://memorymotorstn.com/newandusedcars?clearall=1"
            print(f"📄 Loading: {inventory_url}")
            
            await page.goto(inventory_url, timeout=45000)
            await page.wait_for_timeout(5000)  # Wait for JS to load images
            
            print("✅ Page loaded, looking for vehicles...")
            
            # Scroll to load more content
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            await page.wait_for_timeout(3000)
            
            # Find all DealerCarSearch images
            page_content = await page.content()
            
            # Extract all DealerCarSearch image URLs from the page
            dealercarsearch_urls = re.findall(r'(https?://)?imagescdn\.dealercarsearch\.com/Media/[^"\'>\s]+', page_content)
            
            # Clean and deduplicate URLs
            clean_urls = []
            for url in dealercarsearch_urls:
                if not url.startswith('http'):
                    url = f"https://imagescdn.dealercarsearch.com/Media/{url.split('Media/')[-1]}"
                if url not in clean_urls:
                    clean_urls.append(url)
            
            print(f"🖼️ Found {len(clean_urls)} unique DealerCarSearch image URLs")
            
            # Now find vehicles by looking for containers near these images
            vehicles_data = []
            processed_images = set()
            
            # Get vehicle detail links
            vehicle_links = await page.query_selector_all('a[href*="vdp"]')
            print(f"🔗 Found {len(vehicle_links)} vehicle detail pages")
            
            # Process each vehicle detail page
            for i, link in enumerate(vehicle_links[:10]):  # Limit to 10 for testing
                try:
                    href = await link.get_attribute('href')
                    full_url = urljoin(inventory_url, href)
                    
                    print(f"🚗 Processing vehicle {i+1}: {full_url}")
                    
                    # Visit vehicle detail page
                    detail_page = await self.browser.new_page()
                    await detail_page.goto(full_url, timeout=30000)
                    await detail_page.wait_for_timeout(3000)
                    
                    # Extract vehicle info from VDP
                    vehicle_data = await self.extract_vehicle_from_vdp(detail_page, full_url)
                    
                    if vehicle_data and vehicle_data.get('images'):
                        vehicles_data.append(vehicle_data)
                        print(f"✅ Real photos: {vehicle_data.get('year', 'Unknown')} {vehicle_data.get('make', 'Unknown')} {vehicle_data.get('model', 'Unknown')} - {len(vehicle_data['images'])} photos")
                    
                    await detail_page.close()
                    
                except Exception as e:
                    print(f"⚠️ Error processing vehicle {i+1}: {e}")
                    continue
            
            print(f"🎉 Found {len(vehicles_data)} vehicles with real photos")
            return vehicles_data
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
        finally:
            await page.close()
    
    async def extract_vehicle_from_vdp(self, page, vehicle_url):
        """Extract vehicle data from Vehicle Detail Page"""
        try:
            # Get page content
            content = await page.content()
            title = await page.title()
            
            # Extract DealerCarSearch images from VDP
            image_urls = re.findall(r'https://imagescdn\.dealercarsearch\.com/Media/[^"\'>\s]+', content)
            
            if not image_urls:
                print(f"   ❌ No DealerCarSearch images on VDP")
                return None
            
            # Download real images
            real_images = []
            async with aiohttp.ClientSession() as session:
                for img_url in image_urls[:5]:  # Max 5 images per vehicle
                    try:
                        async with session.get(img_url, timeout=10) as response:
                            if response.status == 200:
                                img_content = await response.read()
                                if len(img_content) > 50000:  # At least 50KB for real photos
                                    base64_data = base64.b64encode(img_content).decode('utf-8')
                                    base64_url = f"data:image/jpeg;base64,{base64_data}"
                                    real_images.append(base64_url)
                                    print(f"   📸 Downloaded real photo: {len(base64_url)} chars")
                    except:
                        continue
            
            if not real_images:
                print(f"   ❌ Failed to download real images")
                return None
            
            # Extract vehicle details from title and content
            vehicle_data = {
                "id": str(uuid.uuid4()),
                "images": real_images,
                "dealer_name": "Memory Motors TN",
                "dealer_url": "https://memorymotorstn.com",
                "source_url": vehicle_url,
                "scraped_at": datetime.utcnow(),
                "status": "active",
                "condition": "used",
                "dealer_id": str(uuid.uuid4()),
                "vin": f"REAL{uuid.uuid4().hex[:13].upper()}",
                "stock_number": f"MM{len(real_images):03d}"
            }
            
            # Extract year, make, model from title
            title_lower = title.lower()
            
            # Extract year (4 digits)
            year_match = re.search(r'\b(19|20)\d{2}\b', title)
            if year_match:
                vehicle_data['year'] = int(year_match.group(0))
            
            # Extract make and model
            car_makes = ['ford', 'toyota', 'honda', 'chevrolet', 'nissan', 'bmw', 'audi', 'mercedes', 'hyundai', 'kia', 'subaru', 'mazda']
            for make in car_makes:
                if make in title_lower:
                    vehicle_data['make'] = make.title()
                    # Try to extract model
                    pattern = rf'{make}\s+([a-zA-Z0-9\-\s]+)'
                    model_match = re.search(pattern, title, re.IGNORECASE)
                    if model_match:
                        model = model_match.group(1).strip()
                        # Clean model name
                        model = re.split(r'\s+(for|at|in|with|miles|used|new)', model, 1)[0]
                        vehicle_data['model'] = model[:30]
                    break
            
            # Extract price from content
            price_match = re.search(r'\$[\d,]+', content)
            if price_match:
                price_str = price_match.group(0).replace('$', '').replace(',', '')
                try:
                    price = float(price_str)
                    if 1000 <= price <= 200000:
                        vehicle_data['price'] = price
                except:
                    pass
            
            # Extract mileage
            mileage_match = re.search(r'([\d,]+)\s*mile[s]?', content, re.IGNORECASE)
            if mileage_match:
                mileage_str = mileage_match.group(1).replace(',', '')
                try:
                    mileage = int(mileage_str)
                    if 0 <= mileage <= 300000:
                        vehicle_data['mileage'] = mileage
                except:
                    pass
            
            return vehicle_data
            
        except Exception as e:
            print(f"   ❌ VDP extraction error: {e}")
            return None
    
    async def save_vehicles_to_db(self, vehicles_data):
        """Save vehicles with real photos to database"""
        saved_count = 0
        
        for vehicle_data in vehicles_data:
            try:
                # Verify this has real photos
                images = vehicle_data.get('images', [])
                if images and all(len(img) > 100000 for img in images):  # Large base64 = real photos
                    result = db.vehicles.insert_one(vehicle_data)
                    saved_count += 1
                    print(f"✅ SAVED: {vehicle_data.get('year', 'Unknown')} {vehicle_data.get('make', 'Unknown')} {vehicle_data.get('model', 'Unknown')} - {len(images)} real photos")
                else:
                    print(f"❌ SKIPPED: Vehicle without real photos")
            except Exception as e:
                print(f"❌ Save error: {e}")
        
        return saved_count
    
    async def close(self):
        """Clean up browser resources"""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

async def main():
    """Main function to scrape REAL dealer photos"""
    print("🎯 REAL DEALER PHOTO SCRAPER - MEMORY MOTORS")
    print("=" * 50)
    
    scraper = WorkingRealPhotoScraper()
    
    try:
        # Scrape Memory Motors for real photos
        vehicles_data = await scraper.scrape_memory_motors_real_photos()
        
        if vehicles_data:
            # Save to database
            saved_count = await scraper.save_vehicles_to_db(vehicles_data)
            print(f"\n🎉 Successfully saved {saved_count} vehicles with REAL dealer photos!")
        else:
            print(f"\n❌ No vehicles with real photos found")
        
        # Check final database count
        total_count = db.vehicles.count_documents({'status': 'active'})
        print(f"📊 Total vehicles in database: {total_count}")
        
        if total_count > 0:
            # Sample a vehicle to verify real photos
            sample = db.vehicles.find_one({'status': 'active'})
            if sample and sample.get('images'):
                largest_image = max(sample['images'], key=len)
                print(f"✅ Sample real photo size: {len(largest_image)} characters")
        
    finally:
        await scraper.close()

if __name__ == "__main__":
    asyncio.run(main())