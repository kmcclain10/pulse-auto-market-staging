#!/usr/bin/env python3
"""
Multi-Dealer Website Scraper for Pulse Auto Market
Scrapes vehicle inventory from 50+ dealer websites across 5 states
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

# Dealer websites by state
DEALER_WEBSITES = {
    "Georgia": [
        {"name": "Atlanta Auto Max", "url": "https://www.atlantaautomax.com"},
        {"name": "Motor Max", "url": "https://www.motormaxga.com"},
        {"name": "Atlanta Used Cars", "url": "https://www.atlantausedcars.com"},
        {"name": "Gravity Autos Roswell", "url": "https://www.gravityautosroswell.com"},
        {"name": "Select Luxury Motors", "url": "https://www.selectluxurymotors.com"},
        {"name": "Georgia Auto World", "url": "https://www.georgiaautoworld.com"},
        {"name": "Atlanta Unique Auto Sales", "url": "https://www.atlantauniqueautosales.com"},
        {"name": "North Georgia Auto Brokers", "url": "https://www.northgeorgiaautobrokers.com"},
        {"name": "Atlanta Direct Auto", "url": "https://www.atlantadirectauto.com"},
        {"name": "Elite Motors", "url": "https://www.elitemotorsga.com"}
    ],
    "Tennessee": [
        {"name": "City Auto Sales", "url": "https://www.cityauto.com"},
        {"name": "Auto Universe", "url": "https://www.autouniverse.net"},
        {"name": "Dixie Motors", "url": "https://www.dixiemotorsinc.com"},
        {"name": "East Tennessee Auto Outlet", "url": "https://www.easttennesseeautooutlet.com"},
        {"name": "Budget Auto Sales", "url": "https://www.budgetautosalesknoxville.com"},
        {"name": "Volunteer Auto Group", "url": "https://www.volunteerautogroup.com"},
        {"name": "Southern Auto Solutions", "url": "https://www.southernautosolutions.com"},
        {"name": "Premier Auto Sales", "url": "https://www.premierautosalesknoxville.com"},
        {"name": "Quality Motors", "url": "https://www.qualitymotorstn.com"},
        {"name": "Auto Depot", "url": "https://www.autodepotknoxville.com"}
    ],
    "Alabama": [
        {"name": "Birmingham Auto Auction", "url": "https://www.birminghamautoauction.com"},
        {"name": "Serra Used Cars", "url": "https://www.serrausedcars.com"},
        {"name": "Auto Mart", "url": "https://www.automartalabama.com"},
        {"name": "Highline Imports", "url": "https://www.highlineimportsal.com"},
        {"name": "City Auto Sales of Hueytown", "url": "https://www.cityautosalesofhueytown.com"},
        {"name": "Edwards Motors", "url": "https://www.edwardsmotorsal.com"},
        {"name": "Alabama Auto Center", "url": "https://www.alabamaautocenter.com"},
        {"name": "Precision Imports", "url": "https://www.precisionimportsal.com"},
        {"name": "Southland Motors", "url": "https://www.southlandmotorsal.com"},
        {"name": "Premier Auto Group", "url": "https://www.premierautogroupal.com"}
    ],
    "Florida": [
        {"name": "Off Lease Only", "url": "https://www.offleaseonly.com"},
        {"name": "Tropical Auto Sales", "url": "https://www.tropicalautosalesfl.com"},
        {"name": "Auto Buying Center", "url": "https://www.autobuyingcenterfl.com"},
        {"name": "Miami Imports", "url": "https://www.miamiimportsfl.com"},
        {"name": "Prestige Auto Sales", "url": "https://www.prestigeautosalesfl.com"},
        {"name": "Florida Fine Cars", "url": "https://www.floridafinecars.com"},
        {"name": "AutoMax of Brevard", "url": "https://www.automaxofbrevard.com"},
        {"name": "Sunshine Auto Sales", "url": "https://www.sunshineautosalesfl.com"},
        {"name": "Elite Auto Group", "url": "https://www.eliteautogroupfl.com"},
        {"name": "Affordable Auto Sales", "url": "https://www.affordableautosalesfl.com"}
    ],
    "Kentucky": [
        {"name": "Auto Max of Louisville", "url": "https://www.automaxoflouisville.com"},
        {"name": "Louisville Auto Center", "url": "https://www.louisvilleautocenter.com"},
        {"name": "Prime Auto Sales", "url": "https://www.primeautosalesky.com"},
        {"name": "Bluegrass Auto Sales", "url": "https://www.bluegrassautosalesky.com"},
        {"name": "Derby City Motors", "url": "https://www.derbycitymotorsky.com"},
        {"name": "Kentucky Auto Sales", "url": "https://www.kentuckyautosales.com"},
        {"name": "Elite Auto Sales", "url": "https://www.eliteautosalesky.com"},
        {"name": "River City Auto Mart", "url": "https://www.rivercityautomart.com"},
        {"name": "Affordable Autos", "url": "https://www.affordableautosky.com"},
        {"name": "Crossroads Auto Sales", "url": "https://www.crossroadsautosalesky.com"}
    ]
}

class MultiDealerScraper:
    def __init__(self):
        self.session = None
        self.scraped_vehicles = []
        
    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(timeout=timeout)
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def extract_vehicle_from_element(self, element, dealer_info, base_url):
        """Extract vehicle information from a DOM element"""
        try:
            vehicle_data = {
                'id': str(uuid.uuid4()),
                'dealer_name': dealer_info['name'],
                'dealer_city': dealer_info.get('city', 'Unknown'),
                'dealer_state': dealer_info.get('state', 'Unknown'),
                'dealer_phone': dealer_info.get('phone', ''),
                'scraped_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'created_at': datetime.utcnow(),
                'status': 'active',
                'condition': 'used',
                'images': []
            }

            # Extract text content
            element_text = element.get_text().strip()
            
            # Extract year (look for 4-digit number starting with 19 or 20)
            year_match = re.search(r'\b(19|20)\d{2}\b', element_text)
            if year_match:
                try:
                    vehicle_data['year'] = int(year_match.group())
                except:
                    vehicle_data['year'] = 2020
            else:
                vehicle_data['year'] = 2020

            # Extract price (look for $X,XXX or $XX,XXX)
            price_match = re.search(r'\$[\d,]+', element_text)
            if price_match:
                price_str = price_match.group().replace('$', '').replace(',', '')
                try:
                    vehicle_data['price'] = float(price_str)
                except:
                    vehicle_data['price'] = 15000.0
            else:
                vehicle_data['price'] = 15000.0

            # Extract mileage (look for XXX,XXX miles or mi)
            mileage_match = re.search(r'(\d+,?\d*)\s*(miles|mi|mileage)', element_text, re.IGNORECASE)
            if mileage_match:
                mileage_str = mileage_match.group(1).replace(',', '')
                try:
                    vehicle_data['mileage'] = int(mileage_str)
                except:
                    vehicle_data['mileage'] = 50000
            else:
                vehicle_data['mileage'] = 50000

            # Extract make and model (common patterns)
            # Look for common car makes
            makes = ['Ford', 'Toyota', 'Honda', 'Chevrolet', 'Chevy', 'BMW', 'Mercedes', 'Audi', 
                    'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'VW', 'Mazda', 'Subaru', 'Lexus',
                    'Acura', 'Infiniti', 'Cadillac', 'Buick', 'GMC', 'Jeep', 'Chrysler', 'Dodge',
                    'Ram', 'Tesla', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche', 'Mini', 'Mitsubishi']
            
            make_found = None
            for make in makes:
                if re.search(r'\b' + re.escape(make) + r'\b', element_text, re.IGNORECASE):
                    make_found = make
                    break
            
            vehicle_data['make'] = make_found or 'Unknown'
            
            # Extract model (everything after make, before year or specs)
            if make_found:
                model_pattern = f'{re.escape(make_found)}\\s+([A-Za-z0-9\\s-]+)'
                model_match = re.search(model_pattern, element_text, re.IGNORECASE)
                if model_match:
                    model_text = model_match.group(1).strip()
                    # Clean up model text (remove year, price, etc.)
                    model_clean = re.sub(r'\b(19|20)\d{2}\b.*', '', model_text).strip()
                    model_clean = re.sub(r'\$.*', '', model_clean).strip()
                    vehicle_data['model'] = model_clean[:30] if model_clean else 'Unknown'
                else:
                    vehicle_data['model'] = 'Unknown'
            else:
                vehicle_data['model'] = 'Unknown'

            # Extract images from the element
            images = []
            img_tags = element.find_all('img')
            for img in img_tags:
                img_src = img.get('src') or img.get('data-src') or img.get('data-lazy')
                if img_src:
                    # Convert relative URLs to absolute
                    if not img_src.startswith('http'):
                        img_src = urljoin(base_url, img_src)
                    
                    # Skip small images, logos, icons
                    if any(skip in img_src.lower() for skip in ['logo', 'icon', 'button', 'arrow', 'star']):
                        continue
                        
                    try:
                        # Download and convert image to base64
                        async with self.session.get(img_src) as img_response:
                            if img_response.status == 200:
                                img_data = await img_response.read()
                                # Only process reasonable sized images
                                if len(img_data) > 5000 and len(img_data) < 2000000:  # 5KB to 2MB
                                    img_base64 = base64.b64encode(img_data).decode('utf-8')
                                    img_format = 'jpeg'
                                    if img_src.lower().endswith('.png'):
                                        img_format = 'png'
                                    images.append(f"data:image/{img_format};base64,{img_base64}")
                                    
                                    if len(images) >= 3:  # Limit to 3 images per vehicle
                                        break
                    except Exception as e:
                        print(f"   Error downloading image {img_src}: {str(e)}")
                        continue

            vehicle_data['images'] = images

            # Only return vehicles with reasonable data
            if (vehicle_data['price'] > 1000 and 
                vehicle_data['make'] != 'Unknown' and 
                vehicle_data['model'] != 'Unknown' and
                len(vehicle_data['model']) > 2):
                return vehicle_data
            
            return None

        except Exception as e:
            print(f"   Error extracting vehicle data: {str(e)}")
            return None

    async def scrape_dealer_website(self, dealer_info, state):
        """Scrape a single dealer website"""
        print(f"\n🚗 Scraping {dealer_info['name']} ({state})")
        print(f"   URL: {dealer_info['url']}")
        
        vehicles = []
        dealer_info_extended = {**dealer_info, 'state': state, 'city': 'Unknown'}
        
        try:
            async with self.session.get(dealer_info['url']) as response:
                if response.status != 200:
                    print(f"   ❌ Failed to load website (status: {response.status})")
                    return vehicles
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Look for common vehicle listing containers
                vehicle_selectors = [
                    '.vehicle', '.car', '.inventory-item', '.vehicle-card', '.listing',
                    '.inventory-vehicle', '.used-vehicle', '.auto-item', '.vehicle-listing',
                    '[data-vehicle]', '[data-car]', '.search-result', '.vehicle-info',
                    '.inventory-card', '.car-item', '.vehicle-container', '.auto-listing'
                ]
                
                vehicle_elements = []
                for selector in vehicle_selectors:
                    elements = soup.select(selector)
                    if elements and len(elements) > 1:  # Found multiple vehicles
                        vehicle_elements = elements
                        print(f"   ✓ Found {len(elements)} vehicles using selector: {selector}")
                        break
                
                # If no specific selectors work, try finding divs with vehicle-related content
                if not vehicle_elements:
                    all_divs = soup.find_all('div')
                    potential_vehicles = []
                    
                    for div in all_divs:
                        div_text = div.get_text().strip()
                        # Look for patterns that suggest this is a vehicle listing
                        if (re.search(r'\$[\d,]+', div_text) and 
                            re.search(r'\b(Ford|Toyota|Honda|Chevrolet|BMW|Mercedes)\b', div_text, re.IGNORECASE) and
                            re.search(r'\b(19|20)\d{2}\b', div_text)):
                            potential_vehicles.append(div)
                    
                    if potential_vehicles:
                        vehicle_elements = potential_vehicles[:20]  # Limit to 20
                        print(f"   ✓ Found {len(vehicle_elements)} potential vehicles through text analysis")
                
                if not vehicle_elements:
                    print(f"   ❌ No vehicle listings found")
                    return vehicles
                
                # Process each vehicle element
                for i, element in enumerate(vehicle_elements[:15]):  # Limit to 15 vehicles per dealer
                    try:
                        vehicle_data = await self.extract_vehicle_from_element(
                            element, dealer_info_extended, dealer_info['url']
                        )
                        
                        if vehicle_data:
                            vehicles.append(vehicle_data)
                            print(f"   ✓ Vehicle {i+1}: {vehicle_data['year']} {vehicle_data['make']} {vehicle_data['model']} - ${vehicle_data['price']:,.0f} ({len(vehicle_data['images'])} images)")
                        
                        # Add delay between vehicles to be respectful
                        await asyncio.sleep(0.5)
                        
                    except Exception as e:
                        print(f"   ❌ Error processing vehicle {i+1}: {str(e)}")
                        continue
                
                print(f"   🎉 Successfully scraped {len(vehicles)} vehicles from {dealer_info['name']}")
                
        except Exception as e:
            print(f"   ❌ Error scraping {dealer_info['name']}: {str(e)}")
        
        return vehicles

    async def scrape_all_dealers(self):
        """Scrape all dealer websites"""
        print("🚀 Starting multi-dealer scraping across 5 states...")
        print("=" * 60)
        
        all_vehicles = []
        total_dealers = sum(len(dealers) for dealers in DEALER_WEBSITES.values())
        current_dealer = 0
        
        for state, dealers in DEALER_WEBSITES.items():
            print(f"\n🏛️  SCRAPING {state.upper()} ({len(dealers)} dealers)")
            print("-" * 40)
            
            for dealer in dealers:
                current_dealer += 1
                print(f"\n[{current_dealer}/{total_dealers}] Processing {dealer['name']}")
                
                try:
                    vehicles = await self.scrape_dealer_website(dealer, state)
                    all_vehicles.extend(vehicles)
                    
                    # Add delay between dealers to be respectful
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    print(f"   ❌ Failed to scrape {dealer['name']}: {str(e)}")
                    continue
        
        print(f"\n🎉 SCRAPING COMPLETE!")
        print(f"📊 Total vehicles found: {len(all_vehicles)}")
        print(f"🖼️  Vehicles with images: {len([v for v in all_vehicles if v['images']])}")
        
        return all_vehicles

async def save_vehicles_to_database(vehicles):
    """Save scraped vehicles to MongoDB"""
    print(f"\n💾 Saving {len(vehicles)} vehicles to database...")
    
    # Connect to MongoDB
    from dotenv import load_dotenv
    load_dotenv('/app/backend/.env')
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Clear existing vehicles
        result = await db.vehicles.delete_many({})
        print(f"🗑️  Cleared {result.deleted_count} existing vehicles")
        
        # Insert new vehicles
        if vehicles:
            await db.vehicles.insert_many(vehicles)
            print(f"✅ Successfully saved {len(vehicles)} vehicles to database")
        
        # Update dealer records
        dealers_by_name = {}
        for vehicle in vehicles:
            dealer_name = vehicle['dealer_name']
            if dealer_name not in dealers_by_name:
                dealers_by_name[dealer_name] = {
                    'id': str(uuid.uuid4()),
                    'name': dealer_name,
                    'city': vehicle.get('dealer_city', 'Unknown'),
                    'state': vehicle.get('dealer_state', 'Unknown'),
                    'phone': vehicle.get('dealer_phone', ''),
                    'is_active': True,
                    'created_at': datetime.utcnow(),
                    'vehicle_count': 0
                }
            dealers_by_name[dealer_name]['vehicle_count'] += 1
        
        # Clear and insert dealers
        await db.dealers.delete_many({})
        if dealers_by_name:
            await db.dealers.insert_many(list(dealers_by_name.values()))
            print(f"🏢 Updated {len(dealers_by_name)} dealer records")
        
        # Print statistics
        total_with_images = len([v for v in vehicles if v['images']])
        avg_price = sum(v['price'] for v in vehicles) / len(vehicles) if vehicles else 0
        total_value = sum(v['price'] for v in vehicles)
        
        print(f"\n📈 INVENTORY STATISTICS:")
        print(f"   💰 Total inventory value: ${total_value:,.2f}")
        print(f"   💵 Average vehicle price: ${avg_price:,.2f}")
        print(f"   🖼️  Vehicles with images: {total_with_images}/{len(vehicles)} ({total_with_images/len(vehicles)*100:.1f}%)")
        
        # Show breakdown by state
        by_state = {}
        for vehicle in vehicles:
            state = vehicle.get('dealer_state', 'Unknown')
            if state not in by_state:
                by_state[state] = 0
            by_state[state] += 1
        
        print(f"\n🗺️  VEHICLES BY STATE:")
        for state, count in sorted(by_state.items()):
            print(f"   {state}: {count} vehicles")
        
        return True
        
    except Exception as e:
        print(f"❌ Error saving to database: {str(e)}")
        return False
    finally:
        client.close()

async def main():
    print("🚀 Pulse Auto Market - Multi-Dealer Scraper")
    print("Scraping 50+ dealer websites across 5 states")
    print("=" * 60)
    
    try:
        async with MultiDealerScraper() as scraper:
            vehicles = await scraper.scrape_all_dealers()
            
            if vehicles:
                success = await save_vehicles_to_database(vehicles)
                if success:
                    print(f"\n🎉 SUCCESS! {len(vehicles)} vehicles scraped and saved!")
                    print("🔍 Your Pulse Auto Market now has real inventory with images!")
                else:
                    print(f"\n❌ Scraping successful but database save failed")
            else:
                print(f"\n❌ No vehicles were successfully scraped")
    
    except Exception as e:
        print(f"\n❌ Scraping failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())