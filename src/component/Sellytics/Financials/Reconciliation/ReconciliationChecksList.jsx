import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Edit, Trash2, CheckCircle2, Search } from 'lucide-react';

export default function ReconciliationChecksList({ 
  reconciliationChecks, 
  totalDiscrepancy,
  onEdit,
  onDelete 
}) {
  const [showList, setShowList] = useState(false);
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-slate-500 dark:text-slate-400">No reconciliation checks found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header with Toggle */}
      <button
        onClick={() => setShowList(!showList)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-t-2xl"
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-left">Saved Checks</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-left mt-1">
            {filteredChecks.length} check{filteredChecks.length !== 1 ? 's' : ''} • 
            Total Discrepancy: <span className={totalDiscrepancy > 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
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

      {showList && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          {/* Search Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by store, method, status, or notes..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Checks Cards */}
          <div className="space-y-4 p-4 sm:p-6">
            {filteredChecks.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400">
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
        </div>
      )}
    </div>
  );
}

// Individual Check Card (unchanged from previous version)
function ReconciliationCheckCard({ check, onEdit, onDelete }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const isResolved = check.status === 'resolved';
  const discrepancy = check.discrepancy || 0;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this check?')) {
      onDelete(check);
    }
    setShowDropdown(false);
  };

  const handleEdit = () => {
    onEdit(check);
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-md transition-all relative"
    >
      {/* Top row: Icon + Info + Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {check.stores?.shop_name || 'Unknown Store'}
              </h3>
              <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full capitalize">
                {check.period}
              </span>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              {check.check_date} • {check.payment_method}
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
                onClick={handleEdit}
                className="w-full px-4 py-3 text-left text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Check
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Check
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom row: Amounts + Status */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Expected</p>
          <p className="font-medium text-slate-900 dark:text-white">
            {check.expected_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Actual</p>
          <p className="font-medium text-slate-900 dark:text-white">
            {check.actual_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Difference</p>
          <p className={`font-bold ${discrepancy > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {discrepancy.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Status</p>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            isResolved 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
          }`}>
            {isResolved && <CheckCircle2 className="w-3 h-3" />}
            {check.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
}