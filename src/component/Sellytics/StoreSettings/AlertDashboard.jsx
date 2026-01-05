import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import {
  FaUsers, FaBell, FaChartBar, FaUserFriends,
  FaArrowLeft, FaSearch, FaChevronRight, FaTimes
} from 'react-icons/fa';
import StoreAdmins from './StoreAdmins/StoreAdmins';

import Employees from './Employees/Employees';
import NotificationAlert from './StoreAlerts/NotificationAlert';
import ActivityLogs from './StoreActivityLogs/ActivityLogs'
const dashboardTools = [
  {
    key: 'store-admins',
    label: 'Store Admins',
    icon: FaUsers,
    desc: 'Manage Staff Access & Roles (Assign Access & Roles)',
    component: <StoreAdmins />,
    adminOnly: true,
    category: 'Management',
  },
  {
    key: 'notifications',
    label: 'Alerts & Reports',
    icon: FaBell,
    desc: 'Manage email alerts notification reports you want to receive',
    component: <NotificationAlert />,
    adminOnly: true,
    category: 'Management',
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: FaUserFriends,
    desc: 'Manage employee profiles and access.',
    component: <Employees />,
    adminOnly: true,
    category: 'Management',
  },
  {
    key: 'activity',
    label: 'Activity Dashboard',
    icon: FaChartBar,
    desc: 'Monitor real-time activity and store updates.',
    component: <ActivityLogs />,
    adminOnly: false,
    category: 'Analytics',
  },
];

export default function UserDashboard() {
  const [activeTool, setActiveTool] = useState(null);
  const [, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableTools, setAvailableTools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function checkUserAccess() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const userEmail = localStorage.getItem('user_email') ||
                          localStorage.getItem('email') ||
                          localStorage.getItem('email_address');

        if (!userEmail) {
          setErrorMessage('No user email found. Please log in.');
          setIsLoading(false);
          return;
        }

        let hasAdminAccess = false;

        // Check if user is store owner by email in stores table
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('shop_name')
          .ilike('email_address', userEmail)
          .maybeSingle();

        if (storeError && storeError.code !== 'PGRST116') {
          console.error('Error checking store owner:', storeError);
        }

        if (storeData) {
          hasAdminAccess = true;
        }

        setIsAdmin(hasAdminAccess);

        // Filter tools based on admin access
        const filtered = dashboardTools.filter(tool =>
          !tool.adminOnly || hasAdminAccess
        );
        setAvailableTools(filtered);
      } catch (err) {
        setErrorMessage('Failed to load dashboard access.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserAccess();
  }, []);

  const handleToolClick = (key) => {
    setActiveTool(key);
  };

  const filteredTools = availableTools.filter((tool) =>
    tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 animate-spin mx-auto" style={{ animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (activeTool) {
      const tool = availableTools.find(t => t.key === activeTool);
      if (!tool) return null;

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
                <div className="text-right">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{tool.label}</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{tool.desc}</p>
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

    // Main tools grid
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 shadow-sm hover:shadow-md transition-all duration-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <FaSearch className="text-4xl text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No results found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <div
                  key={tool.key}
                  onClick={() => handleToolClick(tool.key)}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 lg:p-7 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 hover:border-indigo-400 dark:hover:border-indigo-600"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="text-3xl lg:text-4xl text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.label}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                    {tool.desc}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                      {tool.category}
                    </span>
                    <FaChevronRight className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
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
      {!activeTool && !isLoading && (
        <>
          {/* Clean Gradient Header - No Store Name */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold text-white mb-6 mx-auto">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                User Dashboard
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                User Dashboard
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
                Manage staff, alerts, employees, and monitor activity — all in one place.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <FaTimes className="text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">Access Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                  </div>
                  <button onClick={() => setErrorMessage('')}
                    className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
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
    </div>
  );
}