/**
 * SwiftInventory - useProductAnalytics Hook
 * Fetches analytics data for a product
 */
import { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryServices';

export default function useProductAnalytics(productId, storeId) {
  const [loading, setLoading] = useState(true);
  const [salesTrends, setSalesTrends] = useState([]);
  const [profitability, setProfitability] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    margin: 0
  });
  const [restockHistory, setRestockHistory] = useState([]);
  const [avgStockLife, setAvgStockLife] = useState(null);
  const [forecastDays, setForecastDays] = useState(null);

  useEffect(() => {
    if (!productId || !storeId) {
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      setLoading(true);
      
      try {
        const [trends, profit, history, forecast] = await Promise.all([
          inventoryService.fetchSalesTrends(productId, storeId),
          inventoryService.fetchProfitability(productId, storeId),
          inventoryService.fetchRestockHistory(productId, storeId),
          inventoryService.fetchStockForecast(productId, storeId)
        ]);
        
        setSalesTrends(trends);
        setProfitability(profit);
        setRestockHistory(history);
        setForecastDays(forecast);
        
        // Calculate avg stock life from history
        if (history.length > 0) {
          const firstAdjustment = history[history.length - 1];
          const created = new Date(firstAdjustment.created_at);
          const now = new Date();
          const days = Math.round((now - created) / (1000 * 60 * 60 * 24));
          setAvgStockLife(days);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
      
      setLoading(false);
    };

    loadAnalytics();
  }, [productId, storeId]);

  return {
    loading,
    salesTrends,
    profitability,
    restockHistory,
    avgStockLife,
    forecastDays
  };
}