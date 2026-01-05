/**
 * SwiftCheckout - Customer Selector Component
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../supabaseClient';
import { User, Loader2 } from 'lucide-react';

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
        if (error) {
          throw new Error(`Failed to fetch customers: ${error.message}`);
        }
        setCustomers(data || []);
      } catch (err) {
        toast.error(err.message);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [storeId]);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <User className="w-3.5 h-3.5" />
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
          className="w-full p-2 sm:p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm min-w-[100px]"
        >
          <option value="">Select a customer...</option>
          {customers.map((customer) => (
            <option key={customer.id} value={String(customer.id)}>
              {customer.fullname}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}