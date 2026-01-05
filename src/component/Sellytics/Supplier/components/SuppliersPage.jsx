// components/suppliers/SuppliersPage.jsx
import React, { useState } from "react";
import useSuppliersInventory from "../../hooks/useSuppliersInventory";
import useSuppliersFilters from "../../hooks/useSuppliersFilters";
import useSuppliersPagination from "../../hooks/useSuppliersPagination";

import FiltersBar from "./FiltersBar";
import SuppliersTable from "./SuppliersTable";
import PaginationControls from "./PaginationControls";
import SupplierRowEditor from "./SupplierRowEditor";

export default function SuppliersPage() {
  const { filters, updateFilter, resetFilters } = useSuppliersFilters();
  const { page, limit, nextPage, prevPage, goToPage } =
    useSuppliersPagination(20);

  const {
    data,
    loading,
    totalCount,
    updateItem,
    deleteItem,
  } = useSuppliersInventory(filters, page, limit);

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEdit = (row) => {
    setSelectedItem(row);
    setEditorOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <FiltersBar filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} />

      <SuppliersTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PaginationControls
        totalCount={totalCount}
        page={page}
        limit={limit}
        nextPage={() => nextPage(totalCount)}
        prevPage={prevPage}
        goToPage={(p) => goToPage(p, totalCount)}
      />

      {/* EDITOR MODAL */}
      <SupplierRowEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        item={selectedItem}
        onSave={updateItem}
      />
    </div>
  );
}
