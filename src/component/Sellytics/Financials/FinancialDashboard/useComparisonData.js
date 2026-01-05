import { useMemo } from 'react';

export const useComparisonData = (storeComparison, comparisonMetric, preferredCurrency) => {
  return useMemo(() => {
    const comparisonChartData = {
      labels: storeComparison.map(s => s.storeName),
      datasets: [{
        label: comparisonMetric === 'profitMargin' 
          ? 'Profit Margin (%)' 
          : `${comparisonMetric.replace('total', '')} (${preferredCurrency.symbol})`,
        data: storeComparison.map(s => s[comparisonMetric]),
        backgroundColor: 
          comparisonMetric === 'totalSales' ? '#10B981' :
          comparisonMetric === 'totalExpenses' ? '#EF4444' :
          comparisonMetric === 'totalCOGS' ? '#3B82F6' :
          comparisonMetric === 'totalDebts' ? '#F59E0B' :
          comparisonMetric === 'totalProfit' ? '#6B7280' : '#8B5CF6',
      }],
    };

    const bestPerformers = {
      totalSales: storeComparison.reduce((max, s) => s.totalSales > (max?.totalSales || 0) ? s : max, null)?.storeName,
      totalExpenses: storeComparison.reduce((min, s) => s.totalExpenses < (min?.totalExpenses || Infinity) ? s : min, null)?.storeName,
      totalCOGS: storeComparison.reduce((min, s) => s.totalCOGS < (min?.totalCOGS || Infinity) ? s : min, null)?.storeName,
      totalDebts: storeComparison.reduce((min, s) => s.totalDebts < (min?.totalDebts || Infinity) ? s : min, null)?.storeName,
      totalProfit: storeComparison.reduce((max, s) => s.totalProfit > (max?.totalProfit || 0) ? s : max, null)?.storeName,
      profitMargin: storeComparison.reduce((max, s) => s.profitMargin > (max?.profitMargin || 0) ? s : max, null)?.storeName,
    };

    return { comparisonChartData, bestPerformers };
  }, [storeComparison, comparisonMetric, preferredCurrency]);
};