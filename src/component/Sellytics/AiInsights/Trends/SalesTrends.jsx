/**
 * Sales Trends Page - Enterprise Level
 */
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Loader2 } from 'lucide-react';
import useSalesTrends from './useSalesTrends';
import StatsCards from './StatsCards';
import TrendsFilters from './TrendsFilters';
import TrendsCharts from './TrendsCharts';
import TrendsTable from './TrendsTable';
import TrendsInsights from './TrendsInsights';

export default function SalesTrends() {
  const {
    storeId,
    loading,
    selectedMonth,
    setSelectedMonth,
    rangeFilter,
    setRangeFilter,
    getFilteredTrends,
    selectedMonthData,
    getProjections,
  } = useSalesTrends();

  const filteredTrends = getFilteredTrends();
  const projections = getProjections();

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
              Please log in or select a store to view sales trends.
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
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading sales trends...</p>
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
              Sales Trends
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Monitor performance and forecast future sales
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards
          trends={filteredTrends}
          selectedMonthData={selectedMonthData}
          projections={projections}
        />

        {/* Filters */}
        <TrendsFilters
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          rangeFilter={rangeFilter}
          setRangeFilter={setRangeFilter}
        />

        {/* Insights */}
        <TrendsInsights
          trends={filteredTrends}
          projections={projections}
          selectedMonth={selectedMonth}
        />

        {/* Charts */}
        <TrendsCharts
          trends={filteredTrends}
          topProducts={selectedMonthData.topProducts}
          selectedMonth={selectedMonth}
        />

        {/* Table */}
        <TrendsTable
          trends={filteredTrends}
          rangeFilter={rangeFilter}
          selectedMonth={selectedMonth}
        />
      </div>
    </div>
  );
}