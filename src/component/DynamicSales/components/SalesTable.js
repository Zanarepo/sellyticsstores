// src/components/SalesTable.jsx — FIXED DELETE BUTTON
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { supabase } from '../../../supabaseClient';

export default function SalesTable({
  viewMode,
  paginatedSales,
  paginatedTotals,
  openDetailModal,
  formatCurrency,
  onEdit,
  onDelete,
  storeId,
}) {
  const [isStoreOwner, setIsStoreOwner] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const userEmail = localStorage.getItem('user_email')?.trim()?.toLowerCase();
      if (!userEmail || !storeId) {
        setIsStoreOwner(false);
        return;
      }

      try {
        // CHECK stores.email_address
        const { data: ownerData, error: ownerError } = await supabase
          .from('stores')
          .select('id')
          .eq('id', storeId)
          .eq('email_address', userEmail)
          .single();

        if (ownerError && ownerError.code !== 'PGRST116') {
          console.error('Owner check error:', ownerError);
        }

        if (ownerData) {
          setIsStoreOwner(true);
          return;
        }

        // CHECK store_users.email_address
        const { error: userError } = await supabase
          .from('store_users')
          .select('id')
          .eq('store_id', storeId)
          .eq('email_address', userEmail)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error('Store user check error:', userError);
        }

        setIsStoreOwner(false);
      } catch (err) {
        console.error('Permission check failed:', err);
        setIsStoreOwner(false);
      }
    };

    checkPermission();
  }, [storeId]);

  // Show summary for both Daily and Weekly totals
  if (viewMode === 'daily' || viewMode === 'weekly') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Period</th>
              <th className="px-6 py-4 text-left font-semibold">Total Sales (₦)</th>
              <th className="px-6 py-4 text-left font-semibold">Number of Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedTotals.length > 0 ? (
              paginatedTotals.map((t, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 font-medium">{t.period}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">₦{formatCurrency(t.total)}</td>
                  <td className="px-6 py-4 text-indigo-600 font-medium">{t.count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No sales data for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
            <tr>
              {['Product', 'Customer', 'Qty', 'Unit Price', 'Amount', 'Payment', 'IDs/Sizes', 'Date Sold', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedSales.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-5 py-4 font-medium">{s.dynamic_product?.name || 'Unknown'}</td>
                <td className="px-5 py-4">{s.customer_name || 'Walk-in'}</td>
                <td className="px-5 py-4 font-semibold text-indigo-600">{s.quantity}</td>
                <td className="px-5 py-4">₦{formatCurrency(s.unit_price)}</td>
                <td className="px-5 py-4 font-bold text-green-600">₦{formatCurrency(s.amount)}</td>
                <td className="px-5 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    s.payment_method === 'Cash' ? 'bg-green-100 text-green-800' :
                    s.payment_method === 'Card' ? 'bg-blue-100 text-blue-800' :
                    s.payment_method === 'Transfer' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {s.payment_method}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {s.deviceIds?.length > 0 ? (
                    <button onClick={() => openDetailModal(s)} className="text-indigo-600 hover:underline font-medium">
                      View {s.deviceIds.length} ID{s.deviceIds.length !== 1 ? 's' : ''}
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-xs text-gray-600">
                  {new Date(s.sold_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-4 items-center">
                    <button onClick={() => onEdit(s, idx)} className="text-indigo-600 hover:text-indigo-800 transition transform hover:scale-110" title="Edit">
                      <FaEdit size={18} />
                    </button>

                    {isStoreOwner ? (
                      <button 
                        onClick={() => onDelete(s)}  // ← FIXED: Now "onClick" (no space/k)
                        className="text-red-600 hover:text-red-800 transition transform hover:scale-110" 
                        title="Delete"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    ) : (
                      <div className="text-gray-400 cursor-not-allowed" title="Only store owner can delete sales">
                        <FaTrashAlt size={18} />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}