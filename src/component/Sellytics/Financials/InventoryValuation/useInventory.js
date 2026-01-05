import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';

export default function useInventory(storeId) {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailFilter, setDetailFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const entriesPerPage = 10;

  const fetchInventory = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('dynamic_inventory')
      .select(`id, available_qty, dynamic_product (id, name, purchase_price)`)
      .eq('store_id', storeId);

    if (error) {
      toast.error('Error fetching inventory: ' + error.message);
      setInventory([]);
      setFilteredInventory([]);
    } else {
      const flattened = (data || []).map(item => ({
        id: item.id,
        product_name: item.dynamic_product?.name || 'Unknown',
        quantity: item.available_qty || 0,
        purchase_price: item.dynamic_product?.purchase_price || null,
      }));
      setInventory(flattened);
      setFilteredInventory(flattened);
    }
    setIsLoading(false);
  }, [storeId]);

  // Fetch inventory on store change
  useEffect(() => {
    fetchInventory();
  }, [storeId, fetchInventory]);

  // Filter inventory
  useEffect(() => {
    let filtered = inventory.filter(item =>
      searchTerm
        ? item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

    if (detailFilter === 'complete') filtered = filtered.filter(i => i.purchase_price && i.purchase_price > 0);
    if (detailFilter === 'incomplete') filtered = filtered.filter(i => !i.purchase_price || i.purchase_price === 0);

    // sort items with purchase price on top
    if (detailFilter === 'all') {
      filtered.sort((a, b) => (b.purchase_price ? 1 : 0) - (a.purchase_price ? 1 : 0));
    }

    setFilteredInventory(filtered);
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchTerm, detailFilter, inventory]);

  const totalPages = Math.ceil(filteredInventory.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredInventory.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalStockValue = filteredInventory.reduce((acc, i) => {
    return i.purchase_price && i.quantity ? acc + i.purchase_price * i.quantity : acc;
  }, 0);

  const clearFilters = () => {
    setSearchTerm('');
    setDetailFilter('all');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  return {
    inventory,
    filteredInventory,
    currentEntries,
    searchTerm,
    setSearchTerm,
    detailFilter,
    setDetailFilter,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    totalPages,
    indexOfFirstEntry,
    indexOfLastEntry,
    totalStockValue,
    selectedIds,
    setSelectedIds,
    isLoading,
    clearFilters,
    fetchInventory
  };
}
