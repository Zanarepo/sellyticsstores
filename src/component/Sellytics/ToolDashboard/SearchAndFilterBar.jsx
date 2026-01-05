// src/components/dashboard/SearchAndFilterBar.jsx
import React from 'react';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { tools } from './tools';

const categories = ['All', ...new Set(tools.map(t => t.category))];

const SearchAndFilterBar = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }) => (
  <div className="mb-8 space-y-4">
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
        <button onClick={() => setSearchQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
          <FaTimes />
        </button>
      )}
    </div>

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
);

export default SearchAndFilterBar;