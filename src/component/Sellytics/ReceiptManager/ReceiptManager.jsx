import React, { useState, useEffect } from 'react';
import { Search, Trash2, Loader2, FileText } from 'lucide-react';
import useReceiptManager from './useReceiptManager';
import useReceiptCustomization from './useReceiptCustomization';
import SaleGroupsList from './SaleGroupsList';
import ReceiptModal from './ReceiptModal';
import ReceiptCustomizer from './ReceiptCustomizer';
import BulkDeleteConfirm from './BulkDeleteConfirm';
import FilterPanel from './FilterPanel';
//import { getUserPermission } from '../../../utils/accessControl';

export default function ReceiptManager() {
  const [storeId, setStoreId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Destructure canDelete directly from the hook (now reliable)
  const {
    store,
    filteredSaleGroups,
    selectedSaleGroup,
    selectedReceipt,
    loading,
    canDelete,                    // ← This is now correct and used everywhere
    selectedIds,
    setSelectedIds,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    openReceiptModal,
    updateReceipt,
    deleteSaleGroup,
    bulkDeleteSaleGroups,
    getProductGroups,
    closeReceiptModal
  } = useReceiptManager(storeId, userEmail);

  const { styles, updateStyle, resetStyles } = useReceiptCustomization();

  useEffect(() => {
    const initAuth = async () => {
      const storedStoreId = localStorage.getItem('store_id');
      const storedUserEmail = localStorage.getItem('user_email');
      
      console.log('🔐 Auth init:', { storedStoreId, storedUserEmail });
      
      setStoreId(storedStoreId);
      setUserEmail(storedUserEmail);
    };

    initAuth();
  }, []);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (groups) => {
    const allIds = groups.map(g => g.id);
    const allSelected = allIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleBulkDelete = async () => {
    await bulkDeleteSaleGroups(selectedIds);
    setShowBulkDeleteModal(false);
  };

  const productGroups = selectedSaleGroup ? getProductGroups(selectedSaleGroup) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-0 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 md:p-8 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Receipt Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {store?.shop_name || 'Loading store...'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.length > 0 && canDelete && (
                  <button
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold transition shadow-lg shadow-red-500/30"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete {selectedIds.length}
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by sale ID, amount, payment method..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
            onClearFilters={() => setFilters({ paymentMethod: 'all', dateRange: 'all' })}
          />

          {/* Receipt Customizer */}
          <ReceiptCustomizer
            styles={styles}
            updateStyle={updateStyle}
            resetStyles={resetStyles}
          />

          {/* Sale Groups List */}
          {filteredSaleGroups.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Sales & Receipts
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {filteredSaleGroups.length} sale{filteredSaleGroups.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>

              <SaleGroupsList
                saleGroups={filteredSaleGroups}
                selectedGroup={selectedSaleGroup}
                onSelectGroup={openReceiptModal}
                canDelete={canDelete}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={20}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-0 text-center border-2 border-slate-200 dark:border-slate-700">
              <FileText className="w-20 h-20 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No Sales Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? 'Try a different search term' : 'Sales will appear here once created'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={closeReceiptModal}
        receipt={selectedReceipt}
        saleGroup={selectedSaleGroup}
        store={store}
        productGroups={productGroups}
        styles={styles}
        onUpdate={updateReceipt}
        onDelete={deleteSaleGroup}
        canDelete={canDelete}
      />

      {/* Bulk Delete Confirmation */}
      <BulkDeleteConfirm
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        count={selectedIds.length}
      />
    </>
  );
}