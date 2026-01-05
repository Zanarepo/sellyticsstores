import { useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function useSalesPagination({
  viewMode,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  filtered,
  dailyTotals,
  weeklyTotals,
  search,
}) {
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, search, setCurrentPage]);

  const totalsData = useMemo(() => {
    if (viewMode === 'daily') return dailyTotals;
    if (viewMode === 'weekly') return weeklyTotals;
    return [];
  }, [viewMode, dailyTotals, weeklyTotals]);

  const paginatedSales = useMemo(() => {
    if (viewMode !== 'list') return [];
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, viewMode, itemsPerPage]);

  const paginatedTotals = useMemo(() => {
    if (viewMode === 'list') return [];
    const start = (currentPage - 1) * itemsPerPage;
    return totalsData.slice(start, start + itemsPerPage);
  }, [viewMode, totalsData, currentPage, itemsPerPage]);

  const totalItems = viewMode === 'list' ? filtered.length : totalsData.length;

  return {
    totalsData,
    paginatedSales,
    paginatedTotals,
    totalItems,
  };
}