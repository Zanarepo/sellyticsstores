// hooks/useSales.js
import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function useSales(storeId, checkDate, timePeriod, selectedPaymentMethod) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSales = useCallback(async () => {
    if (!storeId || !checkDate) {
      setSales([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('dynamic_sales')
        .select('id, sold_at, payment_method, amount, status, customer_name')
        .eq('store_id', storeId);

      let startDate, endDate;
      if (timePeriod === 'daily') {
        startDate = startOfDay(new Date(checkDate));
        endDate = endOfDay(new Date(checkDate));
      } else if (timePeriod === 'weekly') {
        startDate = startOfWeek(new Date(checkDate), { weekStartsOn: 1 });
        endDate = endOfWeek(new Date(checkDate), { weekStartsOn: 1 });
      } else if (timePeriod === 'monthly') {
        startDate = startOfMonth(new Date(checkDate));
        endDate = endOfMonth(new Date(checkDate));
      }

      query = query
        .gte('sold_at', format(startDate, 'yyyy-MM-dd HH:mm:ss'))
        .lte('sold_at', format(endDate, 'yyyy-MM-dd HH:mm:ss'));

      if (selectedPaymentMethod && selectedPaymentMethod !== 'All Payment Methods') {
        query = query.eq('payment_method', selectedPaymentMethod.toLowerCase());
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.warn('No sales data found for the selected filters.');
      }
      setSales(data || []);
    } catch (error) {
      toast.error('Error loading sales: ' + error.message);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, checkDate, timePeriod, selectedPaymentMethod]);

  return { sales, loading, fetchSales };
}