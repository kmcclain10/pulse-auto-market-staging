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
    email: 'demo@dealer.com',
    password: 'demo123',
    dealerName: '',
    phone: '',
    website: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Demo credentials for easy testing
    if (isSignIn && formData.email === 'demo@dealer.com' && formData.password === 'demo123') {
      navigate('/dealer-portal');
      return;
    }
    
    if (isSignIn) {
      alert('Demo Login: email: demo@dealer.com, password: demo123');
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
        
        {/* Demo Credentials Display */}
        {isSignIn && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
            <p className="text-sm text-blue-800 font-medium">Demo Login:</p>
            <p className="text-sm text-blue-600">Email: demo@dealer.com</p>
            <p className="text-sm text-blue-600">Password: demo123</p>
          </div>
        )}
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

// Dealer Portal with Enhanced Sidebar
const DealerPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', category: 'main' },
    { id: 'inventory', name: 'Inventory Manager', icon: '🚗', category: 'inventory' },
    { id: 'add-vehicle', name: 'Add Vehicle', icon: '➕', category: 'inventory' },
    { id: 'photos', name: 'Photo Manager', icon: '📸', category: 'inventory' },
    { id: 'pricing', name: 'Pricing Tools', icon: '💲', category: 'inventory' },
    { id: 'crm', name: 'Customer CRM', icon: '👥', category: 'sales' },
    { id: 'leads', name: 'Lead Management', icon: '📈', category: 'sales' },
    { id: 'desking', name: 'Desking Tool', icon: '🧮', category: 'sales' },
    { id: 'follow-up', name: 'Follow-Up Center', icon: '🔄', category: 'sales' },
    { id: 'calendar', name: 'Appointments', icon: '📅', category: 'sales' },
    { id: 'reports', name: 'Sales Reports', icon: '📊', category: 'analytics' },
    { id: 'analytics', name: 'Performance Analytics', icon: '📈', category: 'analytics' },
    { id: 'marketing', name: 'Marketing Tools', icon: '📢', category: 'marketing' },
    { id: 'website', name: 'Website Builder', icon: '🌐', category: 'marketing' },
    { id: 'social', name: 'Social Media', icon: '📱', category: 'marketing' },
    { id: 'finance', name: 'Finance Partners', icon: '🏦', category: 'tools' },
    { id: 'trade-in', name: 'Trade-In Tools', icon: '🔄', category: 'tools' },
    { id: 'warranty', name: 'Warranty Center', icon: '🛡️', category: 'tools' },
    { id: 'subscription', name: 'Subscription', icon: '💳', category: 'account' },
    { id: 'settings', name: 'Dealership Settings', icon: '⚙️', category: 'account' },
    { id: 'users', name: 'User Management', icon: '👤', category: 'account' },
    { id: 'support', name: 'Help & Support', icon: '❓', category: 'account' }
  ];

  const categories = {
    main: 'Overview',
    inventory: 'Inventory Management',
    sales: 'Sales & CRM',
    analytics: 'Analytics & Reports',
    marketing: 'Marketing & Website',
    tools: 'Business Tools',
    account: 'Account & Settings'
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-white shadow-xl">
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <h2 className="text-xl font-bold">Dealer Portal</h2>
          <p className="text-purple-200">Welcome back, John's Auto</p>
          <div className="mt-2 text-sm">
            <span className="bg-purple-500 px-2 py-1 rounded text-xs">Professional Plan</span>
          </div>
        </div>
        
        <nav className="overflow-y-auto h-full pb-20">
          {Object.entries(categories).map(([categoryKey, categoryName]) => (
            <div key={categoryKey} className="mb-2">
              <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {categoryName}
              </div>
              {sidebarItems
                .filter(item => item.category === categoryKey)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-6 py-3 text-left hover:bg-purple-50 transition-colors text-sm ${
                      activeTab === item.id 
                        ? 'bg-purple-50 border-r-4 border-purple-600 text-purple-600 font-medium' 
                        : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'inventory' && <InventoryManagerContent />}
          {activeTab === 'add-vehicle' && <AddVehicleContent />}
          {activeTab === 'photos' && <PhotoManagerContent />}
          {activeTab === 'pricing' && <PricingToolsContent />}
          {activeTab === 'crm' && <CRMContent />}
          {activeTab === 'leads' && <LeadsContent />}
          {activeTab === 'desking' && <DeskingContent />}
          {activeTab === 'follow-up' && <FollowUpContent />}
          {activeTab === 'calendar' && <CalendarContent />}
          {activeTab === 'reports' && <ReportsContent />}
          {activeTab === 'analytics' && <AnalyticsContent />}
          {activeTab === 'marketing' && <MarketingContent />}
          {activeTab === 'website' && <WebsiteBuilderContent />}
          {activeTab === 'social' && <SocialMediaContent />}
          {activeTab === 'finance' && <FinancePartnersContent />}
          {activeTab === 'trade-in' && <TradeInToolsContent />}
          {activeTab === 'warranty' && <WarrantyContent />}
          {activeTab === 'subscription' && <SubscriptionContent />}
          {activeTab === 'settings' && <SettingsContent />}
          {activeTab === 'users' && <UserManagementContent />}
          {activeTab === 'support' && <SupportContent />}
        </div>
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

// Enhanced Inventory Manager Content
const InventoryManagerContent = () => {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      year: 2022,
      make: "Ford",
      model: "F-150",
      trim: "XLT SuperCrew",
      vin: "1FTFW1E50NFA12345",
      stock_number: "F150-001",
      price: 42999,
      mileage: 15420,
      exterior_color: "Magnetic Metallic",
      interior_color: "Black",
      transmission: "10-Speed Automatic",
      drivetrain: "4WD",
      fuel_type: "Regular Unleaded V8",
      engine: "5.0L V8",
      mpg_city: 17,
      mpg_highway: 24,
      images: ["https://via.placeholder.com/800x600/6366f1/ffffff?text=Ford+F-150"],
      features: ["Heated Seats", "Backup Camera", "Bluetooth", "Remote Start"],
      description: "Clean, well-maintained F-150 with low miles. Perfect for work or family use.",
      status: "Available",
      days_on_lot: 12,
      views: 247,
      leads: 8
    },
    {
      id: 2,
      year: 2021,
      make: "Toyota",
      model: "Camry",
      trim: "LE",
      vin: "4T1G11AK3MU123456",
      stock_number: "CAM-002",
      price: 26995,
      mileage: 28350,
      exterior_color: "Midnight Black Metallic",
      interior_color: "Black",
      transmission: "8-Speed Automatic",
      drivetrain: "FWD",
      fuel_type: "Regular Unleaded I4",
      engine: "2.5L I4",
      mpg_city: 28,
      mpg_highway: 39,
      images: ["https://via.placeholder.com/800x600/6366f1/ffffff?text=Toyota+Camry"],
      features: ["Toyota Safety Sense", "Apple CarPlay", "Lane Keeping Assist"],
      description: "Reliable and fuel-efficient sedan with excellent safety ratings.",
      status: "Available",
      days_on_lot: 8,
      views: 156,
      leads: 5
    }
  ]);
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    make: 'all',
    price_range: 'all'
  });

  const handleViewVDP = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleEditVehicle = (vehicleId) => {
    // Handle edit functionality
    console.log('Edit vehicle:', vehicleId);
  };

  const handleDeleteVehicle = (vehicleId) => {
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Sold': return 'bg-blue-100 text-blue-800';
      case 'Hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Manager</h1>
          <p className="text-gray-600">Manage your vehicle listings and track performance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            🔍 Filters
          </button>
          <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all">
            ➕ Add Vehicle
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Inventory</h3>
          <p className="text-3xl font-bold text-purple-600">{vehicles.length}</p>
          <p className="text-sm text-green-600">+2 this week</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg Days on Lot</h3>
          <p className="text-3xl font-bold text-blue-600">18</p>
          <p className="text-sm text-blue-600">Industry avg: 24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Views</h3>
          <p className="text-3xl font-bold text-green-600">1,247</p>
          <p className="text-sm text-green-600">+15% this month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Leads</h3>
          <p className="text-3xl font-bold text-orange-600">23</p>
          <p className="text-sm text-orange-600">18% conversion</p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Sold">Sold</option>
              <option value="Hold">Hold</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filters.make}
              onChange={(e) => setFilters({...filters, make: e.target.value})}
            >
              <option value="all">All Makes</option>
              <option value="Ford">Ford</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Chevrolet">Chevrolet</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filters.price_range}
              onChange={(e) => setFilters({...filters, price_range: e.target.value})}
            >
              <option value="all">All Prices</option>
              <option value="under-20k">Under $20,000</option>
              <option value="20k-40k">$20,000 - $40,000</option>
              <option value="over-40k">Over $40,000</option>
            </select>
          </div>
        </div>
      )}

      {/* Vehicle Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden mr-4">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img
                            src={vehicle.images[0]}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">{vehicle.trim}</div>
                        <div className="text-sm text-gray-500">Stock: {vehicle.stock_number}</div>
                        <div className="text-sm text-gray-500">{vehicle.mileage?.toLocaleString()} mi</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold text-green-600">
                      ${vehicle.price?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {vehicle.days_on_lot} days on lot
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div>👁️ {vehicle.views} views</div>
                      <div>📧 {vehicle.leads} leads</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewVDP(vehicle)}
                        className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                      >
                        View VDP
                      </button>
                      <button
                        onClick={() => handleEditVehicle(vehicle.id)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Details Page Modal */}
      {selectedVehicle && (
        <VehicleDetailsPage 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
        />
      )}
    </div>
  );
};

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

// Additional Dealer Portal Content Components
const AddVehicleContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Vehicle</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">VIN</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Enter VIN to auto-populate" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Number</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>Ford</option>
            <option>Toyota</option>
            <option>Honda</option>
          </select>
        </div>
      </div>
      <button className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800">
        Save Vehicle
      </button>
    </div>
  </div>
);

const PhotoManagerContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Photo Manager</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📸 Upload & Manage Vehicle Photos</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-600">Drag and drop photos here or click to browse</p>
        <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Choose Photos
        </button>
      </div>
    </div>
  </div>
);

const PricingToolsContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Pricing Tools</h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">💲 Market Analysis</h3>
        <p className="text-gray-600">Get competitive pricing recommendations based on market data.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Price History</h3>
        <p className="text-gray-600">Track pricing changes and performance over time.</p>
      </div>
    </div>
  </div>
);

const FollowUpContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Follow-Up Center</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🔄 Automated Follow-Up Sequences</h3>
      <p className="text-gray-600">Manage customer follow-up campaigns and communications.</p>
    </div>
  </div>
);

const CalendarContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointments</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📅 Schedule Management</h3>
      <p className="text-gray-600">Manage test drives, appointments, and deliveries.</p>
    </div>
  </div>
);

const ReportsContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Reports</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Performance Reports</h3>
      <p className="text-gray-600">Detailed sales and performance analytics.</p>
    </div>
  </div>
);

const AnalyticsContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Performance Analytics</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📈 Advanced Analytics</h3>
      <p className="text-gray-600">Deep dive into your dealership performance metrics.</p>
    </div>
  </div>
);

const MarketingContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketing Tools</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📢 Marketing Campaigns</h3>
      <p className="text-gray-600">Create and manage marketing campaigns for your inventory.</p>
    </div>
  </div>
);

const WebsiteBuilderContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Website Builder</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🌐 Custom Website</h3>
      <p className="text-gray-600">Build and customize your dealership website.</p>
    </div>
  </div>
);

const SocialMediaContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Social Media</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📱 Social Media Management</h3>
      <p className="text-gray-600">Manage your social media presence and posts.</p>
    </div>
  </div>
);

const FinancePartnersContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Finance Partners</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🏦 Lending Partners</h3>
      <p className="text-gray-600">Manage relationships with finance and lending partners.</p>
    </div>
  </div>
);

const TradeInToolsContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Trade-In Tools</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🔄 Trade-In Valuations</h3>
      <p className="text-gray-600">Tools for appraising and managing trade-in vehicles.</p>
    </div>
  </div>
);

const WarrantyContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Warranty Center</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🛡️ Extended Warranties</h3>
      <p className="text-gray-600">Manage warranty products and coverage options.</p>
    </div>
  </div>
);

const UserManagementContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">👤 Team Access</h3>
      <p className="text-gray-600">Manage user access and permissions for your team.</p>
    </div>
  </div>
);

const SupportContent = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Help & Support</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">❓ Support Center</h3>
      <p className="text-gray-600">Get help and access training resources.</p>
    </div>
  </div>
);

// Vehicle Card Component (Enhanced)
const VehicleCard = ({ vehicle, onViewDetails }) => {
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
      {/* Vehicle Image - REAL DEALER PHOTOS ONLY */}
      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img 
            src={vehicle.images[0]} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {vehicle.year} {vehicle.make}
              </div>
              <div className="text-lg text-purple-500">{vehicle.model}</div>
              <div className="text-sm text-gray-500 mt-2">Real photo loading...</div>
            </div>
          </div>
        )}
        
        {/* Deal Badge */}
        {vehicle.deal_pulse_rating === "Great Deal" && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            🔥 Great Deal
          </div>
        )}
        
        {/* Photo Count */}
        {vehicle.images && vehicle.images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            📷 {vehicle.images.length}
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
          <button 
            onClick={() => onViewDetails && onViewDetails(vehicle)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg"
          >
            View Details
          </button>
          <button className="flex-1 border-2 border-purple-600 text-purple-600 py-3 px-4 rounded-lg hover:bg-purple-50 transition-colors font-medium">
            Contact Dealer
          </button>
        </div>
      </div>
    </div>
  );
};

// Industry-Standard Vehicle Details Page (VDP)
const VehicleDetailsPage = ({ vehicle, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

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

  const monthlyPayment = vehicle.price ? Math.round((vehicle.price * 0.02)) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h1>
            <p className="text-lg text-gray-600">Stock #{vehicle.stock_number || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 p-6">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
              {vehicle.images && vehicle.images.length > 0 ? (
                <img
                  src={vehicle.images[currentImageIndex]}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {vehicle.year} {vehicle.make}
                    </div>
                    <div className="text-xl text-purple-500">{vehicle.model}</div>
                  </div>
                </div>
              )}
              
              {/* Image Navigation */}
              {vehicle.images && vehicle.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : vehicle.images.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < vehicle.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                    {currentImageIndex + 1} / {vehicle.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {vehicle.images.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-16 rounded overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Price and Payment */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {formatPrice(vehicle.price)}
              </div>
              <div className="text-lg text-gray-700">
                Est. ${monthlyPayment}/mo
              </div>
              <div className="text-sm text-gray-500">
                Based on 60 months at 6.9% APR
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Mileage</div>
                <div className="text-xl font-semibold">{formatMileage(vehicle.mileage)} mi</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Exterior Color</div>
                <div className="text-xl font-semibold">{vehicle.exterior_color || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Transmission</div>
                <div className="text-xl font-semibold">{vehicle.transmission || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Drivetrain</div>
                <div className="text-xl font-semibold">{vehicle.drivetrain || 'N/A'}</div>
              </div>
            </div>

            {/* Vehicle Description */}
            {vehicle.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{vehicle.description}</p>
              </div>
            )}

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Features & Options</h3>
                <div className="grid grid-cols-2 gap-2">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dealer Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Dealer Information</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="font-semibold text-purple-900">{vehicle.dealer_name}</div>
                {vehicle.dealer_city && vehicle.dealer_state && (
                  <div className="text-purple-700">{vehicle.dealer_city}, {vehicle.dealer_state}</div>
                )}
                {vehicle.dealer_phone && (
                  <div className="text-purple-700">{vehicle.dealer_phone}</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold text-lg shadow-lg"
              >
                Contact Dealer
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white border-2 border-purple-600 text-purple-600 py-3 px-4 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                  Schedule Test Drive
                </button>
                <button className="bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Get Financing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Contact {vehicle.dealer_name}</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <textarea
                  placeholder="Message"
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  defaultValue={`I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                ></textarea>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                  >
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Home Page with Featured Inventory
const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
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

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Vehicle
          </h2>
          <p className="text-xl md:text-2xl text-purple-200 mb-12">
            Thousands of quality cars from trusted dealers nationwide
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={filters.model}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        )}

        {!loading && vehicles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vehicles.map(vehicle => (
              <VehicleCard 
                key={vehicle.id || vehicle.vin} 
                vehicle={vehicle} 
                onViewDetails={handleViewDetails}
              />
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
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
            >
              View All Vehicles
            </button>
          </div>
        )}
      </main>

      {/* Vehicle Details Page Modal */}
      {selectedVehicle && (
        <VehicleDetailsPage 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
        />
      )}
    </div>
  );
};

// Other page components (simplified for now)
const InventoryPage = () => <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Inventory</h1></div></div>;
const ServicePage = () => <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-gray-900 mb-6">Service & Repairs</h1></div></div>;
// Admin Portal with Complete CRM System
const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkScrapeStatus();
    const interval = setInterval(checkScrapeStatus, 5000);
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

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'dealers', name: 'Dealer Management', icon: '🏢' },
    { id: 'crm', name: 'CRM System', icon: '🤖' },
    { id: 'billing', name: 'Billing & Revenue', icon: '💰' },
    { id: 'reports', name: 'Analytics & Reports', icon: '📈' },
    { id: 'scraper', name: 'Data Scraping', icon: '🔍' },
    { id: 'settings', name: 'System Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Admin Control</h2>
          <p className="text-sm text-gray-600">Pulse Auto Market</p>
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
        {activeTab === 'dashboard' && <AdminDashboard scrapeStatus={scrapeStatus} />}
        {activeTab === 'dealers' && <DealerManagement />}
        {activeTab === 'crm' && <AdminCRM />}
        {activeTab === 'billing' && <AdminBilling />}
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'scraper' && <AdminScraper scrapeStatus={scrapeStatus} />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ scrapeStatus }) => {
  const [stats, setStats] = useState({
    totalVehicles: 35,
    totalDealers: 8,
    activeSubscriptions: 5,
    monthlyRevenue: 2450,
    totalLeads: 127,
    hotLeads: 23
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Vehicles</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalVehicles}</p>
          <p className="text-sm text-green-600">+12 this week</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Dealers</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalDealers}</p>
          <p className="text-sm text-green-600">+2 this month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Subscriptions</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.activeSubscriptions}</p>
          <p className="text-sm text-purple-600">$2,450 MRR</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Hot Leads</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.hotLeads}</p>
          <p className="text-sm text-orange-600">23% conversion</p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Scraper Engine</span>
              <span className={`px-2 py-1 rounded text-sm ${scrapeStatus?.is_running ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {scrapeStatus?.is_running ? 'Running' : 'Idle'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>CRM System</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Billing System</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Processing</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>New dealer signup</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span>Scraper found 12 vehicles</span>
              <span className="text-gray-500">4 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span>Payment processed: $199</span>
              <span className="text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dealer Management
const DealerManagement = () => {
  const dealers = [
    { id: 1, name: "Atlanta Auto Max", status: "Active", subscription: "Professional", revenue: "$199/mo", vehicles: 45 },
    { id: 2, name: "Serra Used Cars", status: "Active", subscription: "Starter", revenue: "$99/mo", vehicles: 23 },
    { id: 3, name: "Motor Max", status: "Trial", subscription: "Professional", revenue: "$0", vehicles: 12 },
    { id: 4, name: "Elite Motors", status: "Active", subscription: "Enterprise", revenue: "$399/mo", vehicles: 78 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dealer Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add New Dealer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dealers.map((dealer) => (
              <tr key={dealer.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dealer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    dealer.status === 'Active' ? 'bg-green-100 text-green-800' :
                    dealer.status === 'Trial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {dealer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{dealer.subscription}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">{dealer.revenue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{dealer.vehicles}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin CRM System
const AdminCRM = () => {
  const leads = [
    { id: 1, customer: "John Smith", dealer: "Atlanta Auto Max", vehicle: "2022 Ford F-150", score: "Hot", status: "New", value: "$35,999" },
    { id: 2, customer: "Sarah Johnson", dealer: "Serra Used Cars", vehicle: "2021 Toyota Camry", score: "Warm", status: "Contacted", value: "$26,999" },
    { id: 3, customer: "Mike Davis", dealer: "Motor Max", vehicle: "2023 Honda Civic", score: "Hot", status: "Qualified", value: "$24,599" },
    { id: 4, customer: "Lisa Wilson", dealer: "Elite Motors", vehicle: "2022 BMW X3", score: "Cold", status: "Follow-up", value: "$42,999" }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">CRM System</h1>
      
      {/* CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Leads</h3>
          <p className="text-3xl font-bold text-blue-600">127</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Hot Leads</h3>
          <p className="text-3xl font-bold text-red-600">23</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Conversion Rate</h3>
          <p className="text-3xl font-bold text-green-600">18%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">AI Responses</h3>
          <p className="text-3xl font-bold text-purple-600">1,234</p>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Recent Leads</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{lead.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{lead.dealer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{lead.vehicle}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lead.score === 'Hot' ? 'bg-red-100 text-red-800' :
                    lead.score === 'Warm' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {lead.score}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{lead.status}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">{lead.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin Billing
const AdminBilling = () => {
  const revenue = [
    { month: "January", amount: 2150, dealers: 6 },
    { month: "February", amount: 2450, dealers: 7 },
    { month: "March", amount: 2850, dealers: 8 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Revenue</h1>
      
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-green-600">$2,850</p>
          <p className="text-sm text-green-600">+16% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Annual Run Rate</h3>
          <p className="text-3xl font-bold text-blue-600">$34,200</p>
          <p className="text-sm text-blue-600">Growing steadily</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg Revenue/Dealer</h3>
          <p className="text-3xl font-bold text-purple-600">$356</p>
          <p className="text-sm text-purple-600">Per month</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue by Plan</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <span className="font-medium">Starter ($99/mo)</span>
            <span className="text-green-600 font-semibold">$297 (3 dealers)</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <span className="font-medium">Professional ($199/mo)</span>
            <span className="text-green-600 font-semibold">$1,194 (6 dealers)</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <span className="font-medium">Enterprise ($399/mo)</span>
            <span className="text-green-600 font-semibold">$1,197 (3 dealers)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Reports
const AdminReports = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Reports</h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Platform Growth</h3>
        <p className="text-gray-600">Interactive charts and growth metrics would go here.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Dealer Performance</h3>
        <p className="text-gray-600">Individual dealer performance analytics.</p>
      </div>
    </div>
  </div>
);

// Admin Scraper (existing functionality)
const AdminScraper = ({ scrapeStatus }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Scraping Control</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Scraper Status</h3>
      <p className="text-gray-600">
        Status: {scrapeStatus?.is_running ? 'Running' : 'Idle'} | 
        Vehicles: {scrapeStatus?.current_vehicles || 0}
      </p>
    </div>
  </div>
);

// Admin Settings
const AdminSettings = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Platform Configuration</h3>
      <p className="text-gray-600">System settings and configuration options.</p>
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