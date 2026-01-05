// src/component/Sellytics/Financials/InventoryValuation/InventoryValuation.jsx
import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import InventoryFilters from './InventoryFilters';
import InventoryStatsCards from './InventoryStatsCards';
import InventoryActions from './InventoryActions';
import InventoryList from './InventoryList';
import InventoryViewToggle from './InventoryViewToggle';
import { useInventoryValuation } from './useInventoryValuation';
import useStores from './useStores'; // Adjust path as needed

const getOwnerId = () => Number(localStorage.getItem('owner_id')) || null;

export default function InventoryValuation() {
  // === ALL HOOKS CALLED UNCONDITIONALLY AT THE TOP ===
  const ownerId = getOwnerId();
  const { stores, isLoading: storesLoading } = useStores(ownerId);

  const [storeId, setStoreId] = useState(() => localStorage.getItem('store_id') || '');
  const [view, setView] = useState('card');

  // Always call the inventory hook — pass storeId (may be empty)
  const {
    filteredInventory = [],
    searchTerm = '',
    setSearchTerm = () => {},
    detailFilter = 'all',
    setDetailFilter = () => {},
    selectedIds = [],
    toggleSelect = () => {},
    isLoading: inventoryLoading = false,
    clearFilters = () => {},
    deleteMultiple = () => {},
    deleteSingle = () => {},
    archiveItem = () => {},
  } = useInventoryValuation({ storeId });

  // Auto-select first store when stores are loaded
  useEffect(() => {
    if (!storeId && stores.length > 0 && !storesLoading) {
      const firstStoreId = stores[0].id;
      setStoreId(firstStoreId);
      localStorage.setItem('store_id', firstStoreId);
      toast.success(`Loaded inventory for ${stores[0].shop_name}`);
    }
  }, [stores, storeId, storesLoading]);

  // Persist selected store
  useEffect(() => {
    if (storeId) {
      localStorage.setItem('store_id', storeId);
    }
  }, [storeId]);

  // === EARLY RETURNS (AFTER ALL HOOKS) ===
  if (!ownerId) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Please log in to view inventory valuation.
        </p>
      </div>
    );
  }

  if (storesLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg">Loading stores...</p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-slate-600 dark:text-slate-400">
          No stores found. Please create a store first.
        </p>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Selecting store...
        </p>
      </div>
    );
  }

  // === MAIN RENDER ===
  const currentStoreName = stores.find(s => s.id === storeId)?.shop_name || 'Store';

  return (
    <div className="p-0 sm:p-6 max-w-7xl mx-auto space-y-8">
      <ToastContainer />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Inventory Valuation
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
          {currentStoreName} • Real-time stock value
        </p>
      </motion.header>

      <InventoryStatsCards items={filteredInventory} />

      <InventoryFilters
        stores={stores}
        storeId={storeId}
        setStoreId={setStoreId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        detailFilter={detailFilter}
        setDetailFilter={setDetailFilter}
        clearFilters={clearFilters}
        isLoading={inventoryLoading}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <InventoryActions
          selectedIds={selectedIds}
          onDeleteMultiple={deleteMultiple}
          filteredInventory={filteredInventory}
        />
        <InventoryViewToggle view={view} setView={setView} />
      </div>

      <InventoryList
        items={filteredInventory}
        selectedIds={selectedIds}
        onSelect={toggleSelect}
        onDelete={deleteSingle}
        onArchive={archiveItem}
        view={view}
        isLoading={inventoryLoading}
      />
    </div>
  );
}