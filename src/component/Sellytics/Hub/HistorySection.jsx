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
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Transaction History
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {entries.length > 0 && (
              <button
                onClick={() => setShowClearDialog(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-600 mb-2">
                {searchQuery ? "No matching transactions" : "No transactions yet"}
              </h3>
              <p className="text-sm text-slate-400">
                {searchQuery
                  ? "Try a different search term"
                  : "Stock movements will appear here"}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 sticky top-0 bg-white">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">
                        Type
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-slate-700">
                        Qty
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">
                        Notes
                      </th>
                      <th className="text-right py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <EntryRow key={entry.id} entry={entry} onDelete={deleteEntry} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden space-y-4">
                {filteredEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showClearDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Clear All History?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              This will permanently delete all transactions. This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearDialog(false)}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAll();
                  setShowClearDialog(false);
                }}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
