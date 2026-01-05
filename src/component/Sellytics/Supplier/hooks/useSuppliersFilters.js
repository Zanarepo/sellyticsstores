// hooks/useSuppliersFilters.js
import { useState } from "react";

export default function useSuppliersFilters() {
  const [filters, setFilters] = useState({
    search: "",
  });

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: "" });
  };

  return { filters, updateFilter, resetFilters };
}
