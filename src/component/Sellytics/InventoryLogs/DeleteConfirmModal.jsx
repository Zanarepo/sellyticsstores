/**
 * SwiftInventory - Delete Confirm Modal
 * Now with toast feedback on success/error
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';  // ← ONLY LINE YOU ADD

export default function DeleteConfirmModal({
  item,
  onClose,
  onConfirm,
  isSubmitting
}) {
  const product = item?.dynamic_product;
  if (!product) return null;

  const handleDelete = async () => {
    try {
      await onConfirm(product.id);  // your existing delete logic
      toast.success(`${product.name} deleted successfully`, {
        icon: 'Trash',
        duration: 4000,
      });
      onClose();
    } catch (error) {
      toast.error("Failed to delete product. Try again.", {
        duration: 5000,
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Delete Product
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium mb-1">This action cannot be undone!</p>
                <p>
                  You are about to permanently delete <strong>{product.name}</strong> 
                  from your inventory. All associated data including sales history 
                  will be affected.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Product</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {product.name}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-slate-600 dark:text-slate-400">Current Stock</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {item.available_qty} units
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-spin w-5 h-5" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}