#!/usr/bin/env python3
"""
Test the DealerCarSearch scraper to get real dealer inventory
"""
import sys
import os
import asyncio
from datetime import datetime

# Add backend to path
sys.path.append('/app/backend')

from pymongo import MongoClient
from scraper.dealercarsearch_scraper import DealerCarSearchScraper

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.pulse_auto_market

async def test_scraper():
    """Test the dealer scraper with real dealers"""
    print("Starting real dealer inventory scraping...")
    
    # Dealers from the handoff
    dealers = [
        "https://memorymotorstn.com",
        "https://tnautotrade.com", 
        "https://usautomotors.com"
    ]
    
    scraper = DealerCarSearchScraper()
    
    try:
        total_vehicles = 0
        
        for dealer_url in dealers:
            print(f"\n🔍 Scraping {dealer_url}...")
            
            try:
                # Scrape vehicles from this dealer
                vehicles = await scraper.scrape_dealer(dealer_url, max_vehicles=5)
                
                print(f"Found {len(vehicles)} vehicles from {dealer_url}")
                
                # Save vehicles to database
                for vehicle in vehicles:
                    # Convert to dict and add required fields
                    vehicle_dict = vehicle.dict()
                    vehicle_dict['status'] = 'active'
                    vehicle_dict['updated_at'] = datetime.utcnow()
                    
                    # Insert into database
                    result = db.vehicles.insert_one(vehicle_dict)
                    print(f"✅ Saved: {vehicle.year} {vehicle.make} {vehicle.model} - Photos: {len(vehicle.photos)}")
                    total_vehicles += 1
                    
            except Exception as e:
                print(f"❌ Error scraping {dealer_url}: {e}")
                continue
        
        print(f"\n🎉 Total vehicles scraped and saved: {total_vehicles}")
        
        # Check database count
        total_count = db.vehicles.count_documents({'status': 'active'})
        print(f"📊 Total active vehicles in database: {total_count}")
        
    finally:
        await scraper.close()

if __name__ == "__main__":
    asyncio.run(test_scraper())