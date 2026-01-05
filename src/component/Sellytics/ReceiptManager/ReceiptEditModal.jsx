import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, MapPin, Loader2, Shield } from 'lucide-react';

export default function ReceiptEditModal({ isOpen, onClose, receipt, onSave }) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_address: '',
    phone_number: '',
    warranty: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (receipt) {
      setForm({
        customer_name: receipt.customer_name || '',
        customer_address: receipt.customer_address || '',
        phone_number: receipt.phone_number || '',
        warranty: receipt.warranty || ''
      });
    }
  }, [receipt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await onSave(receipt.id, form);

    if (success) {
      onClose();
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg h-[90vh] max-h-[90vh] flex flex-col"
        >
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Edit Customer Details
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receipt #{receipt?.receipt_id || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Custom scrollbar for better UX */}
              <div className="scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    placeholder="Enter customer name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Customer Address
                  </label>
                  <input
                    type="text"
                    value={form.customer_address}
                    onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    placeholder="Enter customer address"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Warranty Period
                  </label>
                  <input
                    type="text"
                    value={form.warranty}
                    onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    placeholder="e.g., 12 months, 1 year"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer - Always Visible */}
            <div className="sticky bottom-0 p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-3 justify-end flex-shrink-0 shadow-lg">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold transition shadow-lg disabled:cursor-not-allowed"
              >
                {loading ? (
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
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}