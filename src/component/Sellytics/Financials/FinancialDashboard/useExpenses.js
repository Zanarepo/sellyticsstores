import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExpenses = useCallback(async (storeId, timeFilter, startDate, endDate) => {
    if (!storeId) {
      setExpenses([]);
      return;
    }
    
    setIsLoading(true);
    let query = supabase
      .from('expense_tracker')
      .select('amount, expense_type, expense_date')
      .eq('store_id', storeId);
    
    if (timeFilter !== 'custom') {
      const start = timeFilter === '30d' ? subDays(new Date(), 30) : 
                    timeFilter === '6m' ? subDays(new Date(), 180) : 
                    subDays(new Date(), 365);
      query = query.gte('expense_date', format(start, 'yyyy-MM-dd'));
    } else if (startDate && endDate) {
      query = query.gte('expense_date', startDate).lte('expense_date', endDate);
    }

    const { data, error } = await query;
    if (error) {
      toast.error('Error loading expenses: ' + error.message);
      setExpenses([]);
    } else {
      setExpenses(data || []);
    }
    setIsLoading(false);
  }, []);

  return { expenses, fetchExpenses, isLoading };
};