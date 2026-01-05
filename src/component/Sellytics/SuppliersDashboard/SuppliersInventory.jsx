// src/components/Suppliers/SuppliersInventory.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../supabaseClient';
import { useSuppliersInventory } from './useSuppliersInventory';
import SuppliersHeader from './SuppliersHeader';
import SuppliersSearch from './SuppliersSearch';
import SuppliersFilters from './SuppliersFilters';
import SuppliersTableRow from './SuppliersTableRow';
import DeviceIdsModal from './DeviceIdsModal';
import SupplierModal from './SupplierModal';
import SupplierDetailModal from './SupplierDetailModal';

export default function SuppliersInventory() {
  const storeId = localStorage.getItem('store_id');
  const {
    filtered,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
    suppliers,
    clearFilters,
    refresh,
  } = useSuppliersInventory(storeId);

  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // <-- For editing
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const itemsPerPage = 15;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCSV = () => { /* your logic */ };
  const exportPDF = () => { /* your logic */ };

  const deleteItem = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.from('suppliers_inventory').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success(' Supplier Info Deleted successfully');
      refresh();
    }
  };

  if (!storeId) {
    return <div className="text-center py-12 text-red-600 text-2xl">No store selected</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <SuppliersHeader
        onExportCSV={exportCSV}
        onExportPDF={exportPDF}
        onNewInventory={() => {
          setEditingItem(null);
          setShowCreateModal(true);
        }}
      />

      <SuppliersSearch search={search} setSearch={setSearch} />

      <SuppliersFilters
        showFilters={true}
        setShowFilters={() => {}}
        filters={filters}
        setFilter={(field, value) => setFilters(field, value)}
        suppliers={suppliers}
        clearFilters={clearFilters}
      />

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading inventory...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-xl font-medium">No inventory items found</p>
          <p className="text-sm mt-2">Click "New Inventory" to add one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((item) => (
            <SuppliersTableRow
              key={item.id}
              item={item}
              onViewIds={() => setShowDetail(item)}
              onEdit={() => {
                setEditingItem(item);
                setShowCreateModal(true);
              }}
              onDelete={() => deleteItem(item.id, item.device_name)}
              onViewSupplier={() => setSelectedSupplier(item.supplier_name)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-5 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-5 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <DeviceIdsModal
        item={showDetail}
        open={!!showDetail}
        onClose={() => setShowDetail(null)}
        search={search}
      />

      <SupplierModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={() => {
          refresh();
          setCurrentPage(1);
          setEditingItem(null);
        }}
      />

      <SupplierDetailModal
        supplierName={selectedSupplier}
        open={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
      />
    </div>
  );
}