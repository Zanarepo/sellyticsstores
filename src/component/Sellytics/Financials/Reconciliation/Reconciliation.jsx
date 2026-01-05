import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Loader2 } from 'lucide-react';


// Components
import ReconciliationFilters from './ReconciliationFilters';
import SalesStatsCards from './SalesStatsCards';
import SalesByPaymentMethod from './SalesByPaymentMethod';
import SalesList from './SalesList';
import SuspiciousPatterns from './SuspiciousPatterns';
import DiscrepanciesCard from './DiscrepanciesCard';
import ReconciliationChart from './ReconciliationChart';
import ReconciliationChecksList from './ReconciliationChecksList';
import AddCheckModal from './AddCheckModal';
import EditCheckModal from './EditCheckModal';
import DeleteCheckModal from './DeleteCheckModal';

// Helper functions
const downloadCSV = (data, filename) => {
  const csv = [
    ['Check Date', 'Store', 'Period', 'Payment Method', 'Expected Amount', 'Actual Amount', 'Discrepancy', 'Status', 'Notes'],
    ...data.map(item => [
      item.check_date,
      item.store_name,
      item.period,
      item.payment_method,
      item.expected_amount,
      item.actual_amount,
      item.discrepancy,
      item.status,
      item.notes || '',
    ]),
  ]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const normalizePaymentMethod = (method) => {
  if (!method) return 'Unknown';
  if (method.toLowerCase() === 'cash') return 'Cash';
  return method
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const denormalizePaymentMethod = (method) => {
  if (!method) return 'Unknown';
  if (method.toLowerCase() === 'cash') return 'Cash';
  return method;
};

export default function Reconciliation() {
 
  const ownerId = Number(localStorage.getItem('owner_id')) || null;
  const [storeId, setStoreId] = useState(localStorage.getItem('store_id') || '');
  const [stores, setStores] = useState([]);
  const [sales, setSales] = useState([]);
  const [reconciliationChecks, setReconciliationChecks] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState('daily');
  const [checkDate, setCheckDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [newCheck, setNewCheck] = useState({
    payment_method: '',
    expected_amount: 0,
    actual_amount: 0,
    notes: '',
    status: 'pending',
  });



const currentStore = stores.find(store => store.id === storeId);
const handleDeleteSale = async (saleId) => {
  if (!saleId) return;

  if (!window.confirm('Are you sure you want to delete this sale?')) return;

  try {
    setIsLoading(true);

    // Delete from Supabase (adjust table name if needed)
    const { error } = await supabase
      .from('dynamic_sales') // or whatever table stores your sales
      .delete()
      .eq('id', saleId);

    if (error) throw error;

    // Update local state to remove the deleted sale
    setSales(prev => prev.filter(s => s.id !== saleId));

    toast.success('Sale deleted successfully!');
  } catch (error) {
    console.error('Delete sale error:', error);
    toast.error('Failed to delete sale: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};





  const allPaymentMethods = useMemo(() => ['Cash', 'Card', 'Bank Transfer', 'Wallet'], []);

  // Fetch stores
  const fetchStores = useCallback(async () => {
    if (!ownerId) {
      toast.error('No owner ID found. Please log in.');
      setStores([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data: storeData, error: storeErr } = await supabase
        .from('stores')
        .select('id, shop_name')
        .eq('owner_user_id', ownerId);
      if (storeErr) throw storeErr;
      setStores(storeData || []);
      if (storeData.length === 0) {
        toast('No stores found for this owner.');
      } else if (!storeId && storeData.length > 0) {
        setStoreId(storeData[0].id);
        localStorage.setItem('store_id', storeData[0].id);
      }
    } catch (error) {
      toast.error('Error fetching stores: ' + error.message);
      console.error('Store fetch error:', error);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId, storeId]);

  const fetchPaymentMethods = useCallback(async () => {
    if (!storeId) {
      setPaymentMethods(allPaymentMethods);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dynamic_sales')
        .select('payment_method')
        .eq('store_id', storeId)
        .not('payment_method', 'is', null);
      if (error) throw error;
      const uniqueMethods = [...new Set(data.map(item => normalizePaymentMethod(item.payment_method)))];
      const combinedMethods = [...new Set([...allPaymentMethods, ...uniqueMethods])].sort();
      setPaymentMethods(combinedMethods);
    } catch (error) {
      toast.error('Error fetching payment methods: ' + error.message);
      setPaymentMethods(allPaymentMethods);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, allPaymentMethods]);

  const fetchSales = useCallback(async () => {
    if (!storeId || !checkDate) {
      setSales([]);
      return;
    }
    setIsLoading(true);
    try {
      let query = supabase
        .from('dynamic_sales')
        .select('id, sold_at, payment_method, amount, status, customer_name')
        .eq('store_id', storeId);

      let startDate, endDate;
      if (timePeriod === 'daily') {
        startDate = startOfDay(new Date(checkDate));
        endDate = endOfDay(new Date(checkDate));
      } else if (timePeriod === 'weekly') {
        startDate = startOfWeek(new Date(checkDate), { weekStartsOn: 1 });
        endDate = endOfWeek(new Date(checkDate), { weekStartsOn: 1 });
      } else if (timePeriod === 'monthly') {
        startDate = startOfMonth(new Date(checkDate));
        endDate = endOfMonth(new Date(checkDate));
      }

      query = query
        .gte('sold_at', format(startDate, 'yyyy-MM-dd HH:mm:ss'))
        .lte('sold_at', format(endDate, 'yyyy-MM-dd HH:mm:ss'));

      if (selectedPaymentMethod && selectedPaymentMethod !== 'All Payment Methods') {
        const denormalizedMethod = denormalizePaymentMethod(selectedPaymentMethod);
        query = query.eq('payment_method', denormalizedMethod);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast('No sales data found for the selected filters.');
      }
      setSales(data || []);
    } catch (error) {
      toast.error('Error loading sales: ' + error.message);
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, checkDate, timePeriod, selectedPaymentMethod]);

  const fetchReconciliationChecks = useCallback(async () => {
    if (!storeId) {
      setReconciliationChecks([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reconciliation_checks')
        .select(`
          id, store_id, check_date, period, payment_method, expected_amount, actual_amount, discrepancy, notes, status, created_at,
          stores (shop_name)
        `)
        .eq('store_id', storeId)
        .order('check_date', { ascending: false });
      if (error) throw error;
      setReconciliationChecks(data || []);
    } catch (error) {
      toast.error('Error loading reconciliation checks: ' + error.message);
      setReconciliationChecks([]);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  // Calculations
  const salesByPaymentMethod = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const method = normalizePaymentMethod(sale.payment_method || 'Unknown');
      acc[method] = acc[method] || { amount: 0, count: 0 };
      acc[method].amount += sale.amount;
      acc[method].count += 1;
      return acc;
    }, {});
  }, [sales]);

  const totalSalesAmount = useMemo(() => {
    return Object.values(salesByPaymentMethod).reduce((sum, { amount }) => sum + amount, 0);
  }, [salesByPaymentMethod]);

  const totalDiscrepancy = useMemo(() => {
    return reconciliationChecks.reduce((sum, check) => sum + (check.discrepancy || 0), 0);
  }, [reconciliationChecks]);

  const discrepanciesByPaymentMethod = useMemo(() => {
    return reconciliationChecks.reduce((acc, check) => {
      const method = normalizePaymentMethod(check.payment_method);
      acc[method] = acc[method] || 0;
      acc[method] += check.discrepancy || 0;
      return acc;
    }, {});
  }, [reconciliationChecks]);

  const suspiciousPatterns = useMemo(() => {
    const patterns = [];
    if (salesByPaymentMethod['Cash'] && salesByPaymentMethod['Cash'].amount > totalSalesAmount * 0.5) {
      patterns.push('High cash transactions detected (>50% of total sales). Verify cash deposits.');
    }
    const nonSoldSales = sales.filter(s => s.status !== 'sold').length;
    if (nonSoldSales > sales.length * 0.1) {
      patterns.push('Frequent non-sold transactions detected. Check for voids or cancellations.');
    }
    return patterns;
  }, [salesByPaymentMethod, totalSalesAmount, sales]);

  // Handlers
  const handleAddCheck = useCallback(async () => {
    if (!storeId || !newCheck.payment_method || !checkDate) {
      toast.error('Please select a store, payment method, and check date.');
      return;
    }
    setIsLoading(true);
    try {
      let expectedAmount;
      if (newCheck.payment_method === 'All Payment Methods') {
        expectedAmount = totalSalesAmount;
      } else {
        expectedAmount = salesByPaymentMethod[newCheck.payment_method]?.amount || newCheck.expected_amount;
      }
      const { error } = await supabase
        .from('reconciliation_checks')
        .insert({
          store_id: storeId,
          check_date: checkDate,
          period: timePeriod,
          payment_method: denormalizePaymentMethod(newCheck.payment_method).toLowerCase(),
          expected_amount: expectedAmount,
          actual_amount: newCheck.actual_amount,
          notes: newCheck.notes,
          status: newCheck.status,
        });
      if (error) throw error;
      toast.success('Reconciliation check added successfully!');
      setShowAddModal(false);
      setNewCheck({ payment_method: '', expected_amount: 0, actual_amount: 0, notes: '', status: 'pending' });
      await fetchReconciliationChecks();
    } catch (error) {
      toast.error('Error adding check: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, checkDate, timePeriod, newCheck, totalSalesAmount, salesByPaymentMethod, fetchReconciliationChecks]);

  const handleEditCheck = useCallback(async () => {
    if (!selectedCheck) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reconciliation_checks')
        .update({
          actual_amount: selectedCheck.actual_amount,
          notes: selectedCheck.notes,
          status: selectedCheck.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedCheck.id);
      if (error) throw error;
      toast.success('Reconciliation check updated successfully!');
      setShowEditModal(false);
      setSelectedCheck(null);
      await fetchReconciliationChecks();
    } catch (error) {
      toast.error('Error updating check: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCheck, fetchReconciliationChecks]);

  const handleDeleteCheck = useCallback(async () => {
    if (!selectedCheck) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reconciliation_checks')
        .delete()
        .eq('id', selectedCheck.id);
      if (error) throw error;
      toast.success('Reconciliation check deleted successfully!');
      setShowDeleteModal(false);
      setSelectedCheck(null);
      await fetchReconciliationChecks();
    } catch (error) {
      toast.error('Error deleting check: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCheck, fetchReconciliationChecks]);

  // Effects
  useEffect(() => {
    if (!ownerId) {
      toast.error('Please log in to view your stores.');
      setStores([]);
      setSales([]);
      setReconciliationChecks([]);
      setPaymentMethods([]);
      return;
    }
    fetchStores();
  }, [ownerId, fetchStores]);

  useEffect(() => {
    if (storeId) {
      fetchPaymentMethods();
      fetchSales();
      fetchReconciliationChecks();
    }
  }, [storeId, checkDate, timePeriod, selectedPaymentMethod, fetchPaymentMethods, fetchSales, fetchReconciliationChecks]);

  useEffect(() => {
    if (newCheck.payment_method) {
      const expected = newCheck.payment_method === 'All Payment Methods'
        ? totalSalesAmount
        : salesByPaymentMethod[newCheck.payment_method]?.amount || 0;
      setNewCheck(prev => ({ ...prev, expected_amount: expected }));
    }
  }, [newCheck.payment_method, salesByPaymentMethod, totalSalesAmount]);

  if (!ownerId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (stores.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            No stores found. Please create a store to proceed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">

      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Reconciliation Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track, verify, and reconcile your business transactions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ReconciliationFilters
          stores={stores}
          storeId={storeId}
          setStoreId={setStoreId}
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          checkDate={checkDate}
          setCheckDate={setCheckDate}
          paymentMethods={paymentMethods}
          storeName={currentStore?.shop_name || 'Store'}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          onApplyFilters={() => {
            if (!storeId || !checkDate) {
              toast.error('Please select a store and check date.');
              return;
            }
            fetchSales();
            fetchReconciliationChecks();
          }}
          onAddCheck={() => {
            if (!storeId || !checkDate) {
              toast.error('Please select a store and check date.');
              return;
            }
            setShowAddModal(true);
            setNewCheck({
              payment_method: selectedPaymentMethod || '',
              expected_amount: selectedPaymentMethod && salesByPaymentMethod[selectedPaymentMethod]
                ? salesByPaymentMethod[selectedPaymentMethod].amount
                : 0,
              actual_amount: 0,
              notes: '',
              status: 'pending',
            });
          }}
          onExportCSV={() => downloadCSV(
            reconciliationChecks.map(c => ({
              ...c,
              store_name: c.stores.shop_name,
              payment_method: normalizePaymentMethod(c.payment_method),
            })),
            `reconciliation_checks_${format(new Date(), 'yyyy-MM-dd')}.csv`
          )}
          isLoading={isLoading}
        />
      </div>

      {/* Stats Cards */}
      {storeId && !isLoading && sales.length > 0 && (
        <div className="mb-8">
          <SalesStatsCards
            totalSalesAmount={totalSalesAmount}
            salesByPaymentMethod={salesByPaymentMethod}
            sales={sales}
            selectedPaymentMethod={selectedPaymentMethod}
          />
        </div>
      )}

      {/* Sales by Payment Method */}
      {storeId && !isLoading && Object.keys(salesByPaymentMethod).length > 0 && (
        <div className="mb-8">
          <SalesByPaymentMethod salesByPaymentMethod={salesByPaymentMethod} />
        </div>
      )}

      {/* Suspicious Patterns */}
      {suspiciousPatterns.length > 0 && !isLoading && (
        <div className="mb-8">
          <SuspiciousPatterns patterns={suspiciousPatterns} />
        </div>
      )}

{storeId && !isLoading && (
      <div className="mb-8">
        <SalesList 
          sales={sales}
          onDelete={handleDeleteSale} // ← Pass the delete function here!
        />
      </div>
    )}


    

      {/* Discrepancies */}
      {storeId && !isLoading && reconciliationChecks.length > 0 && (
        <div className="mb-8">
          <DiscrepanciesCard
            totalDiscrepancy={totalDiscrepancy}
            discrepanciesByPaymentMethod={discrepanciesByPaymentMethod}
          />
        </div>
      )}

      {/* Chart */}
      {storeId && !isLoading && paymentMethods.length > 0 && (
        <div className="mb-8">
          <ReconciliationChart
            paymentMethods={paymentMethods}
            salesByPaymentMethod={salesByPaymentMethod}
            reconciliationChecks={reconciliationChecks}
            checkDate={checkDate}
          />
        </div>
      )}

      {/* Checks Table */}
      {storeId && !isLoading && (
        <div className="mb-8">
          <ReconciliationChecksList
            reconciliationChecks={reconciliationChecks}
            totalDiscrepancy={totalDiscrepancy}
            onEdit={(check) => {
              setSelectedCheck(check);
              setShowEditModal(true);
            }}
            onDelete={(check) => {
              setSelectedCheck(check);
              setShowDeleteModal(true);
            }}
          />
        </div>
      )}

      {/* Modals */}
      <AddCheckModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        newCheck={newCheck}
        setNewCheck={setNewCheck}
        paymentMethods={paymentMethods}
        onSave={handleAddCheck}
        isLoading={isLoading}
      />

      <EditCheckModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        selectedCheck={selectedCheck}
        setSelectedCheck={setSelectedCheck}
        onSave={handleEditCheck}
        isLoading={isLoading}
      />

      <DeleteCheckModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        selectedCheck={selectedCheck}
        onConfirm={handleDeleteCheck}
        isLoading={isLoading}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-slate-700 dark:text-slate-300 font-medium">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}