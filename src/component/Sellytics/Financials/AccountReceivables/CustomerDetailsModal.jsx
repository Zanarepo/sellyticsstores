// CustomerDetailsModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
export default function CustomerDetailsModal({ isOpen, onClose, customer }) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Customer Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white">{customer.customer_name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Phone Number</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white">{customer.phone_number || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white">{customer.address || 'Not provided'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-5 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}