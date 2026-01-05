import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

export const useStoreComparison = () => {
  const [storeComparison, setStoreComparison] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStoreComparison = useCallback(async (stores, timeFilter, startDate, endDate) => {
    if (!stores || stores.length === 0) {
      setStoreComparison([]);
      return;
    }
    
    setIsLoading(true);
    const comparisonData = [];

    for (const store of stores) {
      let salesQuery = supabase
        .from('dynamic_sales')
        .select('amount, quantity, dynamic_product_id')
        .eq('store_id', store.id)
        .eq('status', 'sold');
      
      let expensesQuery = supabase
        .from('expense_tracker')
        .select('amount')
        .eq('store_id', store.id);
      
      let debtsQuery = supabase
        .from('debts')
        .select('remaining_balance')
        .eq('store_id', store.id);
      
      const { data: prodData } = await supabase
        .from('dynamic_product')
        .select('id, purchase_price')
        .eq('store_id', store.id);

      if (timeFilter !== 'custom') {
        const start = timeFilter === '30d' ? subDays(new Date(), 30) : 
                      timeFilter === '6m' ? subDays(new Date(), 180) : 
                      subDays(new Date(), 365);
        salesQuery = salesQuery.gte('sold_at', format(start, 'yyyy-MM-dd'));
        expensesQuery = expensesQuery.gte('expense_date', format(start, 'yyyy-MM-dd'));
        debtsQuery = debtsQuery.gte('date', format(start, 'yyyy-MM-dd'));
      } else if (startDate && endDate) {
        salesQuery = salesQuery.gte('sold_at', startDate).lte('sold_at', endDate);
        expensesQuery = expensesQuery.gte('expense_date', startDate).lte('expense_date', endDate);
        debtsQuery = debtsQuery.gte('date', startDate).lte('date', endDate);
      }

      const { data: salesData, error: salesError } = await salesQuery;
      const { data: expensesData, error: expensesError } = await expensesQuery;
      const { data: debtsData, error: debtsError } = await debtsQuery;

      if (salesError || expensesError || debtsError) {
        toast.error(`Error loading data for ${store.shop_name}: ${salesError?.message || expensesError?.message || debtsError?.message}`);
        continue;
      }

      const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
      const totalExpenses = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
      const totalDebts = debtsData.reduce((sum, debt) => sum + (debt.remaining_balance || 0), 0);
      const totalCOGS = salesData.reduce((sum, sale) => {
        const product = prodData.find(p => p.id === sale.dynamic_product_id);
        return sum + (product?.purchase_price || 0) * sale.quantity;
      }, 0);
      const totalProfit = totalSales - totalCOGS - totalExpenses;
      const profitMargin = totalSales ? ((totalProfit / totalSales) * 100).toFixed(2) : 0;

      comparisonData.push({
        storeId: store.id,
        storeName: store.shop_name,
        totalSales,
        totalExpenses,
        totalDebts,
        totalCOGS,
        totalProfit,
        profitMargin,
      });
    }

    setStoreComparison(comparisonData);
    setIsLoading(false);
  }, []);

  return { storeComparison, fetchStoreComparison, isLoading };
};