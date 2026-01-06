import React, { useState } from "react";
import SalesTable from "./Component/SalesTable";
import SalesChartModal from "./Component/SalesChartModal";
import DateFilters from "./Component/DateFilters";
import PresetButtons from "./Component/PresetButtons";
import Pagination from "./Component/Pagination";
import SalesSummaryCard from "./Component/SalesSummaryCard";
import InventoryMovementCard from "./Component/InventoryMovementCard";

import useSalesData from "./hooks/useSalesData";
import useSalesFilters from "./hooks/useSalesFilters";
import usePagination from "./hooks/usePagination";
import { useCurrency } from "./hooks/useCurrency";
import useAggregatedMetrics from "./hooks/useAggregatedMetrics";
import useRestockMetrics from "./hooks/useRestockMetrics";
import { exportCSV, exportPDF } from "./utils";

export default function SalesDashboard() {
  const { preferredCurrency } = useCurrency();

  // Load sales data
  const { sales, loading: salesLoading } = useSalesData();

  // Filter sales by date/search
  const {
    filteredData: filteredSales,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    applyPreset,
  } = useSalesFilters(sales);
  
  // Pagination
  const { pageData, currentPage, setCurrentPage, pageCount } = usePagination(filteredSales, 50);

  // Metrics
  const salesMetrics = useAggregatedMetrics(filteredSales);
  const { restockMetrics } = useRestockMetrics();

  // Chart modal
  const [showChart, setShowChart] = useState(false);

  // Export functions
  const handleDownloadCSV = () => exportCSV(filteredSales, preferredCurrency);
  const handleDownloadPDF = () => exportPDF(filteredSales, preferredCurrency);

  if (salesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-3 sm:px-4 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Compact Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <PresetButtons applyPreset={applyPreset} />
            </div>
            <div className="flex-1">
              <DateFilters
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>
        </div>

        {/* Sales Summary Section */}
        <div>
       
          <SalesSummaryCard metrics={salesMetrics} />
        </div>

        {/* Inventory Movement Section */}
        <div>
         
          <InventoryMovementCard restockMetrics={restockMetrics} />
        </div>

        {/* Export & Analytics Card */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 
                        dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-pink-900/15 
                        rounded-lg sm:rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-800/50">
          
          <h2 className="text-sm sm:text-base font-bold text-indigo-700 dark:text-indigo-400 text-center mb-3 sm:mb-4">
            Exports & Analytics
          </h2>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Export CSV */}
            <button
              onClick={handleDownloadCSV}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5 sm:p-4 text-center 
                         border-t-2 sm:border-t-3 border-t-green-500 hover:shadow-md transition-all duration-200 
                         hover:scale-105 active:scale-95"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 bg-green-100 dark:bg-green-900/40 rounded-lg 
                              flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 
                              transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 10v6m-4-3h8m5 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">CSV</p>
              <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">Download</p>
            </button>

            {/* Export PDF */}
            <button
              onClick={handleDownloadPDF}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5 sm:p-4 text-center 
                         border-t-2 sm:border-t-3 border-t-red-500 hover:shadow-md transition-all duration-200 
                         hover:scale-105 active:scale-95"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 bg-red-100 dark:bg-red-900/40 rounded-lg 
                              flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/50 
                              transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">PDF</p>
              <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">Report</p>
            </button>

            {/* Show Chart */}
            <button
              onClick={() => setShowChart(true)}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5 sm:p-4 text-center 
                         border-t-2 sm:border-t-3 border-t-indigo-500 hover:shadow-md transition-all duration-200 
                         hover:scale-105 active:scale-95"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg 
                              flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 
                              transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">Chart</p>
              <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">Analytics</p>
            </button>
          </div>

          <div className="mt-2 sm:mt-3 text-center text-[9px] sm:text-xs text-gray-500 dark:text-gray-400">
            Real-time • Filtered data
          </div>
        </div>

        {/* Sales Table */}
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 px-1">
            Sales Records
          </h2>
          <SalesTable data={pageData} preferredCurrency={preferredCurrency} />
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center">
            <Pagination 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              pageCount={pageCount} 
            />
          </div>
        )}
      </div>

      {/* Chart Modal */}
      {showChart && (
        <SalesChartModal
          data={filteredSales}
          preferredCurrency={preferredCurrency}
          onClose={() => setShowChart(false)}
        />
      )}
    </div>
  );
}