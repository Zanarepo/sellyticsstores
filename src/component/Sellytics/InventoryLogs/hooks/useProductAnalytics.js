/**
 * SwiftInventory - useProductAnalytics Hook
 * Comprehensive analytics for a single product
 */
import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';

export default function useProductAnalytics(productId, storeId) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    salesTrends: [],
    profitability: {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      margin: 0
    },
    restockHistory: [],
    avgStockLife: null,
    forecastDays: null,
    topCustomers: []
  });

  useEffect(() => {
    if (!productId || !storeId) {
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      setLoading(true);

      try {
        // Parallel fetch all required data
        const [
          { data: sales, error: salesError },
          { data: product, error: productError },
          { data: restockLogs, error: restockError },
          { data: inventory, error: inventoryError }
        ] = await Promise.all([
          supabase
            .from('dynamic_sales')
            .select('quantity, amount, sold_at, customer_id')
            .eq('dynamic_product_id', productId)
            .eq('store_id', storeId)
            .order('sold_at', { ascending: true }),

          supabase
            .from('dynamic_product')
            .select('purchase_price')
            .eq('id', productId)
            .single(),

          supabase
            .from('product_inventory_adjustments_logs')
            .select('id, difference, reason, updated_by_email, created_at')
            .eq('dynamic_product_id', productId)
            .eq('store_id', storeId)
            .gt('difference', 0) // Only restocks
            .order('created_at', { ascending: false }),

          supabase
            .from('dynamic_inventory')
            .select('available_qty, updated_at')
            .eq('dynamic_product_id', productId)
            .eq('store_id', storeId)
            .single()
        ]);

        if (salesError || productError || restockError || inventoryError) {
          throw salesError || productError || restockError || inventoryError;
        }

        const purchasePrice = product?.purchase_price || 0;
        const salesData = sales || [];
        const restocks = restockLogs || [];
        const currentInventory = inventory;

        // === Sales Trends (daily aggregation) ===
        const trendsMap = {};
        salesData.forEach(sale => {
          const day = sale.sold_at?.split('T')[0];
          if (day) {
            if (!trendsMap[day]) {
              trendsMap[day] = { day, qty: 0, amount: 0 };
            }
            trendsMap[day].qty += sale.quantity || 0;
            trendsMap[day].amount += Number(sale.amount || 0);
          }
        });
        const salesTrends = Object.values(trendsMap);

        // === Profitability ===
        let totalRevenue = 0;
        let totalCost = 0;
        salesData.forEach(sale => {
          totalRevenue += Number(sale.amount || 0);
          totalCost += (sale.quantity || 0) * purchasePrice;
        });
        const totalProfit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        // === Forecast: Days of stock remaining (based on last 30 days) ===
        let forecastDays = null;
        if (currentInventory && currentInventory.available_qty > 0) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentSales = salesData.filter(
            s => s.sold_at && new Date(s.sold_at) >= thirtyDaysAgo
          );
          const totalSoldLast30 = recentSales.reduce((sum, s) => sum + (s.quantity || 0), 0);
          const dailyAvg = totalSoldLast30 / 30;

          forecastDays = dailyAvg > 0 
            ? Math.round(currentInventory.available_qty / dailyAvg)
            : Infinity;
        }

        // === Average Stock Life (days since first restock or inventory creation) ===
        let avgStockLife = null;
        if (restocks.length > 0) {
          const firstRestock = restocks[restocks.length - 1]; // oldest
          const firstDate = new Date(firstRestock.created_at);
          const now = new Date();
          avgStockLife = Math.round((now - firstDate) / (1000 * 60 * 60 * 24));
        } else if (currentInventory?.created_at) {
          const created = new Date(currentInventory.created_at);
          const now = new Date();
          avgStockLife = Math.round((now - created) / (1000 * 60 * 60 * 24));
        }

        // === Top Customers ===
        const customerMap = {};
        salesData.forEach(sale => {
          if (sale.customer_id) {
            if (!customerMap[sale.customer_id]) {
              customerMap[sale.customer_id] = { customerId: sale.customer_id, count: 0, amount: 0 };
            }
            customerMap[sale.customer_id].count += 1;
            customerMap[sale.customer_id].amount += Number(sale.amount || 0);
          }
        });

        const topCustomers = Object.values(customerMap)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // Set all analytics
        setAnalytics({
          salesTrends,
          profitability: { totalRevenue, totalCost, totalProfit, margin },
          restockHistory: restocks,
          avgStockLife,
          forecastDays,
          topCustomers
        });

      } catch (err) {
        console.error('Failed to load product analytics:', err);
        // Keep previous state on error
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [productId, storeId]);

  return {
    loading,
    ...analytics
  };
}