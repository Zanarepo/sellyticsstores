/**
 * SwiftCheckout - Edit Sale Modal
 * Fully supports online & offline sales
 */
import React, { useState } from 'react';
import { X, Save, Package, DollarSign, Hash, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import offlineCache from '../db/offlineCache';

export default function EditSaleModal({
  sale,
  products,
  customers,
  isOwner,
  currentUserId,
  onSave, // function to save online sale
  onClose,
  formatPrice,

}) {
  const [editedSale, setEditedSale] = useState({
    dynamic_product_id: sale?.dynamic_product_id || null,
    quantity: sale?.quantity || 1,
    unit_price: sale?.unit_price || 0,
    payment_method: sale?.payment_method || 'Cash',
    customer_id: sale?.customer_id || null,
    device_id: sale?.device_id || '',
    device_size: sale?.device_size || '',
    notes: sale?.notes || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Check if user can edit
  const canEdit = isOwner || sale?.created_by_user_id === currentUserId;

  const selectedProduct = products.find(p => p.id === editedSale.dynamic_product_id);
  const totalAmount = editedSale.quantity * editedSale.unit_price;






const handleSave = async () => {
  if (!editedSale.dynamic_product_id || editedSale.quantity <= 0 || editedSale.unit_price <= 0) {
    toast.error('Please fill all fields correctly');
    return;
  }

 setIsSaving(true);

  try {
    const totalAmount = editedSale.quantity * editedSale.unit_price;
    const updates = {
      ...editedSale,
      amount: totalAmount,
      updated_at: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      // Offline: save locally
      await offlineCache.updateOfflineSale(sale.id, updates);
      toast.success('Changes saved locally — will sync when online');

      // IMMEDIATE LOCAL REFRESH — shows edit instantly
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('salesChanged'));
      }
    } else {
      // Online: direct update
      await onSave(updates);
      toast.success('Sale updated successfully');
    }

    onClose();
  } catch (err) {
    console.error(err);
    toast.error('Failed to save: ' + (err.message || 'Try again'));
  } finally {
    setIsSaving(false);
  }
};








  if (!canEdit) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Permission Denied</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You don't have permission to edit this sale.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Sale</h2>
                <p className="text-sm text-slate-500">Modify sale details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Product */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Product
              </label>
              <select
                value={editedSale.dynamic_product_id || ''}
                onChange={(e) => {
                  const productId = Number(e.target.value);
                  const product = products.find(p => p.id === productId);
                  setEditedSale({
                    ...editedSale,
                    dynamic_product_id: productId,
                    unit_price: product?.selling_price || editedSale.unit_price
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={editedSale.quantity}
                  onChange={(e) => setEditedSale({
                    ...editedSale,
                    quantity: Math.max(1, Number(e.target.value))
                  })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Unit Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedSale.unit_price}
                    onChange={(e) => setEditedSale({
                      ...editedSale,
                      unit_price: Math.max(0, Number(e.target.value))
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <div className="flex gap-2 flex-wrap">
                {['Cash', 'Card', 'Bank Transfer', 'Wallet'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setEditedSale({ ...editedSale, payment_method: method })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      editedSale.payment_method === method
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Customer
              </label>
              <select
                value={editedSale.customer_id || ''}
                onChange={(e) => setEditedSale({
                  ...editedSale,
                  customer_id: e.target.value ? Number(e.target.value) : null
                })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullname}</option>
                ))}
              </select>
            </div>

            {/* Device ID for unique products */}
            {selectedProduct?.is_unique && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Device ID / IMEI
                </label>
                <input
                  type="text"
                  value={editedSale.device_id}
                  onChange={(e) => setEditedSale({ ...editedSale, device_id: e.target.value })}
                  placeholder="Enter device ID or IMEI"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Notes (Optional)
              </label>
              <textarea
                value={editedSale.notes}
                onChange={(e) => setEditedSale({ ...editedSale, notes: e.target.value })}
                placeholder="Add any notes about this sale..."
                rows="3"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t dark:border-slate-800">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !editedSale.dynamic_product_id}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
