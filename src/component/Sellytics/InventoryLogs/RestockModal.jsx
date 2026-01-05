/**
 * SwiftInventory - Restock Modal
 * Add stock to existing inventory
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2, Scan, Hash, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RestockModal({
  item,
  onRestock,
  onClose,
  onScan,
  isSubmitting
}) {
  const product = item?.dynamic_product || {};
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [newImeis, setNewImeis] = useState([]);
  const [newImei, setNewImei] = useState('');
  const [newSize, setNewSize] = useState('');

  const existingImeis = product.dynamic_product_imeis?.split(',').map(i => i.trim().toLowerCase()).filter(Boolean) || [];

  const handleAddImei = () => {
    if (!newImei.trim()) {
      toast.error('Please enter an IMEI/Device ID');
      return;
    }

    const normalized = newImei.trim().toLowerCase();

    if (existingImeis.includes(normalized)) {
      toast.error('This ID already exists in inventory');
      return;
    }

    if (newImeis.some(i => i.imei.toLowerCase() === normalized)) {
      toast.error('This ID is already in the restock list');
      return;
    }

    setNewImeis(prev => [...prev, {
      id: Date.now(),
      imei: newImei.trim(),
      size: newSize.trim()
    }]);
    setNewImei('');
    setNewSize('');
  };

  const handleRemoveImei = (id) => {
    setNewImeis(prev => prev.filter(i => i.id !== id));
  };

  const handleScanResult = (barcode) => {
    const normalized = barcode.toLowerCase();

    if (existingImeis.includes(normalized)) {
      toast.error('This ID already exists in inventory');
      return;
    }

    if (newImeis.some(i => i.imei.toLowerCase() === normalized)) {
      toast.error('This ID is already in the restock list');
      return;
    }

    setNewImeis(prev => [...prev, {
      id: Date.now(),
      imei: barcode,
      size: ''
    }]);
    toast.success('Id added from scan');
  };

  const handleSubmit = async () => {
    const restockQty = product.is_unique ? newImeis.length : quantity;

    if (restockQty <= 0) {
      toast.error(product.is_unique ? 'Add at least one product ID' : 'Enter a valid quantity');
      return;
    }

    await onRestock({
      productId: product.id,
      inventoryId: item.id,
      quantity: restockQty,
      reason: reason.trim() || 'Restock',
      isUnique: product.is_unique,
      imeis: newImeis.map(i => i.imei),
      sizes: newImeis.map(i => i.size)
    });
  };

  if (!item) return null;

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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Restock Product</h2>
                <p className="text-sm text-slate-500 truncate max-w-[200px]">{product.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Current Stock */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Current Stock</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.available_qty || 0} units</p>
            </div>

            {/* Quantity or IMEI Input */}
            {product.is_unique ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Product IDs ({newImeis.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => onScan?.(handleScanResult)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    Scan
                  </button>
                </div>

                {/* IMEI List */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {newImeis.map((imeiItem) => (
                    <div key={imeiItem.id} className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <Hash className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-slate-900 dark:text-white truncate">{imeiItem.imei}</p>
                        {imeiItem.size && <p className="text-xs text-slate-500">{imeiItem.size}</p>}
                      </div>
                      <button onClick={() => handleRemoveImei(imeiItem.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add IMEI Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImei}
                    onChange={(e) => setNewImei(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImei()}
                    placeholder="Enter IMEI/Product ID"
                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm"
                  />
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Size"
                    className="w-20 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm"
                  />
                  <button onClick={handleAddImei} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quantity to Add</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center text-2xl font-bold py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason (Optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., New shipment, Return"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            {/* New Stock Preview */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">New Stock Level</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {(item.available_qty || 0) + (product.is_unique ? newImeis.length : quantity)} units
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (product.is_unique && newImeis.length === 0)}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Stock
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}