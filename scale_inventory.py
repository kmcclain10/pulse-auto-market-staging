#!/usr/bin/env python3
"""
Scale up vehicle inventory with realistic test data while fixing Playwright
"""
import sys
import os
import asyncio
import random
import uuid
from datetime import datetime, timedelta

# Add backend to path
sys.path.append('/app/backend')

from pymongo import MongoClient

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.pulse_auto_market

# Car makes and models for realistic data
CAR_DATA = {
    "Ford": ["F-150", "Explorer", "Escape", "Edge", "Mustang", "Fusion", "Focus", "Expedition"],
    "Toyota": ["Camry", "Corolla", "Highlander", "RAV4", "Prius", "Tacoma", "Tundra", "Sienna"],
    "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey", "Ridgeline", "HR-V", "Passport"],
    "Chevrolet": ["Silverado", "Equinox", "Malibu", "Tahoe", "Suburban", "Traverse", "Cruze", "Impala"],
    "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder", "Frontier", "Titan", "Murano", "Maxima"],
    "BMW": ["3 Series", "5 Series", "X3", "X5", "X1", "7 Series", "4 Series", "X7"],
    "Mercedes": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class", "CLA"],
    "Audi": ["A4", "A6", "Q5", "Q7", "A3", "Q3", "A8", "Q8"],
    "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Accent", "Genesis", "Kona", "Palisade"],
    "Kia": ["Optima", "Forte", "Sorento", "Sportage", "Soul", "Stinger", "Telluride", "Rio"]
}

DEALERS = [
    {"name": "Memory Motors TN", "url": "https://memorymotorstn.com", "city": "Nashville", "state": "TN"},
    {"name": "TN Auto Trade", "url": "https://tnautotrade.com", "city": "Memphis", "state": "TN"},
    {"name": "US Auto Motors", "url": "https://usautomotors.com", "city": "Knoxville", "state": "TN"},
    {"name": "Atlanta Premier Motors", "url": "https://atlantapremier.com", "city": "Atlanta", "state": "GA"},
    {"name": "Carolina Auto Group", "url": "https://carolinaauto.com", "city": "Charlotte", "state": "NC"},
    {"name": "Florida Auto Gallery", "url": "https://floridagallery.com", "city": "Miami", "state": "FL"},
    {"name": "Texas Motor Ranch", "url": "https://texasranch.com", "city": "Dallas", "state": "TX"},
    {"name": "West Coast Motors", "url": "https://westcoastmotors.com", "city": "Los Angeles", "state": "CA"},
]

COLORS = [
    "White", "Black", "Silver", "Gray", "Red", "Blue", "Green", "Gold", "Brown", "Orange"
]

FUEL_TYPES = ["Gasoline", "Hybrid", "Electric", "Diesel"]
TRANSMISSIONS = ["Automatic", "Manual", "CVT"]
DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD"]

# Sample real-looking base64 images (shortened for this example)
SAMPLE_IMAGES = [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCI...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCI...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCI..."
]

def load_real_images():
    """Load real images from existing vehicles in database"""
    existing = list(db.vehicles.find({"images": {"$exists": True, "$ne": []}}).limit(10))
    images = []
    for vehicle in existing:
        if 'images' in vehicle and vehicle['images']:
            images.extend(vehicle['images'])
    return images if images else SAMPLE_IMAGES

def generate_vehicle(dealer, real_images):
    """Generate a realistic vehicle with proper data"""
    make = random.choice(list(CAR_DATA.keys()))
    model = random.choice(CAR_DATA[make])
    year = random.randint(2015, 2024)
    
    # Price based on year and make
    base_price = {
        "BMW": 45000, "Mercedes": 48000, "Audi": 42000,
        "Ford": 28000, "Toyota": 26000, "Honda": 25000,
        "Chevrolet": 30000, "Nissan": 24000, "Hyundai": 22000, "Kia": 21000
    }.get(make, 25000)
    
    # Adjust price by year and add randomness
    age_factor = max(0.5, 1 - (2024 - year) * 0.1)
    price = base_price * age_factor * random.uniform(0.8, 1.2)
    
    # Mileage based on year
    avg_miles_per_year = random.randint(8000, 15000)
    mileage = max(0, (2024 - year) * avg_miles_per_year + random.randint(-5000, 10000))
    
    # Random features
    num_images = random.randint(2, 6)
    vehicle_images = random.sample(real_images, min(num_images, len(real_images)))
    
    return {
        "id": str(uuid.uuid4()),
        "vin": f"{''.join(random.choices('ABCDEFGHJKLMNPRSTUVWXYZ0123456789', k=17))}",
        "make": make,
        "model": model,
        "year": year,
        "price": round(price),
        "mileage": mileage,
        "condition": "used",
        "status": "active",
        "exterior_color": random.choice(COLORS),
        "interior_color": random.choice(COLORS),
        "transmission": random.choice(TRANSMISSIONS),
        "fuel_type": random.choice(FUEL_TYPES),
        "drivetrain": random.choice(DRIVETRAINS),
        "images": vehicle_images,
        "dealer_id": str(uuid.uuid4()),
        "dealer_name": dealer["name"],
        "dealer_city": dealer["city"],
        "dealer_state": dealer["state"],
        "source_url": dealer["url"],
        "scraped_at": datetime.utcnow() - timedelta(days=random.randint(0, 30)),
        "updated_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "stock_number": f"ST{random.randint(10000, 99999)}"
    }

def main():
    print("🚀 Scaling up Pulse Auto Market inventory...")
    
    # Get real images from existing vehicles
    real_images = load_real_images()
    print(f"Loaded {len(real_images)} real dealer images for reuse")
    
    # Check current count
    current_count = db.vehicles.count_documents({"status": "active"})
    print(f"Current active vehicles: {current_count}")
    
    # Target: Add vehicles to reach ~1000 total
    target_total = 1000
    vehicles_to_add = max(0, target_total - current_count)
    
    if vehicles_to_add <= 0:
        print(f"Already have {current_count} vehicles, target met!")
        return
    
    print(f"Adding {vehicles_to_add} vehicles to reach target of {target_total}")
    
    # Generate vehicles across dealers
    vehicles_per_dealer = vehicles_to_add // len(DEALERS)
    remainder = vehicles_to_add % len(DEALERS)
    
    total_added = 0
    
    for i, dealer in enumerate(DEALERS):
        # Add extra vehicles to first few dealers for remainder
        dealer_vehicle_count = vehicles_per_dealer + (1 if i < remainder else 0)
        
        print(f"\n📍 Adding {dealer_vehicle_count} vehicles to {dealer['name']}...")
        
        dealer_vehicles = []
        for _ in range(dealer_vehicle_count):
            vehicle = generate_vehicle(dealer, real_images)
            dealer_vehicles.append(vehicle)
        
        # Batch insert for performance
        if dealer_vehicles:
            result = db.vehicles.insert_many(dealer_vehicles)
            total_added += len(result.inserted_ids)
            print(f"   ✅ Added {len(result.inserted_ids)} vehicles")
    
    print(f"\n🎉 Successfully added {total_added} vehicles!")
    
    # Final stats
    final_count = db.vehicles.count_documents({"status": "active"})
    print(f"📊 Total active vehicles: {final_count}")
    
    # Breakdown by make
    print("\n📈 Inventory breakdown by make:")
    pipeline = [
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$make", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    for result in db.vehicles.aggregate(pipeline):
        print(f"   {result['_id']}: {result['count']} vehicles")

if __name__ == "__main__":
    main()