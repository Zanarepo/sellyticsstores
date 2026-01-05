// AnomalyAlerts.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../../../supabaseClient'; // Adjust path as needed
import useAnomalyAlerts from './useAnomalyAlerts';
import AnomalyCard from './AnomalyCard';
import AnomalyStats from './AnomalyStats';
import Explanations from './Explanations';

export default function AnomalyAlerts() {
  const { anomalies: initialAnomalies, storeName, loading, error, stats } = useAnomalyAlerts();
  
  // Local state to manage anomalies (allows deletion without reloading)
  const [anomalies, setAnomalies] = useState(initialAnomalies);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = anomalies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(anomalies.length / itemsPerPage);

  // Delete anomaly function
  const deleteAnomaly = async (anomalyId) => {
    if (!anomalyId) return;

    try {
      const { error: deleteError } = await supabase
        .from('anomalies')
        .delete()
        .eq('id', anomalyId);

      if (deleteError) throw deleteError;

      // Update local state
      setAnomalies((prev) => prev.filter((a) => a.id !== anomalyId));
    } catch (err) {
      console.error('Failed to delete anomaly:', err);
      alert('Could not delete anomaly. Please try again.');
    }
  };

  // Sync local anomalies when initial data changes (e.g., on first load or realtime update)
  React.useEffect(() => {
    setAnomalies(initialAnomalies);
  }, [initialAnomalies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading anomalies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-red-200 dark:border-red-900/50">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error</h2>
          <p className="text-slate-600 dark:text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Sales Anomalies
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {storeName || 'Store'} • Detected irregularities
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <AnomalyStats stats={stats} />

        {/* Explanations */}
        <Explanations />

        {/* Content */}
        {anomalies.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentItems.map((anomaly) => (
                <AnomalyCard
                  key={`${anomaly.id || `${anomaly.dynamic_product_id}-${anomaly.sold_at}`}`}
                  anomaly={anomaly}
                  onDelete={deleteAnomaly}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 gap-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {indexOfFirst + 1}–{Math.min(indexOfLast, anomalies.length)} of {anomalies.length}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <AlertTriangle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Anomalies Detected
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Currently no unusual sales patterns for {storeName || 'this store'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}