/**
 * Theft Detection Hook - Enterprise-grade
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../../supabaseClient';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

export default function useTheftDetection() {
  const storeId = localStorage.getItem('store_id') || null;

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [storeName, setStoreName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!storeId) {
      toast.error('No store ID found');
      setLoading(false);
      return;
    }

    try {
      const [storeRes, inventoryRes, productsRes, incidentsRes] = await Promise.all([
        supabase.from('stores').select('shop_name').eq('id', storeId).single(),
        supabase.from('dynamic_inventory').select('dynamic_product_id, available_qty, updated_at').eq('store_id', storeId),
        supabase.from('dynamic_product').select('id, name').eq('store_id', storeId).order('name'),
        supabase.from('theft_incidents').select('*').eq('store_id', storeId).order('created_at', { ascending: false })
      ]);

      if (storeRes.error) throw storeRes.error;
      if (inventoryRes.error) throw inventoryRes.error;
      if (productsRes.error) throw productsRes.error;
      if (incidentsRes.error) throw incidentsRes.error;

      setStoreName(storeRes.data.shop_name);
      setInventory(inventoryRes.data);
      setProducts(productsRes.data);
      setIncidents(incidentsRes.data);
    } catch (err) {
      toast.error(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Realtime subscription
  useEffect(() => {
    fetchData();

    if (!storeId) return;

    const channel = supabase
      .channel('theft_incidents')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'theft_incidents', filter: `store_id=eq.${storeId}` },
        (payload) => {
          setIncidents((prev) => {
            if (prev.some((i) => i.id === payload.new.id)) return prev;
            return [{ ...payload.new }, ...prev];
          });
          toast.success('New theft incident detected', { icon: '🚨' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, fetchData]);

  // Add product
  const addProduct = useCallback((productId) => {
    if (!productId) return;
    
    if (selectedProducts.some((p) => p.productId === productId)) {
      toast.error('Product already added');
      return;
    }

    const product = products.find((p) => p.id === parseInt(productId));
    const inv = inventory.find((i) => i.dynamic_product_id === parseInt(productId));

    setSelectedProducts((prev) => [
      ...prev,
      {
        productId,
        productName: product?.name || `Product ID: ${productId}`,
        physicalCount: '',
        availableQty: inv?.available_qty ?? null
      }
    ]);

    toast.success(`Added ${product?.name}`, { icon: '✅' });
  }, [products, inventory, selectedProducts]);

  // Update physical count
  const updatePhysicalCount = useCallback((productId, value) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, physicalCount: value } : p))
    );
  }, []);

  // Remove product
  const removeProduct = useCallback((productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
    toast('Product removed', { icon: 'ℹ️' });
  }, []);

  // Clear all products
  const clearProducts = useCallback(() => {
    setSelectedProducts([]);
    toast('Cleared all products', { icon: '🗑️' });
  }, []);

  // Parse CSV
  const parseCSV = useCallback((file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsed = [];
          const seen = new Set();

          for (const row of result.data) {
            let productId = null;
            let productName = null;
            const physicalCount = row.physical_count || row.physicalCount || '';
            const physicalCountNum = parseInt(physicalCount);

            if (isNaN(physicalCountNum) || physicalCountNum < 0) continue;

            if (row.dynamic_product_id || row.productId) {
              productId = parseInt(row.dynamic_product_id || row.productId);
              const product = products.find((p) => p.id === productId);
              if (product) productName = product.name;
              else continue;
            } else if (row.product_name || row.productName) {
              const name = (row.product_name || row.productName).toLowerCase();
              const product = products.find((p) => p.name.toLowerCase() === name);
              if (product) {
                productId = product.id;
                productName = product.name;
              } else continue;
            } else continue;

            if (seen.has(productId)) continue;
            seen.add(productId);

            const inv = inventory.find((i) => i.dynamic_product_id === productId);
            const availableQty = inv?.available_qty ?? null;

            parsed.push({
              productId: productId.toString(),
              productName,
              physicalCount,
              availableQty
            });
          }

          resolve(parsed);
        },
        error: (err) => reject(err)
      });
    });
  }, [products, inventory]);

  // Upload CSV
  const uploadCSV = useCallback(async (file) => {
    try {
      const toastId = toast.loading('Processing CSV...');
      const parsed = await parseCSV(file);
      
      if (parsed.length === 0) {
        toast.error('No valid products found in CSV', { id: toastId });
        return;
      }

      setSelectedProducts(parsed);
      toast.success(`Imported ${parsed.length} products`, { id: toastId, icon: '📥' });
    } catch (err) {
      toast.error(`CSV parse failed: ${err.message}`);
    }
  }, [parseCSV]);

  // Check theft
  const checkTheft = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast.error('No products to check');
      return;
    }

    setChecking(true);
    const toastId = toast.loading('Checking for missing items...');
    let missingCount = 0;
    const errors = [];

    try {
      for (const { productId, productName, physicalCount, availableQty } of selectedProducts) {
        if (availableQty == null) continue;

        const physical = Number(physicalCount);
        if (isNaN(physical) || physical < 0) {
          errors.push(`Invalid count for ${productName}`);
          continue;
        }

        if (physical < availableQty) {
          const discrepancy = availableQty - physical;
          missingCount++;

          await supabase.from('theft_incidents').insert({
            dynamic_product_id: Number(productId),
            store_id: Number(storeId),
            inventory_change: -discrepancy,
            expected_change: 0,
            product_name: productName,
            shop_name: storeName,
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
        }
      }

      if (errors.length > 0) {
        toast.error(`Errors: ${errors.join(', ')}`, { id: toastId });
      } else if (missingCount > 0) {
        toast.error(`${missingCount} product(s) with missing items`, { id: toastId, icon: '🚨' });
      } else {
        toast.success('No missing items detected', { id: toastId, icon: '✅' });
      }

      setSelectedProducts([]);
      await fetchData();
    } catch (err) {
      toast.error(`Check failed: ${err.message}`, { id: toastId });
    } finally {
      setChecking(false);
    }
  }, [selectedProducts, storeId, storeName, fetchData]);

  // Delete incident
  const deleteIncident = useCallback(async (incidentId) => {
    try {
      const { error } = await supabase.from('theft_incidents').delete().eq('id', incidentId);
      if (error) throw error;

      setIncidents((prev) => prev.filter((i) => i.id !== incidentId));
      toast.success('Incident deleted', { icon: '🗑️' });
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    }
  }, []);

  // Batch delete incidents
  const batchDeleteIncidents = useCallback(async (ids) => {
    if (ids.length === 0) return;

    const toastId = toast.loading(`Deleting ${ids.length} incidents...`);

    try {
      const { error } = await supabase.from('theft_incidents').delete().in('id', ids);
      if (error) throw error;

      setIncidents((prev) => prev.filter((i) => !ids.includes(i.id)));
      setSelectedIncidents([]);
      toast.success(`Deleted ${ids.length} incidents`, { id: toastId, icon: '🗑️' });
    } catch (err) {
      toast.error(`Batch delete failed: ${err.message}`, { id: toastId });
    }
  }, []);

  // Toggle incident selection
  const toggleIncidentSelection = useCallback((incidentId) => {
    setSelectedIncidents((prev) =>
      prev.includes(incidentId)
        ? prev.filter((id) => id !== incidentId)
        : [...prev, incidentId]
    );
  }, []);

  // Select all incidents
  const selectAllIncidents = useCallback(() => {
    setSelectedIncidents(incidents.map((i) => i.id));
  }, [incidents]);

  // Clear incident selection
  const clearIncidentSelection = useCallback(() => {
    setSelectedIncidents([]);
  }, []);

  return {
    storeId,
    storeName,
    loading,
    checking,
    products,
    inventory,
    incidents,
    selectedProducts,
    selectedIncidents,
    addProduct,
    updatePhysicalCount,
    removeProduct,
    clearProducts,
    uploadCSV,
    checkTheft,
    deleteIncident,
    batchDeleteIncidents,
    toggleIncidentSelection,
    selectAllIncidents,
    clearIncidentSelection
  };
}