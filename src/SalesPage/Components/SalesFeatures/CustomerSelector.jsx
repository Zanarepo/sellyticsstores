import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Loader2 } from 'lucide-react';
import { supabase } from '../../../../supabaseClient';

export default function CustomerSelector({ storeId, selectedCustomerId, onCustomerChange }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!storeId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('customer')
          .select('id, fullname')
          .eq('store_id', storeId)
          .order('fullname');
        if (error) throw error;
        setCustomers(data || []);
      } catch (err) {
        toast.error('Failed to load customers');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [storeId]);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <User className="w-4 h-4" />
        Customer
      </label>

      {loading ? (
        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading customers...
        </div>
      ) : (
        <select
          value={selectedCustomerId || ''}
          onChange={(e) => onCustomerChange(Number(e.target.value) || null)}
          className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
        >
          <option value="">Walk-in customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.fullname}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}