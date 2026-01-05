import { useState, useEffect } from 'react';
import { supabase } from '../../../../../supabaseClient';

const useSalesTrends = (storeId, selectedMonth) => {
  const [trends, setTrends] = useState([]);
  const [selectedMonthTopProduct, setSelectedMonthTopProduct] = useState(null);
  const [selectedMonthTopProducts, setSelectedMonthTopProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) {
        setError('No store selected.');
        setLoading(false);
        return;
      }

      try {
        // Fetch trends
        const { data: trendsData, error: trendsError } = await supabase
          .from('sales_trends')
          .select('month, total_quantity, monthly_growth, top_products')
          .eq('store_id', parseInt(storeId))
          .order('month', { ascending: true })
          .limit(100);
        if (trendsError) throw trendsError;

        // Fetch valid product IDs from dynamic_sales
        const { data: salesData, error: salesError } = await supabase
          .from('dynamic_sales')
          .select('dynamic_product_id')
          .eq('store_id', parseInt(storeId));
        if (salesError) throw salesError;

        const validProductIds = new Set(salesData.map(s => s.dynamic_product_id.toString()));

        // Get top product for selected month
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

        const monthSalesAggregated = monthData.reduce((acc, sale) => {
          const id = sale.dynamic_product_id.toString();
          acc[id] = (acc[id] || 0) + parseInt(sale.quantity);
          return acc;
        }, {});

        // Top product
        const topMonthProduct = Object.entries(monthSalesAggregated).reduce(
          (max, [id, qty]) => (qty > max.qty ? { id, qty } : max),
          { id: null, qty: 0 }
        );

        // Top 5 products
        const topFive = Object.entries(monthSalesAggregated)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .reduce((acc, [id, qty]) => ({ ...acc, [id]: qty }), {});

        // Fetch product names
        const productIds = [...new Set([...Object.keys(topFive).map(Number), ...Object.keys(monthSalesAggregated).map(Number)])];
        const { data: productsData } = await supabase
          .from('dynamic_product')
          .select('id, name')
          .in('id', productIds);

        const productMap = new Map(productsData.map(p => [p.id.toString(), p.name || `Unknown ${p.id}`]));

        const monthTopProductName = topMonthProduct.id ? productMap.get(topMonthProduct.id) : null;
        setSelectedMonthTopProduct(monthTopProductName ? { name: monthTopProductName, quantity: topMonthProduct.qty } : null);

        const topProductsWithNames = {};
        for (const [id, qty] of Object.entries(topFive)) {
          topProductsWithNames[productMap.get(id) || `Unknown ${id}`] = qty;
        }
        setSelectedMonthTopProducts(topProductsWithNames);

        setTrends(trendsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, selectedMonth]);

  return { trends, selectedMonthTopProduct, selectedMonthTopProducts, loading, error };
};

export default useSalesTrends;
