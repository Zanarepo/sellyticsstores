// src/components/dashboard/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { tools } from './tools';
import { useDashboardData } from './useDashboardData';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import ToolGrid from './ToolGrid';
import ActiveToolContent from './ActiveToolContent';
import DashboardAccess from '../../Ops/DashboardAccess'; 

export default function UserDashboard() {
  const {
    shopName,
    allowedFeatures,
    isPremium,
    errorMessage,
    isLoading,
    setErrorMessage,
    fetchAllowedFeatures,
  } = useDashboardData();

  const [activeTool, setActiveTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (activeTool && !allowedFeatures.includes(activeTool)) {
      setActiveTool(null);
    }
  }, [allowedFeatures, activeTool]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardAccess />

      {!activeTool && (
        <>
          <DashboardHeader
            shopName={shopName}
            isPremium={isPremium}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            fetchAllowedFeatures={fetchAllowedFeatures}
          />

          <DashboardStats
            toolsCount={tools.length}
            categoriesCount={new Set(tools.map(t => t.category)).size}
            isPremium={isPremium}
          />

          <ToolGrid
            tools={tools}
            allowedFeatures={allowedFeatures}
            isPremium={isPremium}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onToolSelect={setActiveTool}
          />
        </>
      )}

      {activeTool && (
        <ActiveToolContent
          activeTool={activeTool}
          tools={tools}
          allowedFeatures={allowedFeatures}
          isPremium={isPremium}
          setActiveTool={setActiveTool}
        />
      )}

      {!activeTool && (
        <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 bg-white dark:bg-slate-900 py-6">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <p className="text-sm text-slate-500">© 2024 Sellytics. All rights reserved.</p>
            <button
              onClick={fetchAllowedFeatures}
              className="flex items-center gap-2 text-indigo-600 hover:underline"
            >
              Refresh Permissions
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}