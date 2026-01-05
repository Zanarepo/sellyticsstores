// hooks/useInventoryValuation.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';

export function useInventoryValuation({ storeId }) {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailFilter, setDetailFilter] = useState('all'); // 'all', 'complete', 'incomplete'
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    if (!storeId) {
      setInventory([]);
      setFilteredInventory([]);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('dynamic_inventory')
      .select(`
        id,
        available_qty,
        dynamic_product (id, name, purchase_price)
      `)
      .eq('store_id', storeId);

    if (error) {
      toast.error('Failed to load inventory: ' + error.message);
      setInventory([]);
      setFilteredInventory([]);
    } else {
      const flattened = (data || []).map(item => ({
        id: item.id,
        product_name: item.dynamic_product?.name || 'Unknown Product',
        quantity: item.available_qty || 0,
        purchase_price: item.dynamic_product?.purchase_price || null,
      }));
      setInventory(flattened);
      setFilteredInventory(flattened);
    }
    setIsLoading(false);
  }, [storeId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Apply filters
  useEffect(() => {
    let filtered = inventory.filter(item =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (detailFilter === 'complete') {
      filtered = filtered.filter(i => i.purchase_price && i.purchase_price > 0);
    } else if (detailFilter === 'incomplete') {
      filtered = filtered.filter(i => !i.purchase_price || i.purchase_price <= 0);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, detailFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setDetailFilter('all');
    setSelectedIds([]);
  };

  const toggleSelect = (id, checked) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInventory.length && filteredInventory.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInventory.map(i => i.id));
    }
  };

  const deleteMultiple = async (ids) => {
    if (ids.length === 0) return;

    const { error } = await supabase
      .from('dynamic_inventory')
      .delete()
      .in('id', ids);

    if (error) {
      toast.error('Failed to delete items');
    } else {
      toast.success(`${ids.length} item(s) deleted`);
      setSelectedIds([]);
      fetchInventory();
    }
  };

  const archiveItem = async (id) => {
    // Placeholder — implement if you have an archive column
    toast.info('Archive functionality not implemented yet');
  };

  const deleteSingle = async (id) => {
    await deleteMultiple([id]);
  };

  return {
    filteredInventory,
    searchTerm,
    setSearchTerm,
    detailFilter,
    setDetailFilter,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isLoading,
    clearFilters,
    deleteMultiple,
    deleteSingle,
    archiveItem,
    fetchInventory,
  };
}