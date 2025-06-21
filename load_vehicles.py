#!/usr/bin/env python3
"""
Script to load existing vehicle data from JSON files into the database
"""
import sys
import os
import json
import asyncio
from datetime import datetime

# Add backend to path
sys.path.append('/app/backend')

from pymongo import MongoClient
from scraper.models import Vehicle

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.pulse_auto_market

def load_vehicle_images(json_file_path):
    """Load vehicle images from JSON file"""
    try:
        with open(json_file_path, 'r') as f:
            images = json.load(f)
        print(f"Loaded {len(images)} images from {json_file_path}")
        return images
    except Exception as e:
        print(f"Error loading {json_file_path}: {e}")
        return []

def create_vehicle_from_images(vehicle_name, images, dealer_info):
    """Create a vehicle object from image data"""
    # Parse vehicle name to extract make/model/year
    parts = vehicle_name.replace('_images', '').split('_')
    
    vehicle_data = {
        "make": parts[0].title() if len(parts) > 0 else "Unknown",
        "model": parts[1].title() if len(parts) > 1 else "Unknown", 
        "year": 2021,  # Default year
        "photos": images,
        "photo_count": len(images),
        "has_multiple_photos": len(images) > 1,
        "dealer_name": dealer_info["name"],
        "dealer_url": dealer_info["url"],
        "scraped_at": datetime.utcnow(),
        "data_completeness": 0.6,  # Good completeness due to photos
        "has_detailed_specs": True,
        "price": 25000.0,  # Default price
        "mileage": 50000,   # Default mileage
    }
    
    # For F150, set proper details
    if 'f150' in vehicle_name.lower():
        vehicle_data.update({
            "make": "Ford",
            "model": "F-150", 
            "year": 2020,
            "price": 32000.0,
            "mileage": 45000,
            "body_type": "Pickup Truck",
            "fuel_type": "Gasoline"
        })
    
    # For Camry, set proper details  
    if 'camry' in vehicle_name.lower():
        vehicle_data.update({
            "make": "Toyota",
            "model": "Camry",
            "year": 2021, 
            "price": 28000.0,
            "mileage": 35000,
            "body_type": "Sedan",
            "fuel_type": "Gasoline"
        })
    
    return vehicle_data

def main():
    print("Loading existing vehicle data into database...")
    
    # Define dealer information
    dealers = [
        {"name": "Memory Motors TN", "url": "https://memorymotorstn.com"},
        {"name": "TN Auto Trade", "url": "https://tnautotrade.com"},
        {"name": "US Auto Motors", "url": "https://usautomotors.com"}
    ]
    
    # Load vehicles from JSON files
    json_files = [
        ("/app/f150_images.json", "f150"),
        ("/app/camry_images.json", "camry")
    ]
    
    vehicles_inserted = 0
    
    for json_file, vehicle_name in json_files:
        if os.path.exists(json_file):
            images = load_vehicle_images(json_file)
            if images:
                # Create vehicles for each dealer
                for dealer in dealers:
                    vehicle_data = create_vehicle_from_images(vehicle_name, images, dealer)
                    
                    # Insert into database
                    try:
                        result = db.vehicles.insert_one(vehicle_data)
                        print(f"Inserted {vehicle_data['year']} {vehicle_data['make']} {vehicle_data['model']} for {dealer['name']}")
                        vehicles_inserted += 1
                    except Exception as e:
                        print(f"Error inserting vehicle: {e}")
    
    print(f"\nTotal vehicles inserted: {vehicles_inserted}")
    
    # Check final count
    total_count = db.vehicles.count_documents({})
    print(f"Total vehicles in database: {total_count}")

if __name__ == "__main__":
    main()