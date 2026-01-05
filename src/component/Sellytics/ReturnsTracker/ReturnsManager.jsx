// src/components/returns-management/ReturnsManager.jsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { motion } from 'framer-motion';

import ReturnsFilters from './ReturnsFilters';
import ReturnsStatsCards from './ReturnsStatsCards';
import MatchingSales from './MatchingSales';
import ReturnsActions from './ReturnsActions';
import ReturnsList from './ReturnsList';
import ReturnsModal from './ReturnsModal';
import ReturnsViewToggle from './ReturnsViewToggle';
import { useReturnsByDeviceId } from './useReturnsByDeviceId';

export default function ReturnsManager() {
  const storeId = localStorage.getItem('store_id');

  const {
    receiptIdQuery,
    setReceiptIdQuery,
    deviceIdQuery,
    setDeviceIdQuery,
    queriedReceipts,
    filteredReturns,
    searchTerm,
    setSearchTerm,
    editing,
    setEditing,
    form,
    handleChange,
    openEdit,
    saveReturn,
    deleteReturn,
    error,
    isLoading,
    commonReasons,
    selectedIds,
    toggleSelect,
    deleteMultiple,
  } = useReturnsByDeviceId({ storeId });

  const [view, setView] = React.useState('card');

  if (!storeId) {
    return <div className="p-8 text-center text-red-500">Please select a store</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <ToastContainer />

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-bold">Returns Management</h1>
        <p className="text-lg text-slate-600 mt-2">Manage returns efficiently</p>
      </motion.header>

      <ReturnsStatsCards returns={filteredReturns} commonReasons={commonReasons} />

      <ReturnsFilters
        receiptIdQuery={receiptIdQuery}
        setReceiptIdQuery={setReceiptIdQuery}
        deviceIdQuery={deviceIdQuery}
        setDeviceIdQuery={setDeviceIdQuery}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
      />

      <MatchingSales queriedReceipts={queriedReceipts} />

      <div className="flex justify-between items-center">
        <ReturnsActions
          selectedIds={selectedIds}
          onDeleteMultiple={deleteMultiple}
          filteredReturns={filteredReturns}
        />
        <ReturnsViewToggle view={view} setView={setView} />
      </div>

      <ReturnsList
        returns={filteredReturns}
        selectedIds={selectedIds}
        onSelect={toggleSelect}
        onDelete={deleteReturn}
        onEdit={openEdit}
        view={view}
        isLoading={isLoading}
      />

      <ReturnsModal
        editing={editing}
        setEditing={setEditing}
        form={form}
        handleChange={handleChange}
        saveReturn={saveReturn}
        queriedReceipts={queriedReceipts}
      />
    </div>
  );
}