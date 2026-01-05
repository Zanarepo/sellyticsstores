// hooks/useReconciliationChecks.js
import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';

export default function useReconciliationChecks(storeId) {
  const [reconciliationChecks, setReconciliationChecks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReconciliationChecks = useCallback(async () => {
    if (!storeId) {
      setReconciliationChecks([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reconciliation_checks')
        .select(`
          id, store_id, check_date, period, payment_method, expected_amount, actual_amount, 
          discrepancy, notes, status, created_at,
          stores (shop_name)
        `)
        .eq('store_id', storeId)
        .order('check_date', { ascending: false });

      if (error) throw error;
      setReconciliationChecks(data || []);
    } catch (error) {
      toast.error('Error loading reconciliation checks: ' + error.message);
      setReconciliationChecks([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  return { reconciliationChecks, loading, fetchReconciliationChecks };
}