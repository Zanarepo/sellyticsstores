// PayableCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Trash2, Package, X } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function PayableCard({ entry, onUpdateStatus, onDelete }) {
  const { formatPrice } = useCurrency();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      onDelete(entry.id);
    }
    setShowDropdown(false);
  };

  const statusColor = {
    Pending: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    Partial: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    Paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  }[entry.status] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

  // Prepare items safely
  const items = Array.isArray(entry.items) ? entry.items : [];

  return (
    <>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-md transition-all relative cursor-pointer"
        onClick={() => setIsModalOpen(true)} // Open modal on card click
      >
        {/* Top row: Icon + Supplier + Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {entry.supplier_name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {new Date(entry.transaction_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* MoreVertical Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click from opening modal
                setShowDropdown(prev => !prev);
              }}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
              >
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Bill
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom row: Amount + Status */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Amount Owed</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {formatPrice(entry.amount)}
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Status</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {entry.status === 'Pending' ? 'Unpaid' : entry.status === 'Partial' ? 'Part Paid' : entry.status}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Pop-up Modal for Item Details */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Item Details: {entry.dynamic_product?.name || 'N/A'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Item ID (IMEI/Serial No)</th>
                      <th className="px-4 py-2 text-left font-medium">Size</th>
                      <th className="px-4 py-2 text-right font-medium">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                          No item details available
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">{item.device_id || 'N/A'}</td>
                          <td className="px-4 py-3">{item.size || 'N/A'}</td>
                          <td className="px-4 py-3 text-right font-medium">{item.qty || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-5 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}