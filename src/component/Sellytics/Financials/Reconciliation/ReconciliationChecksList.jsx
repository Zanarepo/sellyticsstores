import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Edit, Trash2, CheckCircle2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReconciliationChecksList({ 
  reconciliationChecks, 
  totalDiscrepancy,
  onEdit,
  onDelete 
}) {
  const [showList, setShowList] = useState(true); // Default to true for better initial view
  const [searchQuery, setSearchQuery] = useState('');

  // Filter checks based on search query
  const filteredChecks = reconciliationChecks.filter(check => {
    const query = searchQuery.toLowerCase();
    return (
      check.stores?.shop_name?.toLowerCase().includes(query) ||
      check.payment_method?.toLowerCase().includes(query) ||
      check.status?.toLowerCase().includes(query) ||
      check.notes?.toLowerCase().includes(query)
    );
  });

  if (reconciliationChecks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No reconciliation checks found</p>
      </div>
    );
  }

  return (
    // Remove container styles to allow full-width cards
    <div className="w-full">
      {/* Header with Toggle */}
      <button
        onClick={() => setShowList(!showList)}
        className="w-full p-3 sm:p-4 flex items-center justify-between bg-white dark:bg-slate-800 sm:rounded-t-2xl border-b border-slate-200 dark:border-slate-700"
      >
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white text-left">Saved Checks</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-left mt-1">
            {filteredChecks.length} check{filteredChecks.length !== 1 ? 's' : ''} • 
            Discrepancy: <span className={totalDiscrepancy > 0 ? 'text-red-500 font-semibold' : 'text-emerald-500 font-semibold'}>
              {totalDiscrepancy.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
          </p>
        </div>
        {showList ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Search Bar */}
            <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search checks..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600"/>
                  </button>
                )}
              </div>
            </div>

            {/* Checks Cards */}
            <div className="space-y-0">
              {filteredChecks.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-10">
                  No matching checks found
                </p>
              ) : (
                filteredChecks.map((check) => (
                  <ReconciliationCheckCard
                    key={check.id}
                    check={check}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReconciliationCheckCard({ check, onEdit, onDelete }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const isResolved = check.status === 'resolved';
  const discrepancy = check.discrepancy || 0;

  const handleDelete = () => {
    // Improved confirmation dialog
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p>Delete this check permanently?</p>
        <div className="flex gap-2">
          <button 
            className="w-full bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
            onClick={() => {
              onDelete(check);
              toast.dismiss(t.id);
            }}>
            Delete
          </button>
          <button 
            className="w-full bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded-lg text-sm"
            onClick={() => toast.dismiss(t.id)}>
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 6000 });
    setShowDropdown(false);
  };

  const handleEdit = () => {
    onEdit(check);
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
    >
      {/* Top row: Icon + Info + Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {check.stores?.shop_name || 'Unknown Store'}
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{check.check_date}</span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex px-1.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md capitalize">
                {check.payment_method}
              </span>
              <span className="inline-flex px-1.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md capitalize">
                {check.period}
              </span>
            </div>
          </div>
        </div>

        {/* MoreVertical Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown((prev) => !prev);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                onMouseLeave={() => setShowDropdown(false)}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden origin-top-right"
              >
                <button
                  onClick={handleEdit}
                  className="w-full px-3 py-2.5 text-left text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Check
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2.5 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Check
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom row: Amounts + Status */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400 mb-0.5">Expected</p>
          <p className="font-medium text-slate-800 dark:text-white">
            {check.expected_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 mb-0.5">Actual</p>
          <p className="font-medium text-slate-800 dark:text-white">
            {check.actual_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 mb-0.5">Difference</p>
          <p className={`font-bold ${discrepancy > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {discrepancy.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <p className="text-slate-500 dark:text-slate-400 mb-0.5">Status</p>
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            isResolved 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {check.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
}