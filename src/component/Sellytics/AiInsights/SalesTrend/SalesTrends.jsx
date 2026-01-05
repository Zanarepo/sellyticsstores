import React, { useState, useMemo } from 'react';
import useSalesTrends from '../SalesTrend/hooks/useSalesTrends';
import SalesFilters from './SalesFilters';
import SalesCard from './SalesCard';
import GrowthChart from './GrowthChart';
import TopProductsChart from './TopProductsChart';

const SalesTrends = () => {
  const storeId = localStorage.getItem('store_id');

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  });

  const [rangeFilter, setRangeFilter] = useState('single');

  const {
    trends = [],
    selectedMonthTopProducts = {},
    loading,
    error,
  } = useSalesTrends(storeId, selectedMonth);

  const filteredTrends = useMemo(() => {
    if (!trends.length) return [];

    if (rangeFilter === 'single') {
      return trends.filter(t => t.month === selectedMonth);
    }

    if (rangeFilter === 'all') {
      return trends;
    }

    const monthsBack = Number(rangeFilter.replace('last', '')) || 12;
    const end = new Date(`${selectedMonth}-01`);
    const start = new Date(end);
    start.setMonth(end.getMonth() - monthsBack + 1);

    const startMonth = start.toISOString().slice(0, 7);

    return trends.filter(
      t => t.month >= startMonth && t.month <= selectedMonth
    );
  }, [trends, rangeFilter, selectedMonth]);

  if (!storeId) return <p>Please log in or select a store.</p>;
  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
        Sales Trends
      </h1>

      <SalesFilters
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        rangeFilter={rangeFilter}
        setRangeFilter={setRangeFilter}
      />

      {/* Sales cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
        {filteredTrends.length ? (
          filteredTrends.map(trend => (
            <SalesCard
              key={trend.month}
              trend={trend}
              topProducts={
                trend.month === selectedMonth
                  ? selectedMonthTopProducts
                  : null
              }
              onClick={() => console.log('Clicked month', trend.month)}
            />
          ))
        ) : (
          <p className="col-span-full text-gray-600 dark:text-gray-300">
            No sales data available.
          </p>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-white mb-2">
            Monthly Growth
          </h2>
          <div className="h-64 sm:h-80">
            <GrowthChart
              data={{
                labels: filteredTrends.map(t => t.month),
                datasets: [
                  {
                    label: 'Growth (%)',
                    data: filteredTrends.map(t => t.monthly_growth * 100),
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-white mb-2">
            Top Products ({selectedMonth})
          </h2>
          <div className="h-64 sm:h-80">
            <TopProductsChart
              data={{
                labels: Object.keys(selectedMonthTopProducts),
                datasets: [
                  {
                    label: 'Units Sold',
                    data: Object.values(selectedMonthTopProducts),
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTrends;
