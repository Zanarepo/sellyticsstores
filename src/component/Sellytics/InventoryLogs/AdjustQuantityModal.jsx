/**
 * AdjustQuantityModal - Adjust inventory quantity
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';

export default function AdjustQuantityModal({ item, onClose, onAdjust, isSubmitting }) {
  const [difference, setDifference] = useState(0);
  const [reason, setReason] = useState('');

  const product = item?.dynamic_product;
  const currentQty = item?.available_qty || 0;
  const newQty = Math.max(0, currentQty + difference);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (difference === 0) return;
    onAdjust(item.id, difference, reason);
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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b dark:border-slate-800">
            <h2 className="text-lg font-semibold">Adjust Quantity</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <p className="font-medium mb-1">{product?.name}</p>
              <p className="text-sm text-slate-500">Current quantity: {currentQty}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adjustment</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDifference(difference - 1)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={difference}
                  onChange={(e) => setDifference(parseInt(e.target.value) || 0)}
                  className="flex-1 text-center px-4 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setDifference(difference + 1)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                New quantity: <span className="font-medium">{newQty}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Damaged items removed"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || difference === 0}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg"
              >
                {isSubmitting ? 'Adjusting...' : 'Adjust'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}