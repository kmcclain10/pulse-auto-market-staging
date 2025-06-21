from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import aiohttp
import json
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Pulse Auto Market API", version="1.0.0")

# Create routers for different interfaces
api_router = APIRouter(prefix="/api")
customer_router = APIRouter(prefix="/api/customer")
dealer_router = APIRouter(prefix="/api/dealer")
admin_router = APIRouter(prefix="/api/admin")

# Enums
class VehicleCondition(str, Enum):
    NEW = "new"
    USED = "used"
    CERTIFIED = "certified"

class VehicleStatus(str, Enum):
    ACTIVE = "active"
    SOLD = "sold"
    PENDING = "pending"
    INACTIVE = "inactive"

class ScrapingStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class UserRole(str, Enum):
    CUSTOMER = "customer"
    DEALER = "dealer"
    ADMIN = "admin"

# Core Models
class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vin: Optional[str] = None
    make: str
    model: str
    year: int
    trim: Optional[str] = None
    price: float
    mileage: int
    condition: VehicleCondition
    status: VehicleStatus = VehicleStatus.ACTIVE
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    fuel_type: Optional[str] = None
    drivetrain: Optional[str] = None
    body_style: Optional[str] = None
    images: List[str] = Field(default_factory=list)  # Base64 encoded images
    description: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    dealer_id: str
    dealer_name: str
    dealer_phone: Optional[str] = None
    dealer_address: Optional[str] = None
    dealer_city: Optional[str] = None
    dealer_state: Optional[str] = None
    dealer_zip: Optional[str] = None
    source_url: Optional[str] = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VehicleCreate(BaseModel):
    make: str
    model: str
    year: int
    price: float
    mileage: int
    condition: VehicleCondition
    dealer_id: str
    dealer_name: str
    trim: Optional[str] = None
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    fuel_type: Optional[str] = None
    drivetrain: Optional[str] = None
    body_style: Optional[str] = None
    description: Optional[str] = None
    features: List[str] = Field(default_factory=list)

class VehicleSearch(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    mileage_max: Optional[int] = None
    condition: Optional[VehicleCondition] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    radius: Optional[int] = 50  # miles
    page: int = 1
    limit: int = 20

class ScrapingJob(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: str  # "autotrader", "cars.com", etc.
    target_url: str
    filters: Dict[str, Any] = Field(default_factory=dict)
    status: ScrapingStatus = ScrapingStatus.PENDING
    vehicles_found: int = 0
    vehicles_processed: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Dealer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    website: Optional[str] = None
    license_number: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MarketCheckAPIKey(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key: str
    user_id: str
    tier: str  # "basic", "premium", "enterprise"
    requests_used: int = 0
    requests_limit: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

# Scraper Engine
class VehicleScraper:
    def __init__(self):
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_autotrader_page(self, url: str) -> Dict[str, Any]:
        """Scrape a single AutoTrader vehicle page"""
        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    return None
                    
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                vehicle_data = {}
                
                # Extract basic info
                title_elem = soup.find('h1', class_='listing-title')
                if title_elem:
                    title_text = title_elem.get_text().strip()
                    # Parse "2020 Ford F-150 XLT" format
                    title_parts = title_text.split()
                    if len(title_parts) >= 3:
                        vehicle_data['year'] = int(title_parts[0])
                        vehicle_data['make'] = title_parts[1]
                        vehicle_data['model'] = ' '.join(title_parts[2:])
                
                # Extract price
                price_elem = soup.find('span', class_='first-price')
                if price_elem:
                    price_text = price_elem.get_text().strip()
                    price_match = re.search(r'[\d,]+', price_text.replace('$', ''))
                    if price_match:
                        vehicle_data['price'] = float(price_match.group().replace(',', ''))
                
                # Extract mileage
                mileage_elem = soup.find('span', {'data-cmp': 'mileage'})
                if mileage_elem:
                    mileage_text = mileage_elem.get_text().strip()
                    mileage_match = re.search(r'[\d,]+', mileage_text)
                    if mileage_match:
                        vehicle_data['mileage'] = int(mileage_match.group().replace(',', ''))
                
                # Extract images
                images = []
                img_elems = soup.find_all('img', class_='listing-photo')
                for img in img_elems:
                    img_url = img.get('src') or img.get('data-src')
                    if img_url:
                        # Convert image to base64
                        try:
                            async with self.session.get(img_url) as img_response:
                                if img_response.status == 200:
                                    img_data = await img_response.read()
                                    img_base64 = base64.b64encode(img_data).decode('utf-8')
                                    images.append(f"data:image/jpeg;base64,{img_base64}")
                        except:
                            continue
                
                vehicle_data['images'] = images[:10]  # Limit to 10 images
                
                # Extract dealer info
                dealer_elem = soup.find('div', class_='dealer-info')
                if dealer_elem:
                    dealer_name_elem = dealer_elem.find('h3')
                    if dealer_name_elem:
                        vehicle_data['dealer_name'] = dealer_name_elem.get_text().strip()
                
                vehicle_data['source_url'] = url
                vehicle_data['condition'] = VehicleCondition.USED  # Default for AutoTrader
                
                return vehicle_data
                
        except Exception as e:
            logging.error(f"Error scraping AutoTrader page {url}: {str(e)}")
            return None
    
    async def scrape_autotrader_search(self, filters: Dict[str, Any], max_pages: int = 10) -> List[Dict[str, Any]]:
        """Scrape AutoTrader search results"""
        vehicles = []
        
        # Build search URL based on filters
        base_url = "https://www.autotrader.com/cars-for-sale"
        
        for page in range(1, max_pages + 1):
            try:
                search_url = f"{base_url}?page={page}"
                
                async with self.session.get(search_url) as response:
                    if response.status != 200:
                        break
                        
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find vehicle links
                    vehicle_links = soup.find_all('a', href=re.compile(r'/cars-for-sale/vehicledetails'))
                    
                    if not vehicle_links:
                        break
                    
                    # Process each vehicle
                    for link in vehicle_links[:5]:  # Limit to 5 per page for demo
                        vehicle_url = urljoin("https://www.autotrader.com", link.get('href'))
                        vehicle_data = await self.scrape_autotrader_page(vehicle_url)
                        
                        if vehicle_data:
                            vehicles.append(vehicle_data)
                            
                        # Add delay to be respectful
                        await asyncio.sleep(1)
                    
                    # Add delay between pages
                    await asyncio.sleep(2)
                    
            except Exception as e:
                logging.error(f"Error scraping AutoTrader search page {page}: {str(e)}")
                break
        
        return vehicles

# Background task for scraping
async def run_scraping_job(job_id: str):
    """Background task to run scraping jobs"""
    try:
        # Get job from database
        job_doc = await db.scraping_jobs.find_one({"id": job_id})
        if not job_doc:
            return
        
        job = ScrapingJob(**job_doc)
        
        # Update job status
        await db.scraping_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": ScrapingStatus.IN_PROGRESS,
                "started_at": datetime.utcnow()
            }}
        )
        
        # Run scraper
        async with VehicleScraper() as scraper:
            if job.source == "autotrader":
                vehicles_data = await scraper.scrape_autotrader_search(job.filters)
                
                # Process and save vehicles
                for vehicle_data in vehicles_data:
                    try:
                        # Create vehicle object
                        vehicle = Vehicle(
                            **vehicle_data,
                            dealer_id=vehicle_data.get('dealer_name', 'unknown'),
                        )
                        
                        # Save to database
                        await db.vehicles.insert_one(vehicle.dict())
                        
                    except Exception as e:
                        logging.error(f"Error saving vehicle: {str(e)}")
                        continue
                
                # Update job completion
                await db.scraping_jobs.update_one(
                    {"id": job_id},
                    {"$set": {
                        "status": ScrapingStatus.COMPLETED,
                        "completed_at": datetime.utcnow(),
                        "vehicles_found": len(vehicles_data),
                        "vehicles_processed": len(vehicles_data)
                    }}
                )
        
    except Exception as e:
        # Update job with error
        await db.scraping_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": ScrapingStatus.FAILED,
                "completed_at": datetime.utcnow(),
                "error_message": str(e)
            }}
        )
        logging.error(f"Scraping job {job_id} failed: {str(e)}")

# API Routes

# Core API Routes
@api_router.get("/")
async def root():
    return {"message": "Pulse Auto Market API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Customer Interface Routes
@customer_router.get("/vehicles", response_model=List[Vehicle])
async def search_vehicles(
    make: Optional[str] = None,
    model: Optional[str] = None,
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    mileage_max: Optional[int] = None,
    condition: Optional[VehicleCondition] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """Search vehicles for customers"""
    query = {"status": VehicleStatus.ACTIVE}
    
    if make:
        query["make"] = {"$regex": make, "$options": "i"}
    if model:
        query["model"] = {"$regex": model, "$options": "i"}
    if year_min:
        query["year"] = {"$gte": year_min}
    if year_max:
        if "year" in query:
            query["year"]["$lte"] = year_max
        else:
            query["year"] = {"$lte": year_max}
    if price_min:
        query["price"] = {"$gte": price_min}
    if price_max:
        if "price" in query:
            query["price"]["$lte"] = price_max
        else:
            query["price"] = {"$lte": price_max}
    if mileage_max:
        query["mileage"] = {"$lte": mileage_max}
    if condition:
        query["condition"] = condition
    if city:
        query["dealer_city"] = {"$regex": city, "$options": "i"}
    if state:
        query["dealer_state"] = {"$regex": state, "$options": "i"}
    
    skip = (page - 1) * limit
    
    vehicles = await db.vehicles.find(query).skip(skip).limit(limit).to_list(limit)
    return [Vehicle(**vehicle) for vehicle in vehicles]

@customer_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    """Get specific vehicle details"""
    vehicle = await db.vehicles.find_one({"id": vehicle_id, "status": VehicleStatus.ACTIVE})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return Vehicle(**vehicle)

@customer_router.get("/makes")
async def get_makes():
    """Get all available makes"""
    makes = await db.vehicles.distinct("make", {"status": VehicleStatus.ACTIVE})
    return sorted(makes)

@customer_router.get("/models/{make}")
async def get_models(make: str):
    """Get models for a specific make"""
    models = await db.vehicles.distinct("model", {"make": make, "status": VehicleStatus.ACTIVE})
    return sorted(models)

# Dealer Interface Routes
@dealer_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle: VehicleCreate):
    """Create a new vehicle listing"""
    vehicle_dict = vehicle.dict()
    vehicle_obj = Vehicle(**vehicle_dict)
    await db.vehicles.insert_one(vehicle_obj.dict())
    return vehicle_obj

@dealer_router.get("/vehicles", response_model=List[Vehicle])
async def get_dealer_vehicles(dealer_id: str, page: int = 1, limit: int = 20):
    """Get vehicles for a specific dealer"""
    skip = (page - 1) * limit
    vehicles = await db.vehicles.find({"dealer_id": dealer_id}).skip(skip).limit(limit).to_list(limit)
    return [Vehicle(**vehicle) for vehicle in vehicles]

@dealer_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, vehicle_update: Dict[str, Any]):
    """Update vehicle information"""
    vehicle_update["updated_at"] = datetime.utcnow()
    result = await db.vehicles.update_one({"id": vehicle_id}, {"$set": vehicle_update})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    updated_vehicle = await db.vehicles.find_one({"id": vehicle_id})
    return Vehicle(**updated_vehicle)

@dealer_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str):
    """Delete a vehicle listing"""
    result = await db.vehicles.update_one(
        {"id": vehicle_id}, 
        {"$set": {"status": VehicleStatus.INACTIVE, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return {"message": "Vehicle deleted successfully"}

# Admin Interface Routes
@admin_router.post("/scraping-jobs", response_model=ScrapingJob)
async def create_scraping_job(
    background_tasks: BackgroundTasks,
    source: str = "autotrader",
    target_url: str = "https://www.autotrader.com/cars-for-sale",
    filters: Dict[str, Any] = None
):
    """Create a new scraping job"""
    if filters is None:
        filters = {}
    
    job = ScrapingJob(
        source=source,
        target_url=target_url,
        filters=filters
    )
    
    await db.scraping_jobs.insert_one(job.dict())
    
    # Start background task
    background_tasks.add_task(run_scraping_job, job.id)
    
    return job

@admin_router.get("/scraping-jobs", response_model=List[ScrapingJob])
async def get_scraping_jobs(page: int = 1, limit: int = 20):
    """Get scraping jobs"""
    skip = (page - 1) * limit
    jobs = await db.scraping_jobs.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [ScrapingJob(**job) for job in jobs]

@admin_router.get("/scraping-jobs/{job_id}", response_model=ScrapingJob)
async def get_scraping_job(job_id: str):
    """Get specific scraping job"""
    job = await db.scraping_jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return ScrapingJob(**job)

@admin_router.get("/stats")
async def get_admin_stats():
    """Get system statistics"""
    total_vehicles = await db.vehicles.count_documents({"status": VehicleStatus.ACTIVE})
    total_dealers = await db.dealers.count_documents({"is_active": True})
    recent_vehicles = await db.vehicles.count_documents({
        "created_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
    })
    
    return {
        "total_vehicles": total_vehicles,
        "total_dealers": total_dealers,
        "recent_vehicles": recent_vehicles,
        "scraping_jobs_pending": await db.scraping_jobs.count_documents({"status": ScrapingStatus.PENDING}),
        "scraping_jobs_running": await db.scraping_jobs.count_documents({"status": ScrapingStatus.IN_PROGRESS})
    }

# Market Check API Routes (Monetization)
@api_router.post("/market-check/pricing")
async def market_check_pricing(
    vin: Optional[str] = None,
    make: Optional[str] = None,
    model: Optional[str] = None,
    year: Optional[int] = None,
    mileage: Optional[int] = None,
    api_key: str = Query(..., description="API Key for Market Check service")
):
    """Market Check style pricing API"""
    # Validate API key
    key_doc = await db.api_keys.find_one({"key": api_key, "is_active": True})
    if not key_doc:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    api_key_obj = MarketCheckAPIKey(**key_doc)
    
    # Check rate limits
    if api_key_obj.requests_used >= api_key_obj.requests_limit:
        raise HTTPException(status_code=429, detail="API rate limit exceeded")
    
    # Update usage count
    await db.api_keys.update_one(
        {"key": api_key},
        {"$inc": {"requests_used": 1}}
    )
    
    # Find similar vehicles for pricing
    query = {}
    if vin:
        query["vin"] = vin
    else:
        if make:
            query["make"] = {"$regex": make, "$options": "i"}
        if model:
            query["model"] = {"$regex": model, "$options": "i"}
        if year:
            query["year"] = {"$gte": year - 2, "$lte": year + 2}
        if mileage:
            query["mileage"] = {"$gte": mileage - 10000, "$lte": mileage + 10000}
    
    similar_vehicles = await db.vehicles.find(query).limit(100).to_list(100)
    
    if not similar_vehicles:
        return {
            "pricing": {
                "average_price": None,
                "price_range": {"min": None, "max": None},
                "market_position": "unknown",
                "confidence": 0
            },
            "sample_size": 0
        }
    
    prices = [v["price"] for v in similar_vehicles]
    avg_price = sum(prices) / len(prices)
    min_price = min(prices)
    max_price = max(prices)
    
    return {
        "pricing": {
            "average_price": round(avg_price, 2),
            "price_range": {"min": min_price, "max": max_price},
            "market_position": "competitive" if len(similar_vehicles) > 10 else "limited_data",
            "confidence": min(len(similar_vehicles) / 50, 1.0)
        },
        "sample_size": len(similar_vehicles),
        "last_updated": datetime.utcnow()
    }

# Include all routers
app.include_router(api_router)
app.include_router(customer_router)
app.include_router(dealer_router)
app.include_router(admin_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)