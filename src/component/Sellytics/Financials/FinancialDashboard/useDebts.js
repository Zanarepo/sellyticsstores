import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

export const useDebts = () => {
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebts = useCallback(async (storeId, timeFilter, startDate, endDate) => {
    if (!storeId) {
      setDebts([]);
      return;
    }
    
    setIsLoading(true);
    let query = supabase
      .from('debts')
      .select('remaining_balance, product_name, date')
      .eq('store_id', storeId);
    
    if (timeFilter !== 'custom') {
      const start = timeFilter === '30d' ? subDays(new Date(), 30) : 
                    timeFilter === '6m' ? subDays(new Date(), 180) : 
                    subDays(new Date(), 365);
      query = query.gte('date', format(start, 'yyyy-MM-dd'));
    } else if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) {
      toast.error('Error loading debts: ' + error.message);
      setDebts([]);
    } else {
      setDebts(data || []);
    }
    setIsLoading(false);
  }, []);

  return { debts, fetchDebts, isLoading };
};