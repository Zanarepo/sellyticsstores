import { useState, useMemo } from 'react';

export function useLedgerFilters(ledgerEntries = []) {  // ← Default to empty array
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 12;

  const filteredEntries = useMemo(() => {
    if (!Array.isArray(ledgerEntries)) return []; // ← Safety guard

    return ledgerEntries.filter(entry => {
      const matchesSearch = searchTerm
        ? entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesAccount = accountFilter ? entry.account === accountFilter : true;
      const matchesDate =
        (!dateRange.start || new Date(entry.transaction_date) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(entry.transaction_date) <= new Date(dateRange.end + 'T23:59:59')); // Include full end day

      return matchesSearch && matchesAccount && matchesDate;
    });
  }, [ledgerEntries, searchTerm, accountFilter, dateRange]);

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => ({
        totalDebit: acc.totalDebit + (entry.debit || 0),
        totalCredit: acc.totalCredit + (entry.credit || 0),
      }),
      { totalDebit: 0, totalCredit: 0 }
    );
  }, [filteredEntries]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredEntries.slice(start, end);
  }, [filteredEntries, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / entriesPerPage));

  const clearFilters = () => {
    setSearchTerm('');
    setAccountFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  return {
    searchTerm,
    setSearchTerm,
    accountFilter,
    setAccountFilter,
    dateRange,
    setDateRange,
    currentPage,
    setCurrentPage,
    filteredEntries,
    paginatedEntries,
    totals,
    totalPages,
    clearFilters,
  };
}