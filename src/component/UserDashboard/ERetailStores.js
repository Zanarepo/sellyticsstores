import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  FaRegMoneyBillAlt,
  FaMoneyCheckAlt,
  FaBoxes,
  FaChartLine,
  FaUsers,
  FaTasks,
  FaArrowLeft,
  FaReceipt,
  FaUndoAlt,
  FaBoxOpen,
  FaSearch,
  FaLock,
  FaTimes,
  FaCrown,
  FaFilter,
  FaChevronRight,

} from 'react-icons/fa';

import ExpenseManager from '../Sellytics/Expenses/ExpenseManager';

import DashboardAccess from '../Ops/DashboardAccess';
import ReceiptQRCode from '../VariexContents/ReceiptQRCode';
import StockTransfer from '../Sellytics/StockTransfer/StockTransfer';
import Sales from '../Sellytics/Sales/Sales';
import Inventory from '../Sellytics/InventoryLogs/Inventory';
import ProductCatalogue from '../Sellytics/ProductLogs/ProductCatalogue';
import UnpaidManager from '../Sellytics/UnpaidSupplies/UnpaidManager'
import DebtForm from '../Sellytics/DebtPayment/DebtForm';
import SalesSummary from '../Sellytics/SalesDashboard/SalesSummary';
import CustomerManagement from '../Sellytics/Customers/CustomerManagement';
import SuppliersInventory from '../Sellytics/SuppliersDashboard/SuppliersInventory';
import Returns from '../Sellytics/ReturnsModule/Returns';
const tools = [
  {
    key: 'sales',
    label: 'Sales Tracker',
    icon: FaChartLine,
    desc: 'Add your sales and see how your business is doing ( Fast, offline-ready point of sale)',
    component: <Sales />,
    isFreemium: true,
    category: 'Sales & Revenue',
  },
  {
    key: 'products',
    label: 'Products & Pricing Tracker',
    icon: FaBoxes,
    desc: 'Add and manage your store\'s products, prices, and stock here',
    component: <ProductCatalogue />,
    isFreemium: true,
    category: 'Inventory',
  },
  {
    key: 'stock_transfer',
    label: 'Stock Transfer',
    icon: FaReceipt,
    desc: 'Easily Transfer Stock from one store to another.',
    component: <StockTransfer />,
    isFreemium: false,
    category: 'Inventory',
  },
  {
    key: 'inventory',
    label: 'Manage Inventory (Goods)',
    icon: FaTasks,
    desc: 'Keep an eye on how much goods you have sold and what is left in your store.',
    component: <Inventory />,
    isFreemium: true,
    category: 'Inventory',
  },
  {
    key: 'receipts',
    label: 'Sales Receipts',
    icon: FaReceipt,
    desc: 'Monitor and track sales.',
    component: <ReceiptQRCode />,
    isFreemium: true,
    category: 'Sales & Revenue',
  },
  {
    key: 'returns',
    label: 'Returned Items Tracker',
    icon: FaUndoAlt,
    desc: 'Track returned items from customers.',
    component: <Returns />,
    isFreemium: false,
    category: 'Sales & Revenue',
  },
  {
    key: 'expenses',
    label: 'Expenses Tracker',
    icon: FaRegMoneyBillAlt,
    desc: 'Keep track of your stores spending.',
    component: <ExpenseManager />,
    isFreemium: true,
    category: 'Finance',
  },
  {
    key: 'unpaid_supplies',
    label: 'Unpaid Supplies',
    icon: FaBoxOpen,
    desc: 'See who took goods on credit and hasn\'t paid yet',
    component: <UnpaidManager />,
    isFreemium: false,
    category: 'Finance',
  },
  {
    key: 'debts',
    label: 'Debtors',
    icon: FaMoneyCheckAlt,
    desc: 'Track debtors.',
    component: <DebtForm />,
    isFreemium: false,
    category: 'Finance',
  },
  {
    key: 'suppliers',
    label: 'Suppliers & Product Tracker',
    icon: FaSearch,
    desc: 'Track product & suppliers.',
    component: <SuppliersInventory />,
    isFreemium: false,
    category: 'Operations',
  },
  {
    key: 'sales_summary',
    label: 'Sales Summary',
    icon: FaChartLine,
    desc: 'View a summary of your sales performance.',
    component: <SalesSummary />,
    isFreemium: true,
    category: 'Analytics',
  },
  {
    key: 'customers',
    label: 'Customer Manager',
    icon: FaUsers,
    desc: 'Manage your customers.',
    component: <CustomerManagement />,
    isFreemium: false,
    category: 'Operations',
  },
];

// Mapping for common variations in allowed_dashboard and users_dashboard
const featureKeyMapping = {
  'products & pricing tracker': 'products',
  'products': 'products',
  'product tracker': 'products',
  'products tracker': 'products',
  'dynamic products': 'products',
  'suppliers & product tracker': 'suppliers',
  'suppliers': 'suppliers',
  'supplier': 'suppliers',
  'sales summary': 'sales_summary',
  'unpaid supplies': 'unpaid_supplies',
  'stock transfer': 'stock_transfer',
  'stock transfer tracker': 'stock_transfer',
};

export default function DashboardModern() {
  const [shopName, setShopName] = useState('Store Owner');
  const [activeTool, setActiveTool] = useState(null);
  const [allowedFeatures, setAllowedFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchAllowedFeatures = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const storeId = localStorage.getItem('store_id');
      const userId = localStorage.getItem('user_id');
      const userAccessRaw = localStorage.getItem('user_access');
      let hasPremiumAccess = false;
      let fetchedShopName = 'Store Owner';
      let features = [];

      if (!storeId) {
        setErrorMessage('Please log in to access the dashboard.');
        setIsLoading(false);
        return;
      }

      localStorage.removeItem(`features_${storeId}`);

      // Fetch shop name, allowed features, and premium status
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('shop_name, allowed_features, premium')
        .eq('id', storeId)
        .single();

      if (storeError) {
        setErrorMessage('Failed to load feature permissions. Please try again.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      fetchedShopName = storeData?.shop_name || 'Store Owner';
      const isPremiumStore = storeData.premium === true || 
                           (typeof storeData.premium === 'string' && 
                            storeData.premium.toLowerCase() === 'true');
      if (isPremiumStore) {
        hasPremiumAccess = true;
      }

      // Parse allowed features
      if (Array.isArray(storeData?.allowed_features)) {
        features = storeData.allowed_features
          .map((item) => {
            const normalized = item?.trim().toLowerCase();
            return featureKeyMapping[normalized] || normalized;
          })
          .filter(Boolean);
      } else if (storeData?.allowed_features === '' || storeData?.allowed_features === '""') {
        features = [];
      } else if (typeof storeData?.allowed_features === 'string') {
        try {
          const parsed = JSON.parse(storeData.allowed_features);
          if (Array.isArray(parsed)) {
            features = parsed
              .map((item) => {
                const normalized = item?.trim().toLowerCase();
                return featureKeyMapping[normalized] || normalized;
              })
              .filter(Boolean);
          } else {
            setErrorMessage('Contact Support or your org. Admin to Unlock.');
            features = [];
          }
        } catch (e) {
          setErrorMessage('Contact Support or your org. Admin to Unlock.');
          features = [];
        }
      } else {
        setErrorMessage('Contact Support or your org. Admin to Unlock.');
        features = [];
      }

      // If not premium yet and user_id is present, check associated stores via store_users
      if (!hasPremiumAccess && userId) {
        const { data: userStores, error: userStoresError } = await supabase
          .from('store_users')
          .select('store_id')
          .eq('id', userId);

        if (!userStoresError && userStores?.length > 0) {
          const associatedStoreIds = userStores.map((us) => us.store_id);

          // Query premium status for associated stores
          const { data: premiumStores, error: premiumStoresError } = await supabase
            .from('stores')
            .select('id, shop_name, premium')
            .in('id', associatedStoreIds)
            .eq('premium', true);

          if (!premiumStoresError && premiumStores?.length > 0) {
            hasPremiumAccess = true;
            fetchedShopName = premiumStores[0].shop_name || fetchedShopName;
          }
        }
      }

      // If user_access is present, cross-check store_ids for premium
      if (!hasPremiumAccess && userAccessRaw) {
        try {
          const userAccess = JSON.parse(userAccessRaw);
          const accessStoreIds = userAccess?.store_ids || [];

          if (accessStoreIds.length > 0) {
            const { data: premiumAccessStores, error: premiumAccessError } = await supabase
              .from('stores')
              .select('id, shop_name, premium')
              .in('id', accessStoreIds)
              .eq('premium', true);

            if (!premiumAccessError && premiumAccessStores?.length > 0) {
              hasPremiumAccess = true;
              fetchedShopName = premiumAccessStores[0].shop_name || fetchedShopName;
            }
          }
        } catch (parseError) {
          console.error('Error parsing user_access:', parseError.message);
        }
      }

      setShopName(fetchedShopName);
      setIsPremium(hasPremiumAccess);
      setAllowedFeatures(features);
      if (!hasPremiumAccess) {
        setErrorMessage('Some features are available only for premium users. Please upgrade your store\'s subscription.');
      }
    } catch (err) {
      setErrorMessage('An error occurred while loading permissions. Please try again.');
      setAllowedFeatures([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowedFeatures();
  }, []);

  useEffect(() => {
    if (!isLoading && activeTool && !allowedFeatures.includes(activeTool)) {
      setActiveTool(null);
    }
  }, [allowedFeatures, isLoading, activeTool]);

  const handleToolClick = (key) => {
    const tool = tools.find((t) => t.key === key);
    if (!allowedFeatures.includes(key)) {
      setErrorMessage(`Access Denied: ${tool.label} is not enabled for your store. Contact your admin to unlock this feature.`);
      return;
    }
    if (!tool.isFreemium && !isPremium) {
      setErrorMessage(`Access Denied: ${tool.label} is a premium feature. Please upgrade your subscription.`);
      return;
    }
    setActiveTool(key);
    setErrorMessage('');
  };

  /* global gtag */
  useEffect(() => {
    if (typeof gtag === 'function') {
      gtag('event', 'fixscan_open', {
        event_category: 'App',
        event_label: 'Dashboard Loaded',
      });
    }
  }, []);

  const categories = ['All', ...new Set(tools.map(t => t.category))];

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 animate-spin mx-auto" style={{ animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your workspace...</p>
            <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Preparing your dashboard</p>
          </div>
        </div>
      );
    }

    if (activeTool) {
      const tool = tools.find((t) => t.key === activeTool);
      if (!allowedFeatures.includes(activeTool)) {
        return (
          <div className="min-h-screen text-indigo-600 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                <FaLock className="text-4xl text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Access Denied</h3>
                <p className="text-red-600 dark:text-red-400">
                  You do not have permission to view {tool.label}. Contact your admin to unlock this feature.
                </p>
                <button
                  onClick={() => setActiveTool(null)}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      }
      if (!tool.isFreemium && !isPremium) {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
                <FaCrown className="text-5xl text-amber-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-amber-900 dark:text-amber-300 mb-2">Premium Feature</h3>
                <p className="text-amber-700 dark:text-amber-400 mb-6">
                  {tool.label} is available only for premium users. Please upgrade your store&apos;s subscription.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/upgrade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                  >
                    Upgrade to Premium
                  </a>
                  <button
                    onClick={() => setActiveTool(null)}
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveTool(null)}
                  className="group flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-all duration-200"
                >
                  <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" /> 
                  <span className="font-semibold">Back</span>
                </button>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {tool.label}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{tool.desc}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                   
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {React.cloneElement(tool.component, { setActiveTool })}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tools</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{tools.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-xl flex items-center justify-center">
                <FaBoxes className="text-indigo-600 dark:text-indigo-400 text-xl" />
              </div>
            </div>
          </div>
      
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{categories.length - 1}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl flex items-center justify-center">
                <FaFilter className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{isPremium ? 'Premium' : 'Free'}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-xl flex items-center justify-center">
                <FaCrown className="text-amber-600 dark:text-amber-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search modules, features, or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 shadow-sm hover:shadow-md transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium whitespace-nowrap">
              <FaFilter className="flex-shrink-0" />
              <span className="hidden sm:inline">Filter:</span>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`group px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:scale-105'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <FaSearch className="text-4xl text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No results found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {filteredTools.map((tool) => {
              const isAccessible = (tool.isFreemium || isPremium) && allowedFeatures.includes(tool.key);
              const isLocked = !isAccessible;
              const Icon = tool.icon;

              return (
                <div
                  key={tool.key}
                  onClick={() => isAccessible && handleToolClick(tool.key)}
                  className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 lg:p-7 transition-all duration-300 ${
                    isAccessible
                      ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 hover:border-indigo-400 dark:hover:border-indigo-600'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  {/* Premium Badge */}
                  {!tool.isFreemium && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800 shadow-sm">
                        <FaCrown className="text-xs" />
                        <span>PRO</span>
                      </div>
                    </div>
                  )}

                  {/* Icon Container */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 mb-5 transition-all duration-300 ${
                    isAccessible ? 'group-hover:scale-110 group-hover:rotate-3' : ''
                  }`}>
                    <Icon className="text-3xl lg:text-4xl text-indigo-600 dark:text-indigo-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.label}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                    {tool.desc}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                      {tool.category}
                    </span>
                    {isAccessible && (
                      <FaChevronRight className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
                    )}
                  </div>

                  {/* Locked Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <div className="text-center px-4">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                          <FaLock className="text-2xl text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {!allowedFeatures.includes(tool.key) ? 'Contact Admin' : 'Upgrade Required'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full">
      <DashboardAccess />
      
      {!activeTool && (
        <>
          {/* Enterprise Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold text-white mb-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    System Online
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">{shopName}</span>
                  </h1>
                  <p className="text-slate-300 text-base sm:text-lg max-w-2xl">
                   Inventory Intelligence • Sales • Real-time analytics • Operations - All to help you GROW
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  
               
                  {!isPremium && (
                    <a
                      href="/upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30"
                    >
                      <FaCrown className="group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Upgrade Pro</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Premium Upgrade Banner */}
          {!isPremium && (
            <div className="border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <FaCrown className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Unlock Enterprise Features</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400"> multi-store, Growth Tools, priority support & more</p>
                      </div>
                    </div>
                    <a
                      href="/upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-200 whitespace-nowrap shadow-lg shadow-amber-500/20"
                    >
                      View Plans
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <FaLock className="text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">Access Restricted</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                  </div>
                  <button
                    onClick={() => setErrorMessage('')}
                    className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      {renderContent()}

      {/* Enterprise Footer */}
      {!activeTool && (
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  © 2024 Sellytics. All rights reserved.
                </p>
               
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem(`features_${localStorage.getItem('store_id')}`);
                  fetchAllowedFeatures();
                }}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-all duration-200"
              >
                <FaUndoAlt className="group-hover:rotate-180 transition-transform duration-500" />
                Refresh Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}