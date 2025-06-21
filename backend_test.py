#!/usr/bin/env python3
import requests
import json
import sys
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://ed89cfaf-7966-421f-9659-9084e35c716a.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"
API_KEY = "demo-api-key-12345"

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_test_header(test_name: str) -> None:
    """Print a formatted test header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD} TEST: {test_name}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")

def print_success(message: str) -> None:
    """Print a success message"""
    print(f"{Colors.OKGREEN}✓ SUCCESS: {message}{Colors.ENDC}")

def print_failure(message: str) -> None:
    """Print a failure message"""
    print(f"{Colors.FAIL}✗ FAILURE: {message}{Colors.ENDC}")

def print_info(message: str) -> None:
    """Print an info message"""
    print(f"{Colors.OKBLUE}ℹ INFO: {message}{Colors.ENDC}")

def print_warning(message: str) -> None:
    """Print a warning message"""
    print(f"{Colors.WARNING}⚠ WARNING: {message}{Colors.ENDC}")

def print_response(response: requests.Response) -> None:
    """Print a formatted API response"""
    try:
        json_response = response.json()
        print(f"{Colors.OKBLUE}Response ({response.status_code}):{Colors.ENDC}")
        print(json.dumps(json_response, indent=2))
    except:
        print(f"{Colors.OKBLUE}Response ({response.status_code}):{Colors.ENDC}")
        print(response.text)

def test_health_check() -> bool:
    """Test the health check endpoint"""
    print_test_header("Health Check Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/health")
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                print_success("Health check endpoint is working correctly")
                return True
            else:
                print_failure("Health check endpoint returned unexpected data")
                return False
        else:
            print_failure(f"Health check endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing health check endpoint: {str(e)}")
        return False

def test_root_endpoint() -> bool:
    """Test the root API endpoint"""
    print_test_header("Root API Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/")
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "version" in data:
                print_success("Root API endpoint is working correctly")
                return True
            else:
                print_failure("Root API endpoint returned unexpected data")
                return False
        else:
            print_failure(f"Root API endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing root API endpoint: {str(e)}")
        return False

def test_customer_vehicles() -> bool:
    """Test the customer vehicles endpoint"""
    print_test_header("Customer Vehicles Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/customer/vehicles")
        print_response(response)
        
        if response.status_code == 200:
            vehicles = response.json()
            if isinstance(vehicles, list):
                print_success(f"Customer vehicles endpoint returned {len(vehicles)} vehicles")
                if len(vehicles) == 8:
                    print_success("Expected number of vehicles (8) returned")
                else:
                    print_warning(f"Expected 8 vehicles, but got {len(vehicles)}")
                
                # Check vehicle structure
                if len(vehicles) > 0:
                    vehicle = vehicles[0]
                    required_fields = ["id", "make", "model", "year", "price", "mileage", "condition"]
                    missing_fields = [field for field in required_fields if field not in vehicle]
                    
                    if not missing_fields:
                        print_success("Vehicle data structure is correct")
                    else:
                        print_failure(f"Vehicle data missing required fields: {', '.join(missing_fields)}")
                        return False
                
                return True
            else:
                print_failure("Customer vehicles endpoint did not return a list")
                return False
        else:
            print_failure(f"Customer vehicles endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing customer vehicles endpoint: {str(e)}")
        return False

def test_search_functionality() -> bool:
    """Test the search functionality with filters"""
    print_test_header("Search Functionality with Filters")
    
    # Get all vehicles first to determine what to search for
    try:
        response = requests.get(f"{API_URL}/customer/vehicles")
        if response.status_code != 200:
            print_failure(f"Failed to get vehicles for search test: {response.status_code}")
            return False
        
        all_vehicles = response.json()
        if not all_vehicles:
            print_failure("No vehicles found to test search functionality")
            return False
        
        # Get a make to search for
        makes = set(vehicle["make"] for vehicle in all_vehicles)
        if not makes:
            print_failure("No vehicle makes found to test search")
            return False
        
        test_make = list(makes)[0]
        print_info(f"Testing search with make: {test_make}")
        
        # Test search by make
        response = requests.get(f"{API_URL}/customer/vehicles?make={test_make}")
        print_response(response)
        
        if response.status_code == 200:
            filtered_vehicles = response.json()
            if all(vehicle["make"].lower() == test_make.lower() for vehicle in filtered_vehicles):
                print_success(f"Search by make '{test_make}' returned correct results")
            else:
                print_failure(f"Search by make '{test_make}' returned incorrect results")
                return False
        else:
            print_failure(f"Search by make returned status code {response.status_code}")
            return False
        
        # Test price range
        min_price = 10000
        max_price = 50000
        print_info(f"Testing search with price range: ${min_price} - ${max_price}")
        
        response = requests.get(f"{API_URL}/customer/vehicles?price_min={min_price}&price_max={max_price}")
        print_response(response)
        
        if response.status_code == 200:
            filtered_vehicles = response.json()
            if all(min_price <= vehicle["price"] <= max_price for vehicle in filtered_vehicles):
                print_success(f"Search by price range returned correct results")
            else:
                print_failure(f"Search by price range returned incorrect results")
                return False
        else:
            print_failure(f"Search by price range returned status code {response.status_code}")
            return False
        
        # Test multiple filters
        print_info(f"Testing search with multiple filters")
        
        response = requests.get(f"{API_URL}/customer/vehicles?make={test_make}&price_min={min_price}&price_max={max_price}")
        print_response(response)
        
        if response.status_code == 200:
            filtered_vehicles = response.json()
            if all(vehicle["make"].lower() == test_make.lower() and min_price <= vehicle["price"] <= max_price for vehicle in filtered_vehicles):
                print_success(f"Search with multiple filters returned correct results")
            else:
                print_failure(f"Search with multiple filters returned incorrect results")
                return False
        else:
            print_failure(f"Search with multiple filters returned status code {response.status_code}")
            return False
        
        return True
    except Exception as e:
        print_failure(f"Error testing search functionality: {str(e)}")
        return False

def test_makes_endpoint() -> bool:
    """Test the makes endpoint"""
    print_test_header("Makes Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/customer/makes")
        print_response(response)
        
        if response.status_code == 200:
            makes = response.json()
            if isinstance(makes, list):
                print_success(f"Makes endpoint returned {len(makes)} makes")
                return True
            else:
                print_failure("Makes endpoint did not return a list")
                return False
        else:
            print_failure(f"Makes endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing makes endpoint: {str(e)}")
        return False

def test_models_by_make_endpoint() -> bool:
    """Test the models by make endpoint"""
    print_test_header("Models by Make Endpoint")
    
    # First get all makes
    try:
        response = requests.get(f"{API_URL}/customer/makes")
        if response.status_code != 200:
            print_failure(f"Failed to get makes for models test: {response.status_code}")
            return False
        
        makes = response.json()
        if not makes:
            print_failure("No makes found to test models endpoint")
            return False
        
        # Test with Ford and Toyota if available, otherwise use the first make
        test_makes = ["Ford", "Toyota"]
        available_test_makes = [make for make in test_makes if make in makes]
        
        if not available_test_makes:
            if makes:
                available_test_makes = [makes[0]]
            else:
                print_failure("No makes available to test models endpoint")
                return False
        
        all_successful = True
        
        for make in available_test_makes:
            print_info(f"Testing models for make: {make}")
            
            response = requests.get(f"{API_URL}/customer/models/{make}")
            print_response(response)
            
            if response.status_code == 200:
                models = response.json()
                if isinstance(models, list):
                    print_success(f"Models endpoint returned {len(models)} models for {make}")
                else:
                    print_failure(f"Models endpoint for {make} did not return a list")
                    all_successful = False
            else:
                print_failure(f"Models endpoint for {make} returned status code {response.status_code}")
                all_successful = False
        
        return all_successful
    except Exception as e:
        print_failure(f"Error testing models by make endpoint: {str(e)}")
        return False

def test_vehicle_details_endpoint() -> bool:
    """Test the vehicle details endpoint"""
    print_test_header("Vehicle Details Endpoint")
    
    # First get all vehicles to get an ID
    try:
        response = requests.get(f"{API_URL}/customer/vehicles")
        if response.status_code != 200:
            print_failure(f"Failed to get vehicles for details test: {response.status_code}")
            return False
        
        vehicles = response.json()
        if not vehicles:
            print_failure("No vehicles found to test details endpoint")
            return False
        
        # Get the first vehicle ID
        vehicle_id = vehicles[0]["id"]
        print_info(f"Testing vehicle details for ID: {vehicle_id}")
        
        response = requests.get(f"{API_URL}/customer/vehicles/{vehicle_id}")
        print_response(response)
        
        if response.status_code == 200:
            vehicle = response.json()
            if "id" in vehicle and vehicle["id"] == vehicle_id:
                print_success(f"Vehicle details endpoint returned correct vehicle")
                return True
            else:
                print_failure(f"Vehicle details endpoint returned incorrect vehicle")
                return False
        else:
            print_failure(f"Vehicle details endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing vehicle details endpoint: {str(e)}")
        return False

def test_admin_stats_endpoint() -> bool:
    """Test the admin stats endpoint"""
    print_test_header("Admin Stats Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/admin/stats")
        print_response(response)
        
        if response.status_code == 200:
            stats = response.json()
            required_fields = ["total_vehicles", "total_dealers", "recent_vehicles"]
            missing_fields = [field for field in required_fields if field not in stats]
            
            if not missing_fields:
                print_success("Admin stats endpoint returned correct data structure")
                
                # Check if stats match expected values
                if stats["total_vehicles"] == 8 and stats["total_dealers"] == 8:
                    print_success("Admin stats show expected 8 vehicles and 8 dealers")
                else:
                    print_warning(f"Expected 8 vehicles and 8 dealers, but got {stats['total_vehicles']} vehicles and {stats['total_dealers']} dealers")
                
                return True
            else:
                print_failure(f"Admin stats missing required fields: {', '.join(missing_fields)}")
                return False
        else:
            print_failure(f"Admin stats endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing admin stats endpoint: {str(e)}")
        return False

def test_scraping_jobs_endpoint() -> bool:
    """Test the scraping jobs endpoint"""
    print_test_header("Scraping Jobs Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/admin/scraping-jobs")
        print_response(response)
        
        if response.status_code == 200:
            jobs = response.json()
            if isinstance(jobs, list):
                print_success(f"Scraping jobs endpoint returned {len(jobs)} jobs")
                print_info("Initial scraping jobs list should be empty")
                return True
            else:
                print_failure("Scraping jobs endpoint did not return a list")
                return False
        else:
            print_failure(f"Scraping jobs endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing scraping jobs endpoint: {str(e)}")
        return False

def test_create_scraping_job() -> bool:
    """Test creating a scraping job"""
    print_test_header("Create Scraping Job Endpoint")
    
    try:
        # Create a new scraping job
        job_data = {
            "source": "autotrader",
            "target_url": "https://www.autotrader.com/cars-for-sale",
            "filters": {
                "make": "Toyota",
                "model": "Camry"
            }
        }
        
        response = requests.post(f"{API_URL}/admin/scraping-jobs", json=job_data)
        print_response(response)
        
        if response.status_code == 200:
            job = response.json()
            if "id" in job and job["source"] == "autotrader":
                print_success("Successfully created a scraping job")
                
                # Verify the job was created by getting all jobs
                job_id = job["id"]
                response = requests.get(f"{API_URL}/admin/scraping-jobs")
                
                if response.status_code == 200:
                    jobs = response.json()
                    if any(j["id"] == job_id for j in jobs):
                        print_success("Verified job was added to the jobs list")
                    else:
                        print_failure("Created job not found in jobs list")
                        return False
                else:
                    print_failure(f"Failed to verify job creation: {response.status_code}")
                    return False
                
                return True
            else:
                print_failure("Create scraping job returned unexpected data")
                return False
        else:
            print_failure(f"Create scraping job endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing create scraping job endpoint: {str(e)}")
        return False

def test_market_check_pricing() -> bool:
    """Test the market check pricing endpoint"""
    print_test_header("Market Check Pricing Endpoint")
    
    try:
        # Test with valid API key
        params = {
            "make": "Toyota",
            "model": "Camry",
            "year": 2020,
            "mileage": 30000,
            "api_key": API_KEY
        }
        
        response = requests.post(f"{API_URL}/market-check/pricing", params=params)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if "pricing" in data and "sample_size" in data:
                print_success("Market check pricing endpoint returned correct data structure")
            else:
                print_failure("Market check pricing endpoint returned unexpected data")
                return False
        else:
            print_failure(f"Market check pricing endpoint returned status code {response.status_code}")
            return False
        
        # Test with invalid API key
        params["api_key"] = "invalid-key"
        response = requests.post(f"{API_URL}/market-check/pricing", params=params)
        print_response(response)
        
        if response.status_code == 401:
            print_success("Market check pricing correctly rejected invalid API key")
        else:
            print_failure(f"Market check pricing did not properly validate API key (expected 401, got {response.status_code})")
            return False
        
        return True
    except Exception as e:
        print_failure(f"Error testing market check pricing endpoint: {str(e)}")
        return False

def test_database_verification() -> bool:
    """Verify database population through API endpoints"""
    print_test_header("Database Verification")
    
    try:
        # Check vehicles
        response = requests.get(f"{API_URL}/customer/vehicles")
        if response.status_code != 200:
            print_failure(f"Failed to get vehicles: {response.status_code}")
            return False
        
        vehicles = response.json()
        print_info(f"Found {len(vehicles)} vehicles in database")
        
        if len(vehicles) == 8:
            print_success("Expected number of vehicles (8) found")
        else:
            print_warning(f"Expected 8 vehicles, but found {len(vehicles)}")
        
        # Check vehicle data structure
        if vehicles:
            vehicle = vehicles[0]
            print_info("Sample vehicle data:")
            print(json.dumps(vehicle, indent=2))
            
            required_fields = [
                "id", "make", "model", "year", "price", "mileage", "condition",
                "dealer_id", "dealer_name"
            ]
            
            missing_fields = [field for field in required_fields if field not in vehicle]
            
            if not missing_fields:
                print_success("Vehicle data structure matches Pydantic models")
            else:
                print_failure(f"Vehicle data missing required fields: {', '.join(missing_fields)}")
                return False
        
        # Check dealers through admin stats
        response = requests.get(f"{API_URL}/admin/stats")
        if response.status_code != 200:
            print_failure(f"Failed to get admin stats: {response.status_code}")
            return False
        
        stats = response.json()
        print_info(f"Found {stats.get('total_dealers', 0)} dealers in database")
        
        if stats.get("total_dealers") == 8:
            print_success("Expected number of dealers (8) found")
        else:
            print_warning(f"Expected 8 dealers, but found {stats.get('total_dealers', 0)}")
        
        return True
    except Exception as e:
        print_failure(f"Error verifying database: {str(e)}")
        return False

def run_all_tests() -> None:
    """Run all tests and print a summary"""
    print(f"\n{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.BOLD} PULSE AUTO MARKET API TESTING{Colors.ENDC}")
    print(f"{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")
    
    print(f"Testing backend API at: {API_URL}\n")
    
    tests = [
        ("Health Check & System Status - Health Endpoint", test_health_check),
        ("Health Check & System Status - Root Endpoint", test_root_endpoint),
        ("Customer Interface APIs - Vehicle Listing", test_customer_vehicles),
        ("Customer Interface APIs - Search Functionality", test_search_functionality),
        ("Customer Interface APIs - Makes Listing", test_makes_endpoint),
        ("Customer Interface APIs - Models by Make", test_models_by_make_endpoint),
        ("Customer Interface APIs - Vehicle Details", test_vehicle_details_endpoint),
        ("Admin Interface APIs - Stats", test_admin_stats_endpoint),
        ("Admin Interface APIs - Scraping Jobs Listing", test_scraping_jobs_endpoint),
        ("Admin Interface APIs - Create Scraping Job", test_create_scraping_job),
        ("Market Check API - Pricing", test_market_check_pricing),
        ("Database Verification", test_database_verification)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{Colors.BOLD}Running test: {test_name}{Colors.ENDC}")
        result = test_func()
        results[test_name] = result
    
    # Print summary
    print(f"\n\n{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.BOLD} TEST SUMMARY{Colors.ENDC}")
    print(f"{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")
    
    passed = 0
    failed = 0
    
    for test_name, result in results.items():
        if result:
            print(f"{Colors.OKGREEN}✓ PASSED: {test_name}{Colors.ENDC}")
            passed += 1
        else:
            print(f"{Colors.FAIL}✗ FAILED: {test_name}{Colors.ENDC}")
            failed += 1
    
    print(f"\n{Colors.BOLD}Summary: {passed} passed, {failed} failed{Colors.ENDC}")
    
    if failed == 0:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}All tests passed successfully!{Colors.ENDC}")
    else:
        print(f"\n{Colors.FAIL}{Colors.BOLD}Some tests failed. Please check the logs for details.{Colors.ENDC}")

if __name__ == "__main__":
    run_all_tests()