// src/components/dashboard/PremiumBanner.jsx
import React from 'react';
import { FaCrown } from 'react-icons/fa';

const PremiumBanner = () => (
  <div className="border-b border-slate-200 dark:border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <FaCrown className="text-white text-xl" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Unlock Enterprise Features</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">multi-store, Growth Tools, priority support & more</p>
            </div>
          </div>
          <a href="/upgrade" target="_blank" rel="noopener noreferrer"
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20">
            View Plans
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default PremiumBanner;