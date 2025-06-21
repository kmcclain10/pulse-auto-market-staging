import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Professional Vehicle Card Component
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      {/* Vehicle Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img 
            src={vehicle.images[0]} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x300/f3f4f6/6b7280?text=${vehicle.year}+${vehicle.make}+${vehicle.model}`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {vehicle.year} {vehicle.make}
              </div>
              <div className="text-lg text-blue-500">{vehicle.model}</div>
            </div>
          </div>
        )}
        
        {/* Deal Badge */}
        {vehicle.deal_pulse_rating === "Great Deal" && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Great Deal
          </div>
        )}
      </div>

      {/* Vehicle Details */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {vehicle.year} {vehicle.make} {vehicle.model}
          {vehicle.trim && <span className="text-gray-600"> {vehicle.trim}</span>}
        </h3>

        {/* Price and Mileage */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(vehicle.price)}
          </div>
          <div className="text-gray-600">
            {formatMileage(vehicle.mileage)} miles
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {vehicle.exterior_color && (
            <div>Color: {vehicle.exterior_color}</div>
          )}
          {vehicle.transmission && (
            <div>Transmission: {vehicle.transmission}</div>
          )}
          {vehicle.fuel_type && (
            <div>Fuel: {vehicle.fuel_type}</div>
          )}
        </div>

        {/* Dealer Info */}
        <div className="border-t pt-3 mb-4">
          <div className="text-sm font-medium text-gray-900">{vehicle.dealer_name}</div>
          {vehicle.dealer_city && vehicle.dealer_state && (
            <div className="text-sm text-gray-600">{vehicle.dealer_city}, {vehicle.dealer_state}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            View Details
          </button>
          <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
            Contact Dealer
          </button>
        </div>
      </div>
    </div>
  );
};

// Search Filters Component
const SearchFilters = ({ filters, onFilterChange, onSearch, makes }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Find Your Perfect Vehicle</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <select 
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.make}
          onChange={(e) => onFilterChange('make', e.target.value)}
        >
          <option value="">All Makes</option>
          {makes.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Model (e.g., F-150)"
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.model}
          onChange={(e) => onFilterChange('model', e.target.value)}
        />
        
        <input
          type="number"
          placeholder="Max Price"
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.price_max}
          onChange={(e) => onFilterChange('price_max', e.target.value)}
        />
        
        <input
          type="number"
          placeholder="Max Mileage"
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.mileage_max}
          onChange={(e) => onFilterChange('mileage_max', e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onSearch}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Search Vehicles
        </button>
        
        <button
          onClick={() => onFilterChange('reset')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

// Main Marketplace Component
const Marketplace = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    price_max: '',
    mileage_max: ''
  });
  const [makes, setMakes] = useState([]);

  useEffect(() => {
    loadMakes();
    searchVehicles();
  }, []);

  const loadMakes = async () => {
    try {
      const response = await axios.get(`${API}/vehicles/search/makes`);
      setMakes(response.data.makes || []);
    } catch (error) {
      console.error('Error loading makes:', error);
    }
  };

  const searchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API}/vehicles?${params}`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        make: '',
        model: '',
        price_max: '',
        mileage_max: ''
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">Pulse Auto Market</h1>
              <span className="text-sm text-gray-600">Find Your Perfect Vehicle</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {vehicles.length.toLocaleString()} vehicles available
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filters */}
        <SearchFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={searchVehicles}
          makes={makes}
        />

        {/* Results Count */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {loading ? 'Searching...' : `${vehicles.length} Vehicles Found`}
          </h3>
          {vehicles.length > 0 && (
            <p className="text-gray-600 mt-1">
              Showing vehicles from trusted dealers nationwide
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Finding the best vehicles for you...</p>
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id || vehicle.vin} vehicle={vehicle} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && vehicles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria to see more results.</p>
            <button
              onClick={() => handleFilterChange('reset')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Pulse Auto Market</h3>
            <p className="text-gray-400">Find your perfect vehicle from trusted dealers nationwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Hidden Admin Access (for internal use only)
const AdminAccess = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
        <div className="space-y-4">
          <a 
            href="/dealer" 
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Dealer Portal
          </a>
          <a 
            href="/admin" 
            className="block w-full bg-gray-600 text-white text-center py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            System Admin
          </a>
        </div>
      </div>
    </div>
  );
};

// Simple Admin/Dealer Components (placeholder)
const DealerPortal = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold mb-6">Dealer Portal</h1>
    <p className="text-gray-600">Dealer management interface would go here.</p>
  </div>
);

const AdminPortal = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
    <p className="text-gray-600">Admin interface would go here.</p>
  </div>
);

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/admin-access" element={<AdminAccess />} />
          <Route path="/dealer" element={<DealerPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;