import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
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
    { name: 'Dealer Portal', path: '/dealer-auth' },
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

          {/* Desktop Navigation */}
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

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// Dealer Authentication Page
const DealerAuth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    dealerName: '',
    phone: '',
    website: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignIn) {
      // For demo, navigate to dealer portal
      navigate('/dealer-portal');
    } else {
      // Sign up - create lead and send to pricing
      navigate('/dealer-pricing');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignIn ? 'Sign in to your account' : 'Join our dealer network'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignIn ? 'Access your dealer portal' : 'Start selling more cars today'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isSignIn && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dealership Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dealerName}
                    onChange={(e) => setFormData({...formData, dealerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website (optional)</label>
                  <input
                    type="url"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSignIn ? 'Sign In' : 'Start Free Trial'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isSignIn ? "Don't have an account?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="w-full text-center text-blue-600 hover:text-blue-500 font-medium"
              >
                {isSignIn ? 'Join our dealer network' : 'Sign in to existing account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dealer Pricing Page
const DealerPricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: 99,
      features: ["Up to 50 vehicles", "Basic CRM", "Email support", "Standard listings"]
    },
    {
      name: "Professional",
      price: 199,
      features: ["Up to 200 vehicles", "AI CRM with lead scoring", "Desking tools", "Premium listings", "Phone support"]
    },
    {
      name: "Enterprise",
      price: 399,
      features: ["Unlimited vehicles", "Full AI CRM suite", "Advanced desking", "API access", "Priority support", "Custom integrations"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Start with a 90-day free trial, then choose the plan that fits your dealership
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-base text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/dealer-portal')}
                className="mt-8 w-full bg-blue-600 border border-transparent rounded-md py-3 px-6 text-center font-medium text-white hover:bg-blue-700"
              >
                Start Free Trial
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dealer Portal with Sidebar
const DealerPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'inventory', name: 'Inventory', icon: '🚗' },
    { id: 'crm', name: 'AI CRM', icon: '🤖' },
    { id: 'desking', name: 'Desking Tool', icon: '💰' },
    { id: 'leads', name: 'Leads', icon: '📈' },
    { id: 'subscription', name: 'Subscription', icon: '💳' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Dealer Portal</h2>
          <p className="text-sm text-gray-600">Welcome back, John's Auto</p>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                activeTab === item.id ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'inventory' && <InventoryContent />}
        {activeTab === 'crm' && <CRMContent />}
        {activeTab === 'desking' && <DeskingContent />}
        {activeTab === 'leads' && <LeadsContent />}
        {activeTab === 'subscription' && <SubscriptionContent />}
        {activeTab === 'settings' && <SettingsContent />}
      </div>
    </div>
  );
};

// Dashboard Content
const DashboardContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Total Inventory</h3>
        <p className="text-3xl font-bold text-blue-600">127</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Active Leads</h3>
        <p className="text-3xl font-bold text-green-600">23</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Deals in Progress</h3>
        <p className="text-3xl font-bold text-orange-600">8</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Monthly Revenue</h3>
        <p className="text-3xl font-bold text-purple-600">$47K</p>
      </div>
    </div>
  </div>
);

// Inventory Management Content
const InventoryContent = () => (
  <div>
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Add Vehicle
      </button>
    </div>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Vehicles</h3>
        <p className="text-gray-600">Manage your vehicle inventory, pricing, and listings.</p>
      </div>
    </div>
  </div>
);

// AI CRM Content
const CRMContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">AI CRM System</h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🤖 AI Lead Scoring</h3>
        <p className="text-gray-600">Our AI automatically scores and prioritizes your leads based on likelihood to purchase.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📧 Auto-Responses</h3>
        <p className="text-gray-600">AI generates personalized responses to customer inquiries in real-time.</p>
      </div>
    </div>
  </div>
);

// Advanced Desking Tool Content
const DeskingContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Advanced Desking Tool</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">💰 Deal Calculator</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Price</label>
          <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="$25,000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
          <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="$5,000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate %</label>
          <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="6.5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Term (months)</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>36</option>
            <option>48</option>
            <option>60</option>
            <option>72</option>
          </select>
        </div>
      </div>
      <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Calculate Payment
      </button>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Features Include:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Tax calculations by state/county</li>
          <li>• Multiple lender rate comparison</li>
          <li>• F&I product integration</li>
          <li>• E-signature capability</li>
          <li>• Payment grid generation</li>
        </ul>
      </div>
    </div>
  </div>
);

// Leads Content
const LeadsContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Lead Management</h1>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Leads</h3>
        <p className="text-gray-600">Track and manage customer inquiries and follow-ups.</p>
      </div>
    </div>
  </div>
);

// Subscription Content
const SubscriptionContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Management</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Current Plan: Professional</h3>
          <p className="text-gray-600">$199/month • Next billing: March 15, 2024</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Upgrade Plan
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Usage This Month</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Vehicles Listed: 127/200</li>
            <li>AI Responses: 1,234/5,000</li>
            <li>Lead Scoring: 456/2,000</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Features Included</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ AI CRM with lead scoring</li>
            <li>✓ Advanced desking tools</li>
            <li>✓ Premium listings</li>
            <li>✓ Phone support</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// Settings Content
const SettingsContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Dealership Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dealership Name</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="John's Auto Sales" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="(555) 123-4567" />
        </div>
      </div>
    </div>
  </div>
);

// Vehicle Card Component (Enhanced)
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
              // Use a more realistic placeholder
              e.target.src = `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center&auto=format&q=60`;
            }}
          />
        ) : (
          <img 
            src={`https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center&auto=format&q=60`}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Deal Badge */}
        {vehicle.deal_pulse_rating === "Great Deal" && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            🔥 Great Deal
          </div>
        )}
      </div>

      {/* Vehicle Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {vehicle.year} {vehicle.make} {vehicle.model}
          {vehicle.trim && <span className="text-gray-600 font-normal"> {vehicle.trim}</span>}
        </h3>

        <div className="flex justify-between items-center mb-4">
          <div className="text-3xl font-bold text-green-600">
            {formatPrice(vehicle.price)}
          </div>
          <div className="text-lg text-gray-600">
            {formatMileage(vehicle.mileage)} mi
          </div>
        </div>

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

        <div className="border-t pt-4 mb-6">
          <div className="font-semibold text-gray-900">{vehicle.dealer_name}</div>
          {vehicle.dealer_city && vehicle.dealer_state && (
            <div className="text-sm text-gray-600">{vehicle.dealer_city}, {vehicle.dealer_state}</div>
          )}
        </div>

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

// Home Page with Featured Inventory
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
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Vehicle
          </h2>
          <p className="text-xl md:text-2xl text-blue-200 mb-12">
            Thousands of quality cars from trusted dealers nationwide
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    placeholder="e.g., Camry, F-150"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.model}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.price_max}
                    onChange={(e) => handleFilterChange('price_max', e.target.value)}
                  >
                    <option value="">Any Price</option>
                    <option value="15000">Under $15,000</option>
                    <option value="25000">Under $25,000</option>
                    <option value="35000">Under $35,000</option>
                    <option value="50000">Under $50,000</option>
                    <option value="75000">Under $75,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Mileage</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.mileage_max}
                    onChange={(e) => handleFilterChange('mileage_max', e.target.value)}
                  >
                    <option value="">Any Mileage</option>
                    <option value="10000">Under 10,000 miles</option>
                    <option value="25000">Under 25,000 miles</option>
                    <option value="50000">Under 50,000 miles</option>
                    <option value="100000">Under 100,000 miles</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Search Vehicles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Inventory */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {loading ? 'Loading...' : `${vehicles.length} Quality Vehicles Available`}
          </h3>
          <p className="text-gray-600">
            Browse our featured inventory from trusted dealers
          </p>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        )}

        {!loading && vehicles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id || vehicle.vin} vehicle={vehicle} />
            ))}
          </div>
        )}

        {!loading && vehicles.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No vehicles found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your search criteria.</p>
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

// Other page components (simplified for now)
const InventoryPage = () => <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Inventory</h1></div></div>;
const ServicePage = () => <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-gray-900 mb-6">Service & Repairs</h1></div></div>;
// Admin Portal with Real-time Scraper Status
const AdminPortal = () => {
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkScrapeStatus();
    const interval = setInterval(checkScrapeStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkScrapeStatus = async () => {
    try {
      const response = await axios.get(`${API}/admin/scrape-status`);
      setScrapeStatus(response.data);
    } catch (error) {
      console.error('Error checking scrape status:', error);
    }
  };

  const startDealerScraping = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/scrape-dealers`);
      alert(`Started scraping 50 dealers! ETA: ${response.data.estimated_time}`);
      checkScrapeStatus();
    } catch (error) {
      alert('Failed to start scraping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Scraper Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Multi-Dealer Scraper</h2>
            <div className="flex items-center space-x-3">
              {scrapeStatus?.is_running ? (
                <span className="flex items-center text-green-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Scraping in Progress
                </span>
              ) : (
                <span className="flex items-center text-gray-500">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  Idle
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Target Dealers</h3>
              <p className="text-3xl font-bold text-blue-600">50</p>
              <p className="text-sm text-blue-600">Across 5 states</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Current Inventory</h3>
              <p className="text-3xl font-bold text-green-600">{scrapeStatus?.current_vehicles || 0}</p>
              <p className="text-sm text-green-600">Vehicles in database</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Status</h3>
              <p className="text-lg font-bold text-purple-600">
                {scrapeStatus?.is_running ? 'Active' : 'Ready'}
              </p>
              <p className="text-sm text-purple-600">
                {scrapeStatus?.is_running ? 'Scraping websites...' : 'Ready to scrape'}
              </p>
            </div>
          </div>

          {/* Control Button */}
          <div className="mb-6">
            <button
              onClick={startDealerScraping}
              disabled={loading || scrapeStatus?.is_running}
              className={`px-6 py-3 rounded-lg font-medium ${
                loading || scrapeStatus?.is_running
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Starting...' : scrapeStatus?.is_running ? 'Scraping in Progress...' : 'Start Multi-Dealer Scraping'}
            </button>
          </div>

          {/* Live Log Output */}
          {scrapeStatus?.log_output && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              <h4 className="text-white font-bold mb-2">Live Scraper Output:</h4>
              <pre className="whitespace-pre-wrap">{scrapeStatus.log_output}</pre>
            </div>
          )}
        </div>

        {/* Dealer List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Target Dealers by State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Georgia (10)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Atlanta Auto Max</li>
                <li>• Motor Max</li>
                <li>• Atlanta Used Cars</li>
                <li>• Gravity Autos Roswell</li>
                <li>• Select Luxury Motors</li>
                <li>• + 5 more dealers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Tennessee (10)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• City Auto Sales</li>
                <li>• Auto Universe</li>
                <li>• Dixie Motors</li>
                <li>• East Tennessee Auto Outlet</li>
                <li>• Budget Auto Sales</li>
                <li>• + 5 more dealers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Alabama (10)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Birmingham Auto Auction</li>
                <li>• Serra Used Cars</li>
                <li>• Auto Mart</li>
                <li>• Highline Imports</li>
                <li>• + 6 more dealers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Florida (10)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Off Lease Only</li>
                <li>• Tropical Auto Sales</li>
                <li>• Auto Buying Center</li>
                <li>• Miami Imports</li>
                <li>• + 6 more dealers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Kentucky (10)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto Max of Louisville</li>
                <li>• Louisville Auto Center</li>
                <li>• Prime Auto Sales</li>
                <li>• Bluegrass Auto Sales</li>
                <li>• + 6 more dealers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          <Route path="/dealer-auth" element={<DealerAuth />} />
          <Route path="/dealer-pricing" element={<DealerPricing />} />
          <Route path="/dealer-portal" element={<DealerPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;