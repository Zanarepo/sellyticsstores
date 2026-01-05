/**
 * Sales Trends Data Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

export default function useSalesTrends() {
  const [storeId] = useState(localStorage.getItem('store_id') || null);
  const [trends, setTrends] = useState([]);
  const [selectedMonthData, setSelectedMonthData] = useState({
    topProduct: null,
    topProducts: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  });
  const [rangeFilter, setRangeFilter] = useState('last6');

  const fetchData = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch sales trends
      const { data: trendsData, error: trendsError } = await supabase
        .from('sales_trends')
        .select('month, total_quantity, monthly_growth, top_products')
        .eq('store_id', parseInt(storeId))
        .order('month', { ascending: true });

      if (trendsError) throw trendsError;

      // Fetch valid product IDs
      const { data: salesData, error: salesError } = await supabase
        .from('dynamic_sales')
        .select('dynamic_product_id')
        .eq('store_id', parseInt(storeId));

      if (salesError) throw salesError;

      const validProductIds = new Set(salesData.map(s => s.dynamic_product_id.toString()));

      // Fetch sales for selected month
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01T00:00:00Z`;
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10) + 'T23:59:59Z';

      const { data: monthData, error: monthError } = await supabase
        .from('dynamic_sales')
        .select('dynamic_product_id, quantity')
        .eq('store_id', parseInt(storeId))
        .gte('sold_at', startDate)
        .lte('sold_at', endDate);

      if (monthError) throw monthError;

      // Aggregate sales
      const monthSales = monthData.reduce((acc, sale) => {
        const id = sale.dynamic_product_id.toString();
        acc[id] = (acc[id] || 0) + parseInt(sale.quantity);
        return acc;
      }, {});

      // Find top product
      const topProduct = Object.entries(monthSales).reduce(
        (max, [id, qty]) => (parseInt(qty) > parseInt(max.qty) ? { id, qty } : max),
        { id: null, qty: 0 }
      );

      // Top 5 products
      const topFive = Object.entries(monthSales)
        .sort(([, a], [, b]) => parseInt(b) - parseInt(a))
        .slice(0, 5)
        .reduce((acc, [id, qty]) => ({ ...acc, [id]: qty }), {});

      // Fetch product names
      const productIds = [
        ...new Set([
          ...trendsData.flatMap(t => Object.keys(t.top_products || {}).filter(id => validProductIds.has(id))),
          ...Object.keys(monthSales),
        ].filter(id => id).map(id => parseInt(id))),
      ];

      const { data: productsData } = await supabase
        .from('dynamic_product')
        .select('id, name')
        .in('id', productIds);

      const productMap = new Map(productsData?.map(p => [p.id.toString(), p.name || `Product ${p.id}`]) || []);

      // Process trends
      const processed = trendsData.map(trend => {
        const topProducts = {};
        for (const [id, qty] of Object.entries(trend.top_products || {})) {
          if (validProductIds.has(id)) {
            const name = productMap.get(id);
            if (name) topProducts[name] = qty;
          }
        }
        
        const top = Object.entries(topProducts).reduce(
          (max, [name, qty]) => (parseInt(qty) > parseInt(max.qty) ? { name, qty } : max),
          { name: null, qty: 0 }
        );

        return {
          ...trend,
          top_products: topProducts,
          top_product: top.name ? `${top.name}: ${top.qty}` : 'No sales',
        };
      });

      // Remove duplicates
      const unique = Array.from(new Map(processed.map(t => [t.month, t])).values());

      // Set month data
      const topName = topProduct.id ? productMap.get(topProduct.id) : null;
      const topFiveWithNames = {};
      for (const [id, qty] of Object.entries(topFive)) {
        const name = productMap.get(id) || `Product ${id}`;
        topFiveWithNames[name] = qty;
      }

      setSelectedMonthData({
        topProduct: topName && topProduct.qty > 0 ? { name: topName, quantity: topProduct.qty } : null,
        topProducts: topFiveWithNames,
      });

      setTrends(unique);
    } catch (err) {
      console.error('Failed to fetch sales trends:', err);
      toast.error('Failed to load sales trends');
    } finally {
      setLoading(false);
    }
  }, [storeId, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter trends by range
  const getFilteredTrends = useCallback(() => {
    if (rangeFilter === 'all') return trends;
    if (rangeFilter === 'single') return trends.filter(t => t.month === selectedMonth);

    const months = parseInt(rangeFilter.replace('last', '')) || 12;
    const endDate = new Date(selectedMonth + '-01');
    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - months + 1);
    const startMonth = startDate.toISOString().slice(0, 7);

    return trends.filter(t => t.month >= startMonth && t.month <= selectedMonth);
  }, [trends, rangeFilter, selectedMonth]);

  // Calculate projections
  const getProjections = useCallback(() => {
    const filtered = getFilteredTrends();
    if (filtered.length < 2) return null;

    const recent = filtered.slice(-3);
    const avgGrowth = recent.reduce((sum, t) => sum + t.monthly_growth, 0) / recent.length;
    const lastQty = filtered[filtered.length - 1]?.total_quantity || 0;

    return {
      nextMonth: Math.round(lastQty * (1 + avgGrowth)),
      avgGrowth: avgGrowth * 100,
      trend: avgGrowth > 0 ? 'up' : avgGrowth < 0 ? 'down' : 'stable',
    };
  }, [getFilteredTrends]);

  return {
    storeId,
    trends,
    selectedMonthData,
    loading,
    selectedMonth,
    setSelectedMonth,
    rangeFilter,
    setRangeFilter,
    getFilteredTrends,
    getProjections,
  };
}