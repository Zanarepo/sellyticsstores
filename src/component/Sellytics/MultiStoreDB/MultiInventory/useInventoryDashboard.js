import { useState, useEffect, useMemo } from 'react';
import { supabase } from "../../../../supabaseClient";

export function useInventoryDashboard(ownerId) {
  const [stores, setStores] = useState([]);
  const [inventoryRecords, setInventoryRecords] = useState([]);
  const [selectedStore, setSelectedStore] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [availableFilter, setAvailableFilter] = useState('');
  const [soldFilter, setSoldFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stores and inventory
  useEffect(() => {
    if (!ownerId) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: storeData, error: storeErr } = await supabase
        .from('stores')
        .select('id, shop_name')
        .eq('owner_user_id', ownerId);

      if (storeErr) {
        setError(storeErr.message);
        setLoading(false);
        return;
      }
      setStores(storeData || []);

      if (!storeData?.length) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('dynamic_inventory')
        .select(`store_id, available_qty, quantity_sold, dynamic_product(name)`)
        .in('store_id', storeData.map(s => s.id));

      if (selectedStore !== 'all') {
        query = query.eq('store_id', selectedStore);
      }

      const { data: inventoryData, error: inventoryErr } = await query;
      if (inventoryErr) {
        setError(inventoryErr.message);
        setLoading(false);
        return;
      }

      setInventoryRecords(inventoryData || []);
      setLoading(false);
    };

    fetchData();
  }, [ownerId, selectedStore]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return inventoryRecords.filter(record => {
      const name = record.dynamic_product?.name || '';
      const available = record.available_qty;
      const sold = record.quantity_sold;

      return (
        (!productFilter || name.toLowerCase().includes(productFilter.toLowerCase())) &&
        (!availableFilter || available >= Number(availableFilter)) &&
        (!soldFilter || sold >= Number(soldFilter))
      );
    });
  }, [inventoryRecords, productFilter, availableFilter, soldFilter]);

  // Group by store
  const inventoryByStore = useMemo(() => {
    const grouped = {};
    stores.forEach(s => {
      grouped[s.shop_name] = { totalAvailable: 0, totalSold: 0 };
    });
    filteredRecords.forEach(r => {
      const store = stores.find(s => s.id === r.store_id);
      if (!store) return;
      grouped[store.shop_name].totalAvailable += r.available_qty;
      grouped[store.shop_name].totalSold += r.quantity_sold;
    });
    return grouped;
  }, [filteredRecords, stores]);

  const summaryData = useMemo(() => 
    Object.entries(inventoryByStore).map(([storeName, data]) => ({
      storeName,
      totalAvailable: data.totalAvailable,
      totalSold: data.totalSold
    }))
  , [inventoryByStore]);

  const highestStockStore = useMemo(() => {
    return summaryData.reduce((highest, s) => !highest || s.totalAvailable > highest.totalAvailable ? s : highest, null);
  }, [summaryData]);

  return {
    stores,
    loading,
    error,
    selectedStore,
    setSelectedStore,
    productFilter,
    setProductFilter,
    availableFilter,
    setAvailableFilter,
    soldFilter,
    setSoldFilter,
    inventoryRecords,
    filteredRecords,
    summaryData,
    highestStockStore,
  };
}
