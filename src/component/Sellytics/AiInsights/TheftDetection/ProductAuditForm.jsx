/**
 * Product Audit Form Component
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Download } from 'lucide-react';
import ProductSelector from './ProductSelector';

export default function ProductAuditForm({
  products,
  selectedProducts,
  onAddProduct,
  onUpdateCount,
  onRemoveProduct,
  onClearAll
}) {
  // Download CSV with current products
  const downloadProductsCSV = () => {
    const headers = 'product_name,available_quantity,physical_count\n';
    const rows = selectedProducts.map(sp => 
      `"${sp.productName}",${sp.availableQty || ''},${sp.physicalCount || ''}`
    ).join('\n');
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `product_audit_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Product Selector + Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="flex-1">
          <ProductSelector
            products={products}
            selectedProducts={selectedProducts}
            onAddProduct={onAddProduct}
          />
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={downloadProductsCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button
              onClick={onClearAll}
              className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors whitespace-nowrap text-sm"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Selected Products - One per row */}
      <AnimatePresence mode="popLayout">
        {selectedProducts.map((sp, index) => (
          <motion.div
            key={sp.productId}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
          >
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 p-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white truncate">
                    {sp.productName}
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    Available: <span className="font-semibold text-emerald-600">
                      {sp.availableQty !== null ? sp.availableQty : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Count Input */}
              <div className="flex items-center gap-3 lg:w-auto">
                <div className="flex-1 lg:flex-initial">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 lg:hidden">
                    Physical Count
                  </label>
                  <input
                    type="number"
                    value={sp.physicalCount}
                    onChange={(e) => onUpdateCount(sp.productId, e.target.value)}
                    placeholder="Count"
                    min="0"
                    className="w-full lg:w-28 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveProduct(sp.productId)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {selectedProducts.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No products added yet. Select products to start audit.
          </p>
        </div>
      )}
    </div>
  );
}