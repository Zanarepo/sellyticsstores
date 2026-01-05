/**
 * Restock Recommendations Page - Enterprise Level
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Loader2, Search, Package } from 'lucide-react';
import useRestockRecommendations from './useRestockRecommendations';
import RecommendationCard from './RecommendationCard';
import StatsHeader from './StatsHeader';

export default function RestockRecommendations() {
  const { storeId, storeName, recommendations, loading, deleteRecommendation } = useRestockRecommendations();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter recommendations
  const filtered = recommendations.filter(r =>
    r.product_name.toLowerCase().includes(search.toLowerCase()) ||
    r.recommendation.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (!storeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Store Selected
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Please log in to view restock recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Market Demands
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {storeName || 'Store'} - Restock recommendations
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <StatsHeader recommendations={recommendations} />

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products or recommendations..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {current.length > 0 ? (
          <>
       <div className="flex flex-col gap-4">
  <AnimatePresence>
    {current.map((rec) => (
      <RecommendationCard
        key={rec.id}
        recommendation={rec}
        onDelete={deleteRecommendation}
      />
    ))}
  </AnimatePresence>
</div>


            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Recommendations Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {search ? 'Try adjusting your search' : 'No restock recommendations available yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}