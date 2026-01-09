import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';

export default function useDebtorsDashboard(ownerId) {
  const [stores, setStores] = useState([]);
  const [debtRecords, setDebtRecords] = useState([]);
  const [selectedStore, setSelectedStore] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [owedFilter, setOwedFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stores and debts
  useEffect(() => {
    if (!ownerId) return;

    (async () => {
      setLoading(true);

      // Fetch stores
      const { data: storeData, error: storeErr } = await supabase
        .from('stores')
        .select('id, shop_name')
        .eq('owner_user_id', ownerId);

      if (storeErr) {
        setError(storeErr.message);
        toast.error(storeErr.message);
        setLoading(false);
        return;
      }
      setStores(storeData);

      if (!storeData.length) {
        setLoading(false);
        return;
      }

      // Fetch debts
      let query = supabase
        .from('debts')
        .select('store_id, customer_name, product_name, qty, owed, deposited, date')
        .in('store_id', storeData.map(s => s.id));

      if (selectedStore !== 'all') query = query.eq('store_id', selectedStore);

      const { data: debts, error: debtErr } = await query;
      if (debtErr) {
        setError(debtErr.message);
        toast.error(debtErr.message);
        setLoading(false);
        return;
      }

      setDebtRecords(debts || []);
      setLoading(false);
    })();
  }, [ownerId, selectedStore]);

  // Filter debts
  const filteredDebts = useMemo(() => {
    return debtRecords.filter(r => {
      const owed = r.owed - r.deposited;
      const matchesCustomer = customerFilter ? r.customer_name?.toLowerCase().includes(customerFilter.toLowerCase()) : true;
      const matchesProduct = productFilter ? r.product_name?.toLowerCase().includes(productFilter.toLowerCase()) : true;
      const matchesOwed = owedFilter ? owed >= Number(owedFilter) : true;
      return matchesCustomer && matchesProduct && matchesOwed;
    });
  }, [debtRecords, customerFilter, productFilter, owedFilter]);

  // Group by store
  const summaryData = useMemo(() => {
    const grouped = {};
    stores.forEach(s => grouped[s.shop_name] = { totalOwed: 0, totalDeposited: 0 });

    filteredDebts.forEach(r => {
      const store = stores.find(s => s.id === r.store_id);
      if (!store) return;
      grouped[store.shop_name].totalOwed += r.owed;
      grouped[store.shop_name].totalDeposited += r.deposited;
    });

    return Object.entries(grouped).map(([storeName, data]) => ({
      storeName,
      totalOwed: data.totalOwed,
      totalDeposited: data.totalDeposited,
      outstanding: data.totalOwed - data.totalDeposited
    }));
  }, [filteredDebts, stores]);

  const highestDebtStore = useMemo(() => {
    return summaryData.reduce((highest, store) => {
      if (!highest || store.outstanding > highest.outstanding) return store;
      return highest;
    }, null);
  }, [summaryData]);

  // Group debts by customer
// Group debts by customer (ONLY customers still owing)
const customersSummary = useMemo(() => {
  const map = {};

  filteredDebts.forEach(d => {
    const outstanding = d.owed - d.deposited;

    // 🚫 Ignore fully paid debts
    if (outstanding <= 0) return;

    const store = stores.find(s => s.id === d.store_id);
    if (!store) return;

    const key = `${d.customer_name}-${d.store_id}`;

    if (!map[key]) {
      map[key] = {
        customerName: d.customer_name,
        storeName: store.shop_name, // ✅ store they owe
        storeId: d.store_id,
        totalOutstanding: 0,
        items: []
      };
    }

    map[key].totalOutstanding += outstanding;
    map[key].items.push({
      product: d.product_name,
      qty: d.qty,
      owed: outstanding
    });
  });

  return Object.values(map);
}, [filteredDebts, stores]);


  return {
    stores,
    selectedStore,
    setSelectedStore,
    customerFilter,
    setCustomerFilter,
    productFilter,
    setProductFilter,
    owedFilter,
    setOwedFilter,
    filteredDebts,
    summaryData,
    highestDebtStore,
    loading,
    error,
    customersSummary,
  };
}
