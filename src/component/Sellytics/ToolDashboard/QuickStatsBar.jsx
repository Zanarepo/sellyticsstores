// src/components/dashboard/QuickStatsBar.jsx
import React from 'react';
import { FaBoxes, FaFilter, FaCrown } from 'react-icons/fa';
import { tools } from './tools';

const categories = ['All', ...new Set(tools.map(t => t.category))];

const QuickStatsBar = ({ isPremium }) => (
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
);

export default QuickStatsBar;