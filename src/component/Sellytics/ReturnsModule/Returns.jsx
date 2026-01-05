/**
 * Returns Management Page - Enterprise Level
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Loader2, Search, Grid, List, Trash2 } from 'lucide-react';
import useReturnsManager from './useReturnsManager';
import useReturnsStats from './useReturnsStats';
import ReturnStatsHeader from './ReturnStatsHeader';
import SaleSearchForm from './SaleSearchForm';
import SalesResultsTable from './SalesResultsTable';
import ReturnFormModal from './ReturnFormModal';
import EditReturnModal from './EditReturnModal';
import ReturnCard from './ReturnCard';
import ReturnsTable from './ReturnsTable';
import ReportGenerator from './ReportGenerator';

export default function Returns() {
  const {
    storeId,
    storeName,
    returns,
    queriedSales,
    loading,
    searching,
    searchSales,
    createReturns,
    updateReturn,
    deleteReturns
  } = useReturnsManager();

  const stats = useReturnsStats(returns);

  // View mode (card/table) - persisted to localStorage
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('returnsViewMode') || 'card';
  });

  // Search and selection
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSales, setSelectedSales] = useState([]);
  const [editingReturn, setEditingReturn] = useState(null);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('returnsViewMode', viewMode);
  }, [viewMode]);

  // Filter returns
  const filteredReturns = returns.filter(r => {
    const query = search.toLowerCase();
    return (
      r.product_name?.toLowerCase().includes(query) ||
      r.device_id?.toLowerCase().includes(query) ||
      r.customer_address?.toLowerCase().includes(query) ||
      r.status?.toLowerCase().includes(query) ||
      r.remark?.toLowerCase().includes(query) ||
      r.receipt_code?.toLowerCase().includes(query)
    );
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectItems = (sales) => {
    setSelectedSales(sales);
    setShowFormModal(true);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} return${selectedIds.length !== 1 ? 's' : ''}?`)) return;
    
    await deleteReturns(selectedIds);
    setSelectedIds([]);
  };

  if (!storeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <RotateCcw className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Store Selected
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Please log in to manage returns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading returns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-0 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <RotateCcw className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Returns Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {storeName || 'Store'} - Track and manage product returns
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <ReturnStatsHeader stats={stats} />

        {/* Search Sales */}
        <SaleSearchForm onSearch={searchSales} searching={searching} />

        {/* Sales Results */}
        {queriedSales.length > 0 && (
          <SalesResultsTable 
            sales={queriedSales} 
            onSelectItems={handleSelectItems}
          />
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search returns..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'card'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Report Generator */}
          <ReportGenerator returns={filteredReturns} storeName={storeName} />

          {/* Batch Delete */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Returns Display */}
        {filteredReturns.length > 0 ? (
          viewMode === 'card' ? (
          <div className="space-y-6">
              <AnimatePresence>
                {filteredReturns.map((ret) => (
                  <ReturnCard
                    key={ret.id}
                    returnItem={ret}
                    onEdit={setEditingReturn}
                    onDelete={(id) => deleteReturns([id])}
                    isSelected={selectedIds.includes(ret.id)}
                    onToggleSelect={() => toggleSelect(ret.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <ReturnsTable
              returns={filteredReturns}
              onEdit={setEditingReturn}
              onDelete={(id) => deleteReturns([id])}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          )
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <RotateCcw className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Returns Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {search ? 'Try adjusting your search' : 'Search for sales to add returns'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReturnFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedSales([]);
        }}
        items={selectedSales}
        onSubmit={createReturns}
      />

      <EditReturnModal
        isOpen={!!editingReturn}
        onClose={() => setEditingReturn(null)}
        returnItem={editingReturn}
        onSubmit={updateReturn}
      />
    </div>
  );
}