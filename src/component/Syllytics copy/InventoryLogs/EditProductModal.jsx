/**
 * SwiftInventory - Edit Product Modal
 * Modal for editing product details
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Loader2, Save } from 'lucide-react';

export default function EditProductModal({
  item,
  onClose,
  onSubmit,
  isSubmitting
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selling_price: 0,
    purchase_price: 0,
    dynamic_product_imeis: ''
  });

  const product = item?.dynamic_product;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        selling_price: product.selling_price || 0,
        purchase_price: product.purchase_price || 0,
        dynamic_product_imeis: product.dynamic_product_imeis || ''
      });
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit(product.id, {
      ...formData,
      selling_price: parseFloat(formData.selling_price) || 0,
      purchase_price: parseFloat(formData.purchase_price) || 0
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Edit Product</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Selling Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={e => handleChange('selling_price', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cost Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={e => handleChange('purchase_price', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Product Id</label>
              <input
                type="text"
                value={formData.dynamic_product_imeis}
                onChange={e => handleChange('dynamic_product_imeis', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Trackable Note */}
            {product.is_unique && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-sm text-purple-700 dark:text-purple-300">
                This is a trackable product. Quantity is managed via device IDs/IMEIs.
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
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