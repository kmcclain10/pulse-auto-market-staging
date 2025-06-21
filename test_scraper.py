#!/usr/bin/env python3
"""
Test scraper to populate inventory for Pulse Auto Market
This will create sample vehicle data to test the system
"""

import asyncio
import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid
import json

# Sample vehicle data (realistic AutoTrader-style data)
SAMPLE_VEHICLES = [
    {
        "make": "Ford",
        "model": "F-150",
        "year": 2022,
        "trim": "XLT SuperCrew",
        "price": 35999.00,
        "mileage": 28500,
        "condition": "used",
        "exterior_color": "Oxford White",
        "interior_color": "Black",
        "transmission": "Automatic",
        "engine": "3.5L V6 EcoBoost",
        "fuel_type": "Gasoline",
        "drivetrain": "4WD",
        "body_style": "Pickup Truck",
        "description": "Well-maintained F-150 XLT with EcoBoost engine. Clean Carfax, one owner. Great for work or family use.",
        "features": ["Bluetooth", "Backup Camera", "Cruise Control", "Tow Package", "Bedliner"],
        "dealer_name": "Atlanta Ford Center",
        "dealer_phone": "(404) 555-0123",
        "dealer_address": "1234 Peachtree St",
        "dealer_city": "Atlanta",
        "dealer_state": "GA",
        "dealer_zip": "30309",
        "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="]
    },
    {
        "make": "Toyota",
        "model": "Camry",
        "year": 2021,
        "trim": "LE",
        "price": 26999.00,
        "mileage": 15200,
        "condition": "used",
        "exterior_color": "Midnight Black Metallic",
        "interior_color": "Ash",
        "transmission": "Automatic",
        "engine": "2.5L 4-Cylinder",
        "fuel_type": "Gasoline",
        "drivetrain": "FWD",
        "body_style": "Sedan",
        "description": "Low mileage Toyota Camry LE. Excellent fuel economy and reliability. Perfect commuter car.",
        "features": ["Toyota Safety Sense", "Apple CarPlay", "LED Headlights", "Power Seats"],
        "dealer_name": "Premier Toyota of Atlanta",
        "dealer_phone": "(404) 555-0456",
        "dealer_address": "5678 Piedmont Ave",
        "dealer_city": "Atlanta",
        "dealer_state": "GA",
        "dealer_zip": "30305",
        "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="]
    },
    {
        "make": "Honda",
        "model": "Civic",
        "year": 2023,
        "trim": "Sport",
        "price": 24599.00,
        "mileage": 8900,
        "condition": "used",
        "exterior_color": "Sonic Gray Pearl",
        "interior_color": "Black",
        "transmission": "CVT",
        "engine": "2.0L 4-Cylinder",
        "fuel_type": "Gasoline",
        "drivetrain": "FWD",
        "body_style": "Sedan",
        "description": "Nearly new Honda Civic Sport with sport styling and excellent fuel economy. Still under warranty.",
        "features": ["Honda Sensing", "Sport Mode", "18-inch Alloy Wheels", "Dual-Zone Climate"],
        "dealer_name": "Hennessy Honda",
        "dealer_phone": "(404) 555-0789",
        "dealer_address": "9012 Roswell Rd",
        "dealer_city": "Atlanta",
        "dealer_state": "GA",
        "dealer_zip": "30342",
        "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="]
    },
    {
        "make": "BMW",
        "model": "X3",
        "year": 2022,
        "trim": "xDrive30i",
        "price": 42999.00,
        "mileage": 22100,
        "condition": "used",
        "exterior_color": "Alpine White",
        "interior_color": "Black SensaTec",
        "transmission": "Automatic",
        "engine": "2.0L TwinPower Turbo",
        "fuel_type": "Gasoline",
        "drivetrain": "AWD",
        "body_style": "SUV",
        "description": "Luxury BMW X3 with all-wheel drive. Loaded with premium features and excellent condition.",
        "features": ["iDrive Infotainment", "Panoramic Sunroof", "Heated Seats", "Premium Audio"],
        "dealer_name": "BMW of Atlanta",
        "dealer_phone": "(404) 555-0321",
        "dealer_address": "3456 Buckhead Ave",
        "dealer_city": "Atlanta",
        "dealer_state": "GA",
        "dealer_zip": "30326",
        "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="]
    },
    {
        "make": "Chevrolet",
        "model": "Tahoe",
        "year": 2021,
        "trim": "LT",
        "price": 52999.00,
        "mileage": 35600,
        "condition": "used",
        "exterior_color": "Black",
        "interior_color": "Jet Black",
        "transmission": "Automatic",
        "engine": "5.3L V8",
        "fuel_type": "Gasoline",
        "drivetrain": "4WD",
        "body_style": "SUV",
        "description": "Full-size Chevrolet Tahoe with seating for 8. Perfect for large families or towing needs.",
        "features": ["Third Row Seating", "Tow Package", "Bose Audio", "Power Liftgate"],
        "dealer_name": "Carl Black Chevrolet",
        "dealer_phone": "(404) 555-0654",
        "dealer_address": "7890 Cobb Pkwy",
        "dealer_city": "Atlanta",
        "dealer_state": "GA",
        "dealer_zip": "30339",
        "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="]
    },
    {
        "make": "Tesla",
        "model": "Model 3",
        "year": 2022,
        "trim": "Long Range",
        "price": 48999.00,
        "mileage": 18500,
        "condition": "used",
        "exterior_color": "Pearl White Multi-Coat",
        "interior_color": "Black",
        "transmission": "Direct Drive",
        "engine": "Electric Motor",
        "fuel_type": "Electric",
        "drivetrain": "AWD",
        "body_style": "Sedan",
        "description": "Tesla Model 3 Long Range with Autopilot. Excellent electric vehicle with supercharging capability.",
        "features": ["Autopilot", "Supercharging", "Over-the-Air Updates", "Premium Interior"],
        "dealer_name": "Tesla Atlanta",
        "dealer_phone": "(404) 555-0987",
        "dealer_address": "1122 Technology Pkwy",
        "dealer_city": "Atlanta",
        "dealer_state": "GA",
        "dealer_zip": "30092",
        "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="]
    },
    {
        "make": "Jeep",
        "model": "Wrangler",
        "year": 2023,
        "trim": "Sport Unlimited",
        "price": 33999.00,
        "mileage": 12400,
        "condition": "used",
        "exterior_color": "Firecracker Red",
        "interior_color": "Black",
        "transmission": "Manual",
        "engine": "3.6L V6",
        "fuel_type": "Gasoline",
        "drivetrain": "4WD",
        "body_style": "SUV",
        "description": "Iconic Jeep Wrangler Unlimited with removable doors and roof. Perfect for off-road adventures.",
        "features": ["Removable Doors", "Fold-Down Windshield", "Rock Rails", "All-Terrain Tires"],
        "dealer_name": "Landmark Jeep",
        "dealer_phone": "(404) 555-0234",
        "dealer_address": "4567 Highway 9",
        "dealer_city": "Atlanta",
        "dealer_state": "GA",
        "dealer_zip": "30004",
        "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="]
    },
    {
        "make": "Mercedes-Benz",
        "model": "C-Class",
        "year": 2021,
        "trim": "C 300",
        "price": 38999.00,
        "mileage": 24800,
        "condition": "used",
        "exterior_color": "Obsidian Black Metallic",
        "interior_color": "Artico Black",
        "transmission": "Automatic",
        "engine": "2.0L Turbo",
        "fuel_type": "Gasoline",
        "drivetrain": "RWD",
        "body_style": "Sedan",
        "description": "Luxury Mercedes-Benz C 300 with premium interior and advanced safety features.",
        "features": ["MBUX Infotainment", "Active Brake Assist", "LED Lighting", "Power Seats"],
        "dealer_name": "Mercedes-Benz of Atlanta",
        "dealer_phone": "(404) 555-0765",
        "dealer_address": "8901 Perimeter Center",
        "dealer_city": "Atlanta",
        "dealer_state": "GA",
        "dealer_zip": "30346",
        "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="]
    }
]

async def populate_vehicles():
    """Populate the database with sample vehicle data"""
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"🚀 Connected to MongoDB: {mongo_url}")
    print(f"📊 Database: {db_name}")
    
    try:
        # Clear existing vehicles
        result = await db.vehicles.delete_many({})
        print(f"🗑️  Cleared {result.deleted_count} existing vehicles")
        
        # Insert sample vehicles
        for i, vehicle_data in enumerate(SAMPLE_VEHICLES):
            vehicle = {
                "id": str(uuid.uuid4()),
                "dealer_id": f"dealer-{i+1}",
                "status": "active",
                "vin": f"1HGBH41JXMN{str(i+1).zfill(6)}",
                "scraped_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                **vehicle_data
            }
            
            await db.vehicles.insert_one(vehicle)
            print(f"✅ Added: {vehicle['year']} {vehicle['make']} {vehicle['model']} - ${vehicle['price']:,.2f}")
        
        # Create sample dealers
        dealers = []
        for i, vehicle_data in enumerate(SAMPLE_VEHICLES):
            dealer = {
                "id": f"dealer-{i+1}",
                "name": vehicle_data["dealer_name"],
                "phone": vehicle_data.get("dealer_phone"),
                "address": vehicle_data.get("dealer_address"),
                "city": vehicle_data.get("dealer_city"),
                "state": vehicle_data.get("dealer_state"),
                "zip_code": vehicle_data.get("dealer_zip"),
                "is_active": True,
                "created_at": datetime.utcnow()
            }
            dealers.append(dealer)
        
        # Clear existing dealers and insert new ones
        await db.dealers.delete_many({})
        await db.dealers.insert_many(dealers)
        print(f"🏢 Added {len(dealers)} dealers")
        
        # Create a sample API key for Market Check testing
        api_key = {
            "id": str(uuid.uuid4()),
            "key": "demo-api-key-12345",
            "user_id": "demo-user",
            "tier": "premium",
            "requests_used": 0,
            "requests_limit": 1000,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "expires_at": None
        }
        
        await db.api_keys.delete_many({})
        await db.api_keys.insert_one(api_key)
        print(f"🔑 Created API key: {api_key['key']}")
        
        # Verify the data
        vehicle_count = await db.vehicles.count_documents({"status": "active"})
        dealer_count = await db.dealers.count_documents({"is_active": True})
        
        print(f"\n🎉 SUCCESS! Inventory populated:")
        print(f"   📈 {vehicle_count} active vehicles")
        print(f"   🏢 {dealer_count} active dealers")
        print(f"   💰 Total inventory value: ${sum(v['price'] for v in SAMPLE_VEHICLES):,.2f}")
        
        # Show sample by make
        makes = {}
        for vehicle in SAMPLE_VEHICLES:
            make = vehicle['make']
            if make not in makes:
                makes[make] = 0
            makes[make] += 1
        
        print(f"\n📊 Inventory by Make:")
        for make, count in makes.items():
            print(f"   {make}: {count} vehicles")
        
        return True
        
    except Exception as e:
        print(f"❌ Error populating database: {str(e)}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv('/app/backend/.env')
    
    print("🚀 Pulse Auto Market - Manual Inventory Population")
    print("=" * 60)
    
    # Run the population
    result = asyncio.run(populate_vehicles())
    
    if result:
        print("\n✅ Manual scrape completed successfully!")
        print("🔍 You can now test the three interfaces:")
        print("   👤 Customer Portal: Browse and search vehicles")
        print("   🏢 Dealer Portal: Manage inventory")
        print("   ⚙️  Admin Dashboard: View system stats")
        print("\n💡 Next steps:")
        print("   1. Test the frontend interfaces")
        print("   2. Verify API endpoints work")
        print("   3. Test Market Check API with key: demo-api-key-12345")
    else:
        print("\n❌ Manual scrape failed. Check the error messages above.")