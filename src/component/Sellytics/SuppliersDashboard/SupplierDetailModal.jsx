// src/components/Suppliers/SupplierDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-toastify';
import { useCurrency } from '../../context/currencyContext';

export default function SupplierDetailModal({ supplierName, open, onClose }) {
  const storeId = Number(localStorage.getItem('store_id'));
  const { formatPrice } = useCurrency();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !supplierName) return;

    const fetchStats = async () => {
      setLoading(true);

      const { data: inventoryData, error: invError } = await supabase
        .from('suppliers_inventory')
        .select('qty')
        .eq('store_id', storeId)
        .eq('supplier_name', supplierName);

      if (invError) {
        toast.error('Failed to load supplier stats');
        setLoading(false);
        return;
      }

      const totalSupplies = inventoryData.length;
      const totalQty = inventoryData.reduce((sum, item) => sum + (item.qty || 0), 0);

      const { data: productData } = await supabase
        .from('dynamic_product')
        .select('purchase_price, purchase_qty')
        .eq('store_id', storeId)
        .eq('suppliers_name', supplierName);

      const totalWorth = productData
        ? productData.reduce(
            (sum, p) => sum + (p.purchase_price || 0) * (p.purchase_qty || 1),
            0
          )
        : 0;

      setStats({ totalSupplies, totalQty, totalWorth });
      setLoading(false);
    };

    fetchStats();
  }, [supplierName, open, storeId]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {supplierName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              Loading supplier stats...
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Total Supplies
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {stats.totalSupplies}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Total Quantity
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {stats.totalQty.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Estimated Worth
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatPrice(stats.totalWorth)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Based on purchase prices from product catalog
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
