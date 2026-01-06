import React from 'react';
import {
  FaSearch,
  FaTimes,
  FaFilter,
  FaChevronRight,
  FaLock,
  FaCrown,
  FaBoxes,
} from 'react-icons/fa';

export default function DashboardToolsGrid({
  tools,
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredTools,
  handleToolClick,
  allowedFeatures,
  isPremium,
}) {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
  {/* Quick Stats Bar */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">

    {/* Total Tools */}
    <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Total Tools
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {tools.length}
          </p>
        </div>
        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
          <FaBoxes className="text-indigo-600 dark:text-indigo-400 text-base sm:text-xl" />
        </div>
      </div>
    </div>

    {/* Categories */}
    <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Categories
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {categories.length - 1}
          </p>
        </div>
        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
          <FaFilter className="text-purple-600 dark:text-purple-400 text-base sm:text-xl" />
        </div>
      </div>
    </div>

    {/* Account */}
    <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Account
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {isPremium ? 'Premium' : 'Free'}
          </p>
        </div>
        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
          <FaCrown className="text-amber-600 dark:text-amber-400 text-base sm:text-xl" />
        </div>
      </div>
    </div>

  </div>





      {/* Search and Filter Bar */}
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
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
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
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 mb-5 transition-all duration-300 ${
                    isAccessible ? 'group-hover:scale-110 group-hover:rotate-3' : ''
                  }`}
                >
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
}