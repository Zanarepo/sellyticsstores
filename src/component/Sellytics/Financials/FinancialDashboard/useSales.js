import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSales = useCallback(async (storeId, timeFilter, startDate, endDate) => {
    if (!storeId) {
      setSales([]);
      return;
    }
    
    setIsLoading(true);
    let query = supabase
      .from('dynamic_sales')
      .select(`
        amount,
        sold_at,
        quantity,
        dynamic_product_id,
        dynamic_product (name)
      `)
      .eq('store_id', storeId)
      .eq('status', 'sold');
    
    if (timeFilter !== 'custom') {
      const start = timeFilter === '30d' ? subDays(new Date(), 30) : 
                    timeFilter === '6m' ? subDays(new Date(), 180) : 
                    subDays(new Date(), 365);
      query = query.gte('sold_at', format(start, 'yyyy-MM-dd'));
    } else if (startDate && endDate) {
      query = query.gte('sold_at', startDate).lte('sold_at', endDate);
    }

    const { data, error } = await query;
    if (error) {
      toast.error('Error loading sales: ' + error.message);
      setSales([]);
    } else {
      setSales(data || []);
    }
    setIsLoading(false);
  }, []);

  return { sales, fetchSales, isLoading };
};