import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import db from '../../db/dexieDb';


export default function useProductStock(productId, storeId) {
  const [imeis, setImeis] = useState([]);
  const [inStock, setInStock] = useState([]);
  const [sold, setSold] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStock = useCallback(async () => {
    if (!productId || !storeId) return;
    setIsLoading(true);

    let fetchedOnline = false;

    try {
      // --- Fetch product IMEIs from Supabase ---
      const { data: product, error: productError } = await supabase
        .from('dynamic_product')
        .select('dynamic_product_imeis')
        .eq('id', productId)
        .single();
      if (productError) throw productError;

      const allIMEIs = product?.dynamic_product_imeis
        ? product.dynamic_product_imeis.split(',').map(i => i.trim())
        : [];

      // --- Fetch sales for this product ---
      const { data: sales, error: salesError } = await supabase
        .from('dynamic_sales')
        .select('device_id,status')
        .eq('dynamic_product_id', productId)
        .eq('store_id', storeId);
      if (salesError) throw salesError;

      const soldIDs = (sales || [])
        .filter(s => s.status === 'sold')
        .map(s => s.device_id)
        .filter(Boolean);

      const inStockIDs = allIMEIs.filter(i => !soldIDs.includes(i));

      setImeis(allIMEIs);
      setSold(soldIDs);
      setInStock(inStockIDs);

      // --- Cache online data in Dexie ---
      const existing = await db.dynamic_product.get(Number(productId));
      await db.dynamic_product.put({
        id: Number(productId),
        store_id: Number(storeId),
        dynamic_product_imeis: allIMEIs.join(','),
        ...existing, // preserve other existing fields
      });

      if (sales?.length) {
        await db.dynamic_sales.bulkPut(
          sales.map(s => ({
            ...s,
            dynamic_product_id: Number(productId),
            store_id: Number(storeId),
            _offline_status: 'synced',
          }))
        );
      }

      fetchedOnline = true;
    } catch (err) {
      console.warn('⚠️ Failed to fetch product stock online:', err);
    }

    // --- Offline fallback only if online fetch failed ---
    if (!fetchedOnline) {
      const cachedProduct = await db.dynamic_product
        .where('id')
        .equals(Number(productId))
        .first();

      const cachedIMEIs = cachedProduct?.dynamic_product_imeis
        ? cachedProduct.dynamic_product_imeis.split(',').map(i => i.trim())
        : [];

      const cachedSales = await db.dynamic_sales
        .where('dynamic_product_id')
        .equals(Number(productId))
        .toArray();

      const cachedSoldIDs = cachedSales
        .filter(s => s.status === 'sold')
        .map(s => s.device_id)
        .filter(Boolean);

      const cachedInStockIDs = cachedIMEIs.filter(i => !cachedSoldIDs.includes(i));

      setImeis(cachedIMEIs);
      setSold(cachedSoldIDs);
      setInStock(cachedInStockIDs);

      
    }

    setIsLoading(false);
  }, [productId, storeId]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return { imeis, inStock, sold, isLoading, refresh: fetchStock };
}
