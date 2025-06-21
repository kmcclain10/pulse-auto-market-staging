import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const CUSTOMER_API = `${BACKEND_URL}/api/customer`;
const DEALER_API = `${BACKEND_URL}/api/dealer`;
const ADMIN_API = `${BACKEND_URL}/api/admin`;

// Interface Selection Component
const InterfaceSelector = () => {
  const location = useLocation();
  
  const interfaces = [
    { path: '/customer', name: 'Customer Portal', icon: '🚗', description: 'Browse & Search Vehicles' },
    { path: '/dealer', name: 'Dealer Portal', icon: '🏢', description: 'Manage Inventory' },
    { path: '/admin', name: 'Admin Dashboard', icon: '⚙️', description: 'System Management' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pulse Auto Market
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Complete Automotive Data Platform - Select Your Interface
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
            <p className="text-white text-sm">
              🚀 <strong>1M+ Vehicles</strong> | 💰 <strong>API Monetization Ready</strong> | 🔍 <strong>Scraper-as-Engine</strong>
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {interfaces.map((interfaceItem) => (
            <Link
              key={interfaceItem.path}
              to={interfaceItem.path}
              className="group block"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="text-6xl mb-4">{interface.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {interface.name}
                </h3>
                <p className="text-blue-200 mb-4">
                  {interface.description}
                </p>
                <div className="inline-flex items-center text-white font-medium group-hover:text-blue-200 transition-colors">
                  Enter Portal
                  <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
            <SystemStatus />
          </div>
        </div>
      </div>
    </div>
  );
};

// System Status Component
const SystemStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${API}/health`);
        setStatus({ healthy: true, ...response.data });
      } catch (error) {
        setStatus({ healthy: false, error: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-blue-200">Checking system status...</div>;
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className={`w-3 h-3 rounded-full ${status?.healthy ? 'bg-green-400' : 'bg-red-400'}`}></div>
      <span className="text-white">
        {status?.healthy ? '✅ All Systems Operational' : '❌ System Issues Detected'}
      </span>
    </div>
  );
};

// Customer Portal Component
const CustomerPortal = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    year_min: '',
    year_max: '',
    price_min: '',
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
      const response = await axios.get(`${CUSTOMER_API}/makes`);
      setMakes(response.data);
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
      
      const response = await axios.get(`${CUSTOMER_API}/vehicles?${params}`);
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
      <NavBar title="Customer Portal" icon="🚗" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Find Your Perfect Vehicle</h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <select 
              className="border rounded-lg px-3 py-2"
              value={filters.make}
              onChange={(e) => handleFilterChange('make', e.target.value)}
            >
              <option value="">All Makes</option>
              {makes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Model"
              className="border rounded-lg px-3 py-2"
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Min Year"
              className="border rounded-lg px-3 py-2"
              value={filters.year_min}
              onChange={(e) => handleFilterChange('year_min', e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Max Year"
              className="border rounded-lg px-3 py-2"
              value={filters.year_max}
              onChange={(e) => handleFilterChange('year_max', e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Min Price"
              className="border rounded-lg px-3 py-2"
              value={filters.price_min}
              onChange={(e) => handleFilterChange('price_min', e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Max Price"
              className="border rounded-lg px-3 py-2"
              value={filters.price_max}
              onChange={(e) => handleFilterChange('price_max', e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Max Mileage"
              className="border rounded-lg px-3 py-2"
              value={filters.mileage_max}
              onChange={(e) => handleFilterChange('mileage_max', e.target.value)}
            />
            
            <button
              onClick={searchVehicles}
              className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Vehicle Results */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold">
            {loading ? 'Searching...' : `${vehicles.length} Vehicles Found`}
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading vehicles...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        {vehicles.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No vehicles found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Vehicle Card Component
const VehicleCard = ({ vehicle }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {vehicle.images && vehicle.images.length > 0 ? (
        <img 
          src={vehicle.images[0]} 
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No Image Available</span>
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.trim && (
          <p className="text-gray-600 mb-2">{vehicle.trim}</p>
        )}
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-green-600">
            ${vehicle.price.toLocaleString()}
          </span>
          <span className="text-gray-600">
            {vehicle.mileage.toLocaleString()} miles
          </span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span className="capitalize">{vehicle.condition}</span>
          {vehicle.exterior_color && (
            <span>{vehicle.exterior_color}</span>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          <p>{vehicle.dealer_name}</p>
          {vehicle.dealer_city && vehicle.dealer_state && (
            <p>{vehicle.dealer_city}, {vehicle.dealer_state}</p>
          )}
        </div>
        
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

// Dealer Portal Component
const DealerPortal = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadDealerVehicles();
  }, []);

  const loadDealerVehicles = async () => {
    try {
      // For demo, using a mock dealer ID
      const response = await axios.get(`${DEALER_API}/vehicles?dealer_id=demo-dealer`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title="Dealer Portal" icon="🏢" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold">My Inventory</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Vehicle
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Inventory</h3>
            <p className="text-3xl font-bold text-blue-600">{vehicles.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Active Listings</h3>
            <p className="text-3xl font-bold text-green-600">
              {vehicles.filter(v => v.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Pending Sales</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {vehicles.filter(v => v.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Sold</h3>
            <p className="text-3xl font-bold text-gray-600">
              {vehicles.filter(v => v.status === 'sold').length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading inventory...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Vehicle Listings</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map(vehicle => (
                    <tr key={vehicle.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          {vehicle.trim && <p className="text-sm text-gray-500">{vehicle.trim}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        ${vehicle.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.mileage.toLocaleString()} mi
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                          vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          vehicle.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {vehicles.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No vehicles in inventory. Start by adding your first vehicle!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [scrapingJobs, setScrapingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsResponse, jobsResponse] = await Promise.all([
        axios.get(`${ADMIN_API}/stats`),
        axios.get(`${ADMIN_API}/scraping-jobs`)
      ]);
      
      setStats(statsResponse.data);
      setScrapingJobs(jobsResponse.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScrapingJob = async () => {
    try {
      await axios.post(`${ADMIN_API}/scraping-jobs`, {
        source: 'autotrader',
        target_url: 'https://www.autotrader.com/cars-for-sale',
        filters: {}
      });
      
      // Reload jobs
      loadAdminData();
    } catch (error) {
      console.error('Error starting scraping job:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title="Admin Dashboard" icon="⚙️" />
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Total Vehicles</h3>
                <p className="text-3xl font-bold text-blue-600">{stats?.total_vehicles || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Active Dealers</h3>
                <p className="text-3xl font-bold text-green-600">{stats?.total_dealers || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Recent Vehicles</h3>
                <p className="text-3xl font-bold text-purple-600">{stats?.recent_vehicles || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Jobs Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats?.scraping_jobs_pending || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Jobs Running</h3>
                <p className="text-3xl font-bold text-orange-600">{stats?.scraping_jobs_running || 0}</p>
              </div>
            </div>

            {/* Scraping Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Scraper Engine Control</h3>
                <button
                  onClick={startScrapingJob}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start AutoTrader Scraping
                </button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  🚀 <strong>Scraper-as-Engine Architecture:</strong> Our system can process 1M+ vehicles 
                  from AutoTrader and other sources. Each scraping job runs in the background and 
                  automatically updates the vehicle database with real images and data.
                </p>
              </div>
            </div>

            {/* Scraping Jobs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Recent Scraping Jobs</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicles Found</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scrapingJobs.map(job => (
                      <tr key={job.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {job.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.vehicles_found}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {scrapingJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No scraping jobs yet. Start your first job to begin collecting vehicle data!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Navigation Bar Component
const NavBar = ({ title, icon }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <span className="text-2xl">{icon}</span>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Pulse Auto Market</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InterfaceSelector />} />
          <Route path="/customer/*" element={<CustomerPortal />} />
          <Route path="/dealer/*" element={<DealerPortal />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;