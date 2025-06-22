import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Header Component with Enhanced Logo and Navigation
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
    <header className="bg-white shadow-lg sticky top-0 z-50 relative border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2 rounded-lg">
              <span className="text-xl font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent font-automotive">PULSE</h1>
              <p className="text-xs text-accent-500 font-medium">Trusted Car Marketplace</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-accent-700 hover:text-primary-600 font-medium transition-colors relative group"
              >
                {item.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-accent-200 text-accent-600 hover:bg-accent-50 hover:text-primary-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <>
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            ></div>
            
            {/* Mobile menu panel */}
            <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
              <nav className="flex flex-col">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-purple-600 font-medium py-4 px-6 border-b border-gray-100 hover:bg-purple-50 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Enhanced Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Dealer Portal</h2>
              <p className="text-purple-200">Welcome back, John's Auto</p>
              <div className="mt-2 text-sm">
                <span className="bg-purple-500 px-2 py-1 rounded text-xs">Professional Plan</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white hover:text-purple-200"
            >
              ✕
            </button>
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
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
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
        {/* Mobile Menu Button */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Dealer Portal</h1>
          <div></div>
        </div>

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
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    make: 'all',
    price_range: 'all'
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      // Load vehicles from the correct endpoint - use customer vehicles for dealer inventory view
      // Since all dealers can see all vehicles in this marketplace
      const response = await axios.get(`${API}/customer/vehicles?limit=50`);
      
      if (response.data && response.data.length > 0) {
        // Add some performance metrics for demo
        const vehiclesWithMetrics = response.data.map((vehicle, index) => ({
          ...vehicle,
          stock_number: vehicle.stock_number || `STK-${String(index + 1).padStart(3, '0')}`,
          status: vehicle.status || 'Available',
          days_on_lot: Math.floor(Math.random() * 45) + 1,
          views: Math.floor(Math.random() * 500) + 50,
          leads: Math.floor(Math.random() * 15) + 1
        }));
        
        setVehicles(vehiclesWithMetrics);
        console.log('Loaded vehicles:', vehiclesWithMetrics.length);
      } else {
        console.log('No vehicles returned from API');
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      console.log('API URL:', `${API}/customer/vehicles?limit=50`);
      // Show some sample data if API fails
      setVehicles([
        {
          id: 'sample1',
          year: 2022,
          make: 'Ford',
          model: 'F-150',
          trim: 'XLT SuperCrew',
          price: 42999,
          mileage: 15420,
          stock_number: 'STK-001',
          status: 'Available',
          days_on_lot: 12,
          views: 247,
          leads: 8,
          images: [],
          dealer_name: "John's Auto Sales"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVDP = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleEditVehicle = (vehicleId) => {
    // Handle edit functionality
    console.log('Edit vehicle:', vehicleId);
    alert('Edit functionality will be implemented here');
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      await axios.delete(`${API}/dealer/vehicles/${vehicleId}`);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      alert('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error deleting vehicle');
    }
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading inventory...</p>
      </div>
    );
  }

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
          <p className="text-sm text-green-600">Active listings</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg Days on Lot</h3>
          <p className="text-3xl font-bold text-blue-600">
            {vehicles.length > 0 ? Math.round(vehicles.reduce((sum, v) => sum + v.days_on_lot, 0) / vehicles.length) : 0}
          </p>
          <p className="text-sm text-blue-600">Industry avg: 24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Views</h3>
          <p className="text-3xl font-bold text-green-600">
            {vehicles.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
          </p>
          <p className="text-sm text-green-600">This month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Leads</h3>
          <p className="text-3xl font-bold text-orange-600">
            {vehicles.reduce((sum, v) => sum + v.leads, 0)}
          </p>
          <p className="text-sm text-orange-600">
            {vehicles.length > 0 ? Math.round((vehicles.reduce((sum, v) => sum + v.leads, 0) / vehicles.reduce((sum, v) => sum + v.views, 0)) * 100) : 0}% conversion
          </p>
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
        
        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">No vehicles in inventory</h3>
            <p className="text-gray-600 mb-6">Start by adding your first vehicle to the inventory.</p>
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all">
              ➕ Add Your First Vehicle
            </button>
          </div>
        )}
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
      const response = await axios.get(`${API}/customer/vehicles?limit=12`);
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
      
      const response = await axios.get(`${API}/customer/vehicles?${params}&limit=20`);
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

// Complete Inventory Page - Fixed to actually show vehicles
const InventoryPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filters, setFilters] = useState({
    make: '',
    maxPrice: '',
    maxMileage: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/customer/vehicles?limit=100`);
      console.log('Loaded vehicles:', response.data.length);
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const closeModal = () => {
    setSelectedVehicle(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Inventory</h1>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Inventory</h1>
        
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <p className="text-lg text-gray-600">
            Showing <span className="font-semibold text-purple-600">{vehicles.length}</span> vehicles
          </p>
        </div>

        {/* Vehicle Grid */}
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Vehicle Image */}
                <div className="h-48 bg-gray-200 relative">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img 
                      src={vehicle.images[index % vehicle.images.length]} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📷 No Image
                    </div>
                  )}
                  {vehicle.images && vehicle.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {vehicle.images.length} photos
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-semibold text-purple-600">
                        {vehicle.price ? formatPrice(vehicle.price) : 'Call for Price'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Mileage:</span>
                      <span>{vehicle.mileage ? formatMileage(vehicle.mileage) + ' miles' : 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Dealer:</span>
                      <span>{vehicle.dealer_name || 'N/A'}</span>
                    </div>
                    
                    {vehicle.condition && (
                      <div className="flex justify-between">
                        <span>Condition:</span>
                        <span className="capitalize">{vehicle.condition}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleViewDetails(vehicle)}
                    className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">No vehicles available at this time.</p>
            <p className="text-gray-400 text-sm mt-2">Please check back later for new inventory.</p>
          </div>
        )}

        {/* Vehicle Details Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Image Gallery */}
                {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedVehicle.images.slice(0, 4).map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`Vehicle photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                    {selectedVehicle.images.length > 4 && (
                      <p className="text-center text-gray-600 mt-2">
                        +{selectedVehicle.images.length - 4} more photos
                      </p>
                    )}
                  </div>
                )}

                {/* Vehicle Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-medium">{selectedVehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Make:</span>
                        <span className="font-medium">{selectedVehicle.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{selectedVehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mileage:</span>
                        <span className="font-medium">{formatMileage(selectedVehicle.mileage)} miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Condition:</span>
                        <span className="font-medium capitalize">{selectedVehicle.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transmission:</span>
                        <span className="font-medium">{selectedVehicle.transmission || 'Automatic'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuel Type:</span>
                        <span className="font-medium">{selectedVehicle.fuel_type || 'Gasoline'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pricing & Dealer</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-purple-600 text-xl">
                          {formatPrice(selectedVehicle.price)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dealer:</span>
                        <span className="font-medium">{selectedVehicle.dealer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock #:</span>
                        <span className="font-medium">{selectedVehicle.stock_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">VIN:</span>
                        <span className="font-medium text-xs">{selectedVehicle.vin || 'Available upon request'}</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        📞 Contact Dealer
                      </button>
                      <button className="w-full border-2 border-purple-600 text-purple-600 py-3 px-4 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                        🚗 Schedule Test Drive
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// Service & Repairs Page
const ServicePage = () => {
  const [repairShops, setRepairShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [bookingForm, setBookingForm] = useState({
    vehicle_make: '',
    vehicle_model: '',
    service_type: '',
    customer_name: '',
    customer_phone: '',
    preferred_shop: '',
    scheduled_date: ''
  });
  const [showBookingForm, setShowBookingForm] = useState(false);

  const serviceTypes = [
    'Oil Change',
    'Brake Service', 
    'Tire Service',
    'Engine Repair',
    'Transmission',
    'AC Repair',
    'Inspection',
    'Engine Diagnostics'
  ];

  useEffect(() => {
    loadRepairShops();
  }, []);

  const loadRepairShops = async (searchZip = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/repair-shops?city=Nashville&state=TN`);
      console.log('Repair shops API response:', response.data);
      
      let shops = [];
      if (response.data && response.data.repair_shops) {
        shops = response.data.repair_shops.map(shop => ({
          ...shop,
          zipCode: shop.address.match(/\d{5}/)?.[0] || "37201" // Extract ZIP from address
        }));
      }
      
      // Add more shops for different zip codes
      const expandedShops = [
        ...shops,
        {
          id: "shop4",
          name: "Quick Lube Express",
          address: "123 Oak St, Nashville, TN 37203",
          phone: "(615) 555-0104",
          rating: 4.5,
          services: ["Oil Change", "Inspection", "Tire Service"],
          hours: "Mon-Sat 8AM-8PM, Sun 10AM-6PM",
          distance: "1.2 miles",
          zipCode: "37203"
        },
        {
          id: "shop5",
          name: "Brentwood Auto Center", 
          address: "456 Wilson Pike, Brentwood, TN 37027",
          phone: "(615) 372-8900",
          rating: 4.7,
          services: ["Brake Service", "Engine Repair", "Transmission", "Oil Change"],
          hours: "Mon-Fri 7AM-6PM, Sat 8AM-4PM",
          distance: "12.3 miles",
          zipCode: "37027"
        },
        {
          id: "shop6",
          name: "Tire World Plus",
          address: "789 Murfreesboro Rd, Nashville, TN 37217",
          phone: "(615) 244-7777", 
          rating: 4.4,
          services: ["Tire Service", "Oil Change", "Brake Service", "AC Repair"],
          hours: "Mon-Fri 8AM-7PM, Sat 8AM-5PM",
          distance: "5.8 miles",
          zipCode: "37217"
        },
        {
          id: "shop7",
          name: "Franklin Auto Repair",
          address: "321 Cool Springs Blvd, Franklin, TN 37067",
          phone: "(615) 791-2345",
          rating: 4.6,
          services: ["Engine Diagnostics", "Brake Service", "Oil Change", "Inspection"],
          hours: "Mon-Fri 8AM-6PM, Sat 9AM-3PM",
          distance: "15.2 miles",
          zipCode: "37067"
        }
      ];

      setAllShops(expandedShops);
      
      // Filter by zip code if provided
      if (searchZip) {
        const filtered = expandedShops.filter(shop => 
          shop.zipCode === searchZip || shop.address.includes(searchZip)
        );
        setRepairShops(filtered.length > 0 ? filtered : expandedShops);
      } else {
        setRepairShops(expandedShops);
      }
      
      console.log('Total repair shops loaded:', expandedShops.length);
    } catch (error) {
      console.error('Error loading repair shops:', error);
      
      // Fallback data if API fails
      const fallbackShops = [
        {
          id: "fallback1",
          name: "Nashville Auto Care",
          address: "123 Main St, Nashville, TN 37201",
          phone: "(615) 329-1234",
          rating: 4.8,
          services: ["Oil Change", "Brake Service", "Tire Service", "Engine Repair"],
          hours: "Mon-Fri 8AM-6PM, Sat 8AM-4PM",
          distance: "2.3 miles",
          zipCode: "37201"
        },
        {
          id: "fallback2",
          name: "Music City Motors",
          address: "456 Broadway, Nashville, TN 37203",
          phone: "(615) 256-8888",
          rating: 4.6,
          services: ["Transmission", "AC Repair", "Oil Change", "Inspection"],
          hours: "Mon-Fri 7AM-7PM, Sat 9AM-5PM",
          distance: "3.1 miles",
          zipCode: "37203"
        },
        {
          id: "fallback3", 
          name: "Elite Auto Service",
          address: "789 Charlotte Ave, Nashville, TN 37209",
          phone: "(615) 463-2000",
          rating: 4.7,
          services: ["Engine Diagnostics", "Brake Service", "Oil Change", "Tire Service"],
          hours: "Mon-Fri 8AM-6PM, Sat 8AM-2PM",
          distance: "4.1 miles",
          zipCode: "37209"
        }
      ];
      
      setRepairShops(fallbackShops);
      setAllShops(fallbackShops);
    } finally {
      setLoading(false);
    }
  };

  const handleZipSearch = () => {
    loadRepairShops(zipCode);
  };

  const getEstimate = async () => {
    if (!selectedService || !bookingForm.vehicle_make || !bookingForm.vehicle_model) return;
    
    try {
      const response = await axios.get(
        `${API}/service/estimate?service_type=${selectedService}&vehicle_make=${bookingForm.vehicle_make}&vehicle_model=${bookingForm.vehicle_model}`
      );
      setEstimate(response.data);
    } catch (error) {
      console.error('Error getting estimate:', error);
    }
  };

  const handleBookService = async () => {
    try {
      const response = await axios.post(`${API}/service/schedule`, null, {
        params: {
          ...bookingForm,
          service_type: selectedService
        }
      });
      
      alert(`Service scheduled! Confirmation: ${response.data.confirmation}`);
      setShowBookingForm(false);
      setBookingForm({
        vehicle_make: '',
        vehicle_model: '',
        service_type: '',
        customer_name: '',
        customer_phone: '',
        preferred_shop: '',
        scheduled_date: ''
      });
    } catch (error) {
      console.error('Error booking service:', error);
      alert('Error booking service. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            🔧 Service & Repairs
          </h2>
          <p className="text-xl md:text-2xl text-purple-200 mb-8">
            Find trusted auto repair shops and schedule service
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Zip Code Search */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📍 Find Shops Near You</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter ZIP code (e.g., 37203, 37027, 37217)"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                maxLength="5"
              />
              <button
                onClick={handleZipSearch}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setZipCode('');
                  loadRepairShops();
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Show All
              </button>
            </div>
            {zipCode && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Showing {repairShops.length} shops for ZIP code {zipCode}
                </p>
                {repairShops.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    No shops found. Try ZIP codes: 37201, 37203, 37027, 37217
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Service Booking Section */}
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">📅 Schedule Service</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Make</label>
                <select
                  value={bookingForm.vehicle_make}
                  onChange={(e) => setBookingForm({...bookingForm, vehicle_make: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Make</option>
                  <option value="Ford">Ford</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                <input
                  type="text"
                  value={bookingForm.vehicle_model}
                  onChange={(e) => setBookingForm({...bookingForm, vehicle_model: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., F-150, Camry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    setBookingForm({...bookingForm, service_type: e.target.value});
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Service</option>
                  {serviceTypes.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={getEstimate}
                disabled={!selectedService || !bookingForm.vehicle_make || !bookingForm.vehicle_model}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Get Price Estimate
              </button>
              
              <button
                onClick={() => setShowBookingForm(true)}
                disabled={!selectedService}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50"
              >
                Book Service
              </button>
            </div>

            {/* Price Estimate */}
            {estimate && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">💰 Price Estimate for {estimate.vehicle}</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Low: </span>
                    <span className="font-semibold">${estimate.min_cost}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Average: </span>
                    <span className="font-semibold">${estimate.average_cost}</span>
                  </div>
                  <div>
                    <span className="text-green-700">High: </span>
                    <span className="font-semibold">${estimate.max_cost}</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">{estimate.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Repair Shops Directory */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            🏪 {zipCode ? `Repair Shops Near ${zipCode}` : 'Trusted Repair Shops'}
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">Loading repair shops...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repairShops.map((shop) => (
                <div key={shop.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{shop.name}</h4>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                      <span className="text-yellow-600">⭐</span>
                      <span className="text-sm font-medium text-yellow-800 ml-1">{shop.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-start">
                      <span className="text-purple-600 mr-2">📍</span>
                      <span>{shop.address}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-2">📞</span>
                      <span>{shop.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-2">🕒</span>
                      <span>{shop.hours}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-2">📏</span>
                      <span className="font-medium text-purple-600">{shop.distance}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Services Offered:</h5>
                    <div className="flex flex-wrap gap-1">
                      {shop.services.slice(0, 3).map((service) => (
                        <span key={service} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                      {shop.services.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{shop.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingForm({...bookingForm, preferred_shop: shop.name});
                      setShowBookingForm(true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-sm font-medium"
                  >
                    Select This Shop
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Book Service Appointment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={bookingForm.customer_name}
                  onChange={(e) => setBookingForm({...bookingForm, customer_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={bookingForm.customer_phone}
                  onChange={(e) => setBookingForm({...bookingForm, customer_phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  value={bookingForm.scheduled_date}
                  onChange={(e) => setBookingForm({...bookingForm, scheduled_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>Service:</strong> {selectedService}</p>
                <p><strong>Vehicle:</strong> {bookingForm.vehicle_make} {bookingForm.vehicle_model}</p>
                <p><strong>Shop:</strong> {bookingForm.preferred_shop}</p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBookService}
                disabled={!bookingForm.customer_name || !bookingForm.customer_phone || !bookingForm.scheduled_date}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowBookingForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Admin Portal with Complete CRM System
const AdminPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkScrapeStatus();
      const interval = setInterval(checkScrapeStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Admin credentials
    if (loginForm.username === 'admin' && loginForm.password === 'pulseadmin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'authenticated');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    setLoginForm({ username: '', password: '' });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-2">Access the admin dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="admin"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="••••••••••••"
                required
              />
            </div>
            
            {loginError && (
              <div className="text-red-600 text-sm text-center">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Demo credentials: admin / pulseadmin123
          </div>
        </div>
      </div>
    );
  }

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
          <button
            onClick={handleLogout}
            className="mt-2 text-xs text-red-600 hover:text-red-800"
          >
            🚪 Logout
          </button>
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