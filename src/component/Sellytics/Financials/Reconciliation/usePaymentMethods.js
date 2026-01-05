// hooks/usePaymentMethods.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';

const allPaymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Wallet'];

export default function usePaymentMethods(storeId) {
  const [paymentMethods, setPaymentMethods] = useState(allPaymentMethods);
  const [loading, setLoading] = useState(false);

  const fetchPaymentMethods = useCallback(async () => {
    if (!storeId) {
      setPaymentMethods(allPaymentMethods);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dynamic_sales')
        .select('payment_method')
        .eq('store_id', storeId)
        .not('payment_method', 'is', null);

      if (error) throw error;

      const uniqueMethods = [...new Set(
        data.map(item => normalizePaymentMethod(item.payment_method))
      )];

      const combined = [...new Set([...allPaymentMethods, ...uniqueMethods])].sort();
      setPaymentMethods(combined);
    } catch (error) {
      toast.error('Error fetching payment methods: ' + error.message);
      setPaymentMethods(allPaymentMethods);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return { paymentMethods, loading, fetchPaymentMethods };
}

// Helper (move to utils if you prefer)
function normalizePaymentMethod(method) {
  if (!method) return 'Unknown';
  if (method.toLowerCase() === 'cash') return 'Cash';
  return method
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}