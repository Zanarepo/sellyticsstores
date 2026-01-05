import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';
import FinancialFilters from './FinancialFilters';
import FinancialStatsCards from './FinancialStatsCards';
import SalesTrendChart from './SalesTrendChart';
import CogsVsSalesChart from './CogsVsSalesChart';
import ExpenseBreakdownChart from './ExpenseBreakdownChart';
import TopProductsList from './TopProductsList';
import StoreComparisonChart from './StoreComparisonChart';
import StoreComparisonList from './StoreComparisonList';
import { useStores } from './useStores';
import { useSales } from './useSales';
import { useExpenses } from './useExpenses';
import { useDebts } from './useDebts';
import { useInventory } from './useInventory';
import { useStoreComparison } from './useStoreComparison';
import { useFinancialMetrics } from './useFinancialMetrics';
import { useChartData } from './useChartData';
import { useComparisonData } from './useComparisonData';

const SUPPORTED_CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Pound Sterling' },
];

export default function FinancialDashboard() {
  const ownerId = Number(localStorage.getItem('owner_id')) || null;
  const [timeFilter, setTimeFilter] = useState('30d');
  const [timeGranularity, setTimeGranularity] = useState('monthly');
  const [metricFilter, setMetricFilter] = useState('All');
  const [comparisonMetric, setComparisonMetric] = useState('totalSales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { preferredCurrency, setPreferredCurrency } = useCurrency();
  const { stores, storeId, setStoreId, isLoading: storesLoading } = useStores(ownerId);
  const { sales, fetchSales, isLoading: salesLoading } = useSales();
  const { expenses, fetchExpenses, isLoading: expensesLoading } = useExpenses();
  const { debts, fetchDebts, isLoading: debtsLoading } = useDebts();
  const { inventory, products, fetchInventory, isLoading: inventoryLoading } = useInventory();
  const { storeComparison, fetchStoreComparison, isLoading: comparisonLoading } = useStoreComparison();

  const isLoading = storesLoading || salesLoading || expensesLoading || debtsLoading || inventoryLoading || comparisonLoading;

  const setCurrency = (code) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === code);
    if (currency) {
      setPreferredCurrency(currency);
    }
  };

  // Computed values using custom hooks
  const metrics = useFinancialMetrics(sales, expenses, debts, inventory, products);
  const chartData = useChartData(sales, expenses, timeGranularity, metrics.totalSales, metrics.totalCOGS, preferredCurrency);
  const comparisonData = useComparisonData(storeComparison, comparisonMetric, preferredCurrency);

  // Effects

  useEffect(() => {
    if (metricFilter === 'Comparison') {
      fetchStoreComparison(stores, timeFilter, startDate, endDate);
    } else if (storeId) {
      fetchSales(storeId, timeFilter, startDate, endDate);
      fetchExpenses(storeId, timeFilter, startDate, endDate);
      fetchDebts(storeId, timeFilter, startDate, endDate);
      fetchInventory(storeId);
    }
  }, [storeId, metricFilter, timeFilter, startDate, endDate, stores, fetchSales, fetchExpenses, fetchDebts, fetchInventory, fetchStoreComparison]);

  if (!ownerId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
     
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Financial Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive financial analytics and performance metrics
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FinancialFilters
          stores={stores}
          storeId={storeId}
          setStoreId={setStoreId}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          timeGranularity={timeGranularity}
          setTimeGranularity={setTimeGranularity}
          metricFilter={metricFilter}
          setMetricFilter={setMetricFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          preferredCurrency={preferredCurrency}
          setCurrency={setCurrency}
          SUPPORTED_CURRENCIES={SUPPORTED_CURRENCIES}
          onApply={() => {
            if (metricFilter === 'Comparison') {
              fetchStoreComparison(stores, timeFilter, startDate, endDate);
            } else if (storeId) {
              fetchSales(storeId, timeFilter, startDate, endDate);
              fetchExpenses(storeId, timeFilter, startDate, endDate);
              fetchDebts(storeId, timeFilter, startDate, endDate);
              fetchInventory(storeId);
            } else {
              toast.error('Please select a store');
            }
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Single Store View */}
      {metricFilter !== 'Comparison' && storeId && (
        <>
          {/* Stats Cards */}
          <div className="mb-8">
            <FinancialStatsCards
              totalSales={metrics.totalSales}
              totalExpenses={metrics.totalExpenses}
              totalDebts={metrics.totalDebts}
              totalInventoryCost={metrics.totalInventoryCost}
              totalProfit={metrics.totalProfit}
              profitMargin={metrics.profitMargin}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {(metricFilter === 'All' || metricFilter === 'Sales') && (
              <SalesTrendChart salesTrendData={chartData.salesTrendData} timeGranularity={timeGranularity} />
            )}
            {(metricFilter === 'All' || metricFilter === 'Sales' || metricFilter === 'COGS') && (
              <CogsVsSalesChart cogsVsSalesData={chartData.cogsVsSalesData} />
            )}
            {(metricFilter === 'All' || metricFilter === 'Expenses') && (
              <ExpenseBreakdownChart expensePieData={chartData.expensePieData} hasData={chartData.expenseByType && Object.keys(chartData.expenseByType).length > 0} />
            )}
          </div>

          {/* Top Products */}
          {(metricFilter === 'All' || metricFilter === 'Sales') && (
            <div className="mb-8">
              <TopProductsList topProducts={metrics.topProducts} />
            </div>
          )}
        </>
      )}

      {/* Store Comparison View */}
      {metricFilter === 'Comparison' && stores.length > 1 && (
        <div className="space-y-8">
          {/* Metric Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Select Comparison Metric
            </label>
            <select
              className="w-full max-w-xs px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
              value={comparisonMetric}
              onChange={(e) => setComparisonMetric(e.target.value)}
            >
              <option value="totalSales">Sales</option>
              <option value="totalExpenses">Expenses</option>
              <option value="totalCOGS">Cost of Goods</option>
              <option value="totalDebts">Debts</option>
              <option value="totalProfit">Profit</option>
              <option value="profitMargin">Profit Margin</option>
            </select>
          </div>

          {/* Comparison Chart */}
          {storeComparison.length > 0 && (
            <>
              <StoreComparisonChart
                comparisonChartData={comparisonData.comparisonChartData}
                comparisonMetric={comparisonMetric}
                
              />
              <StoreComparisonList
                storeComparison={storeComparison}
                bestPerformers={comparisonData.bestPerformers}
              />

              <TopProductsList 
  topProducts={metrics.topProducts} 
  onDelete={(product) => {
    console.log('Delete product:', product);
  
  }}
/>
            </>
          )}

          {storeComparison.length === 0 && !isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No comparison data available. Please apply filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-slate-700 dark:text-slate-300 font-medium">Loading financial data...</p>
          </div>
        </div>
      )}
    </div>
  );
}