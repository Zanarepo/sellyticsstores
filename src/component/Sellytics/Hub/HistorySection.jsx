import React, { useState } from "react";
import { motion } from "framer-motion";
import { History, Loader2, Search, AlertCircle } from "lucide-react";
import EntryRow from "./EntryRow";
import EntryCard from "./EntryCard";
import { useLedgerEntries } from "./useLedgerEntries";

export default function HistorySection({ ledgerEntries, ledgerLoading }) {
  const { entries, deleteEntry, clearAll, loading } = useLedgerEntries(
    ledgerEntries,
    ledgerLoading
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const filteredEntries = entries.filter((entry) =>
    (entry.warehouse_product_id?.product_name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (entry.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-white rounded-lg shadow border border-slate-200">
        {/* Ultra Compact Header */}
        <div className="px-2 py-2 sm:px-3 sm:py-2 border-b border-slate-200">
          {/* Mobile: Fully Stacked Vertical Layout */}
          <div className="flex flex-col gap-2 sm:hidden">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 text-slate-800">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              History
            </h2>
            
            {/* Ultra Compact Search - Full Width */}
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Ultra Responsive Clear Button - Full Width */}
            {entries.length > 0 && (
              <button
                onClick={() => setShowClearDialog(true)}
                className="w-full py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded transition-all shadow-sm active:shadow"
              >
                Clear All History
              </button>
            )}
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold flex items-center gap-1.5 text-slate-800">
              <History className="w-4 h-4 text-indigo-600" />
              Transaction History
            </h2>

            <div className="flex gap-2">
              {/* Ultra Compact Search */}
              <div className="relative w-[200px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Ultra Responsive Clear Button */}
              {entries.length > 0 && (
                <button
                  onClick={() => setShowClearDialog(true)}
                  className="px-3 py-1 text-sm font-medium bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded transition-all whitespace-nowrap shadow-sm active:shadow"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ultra Compact Content */}
        <div className="p-2 sm:p-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <History className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-xs sm:text-sm font-medium text-slate-600 mb-0.5">
                {searchQuery ? "No matching transactions" : "No transactions yet"}
              </h3>
              <p className="text-xs text-slate-400">
                {searchQuery ? "Try a different search" : "Stock movements appear here"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table - Maximum Space Utilization */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-1 px-1.5 font-semibold text-slate-700 whitespace-nowrap w-[100px]">
                        Date
                      </th>
                      <th className="text-left py-1 px-1.5 font-semibold text-slate-700">
                        Product
                      </th>
                      <th className="text-left py-1 px-1.5 font-semibold text-slate-700 w-[80px]">
                        Type
                      </th>
                      <th className="text-right py-1 px-1.5 font-semibold text-slate-700 w-[60px]">
                        Qty
                      </th>
                      <th className="text-left py-1 px-1.5 font-semibold text-slate-700">
                        Notes
                      </th>
                      <th className="w-[40px] py-1 px-1"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEntries.map((entry) => (
                      <EntryRow key={entry.id} entry={entry} onDelete={deleteEntry} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Ultra Compact */}
              <div className="lg:hidden space-y-2">
                {filteredEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ultra Compact Dialog */}
      {showClearDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60"
          onClick={() => setShowClearDialog(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-lg shadow-xl max-w-xs w-full p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2 mb-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Clear All History?</h3>
                <p className="text-xs text-slate-600 leading-snug">
                  Permanently delete all transactions. Cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowClearDialog(false)}
                className="flex-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded hover:bg-slate-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAll();
                  setShowClearDialog(false);
                }}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded transition-all"
              >
                Delete All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}