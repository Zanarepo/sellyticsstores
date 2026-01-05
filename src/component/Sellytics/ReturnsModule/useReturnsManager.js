/**
 * Returns Manager Hook - Enterprise Grade
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';

export default function useReturnsManager() {
  const storeId = localStorage.getItem('store_id');
  const [storeName, setStoreName] = useState(null);
  const [returns, setReturns] = useState([]);
  const [queriedSales, setQueriedSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Fetch store info and returns
  const fetchData = useCallback(async () => {
    if (!storeId) {
      toast.error('No store ID found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      // Fetch store name
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('shop_name')
        .eq('id', storeId)
        .single();

      if (storeError) throw storeError;
      setStoreName(storeData.shop_name);

      // Fetch receipts for this store
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('receipts')
        .select('id, receipt_id, sale_group_id')
        .eq('store_receipt_id', storeId);

      if (receiptsError) throw receiptsError;

      const receiptIds = receiptsData.map(r => r.id);

      // Fetch returns
      const { data: returnsData, error: returnsError } = await supabase
        .from('returns')
        .select('*')
        .in('receipt_id', receiptIds)
        .order('created_at', { ascending: false });

      if (returnsError) throw returnsError;

      // Combine returns with receipt info
      const combined = returnsData.map(ret => {
        const receipt = receiptsData.find(r => r.id === ret.receipt_id);
        return {
          ...ret,
          receipt_code: receipt?.receipt_id || 'Unknown',
          sale_group_id: receipt?.sale_group_id || null
        };
      });

      setReturns(combined);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load returns data');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Search sales by receipt ID or device ID
  const searchSales = useCallback(async (receiptId, deviceId) => {
    if (!receiptId && !deviceId) {
      setQueriedSales([]);
      return;
    }

    setSearching(true);
    const toastId = toast.loading('Searching...');

    try {
      let salesData = [];

      if (receiptId) {
        // Search by receipt ID - get ALL products in that receipt
        const { data: receipt, error: receiptError } = await supabase
          .from('receipts')
          .select('id, sale_group_id, receipt_id, customer_address, phone_number')
          .eq('store_receipt_id', storeId)
          .eq('receipt_id', receiptId)
          .single();

        if (receiptError || !receipt) {
          throw new Error(`No receipt found for ID: ${receiptId}`);
        }

        // Fetch ALL sales for this sale_group_id (unique AND non-unique)
        const { data: sales, error: salesError } = await supabase
          .from('dynamic_sales')
          .select(`
            id,
            dynamic_product_id,
            quantity,
            device_id,
            unit_price,
            amount,
            payment_method,
            sale_group_id,
            dynamic_product (
              id,
              name,
              is_unique,
              dynamic_product_imeis
            )
          `)
          .eq('store_id', storeId)
          .eq('sale_group_id', receipt.sale_group_id);

        if (salesError) throw salesError;

        // Process each sale - create separate rows for unique items
        salesData = sales.flatMap(sale => {
          const product = sale.dynamic_product;
          const isUnique = product?.is_unique;

          if (isUnique && sale.device_id) {
            // For unique products, split by device IDs
            const deviceIds = sale.device_id.split(',').map(id => id.trim()).filter(Boolean);
            return deviceIds.map(devId => ({
              id: `${sale.id}-${devId}`,
              sale_id: sale.id,
              receipt_id: receipt.id,
              receipt_code: receipt.receipt_id,
              customer_address: receipt.customer_address,
              phone_number: receipt.phone_number,
              product_name: product.name,
              device_id: devId,
              quantity: 1,
              unit_price: sale.unit_price || (sale.amount / sale.quantity),
              amount: sale.unit_price || (sale.amount / sale.quantity),
              payment_method: sale.payment_method,
              is_unique: true,
              sale_group_id: sale.sale_group_id
            }));
          } else {
            // For non-unique products, keep as single row
            return [{
              id: sale.id,
              sale_id: sale.id,
              receipt_id: receipt.id,
              receipt_code: receipt.receipt_id,
              customer_address: receipt.customer_address,
              phone_number: receipt.phone_number,
              product_name: product.name,
              device_id: null,
              quantity: sale.quantity,
              unit_price: sale.unit_price || (sale.amount / sale.quantity),
              amount: sale.amount,
              payment_method: sale.payment_method,
              is_unique: false,
              sale_group_id: sale.sale_group_id
            }];
          }
        });

      } else if (deviceId) {
        // Search by device ID
        const { data: sales, error: salesError } = await supabase
          .from('dynamic_sales')
          .select(`
            id,
            dynamic_product_id,
            quantity,
            device_id,
            unit_price,
            amount,
            payment_method,
            sale_group_id,
            dynamic_product (
              id,
              name,
              dynamic_product_imeis
            )
          `)
          .eq('store_id', storeId)
          .ilike('device_id', `%${deviceId}%`);

        if (salesError) throw salesError;

        if (!sales || sales.length === 0) {
          throw new Error(`No sales found for device ID: ${deviceId}`);
        }

        // Get receipts for these sales
        const saleGroupIds = sales.map(s => s.sale_group_id).filter(Boolean);
        const { data: receipts } = await supabase
          .from('receipts')
          .select('id, sale_group_id, receipt_id, customer_address, phone_number')
          .eq('store_receipt_id', storeId)
          .in('sale_group_id', saleGroupIds);

        // Process sales
        salesData = sales.flatMap(sale => {
          const product = sale.dynamic_product;
          const receipt = receipts?.find(r => r.sale_group_id === sale.sale_group_id);
          const deviceIds = sale.device_id?.split(',').map(id => id.trim()).filter(Boolean) || [];
          
          // Filter for exact match
          const matchingIds = deviceIds.filter(id => id.toLowerCase().includes(deviceId.toLowerCase()));
          
          if (matchingIds.length === 0) return [];

          return matchingIds.map(devId => ({
            id: `${sale.id}-${devId}`,
            sale_id: sale.id,
            receipt_id: receipt?.id,
            receipt_code: receipt?.receipt_id || 'Unknown',
            customer_address: receipt?.customer_address,
            phone_number: receipt?.phone_number,
            product_name: product.name,
            device_id: devId,
            quantity: 1,
            unit_price: sale.unit_price || (sale.amount / sale.quantity),
            amount: sale.unit_price || (sale.amount / sale.quantity),
            payment_method: sale.payment_method,
            is_unique: true,
            sale_group_id: sale.sale_group_id
          }));
        });
      }

      setQueriedSales(salesData);
      toast.success(`Found ${salesData.length} item${salesData.length !== 1 ? 's' : ''}`, { id: toastId });
    } catch (err) {
      console.error('Search failed:', err);
      toast.error(err.message || 'Search failed', { id: toastId });
      setQueriedSales([]);
    } finally {
      setSearching(false);
    }
  }, [storeId]);

  // Create return(s)
  const createReturns = useCallback(async (returnsData) => {
    const toastId = toast.loading(`Creating ${returnsData.length} return${returnsData.length !== 1 ? 's' : ''}...`);

    try {
      const { error } = await supabase.from('returns').insert(returnsData);
      if (error) throw error;

      toast.success(`Created ${returnsData.length} return${returnsData.length !== 1 ? 's' : ''}`, { id: toastId, icon: '✅' });
      await fetchData();
    } catch (err) {
      console.error('Failed to create returns:', err);
      toast.error('Failed to create returns', { id: toastId });
      throw err;
    }
  }, [fetchData]);

  // Update return
  const updateReturn = useCallback(async (returnId, updates) => {
    const toastId = toast.loading('Updating...');

    try {
      const { error } = await supabase
        .from('returns')
        .update(updates)
        .eq('id', returnId);

      if (error) throw error;

      toast.success('Return updated', { id: toastId, icon: '✅' });
      await fetchData();
    } catch (err) {
      console.error('Failed to update return:', err);
      toast.error('Failed to update return', { id: toastId });
      throw err;
    }
  }, [fetchData]);

  // Delete return(s)
  const deleteReturns = useCallback(async (returnIds) => {
    const count = returnIds.length;
    const toastId = toast.loading(`Deleting ${count} return${count !== 1 ? 's' : ''}...`);

    try {
      const { error } = await supabase
        .from('returns')
        .delete()
        .in('id', returnIds);

      if (error) throw error;

      toast.success(`Deleted ${count} return${count !== 1 ? 's' : ''}`, { id: toastId, icon: '🗑️' });
      await fetchData();
    } catch (err) {
      console.error('Failed to delete returns:', err);
      toast.error('Failed to delete returns', { id: toastId });
      throw err;
    }
  }, [fetchData]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    if (!storeId) return;

    const channel = supabase
      .channel('returns')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'returns' },
        () => {
          fetchData();
          toast('New return added', { icon: '📦' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, fetchData]);

  return {
    storeId,
    storeName,
    returns,
    queriedSales,
    loading,
    searching,
    searchSales,
    createReturns,
    updateReturn,
    deleteReturns,
    refreshData: fetchData
  };
}