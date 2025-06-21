import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Header Component with Logo and Navigation
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Service & Repairs', path: '/service' },
    { name: 'Dealer Portal', path: '/dealer' },
    { name: 'Admin', path: '/admin' }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pulse Auto Market</h1>
              <p className="text-sm text-gray-600">Your Trusted Car Marketplace</p>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Hamburger Menu Button - Visible on mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Hero Section with Search
const HeroSection = ({ onSearch, filters, onFilterChange }) => {
  return (
    <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Tagline */}
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Find Your Perfect Vehicle
        </h2>
        <p className="text-xl md:text-2xl text-blue-200 mb-12">
          Thousands of quality cars from trusted dealers nationwide
        </p>

        {/* Main Search Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {/* Make Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.make}
                  onChange={(e) => onFilterChange('make', e.target.value)}
                >
                  <option value="">Any Make</option>
                  <option value="Ford">Ford</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Jeep">Jeep</option>
                </select>
              </div>

              {/* Model Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  placeholder="e.g., Camry, F-150"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.model}
                  onChange={(e) => onFilterChange('model', e.target.value)}
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.price_max}
                  onChange={(e) => onFilterChange('price_max', e.target.value)}
                >
                  <option value="">Any Price</option>
                  <option value="15000">Under $15,000</option>
                  <option value="25000">Under $25,000</option>
                  <option value="35000">Under $35,000</option>
                  <option value="50000">Under $50,000</option>
                  <option value="75000">Under $75,000</option>
                  <option value="100000">Under $100,000</option>
                </select>
              </div>

              {/* Mileage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Mileage</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.mileage_max}
                  onChange={(e) => onFilterChange('mileage_max', e.target.value)}
                >
                  <option value="">Any Mileage</option>
                  <option value="10000">Under 10,000 miles</option>
                  <option value="25000">Under 25,000 miles</option>
                  <option value="50000">Under 50,000 miles</option>
                  <option value="75000">Under 75,000 miles</option>
                  <option value="100000">Under 100,000 miles</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={onSearch}
              className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Search Vehicles
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Professional Vehicle Card
const VehicleCard = ({ vehicle }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Vehicle Image */}
      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img 
            src={vehicle.images[0]} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x320/f8fafc/64748b?text=${vehicle.year}+${vehicle.make}+${vehicle.model}`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {vehicle.year} {vehicle.make}
              </div>
              <div className="text-lg text-blue-500">{vehicle.model}</div>
            </div>
          </div>
        )}
        
        {/* Deal Badge */}
        {vehicle.deal_pulse_rating === "Great Deal" && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            🔥 Great Deal
          </div>
        )}

        {/* Image Count */}
        {vehicle.images && vehicle.images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            📷 {vehicle.images.length} photos
          </div>
        )}
      </div>

      {/* Vehicle Details */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {vehicle.year} {vehicle.make} {vehicle.model}
          {vehicle.trim && <span className="text-gray-600 font-normal"> {vehicle.trim}</span>}
        </h3>

        {/* Price and Mileage */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-3xl font-bold text-green-600">
            {formatPrice(vehicle.price)}
          </div>
          <div className="text-lg text-gray-600">
            {formatMileage(vehicle.mileage)} mi
          </div>
        </div>

        {/* Vehicle Specs */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-6">
          {vehicle.exterior_color && (
            <div><span className="font-medium">Color:</span> {vehicle.exterior_color}</div>
          )}
          {vehicle.transmission && (
            <div><span className="font-medium">Trans:</span> {vehicle.transmission}</div>
          )}
          {vehicle.fuel_type && (
            <div><span className="font-medium">Fuel:</span> {vehicle.fuel_type}</div>
          )}
          {vehicle.drivetrain && (
            <div><span className="font-medium">Drive:</span> {vehicle.drivetrain}</div>
          )}
        </div>

        {/* Dealer Info */}
        <div className="border-t pt-4 mb-6">
          <div className="font-semibold text-gray-900">{vehicle.dealer_name}</div>
          {vehicle.dealer_city && vehicle.dealer_state && (
            <div className="text-sm text-gray-600">{vehicle.dealer_city}, {vehicle.dealer_state}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            View Details
          </button>
          <button className="flex-1 border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            Contact Dealer
          </button>
        </div>
      </div>
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    price_max: '',
    mileage_max: ''
  });

  useEffect(() => {
    loadFeaturedVehicles();
  }, []);

  const loadFeaturedVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/vehicles?limit=12`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchVehicles();
  };

  const searchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API}/vehicles?${params}&limit=20`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <HeroSection 
        onSearch={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {loading ? 'Loading...' : `${vehicles.length} Vehicles Available`}
          </h3>
          <p className="text-gray-600">
            Find your perfect vehicle from our trusted dealer network
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching for the best vehicles...</p>
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && vehicles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id || vehicle.vin} vehicle={vehicle} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && vehicles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0012 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No vehicles found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your search criteria or browse all inventory.</p>
            <button
              onClick={() => {
                setFilters({ make: '', model: '', price_max: '', mileage_max: '' });
                loadFeaturedVehicles();
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View All Vehicles
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// Inventory Page
const InventoryPage = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Vehicle Inventory</h1>
      <p className="text-gray-600">Browse our complete inventory of quality vehicles.</p>
    </div>
  </div>
);

// Service Page
const ServicePage = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Service & Repairs</h1>
      <p className="text-gray-600">Find trusted service centers and repair shops in your area.</p>
    </div>
  </div>
);

// Dealer Portal
const DealerPortal = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dealer Portal</h1>
      <p className="text-gray-600">Manage your inventory and dealer account.</p>
    </div>
  </div>
);

// Admin Portal
const AdminPortal = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <p className="text-gray-600">System administration and management.</p>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/dealer" element={<DealerPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;