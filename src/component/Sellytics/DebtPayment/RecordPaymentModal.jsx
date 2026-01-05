// src/components/Debt/RecordPaymentModal.jsx
import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import {useCurrency} from '../../context/currencyContext'
import toast from 'react-hot-toast';




const methods = ['Cash', 'Card', 'Transfer'];



export default function RecordPaymentModal({ debt, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);

  const storeId = localStorage.getItem('store_id');
  const { formatPrice } = useCurrency();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) > debt.remaining) {
      toast.error('Amount exceeds balance');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('debt_payment_history').insert([{
      debt_tracker_id: debt.id,
      customer_id: debt.customer_id,
      amount_paid: Number(amount),
      payment_method: method,
      payment_date: new Date().toISOString(),
      store_id: storeId,
    }]);

    if (error) toast.error('Failed to record payment');
    else {
      toast.success('Payment recorded');
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Record Payment</h2>
        <p className="mb-4">Customer: <strong>{debt.customer_name}</strong></p>
        <p className="mb-6 text-lg">Balance: <strong className="text-red-600">{formatPrice(debt.remaining)}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="number"
            step="0.01"
            placeholder="Amount Paid"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-xl dark:bg-slate-700"
          />
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-xl dark:bg-slate-700"
          >
            <option value="">Select Method</option>
            {methods.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-70">
              {loading ? 'Saving...' : 'Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}