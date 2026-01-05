// hooks/useInventoryProducts.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { ReturnsService } from './services/returnsService'; // Adjust path if needed
import { toast } from 'react-hot-toast';

export function useInventoryProducts({ supabase, warehouseId, userId }) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist service instance across renders using useRef
  const serviceRef = useRef(null);

  // Only recreate service if warehouseId or userId actually changes
  if (
    !serviceRef.current ||
    serviceRef.current.warehouseId !== warehouseId ||
    serviceRef.current.userId !== userId ||
    serviceRef.current.supabase !== supabase
  ) {
    serviceRef.current = new ReturnsService(supabase, warehouseId, userId);
  }

  const service = serviceRef.current;
  const isReady = !!warehouseId && !!service;

  useEffect(() => {
    if (!isReady) {
      setAllProducts([]);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await service.fetchInventory();

        if (!Array.isArray(data) || data.length === 0) {
          console.warn('No inventory products returned from service');
          toast.info('No available products found in this warehouse'); // Changed to info
        }

        setAllProducts(data || []);
      } catch (err) {
        console.error('Inventory fetch failed:', err);
        setError('Failed to load products');
        toast.error('Could not load warehouse inventory');
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [isReady, service]); // Now safe: service reference is stable




  
 const getProductsForClient = useMemo(() => {
  return (selectedClientId) => {
    if (!selectedClientId || !isReady) return [];

    const clientIdNum = Number(selectedClientId);

    const filtered = allProducts
      .filter((item) => {
        return Number(item.client_id) === clientIdNum && 
               (item.available_qty || 0) > 0 &&
               item.warehouse_products;
      })
      .map((item) => ({
        id: item.warehouse_product_id,                    // This is the correct product ID to save
        name: item.warehouse_products.product_name,
        sku: item.warehouse_products.sku || 'N/A',
        available: item.available_qty,
        type: item.warehouse_products.product_type,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Products available for client ${clientIdNum}:`, filtered);

    return filtered;
  };
}, [allProducts, isReady]);





  return {
    allProducts,
    loading,
    error,
    getProductsForClient,
  };
}