import React from 'react';
import { FaCrown, FaUndoAlt, FaTimes, FaLock } from 'react-icons/fa';

export default function DashboardHeader({ 
  shopName, 
  isPremium, 
  errorMessage, 
  setErrorMessage, 
  refreshPermissions 
}) {
  return (
    <>
      {/* Enterprise Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
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
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                  {shopName}
                </span>
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      multi-store, Growth Tools, priority support & more
                    </p>
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

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 mt-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              
            </div>
            <button
              onClick={() => {
                localStorage.removeItem(`features_${localStorage.getItem('store_id')}`);
                refreshPermissions();
              }}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-all duration-200"
            >
              <FaUndoAlt className="group-hover:rotate-180 transition-transform duration-500" />
              Refresh Permissions
            </button>
          </div>
        </div>
      </div>
      
    </>
  );
}