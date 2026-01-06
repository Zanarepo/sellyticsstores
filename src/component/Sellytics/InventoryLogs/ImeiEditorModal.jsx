/**
 * SwiftInventory - IMEI Editor Modal
 * Modal for managing IMEIs/device IDs for unique products (unsold only)
 */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Scan, Plus, Trash2, Loader2, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useProductStock from '../InventoryLogs/hooks/useProductStock'; // adjust path if needed

export default function ImeiEditorModal({
  item,
  onClose,
  onAddImei,
  onRemoveImei,
  isSubmitting,
  openScanner
}) {
  const [newImei, setNewImei] = useState('');
  const inputRef = useRef(null);

  const product = item?.dynamic_product;
  const storeId = item?.store_id;

  // Hook returns all IMEIs, sold, and in-stock IDs
  const { imeis: allImeis, inStock, refresh } = useProductStock(product?.id, storeId);

  if (!product) return null;

  const handleAddImei = async () => {
    const trimmed = newImei.trim();
    if (!trimmed) {
      toast.error('Please enter a device ID');
      return;
    }

    // Prevent duplicates in all IMEIs (sold or not)
    if (allImeis.map(i => i.toLowerCase()).includes(trimmed.toLowerCase())) {
      toast.error('This device ID already exists');
      return;
    }

    const success = await onAddImei(product.id, trimmed);
    if (success) {
      setNewImei('');
      inputRef.current?.focus();
      toast.success(`Product ID "${trimmed}" added successfully`);
      refresh(); // refresh in-stock & sold after adding
    } else {
      toast.error('Failed to add Product ID');
    }
  };

  const handleRemoveImei = async (imei) => {
    const success = await onRemoveImei(product.id, imei);
    if (success) {
      toast.success(`Product ID "${imei}" removed successfully`);
      refresh(); // refresh in-stock & sold after removal
    } else {
      toast.error('Failed to remove Product ID');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImei();
    }
  };

  const handleScan = () => {
    if (openScanner) openScanner('external');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-5 border-b dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Box className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">Manage Product IDs</h2>
                <p className="text-sm text-slate-500 truncate">{product.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
            {/* Add New IMEI */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Add Product ID / IMEIs</label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newImei}
                  onChange={e => setNewImei(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scan or enter ID..."
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex-shrink-0 flex items-center gap-2">
                  <button type="button" onClick={handleScan} className="p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors">
                    <Scan className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onClick={handleAddImei}
                    disabled={isSubmitting || !newImei.trim()}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl font-medium flex items-center gap-1 sm:gap-2 transition-colors"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                Each device ID represents one unit in stock. Adding/removing IDs will automatically update the inventory count.
              </div>
            </div>

            {/* IMEI List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tracked IDs</span>
                <span className="text-sm text-slate-500">{inStock.length} units</span>
              </div>

              <div className="space-y-2 max-h-60 sm:max-h-64 overflow-y-auto p-0.5 -mr-2 pr-2">
                {inStock.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No IDs tracked</p>
                    <p className="text-sm">Add Product IDs to track inventory</p>
                  </div>
                ) : (
                  inStock.map((imei, index) => (
                    <motion.div
                      key={imei}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate">{imei}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveImei(imei)}
                        disabled={isSubmitting}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 sm:py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-5 h-5" />
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
