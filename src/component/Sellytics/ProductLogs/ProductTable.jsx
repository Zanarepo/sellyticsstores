/**
 * Product Table Component
 */
import React from 'react';
import { Edit, Trash2, Eye, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductTable({ 
  products, 
  isLoading, 
  onEdit, 
  onDelete, 
  onDetail 
}) {
  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <Package className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No products yet
        </h3>
        <p className="text-sm text-slate-500">
          Create your first product to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Buy Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Sell Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            <AnimatePresence>
              {products.map((product, index) => {
                const qty = product.is_unique 
                  ? (product.deviceList?.length || 0)
                  : (product.purchase_qty || 0);
                const isLowStock = qty <= 5 && qty > 0;
                const isOutOfStock = qty === 0;

                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {product.name}
                          </div>
                          {product.is_unique && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              IMEI Tracked
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {product.suppliers_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      ₦{Number(product.purchase_price || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      ₦{Number(product.selling_price || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          isOutOfStock 
                            ? 'text-red-600' 
                            : isLowStock 
                              ? 'text-amber-600' 
                              : 'text-emerald-600'
                        }`}>
                          {qty}
                        </span>
                        {(isOutOfStock || isLowStock) && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.sync_status === 'pending' ? (
                        <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                          Pending
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                          Synced
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onDetail(product)}
                          className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}