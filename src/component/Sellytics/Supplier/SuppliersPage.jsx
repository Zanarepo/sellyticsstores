// components/suppliers/SuppliersPage.jsx
import React from "react";
import useSuppliersInventory from "./hooks/useSuppliersInventory";
import useSuppliersFilters from "./hooks/useSuppliersFilters";
import useSuppliersPagination from "./hooks/useSuppliersPagination";

import FiltersBar from "../Supplier/components/FiltersBar";
import SuppliersTable from "../Supplier/components/SuppliersTable";
import PaginationControls from "../Supplier/components/PaginationControls";

export default function SuppliersPage() {
  const { filters, updateFilter } = useSuppliersFilters();
  const { page, limit, nextPage, prevPage, goToPage } = useSuppliersPagination(10);

  const { data, loading, totalCount, updateItem, deleteItem } =
    useSuppliersInventory(filters, page, limit);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <FiltersBar
        search={filters.search}
        setSearch={(value) => updateFilter("search", value)}
      />

      <SuppliersTable
        data={data}
        loading={loading}
        onEdit={updateItem}
        onDelete={deleteItem}
      />

      <PaginationControls
        page={page}
        totalPages={Math.ceil(totalCount / limit)}
        setPage={goToPage}
        nextPage={() => nextPage(totalCount)}
        prevPage={prevPage}
      />
    </div>
  );
}
