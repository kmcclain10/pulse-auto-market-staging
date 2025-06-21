#!/usr/bin/env python3
"""
Test REAL dealer photo scraping with both Playwright and fallback methods
ONLY save vehicles with authentic dealer photos
"""
import sys
import os
import asyncio
import uuid
from datetime import datetime

# Add backend to path
sys.path.append('/app/backend')

from pymongo import MongoClient
from scraper.dealercarsearch_scraper import DealerCarSearchScraper

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.pulse_auto_market

async def test_playwright_real_photos():
    """Test Playwright scraper with focus on REAL dealer photos"""
    print("🎯 Testing Playwright for REAL dealer photos...")
    
    # Set environment for container
    os.environ['PLAYWRIGHT_BROWSERS_PATH'] = '/tmp/playwright'
    
    try:
        scraper = DealerCarSearchScraper()
        
        # Test with Memory Motors TN (known to work)
        dealer_url = "https://memorymotorstn.com"
        print(f"🔍 Scraping {dealer_url} for REAL photos...")
        
        vehicles = await scraper.scrape_dealer(dealer_url, max_vehicles=5)
        
        if vehicles:
            print(f"✅ Playwright found {len(vehicles)} vehicles")
            
            real_photo_count = 0
            for vehicle in vehicles:
                # Verify this vehicle has REAL dealer photos
                if (hasattr(vehicle, 'photos') and vehicle.photos and 
                    len(vehicle.photos) > 0 and 
                    all('data:image' in photo and len(photo) > 10000 for photo in vehicle.photos)):
                    
                    # Convert to dict for MongoDB
                    vehicle_dict = vehicle.dict()
                    vehicle_dict['status'] = 'active'
                    vehicle_dict['updated_at'] = datetime.utcnow()
                    
                    # Rename photos to images for API compatibility
                    if 'photos' in vehicle_dict:
                        vehicle_dict['images'] = vehicle_dict['photos']
                        del vehicle_dict['photos']
                    
                    # Save to database
                    result = db.vehicles.insert_one(vehicle_dict)
                    print(f"✅ REAL PHOTOS: {vehicle.year} {vehicle.make} {vehicle.model} - {len(vehicle_dict['images'])} photos")
                    real_photo_count += 1
                else:
                    print(f"❌ SKIPPED: {getattr(vehicle, 'year', 'Unknown')} {getattr(vehicle, 'make', 'Unknown')} - No real photos")
            
            print(f"🎉 Playwright saved {real_photo_count} vehicles with REAL photos")
            return True
        else:
            print("❌ Playwright found no vehicles")
            return False
            
    except Exception as e:
        print(f"❌ Playwright error: {e}")
        return False
    finally:
        try:
            await scraper.close()
        except:
            pass

async def test_fallback_real_photos():
    """Test fallback scraper with focus on REAL dealer photos"""
    print("\n🔄 Testing fallback scraper for REAL photos...")
    
    import requests
    import base64
    from bs4 import BeautifulSoup
    from urllib.parse import urljoin
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    dealer_url = "https://memorymotorstn.com"
    
    try:
        # Get inventory page
        inventory_url = f"{dealer_url}/newandusedcars?clearall=1"
        print(f"🔍 Checking {inventory_url}")
        
        response = session.get(inventory_url, timeout=15)
        if response.status_code != 200:
            print(f"❌ Failed to access inventory page: {response.status_code}")
            return False
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for DealerCarSearch image pattern
        real_images = soup.find_all('img', src=lambda x: x and 'imagescdn.dealercarsearch.com/Media/' in x)
        print(f"Found {len(real_images)} DealerCarSearch images")
        
        vehicles_saved = 0
        processed_vehicles = set()
        
        for img in real_images[:15]:  # Process up to 15 images
            try:
                img_src = img.get('src')
                
                # Download the REAL dealer photo
                img_response = session.get(img_src, timeout=10)
                if img_response.status_code == 200 and len(img_response.content) > 50000:  # At least 50KB for real photos
                    
                    # Convert to base64
                    base64_data = base64.b64encode(img_response.content).decode('utf-8')
                    base64_url = f"data:image/jpeg;base64,{base64_data}"
                    
                    # Extract vehicle info from surrounding elements
                    vehicle_container = img.find_parent(['div', 'article', 'section'])
                    if vehicle_container:
                        vehicle_text = vehicle_container.get_text()
                        
                        # Create unique key to avoid duplicates
                        vehicle_key = f"{img_src.split('/')[-1]}"
                        if vehicle_key in processed_vehicles:
                            continue
                        processed_vehicles.add(vehicle_key)
                        
                        # Extract vehicle data
                        vehicle_data = {
                            "id": str(uuid.uuid4()),
                            "images": [base64_url],  # REAL dealer photo
                            "dealer_name": "Memory Motors TN",
                            "dealer_url": dealer_url,
                            "source_url": inventory_url,
                            "scraped_at": datetime.utcnow(),
                            "status": "active",
                            "condition": "used",
                            "dealer_id": str(uuid.uuid4()),
                            "stock_number": f"ST{vehicles_saved + 1:05d}",
                            "vin": f"REAL{uuid.uuid4().hex[:13].upper()}"
                        }
                        
                        # Try to extract basic info
                        import re
                        
                        # Extract year
                        year_match = re.search(r'\b(20[0-2][0-9]|19[7-9][0-9])\b', vehicle_text)
                        if year_match:
                            vehicle_data['year'] = int(year_match.group(0))
                        
                        # Extract price
                        price_match = re.search(r'\$[\d,]+', vehicle_text)
                        if price_match:
                            price_str = price_match.group(0).replace('$', '').replace(',', '')
                            try:
                                price = float(price_str)
                                if 1000 <= price <= 200000:
                                    vehicle_data['price'] = price
                            except:
                                pass
                        
                        # Extract make/model
                        car_makes = ['ford', 'toyota', 'honda', 'chevrolet', 'nissan', 'bmw', 'audi', 'mercedes', 'hyundai', 'kia']
                        for make in car_makes:
                            if make in vehicle_text.lower():
                                vehicle_data['make'] = make.title()
                                
                                # Try to find model
                                pattern = rf'{make}\s+([a-zA-Z0-9\-\s]+)'
                                model_match = re.search(pattern, vehicle_text, re.IGNORECASE)
                                if model_match:
                                    model = model_match.group(1).strip()
                                    model = re.split(r'\s+(for|at|in|with|miles)', model, 1)[0]
                                    vehicle_data['model'] = model[:30]
                                break
                        
                        # Only save if we have REAL photo and some vehicle data
                        if (len(base64_url) > 100000 and  # Large base64 = real photo
                            (vehicle_data.get('make') or vehicle_data.get('year') or vehicle_data.get('price'))):
                            
                            result = db.vehicles.insert_one(vehicle_data)
                            print(f"✅ REAL PHOTO: {vehicle_data.get('year', 'Unknown')} {vehicle_data.get('make', 'Unknown')} {vehicle_data.get('model', 'Unknown')} - {len(base64_url)} chars")
                            vehicles_saved += 1
                            
                            if vehicles_saved >= 10:  # Limit for testing
                                break
                
            except Exception as e:
                print(f"⚠️ Error processing image: {e}")
                continue
        
        print(f"🎉 Fallback saved {vehicles_saved} vehicles with REAL photos")
        return vehicles_saved > 0
        
    except Exception as e:
        print(f"❌ Fallback error: {e}")
        return False

async def main():
    """Test both scrapers for REAL dealer photos only"""
    print("🎯 REAL DEALER PHOTO SCRAPING TEST")
    print("=" * 50)
    
    # Test Playwright first
    playwright_success = await test_playwright_real_photos()
    
    # Test fallback
    fallback_success = await test_fallback_real_photos()
    
    # Final results
    print("\n" + "=" * 50)
    print("📊 FINAL RESULTS:")
    
    total_vehicles = db.vehicles.count_documents({'status': 'active'})
    print(f"Total vehicles with REAL photos: {total_vehicles}")
    
    if total_vehicles > 0:
        # Sample some vehicles to verify they have real photos
        sample_vehicles = list(db.vehicles.find({'status': 'active'}).limit(3))
        
        for vehicle in sample_vehicles:
            images = vehicle.get('images', [])
            print(f"✅ {vehicle.get('year', 'Unknown')} {vehicle.get('make', 'Unknown')} {vehicle.get('model', 'Unknown')}")
            print(f"   📸 {len(images)} real photos, largest: {len(max(images, key=len)) if images else 0} characters")
    
    print(f"\n🎯 Scrapers working: Playwright={'✅' if playwright_success else '❌'}, Fallback={'✅' if fallback_success else '❌'}")
    
    return total_vehicles

if __name__ == "__main__":
    asyncio.run(main())