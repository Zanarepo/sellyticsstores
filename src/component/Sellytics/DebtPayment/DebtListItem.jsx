// src/components/Debt/DebtListItem.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // <-- Added import

function DebtActions({ debt, onRecordPayment, onViewHistory, onDelete, canDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete debt for ${debt.customer_name}? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setShowMenu(false);

    try {
      await onDelete(); // Parent handles actual Supabase delete + refresh
      toast.success(`Debt for ${debt.customer_name} deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete debt');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative">
      <button
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          if (!deleting) setShowMenu((prev) => !prev);
        }}
        disabled={deleting}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            {debt.status !== 'paid' && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onRecordPayment();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition"
              >
                <DollarSign className="w-4 h-4" /> Record Payment
              </button>
            )}

            <button
              onClick={() => {
                setShowMenu(false);
                onViewHistory();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition"
            >
              <Calendar className="w-4 h-4" /> View History
            </button>

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition disabled:opacity-70"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Debt'}
              </button>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function DebtListItem({
  debt,
  formatPrice,
  onRecordPayment,
  onViewHistory,
  onDelete, // Should return a Promise (async function)
  canDelete,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300"
    >
      {/* Main Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0 pr-12 sm:pr-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30">
            <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
              {debt.customer_name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {debt.status === 'paid' && 'Fully Paid'}
              {debt.status === 'partial' && 'Partially Paid'}
              {debt.status === 'owing' && 'Still Owing'}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Remaining Balance
            </span>
            <p className={`font-semibold text-lg ${debt.remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {formatPrice(debt.remaining)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>
                {debt.payment_history?.length > 0
                  ? new Date(debt.payment_history[0].payment_date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'No payments'}
              </span>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:block">
            <DebtActions
              debt={debt}
              onRecordPayment={onRecordPayment}
              onViewHistory={onViewHistory}
              onDelete={onDelete}
              canDelete={canDelete}
            />
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="absolute top-4 right-4 sm:hidden">
        <DebtActions
          debt={debt}
          onRecordPayment={onRecordPayment}
          onViewHistory={onViewHistory}
          onDelete={onDelete}
          canDelete={canDelete}
        />
      </div>
    </motion.div>
  );
}