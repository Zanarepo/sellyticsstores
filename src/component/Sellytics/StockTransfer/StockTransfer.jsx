// src/components/stockTransfer/StockTransfer.jsx
import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useStockTransfer } from "./useStockTransfer";
import StoreSelector from "./StoreSelector";
import SearchBar from "./SearchBar";
import InventoryTable from "./InventoryTable";
import TransferHistoryTable from "./TransferHistoryTable";
import TransferModal from "./TransferModal";
import TransferDetailsModal from "./TransferDetailsModal";

export default function StockTransfer() {
  const {
    stores,
    selectedStore,
    inventory,

    currentEntries,
    totalPages,
    currentPage,
    loading,
    loadingUser,
    isStoreOwner,
    searchQuery,
    setSearchQuery,
    handleStoreChange,
    paginate,
    refreshData,
    userId,
    ownerIdState,
  } = useStockTransfer();

  const [showInv, setShowInv] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [destStore, setDestStore] = useState("");
  const [qty, setQty] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        {/* Header (MATCHES ExpenseManager) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">
            Stock Transfer
          </h1>
        </div>

        {/* Access States */}
        {!isStoreOwner && !loadingUser && (
          <div className="text-center py-20 text-red-600 text-xl font-semibold">
            Only store owners can use this page.
          </div>
        )}

        {isStoreOwner && stores.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-500 text-xl">
            No stores found.
          </div>
        )}

        {/* Main Content */}
        {isStoreOwner && (
          <>
            {/* Filters Card (same visual level as Expense cards) */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StoreSelector
                  stores={stores}
                  value={selectedStore}
                  onChange={handleStoreChange}
                  disabled={loading || loadingUser}
                />

                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  disabled={!selectedStore}
                />
              </div>
            </div>

            {/* Inventory */}
            <InventoryTable
              inventory={inventory}
              loading={loading}
              show={showInv}
              toggleShow={() => setShowInv(!showInv)}
              onTransfer={(p) => {
                setSelectedProduct(p);
                setModalOpen(true);
              }}
            />

            {/* Transfer History */}
            <TransferHistoryTable
              entries={currentEntries}
              totalPages={totalPages}
              currentPage={currentPage}
              paginate={paginate}
              loading={loading}
              show={showHist}
              toggleShow={() => setShowHist(!showHist)}
              onViewDetails={(t) => {
                setSelectedTransfer(t);
                setDetailsOpen(true);
              }}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <TransferModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        stores={stores}
        sourceStoreId={selectedStore}
        destination={destStore}
        setDestination={setDestStore}
        qty={qty}
        setQty={setQty}
        onSuccess={refreshData}
        userId={userId}
        ownerId={ownerIdState}
      />

      <TransferDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        transfer={selectedTransfer}
      />

      {/* Global Loader (same UX level as ExpenseManager) */}
      {(loading || loadingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
