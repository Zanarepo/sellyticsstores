/**
 * Theft Detection - Enterprise Edition
 * Inventory audit and missing product tracking
 */
import React, { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Upload, FileText, CheckCircle, 
  Loader2, Download, Search 
} from 'lucide-react';

import useTheftDetection from './hooks/useTheftDetection';
import { usePagination } from './hooks/usePagination';
import ProductAuditForm from './ProductAuditForm';
import TheftCard from './TheftCard';
import BatchActions from './BatchActions';

export default function TheftDetection() {
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const {
    storeName,
    loading,
    checking,
    products,
    incidents,
    selectedProducts,
    selectedIncidents,
    addProduct,
    updatePhysicalCount,
    removeProduct,
    clearProducts,
    uploadCSV,
    checkTheft,
    deleteIncident,
    batchDeleteIncidents,
    toggleIncidentSelection,
    selectAllIncidents,
    clearIncidentSelection
  } = useTheftDetection();

  // Filter incidents by search
  const filteredIncidents = React.useMemo(() => {
    if (!searchQuery.trim()) return incidents;
    const query = searchQuery.toLowerCase();
    return incidents.filter(i => 
      i.product_name?.toLowerCase().includes(query) ||
      i.dynamic_product_id?.toString().includes(query)
    );
  }, [incidents, searchQuery]);

  const { currentItems: currentIncidents, currentPage, totalPages, setPage } = 
    usePagination(filteredIncidents, 12);

  // Download CSV template
  const downloadTemplate = () => {
    const csv = 'product_name,physical_count\nExample Product,0\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theft_audit_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCSV(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading theft detection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              Theft Detection
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {storeName ? `${storeName} - ` : ''}
              {incidents.length} incident{incidents.length !== 1 ? 's' : ''} recorded
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
          </div>
        </div>

        {/* Audit Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Product Audit
            </h2>
          </div>

          <ProductAuditForm
            products={products}
            selectedProducts={selectedProducts}
            onAddProduct={addProduct}
            onUpdateCount={updatePhysicalCount}
            onRemoveProduct={removeProduct}
            onClearAll={clearProducts}
          />

          {selectedProducts.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={checkTheft}
                disabled={checking}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Check All ({selectedProducts.length})
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Incidents Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Theft Incidents
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incidents..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <BatchActions
            selectedCount={selectedIncidents.length}
            totalCount={filteredIncidents.length}
            onSelectAll={selectAllIncidents}
            onClearSelection={clearIncidentSelection}
            onBatchDelete={() => batchDeleteIncidents(selectedIncidents)}
          />

          {filteredIncidents.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {searchQuery ? 'No incidents found' : 'No theft incidents'}
              </h3>
              <p className="text-sm text-slate-500">
                {searchQuery 
                  ? `No incidents match "${searchQuery}"`
                  : 'All inventory is accounted for'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {currentIncidents.map((incident) => (
                    <TheftCard
                      key={incident.id}
                      incident={incident}
                      isSelected={selectedIncidents.includes(incident.id)}
                      onToggleSelect={toggleIncidentSelection}
                      onDelete={deleteIncident}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}