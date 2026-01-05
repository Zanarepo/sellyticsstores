/**
 * useOfflineProducts Hook
 * Manages product CRUD with offline-first approach
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import offlineDB from '../db/offlineDB';
import { supabase } from '../../../supabaseClient';
// Supabase client - import from your project
const getSupabase = () => {
  // Dynamic import to handle SSR
  if (typeof window === 'undefined') return null;
  
  return supabase;
}

export function useOfflineProducts(storeId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  const realtimeSubscription = useRef(null);
  const supabase = useRef(getSupabase());

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online!', { icon: '🌐' });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast('Working offline', { icon: '📴' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Format product data consistently
  const formatProduct = useCallback((product) => {
    return {
      ...product,
      is_unique: product.is_unique ?? false,
      deviceList: product.is_unique && product.dynamic_product_imeis
        ? product.dynamic_product_imeis.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      sizeList: product.is_unique && product.device_size
        ? product.device_size.split(',').map(s => s.trim())
        : []
    };
  }, []);

  // Fetch products - NETWORK FIRST when online, cache fallback when offline
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isOnline && supabase.current) {
        // ONLINE: Fetch directly from database (network-first)
        const { data, error: fetchError } = await supabase.current
          .from('dynamic_product')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          await offlineDB.logSync('fetch_products', 'failed', fetchError.message);
          
          // Fallback to cache on network error
          const cached = await offlineDB.getProducts(storeId);
          if (cached && cached.length > 0) {
            setProducts(cached.map(formatProduct));
          }
        } else if (data) {
          const formatted = data.map(formatProduct);
          setProducts(formatted);
          await offlineDB.cacheProducts(data, storeId);
          await offlineDB.logSync('fetch_products', 'success', `Fetched ${data.length} products from server`);
        }
      } else {
        // OFFLINE: Load from cache
        const cached = await offlineDB.getProducts(storeId);
        if (cached && cached.length > 0) {
          setProducts(cached.map(formatProduct));
        }
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.message);
      
      // Fallback to cache on any error
      const cached = await offlineDB.getProducts(storeId);
      if (cached && cached.length > 0) {
        setProducts(cached.map(formatProduct));
      }
    } finally {
      setLoading(false);
    }
  }, [storeId, isOnline, formatProduct]);

  // Check for duplicate IMEIs
  const checkDuplicateImeis = useCallback(async (imeis, excludeProductId = null) => {
    if (!imeis || imeis.length === 0) return [];

    try {
      // Check in cache
      const cached = await offlineDB.getProducts(storeId);
      const duplicates = [];

      for (const product of cached) {
        if (excludeProductId && product.id === excludeProductId) continue;
        if (!product.is_unique || !product.dynamic_product_imeis) continue;

        const existingImeis = product.dynamic_product_imeis.split(',').map(s => s.trim());
        const found = imeis.filter(imei => existingImeis.includes(imei));
        
        if (found.length > 0) {
          duplicates.push(...found.map(imei => ({ imei, productName: product.name })));
        }
      }

      // Check database if online
      if (isOnline && supabase.current && duplicates.length === 0) {
        for (const imei of imeis) {
          const { data } = await supabase.current
            .from('dynamic_product')
            .select('id, name')
            .eq('store_id', storeId)
            .ilike('dynamic_product_imeis', `%${imei}%`)
            .limit(1);

          if (data && data.length > 0) {
            const existing = data[0];
            if (!excludeProductId || existing.id !== excludeProductId) {
              duplicates.push({ imei, productName: existing.name });
            }
          }
        }
      }

      return duplicates;
    } catch (err) {
      console.error('Error checking duplicates:', err);
      return [];
    }
  }, [storeId, isOnline]);

  // Create product
  const createProduct = useCallback(async (productData) => {
    if (!storeId) throw new Error('No store selected');

    // Check for duplicate IMEIs if unique product
    if (productData.is_unique && productData.dynamic_product_imeis) {
      const imeis = productData.dynamic_product_imeis.split(',').map(s => s.trim());
      const duplicates = await checkDuplicateImeis(imeis);
      
      if (duplicates.length > 0) {
        const dupeList = duplicates.map(d => `${d.imei} (in ${d.productName})`).join(', ');
        throw new Error(`Duplicate IMEI(s) found: ${dupeList}`);
      }
    }

    const product = {
      store_id: Number(storeId),
      name: productData.name?.trim(),
      description: productData.description?.trim() || null,
      purchase_price: Number(productData.purchase_price) || 0,
      selling_price: Number(productData.selling_price) || 0,
      purchase_qty: productData.purchase_qty || 0,
      suppliers_name: productData.suppliers_name?.trim() || null,
      is_unique: productData.is_unique || false,
      dynamic_product_imeis: productData.dynamic_product_imeis || null,
      device_size: productData.device_size || null,
      device_id: productData.device_id || null,
      created_at: new Date().toISOString()
    };

   
   
   
try {
  if (isOnline && supabase.current) {
    // 1️⃣ Update product
    const { data } = await supabase.current
      .from('dynamic_product')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()
      .throwOnError();

    // 2️⃣ Read inventory (if exists)
    const { data: inv } = await supabase.current
      .from('dynamic_inventory')
      .select('available_qty, quantity_sold')
      .eq('dynamic_product_id', productId)
      .eq('store_id', storeId)
      .maybeSingle()
      .throwOnError();

    // 3️⃣ Calculate quantity
    const newQty =
      updates.purchase_qty !== undefined
        ? Number(updates.purchase_qty)
        : Math.max(0, (inv?.available_qty || 0) + inventoryDelta);

    // 4️⃣ FORCE inventory write (no silent failure)
    await supabase.current
      .from('dynamic_inventory')
      .upsert(
        {
          dynamic_product_id: productId,
          store_id: Number(storeId),
          available_qty: newQty,
          quantity_sold: inv?.quantity_sold ?? 0,
          last_updated: new Date().toISOString()
        },
        { onConflict: ['dynamic_product_id', 'store_id'] }
      )
      .select()
      .throwOnError();

    // 5️⃣ Cache + state
    await offlineDB.cacheProducts([data], storeId);

    setProducts(prev =>
      prev.map(p => (p.id === productId ? formatProduct(data) : p))
    );

    return data;
  }




else {
        // Offline: save locally and queue for sync
        const localProduct = await offlineDB.addProduct(product, storeId);
        await offlineDB.logSync('create_product', 'offline', `Queued: ${product.name}`);
        
        setProducts(prev => [formatProduct(localProduct), ...prev]);
        return localProduct;
      }
    } catch (err) {
      console.error('Create product error:', err);
      await offlineDB.logSync('create_product', 'failed', err.message);
      throw err;
    }
  }, [storeId, isOnline, formatProduct, checkDuplicateImeis]);

  // Update product
  const updateProduct = useCallback(async (productId, updates, inventoryDelta = 0) => {
    if (!storeId) throw new Error('No store selected');

    // Check for duplicate IMEIs if updating unique product IMEIs
    if (updates.dynamic_product_imeis) {
      const imeis = updates.dynamic_product_imeis.split(',').map(s => s.trim());
      const duplicates = await checkDuplicateImeis(imeis, productId);
      
      if (duplicates.length > 0) {
        const dupeList = duplicates.map(d => `${d.imei} (in ${d.productName})`).join(', ');
        throw new Error(`Duplicate IMEI(s) found: ${dupeList}`);
      }
    }





try {
  if (isOnline && supabase.current) {
    // 1️⃣ Update product
    const { data, error } = await supabase.current
      .from('dynamic_product')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()
      .throwOnError();

    if (error) throw error;

    // 2️⃣ Read current inventory (if exists)
    const { data: inv } = await supabase.current
      .from('dynamic_inventory')
      .select('available_qty')
      .eq('dynamic_product_id', productId)
      .eq('store_id', storeId)
      .maybeSingle()
      .throwOnError();

    // 3️⃣ Compute new qty
    const newQty =
      updates.purchase_qty !== undefined
        ? Number(updates.purchase_qty)
        : Math.max(0, (inv?.available_qty || 0) + inventoryDelta);

    // 4️⃣ FORCE inventory upsert (NO silent failure)
    const { error: invError } = await supabase.current
      .from('dynamic_inventory')
      .upsert(
        {
          dynamic_product_id: productId,
          store_id: Number(storeId),
          available_qty: newQty,
          quantity_sold: inv?.quantity_sold ?? 0,
          last_updated: new Date().toISOString()
        },
        { onConflict: ['dynamic_product_id', 'store_id'] }
      )
      .select()
      .throwOnError();

    if (invError) throw invError;

    // 5️⃣ Cache + state
    await offlineDB.cacheProducts([data], storeId);

    setProducts(prev =>
      prev.map(p => (p.id === productId ? formatProduct(data) : p))
    );

    return data;
  }


else {
        // Offline: update locally
        const updated = await offlineDB.updateProduct(productId, updates);
        await offlineDB.logSync('update_product', 'offline', `Queued update: ${productId}`);
        
        setProducts(prev => prev.map(p => p.id === productId ? formatProduct(updated) : p));
        return updated;
      }
    } catch (err) {
      console.error('Update product error:', err);
      await offlineDB.logSync('update_product', 'failed', err.message);
      throw err;
    }
  }, [storeId, isOnline, formatProduct, checkDuplicateImeis]);

  
  
  
  
  
  
  // Delete product
  const deleteProduct = useCallback(async (productId) => {
    if (!storeId) throw new Error('No store selected');

    try {
      if (isOnline && supabase.current) {
        // Online: delete directly
        await supabase.current
          .from('dynamic_product')
          .delete()
          .eq('id', productId);

        await supabase.current
          .from('dynamic_inventory')
          .delete()
          .eq('dynamic_product_id', productId)
          .eq('store_id', storeId);

        // Remove from cache
        await offlineDB.permanentlyDeleteProduct(productId);
        await offlineDB.logSync('delete_product', 'success', `Deleted: ${productId}`);
        
        setProducts(prev => prev.filter(p => p.id !== productId));
        return true;
      } else {
        // Offline: mark for deletion
        await offlineDB.deleteProduct(productId);
        await offlineDB.logSync('delete_product', 'offline', `Queued deletion: ${productId}`);
        
        setProducts(prev => prev.filter(p => p.id !== productId));
        return true;
      }
    } catch (err) {
      console.error('Delete product error:', err);
      await offlineDB.logSync('delete_product', 'failed', err.message);
      throw err;
    }
  }, [storeId, isOnline]);



  // Get product by ID
  const getProductById = useCallback(async (id) => {
    try {
      const cached = await offlineDB.getProductById(id);
      if (cached) return formatProduct(cached);

      if (isOnline && supabase.current) {
        const { data } = await supabase.current
          .from('dynamic_product')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) return formatProduct(data);
      }
      return null;
    } catch (err) {
      console.error('Get product error:', err);
      return null;
    }
  }, [isOnline, formatProduct]);

  // Setup real-time subscription
  useEffect(() => {
    if (!storeId || !isOnline || !supabase.current) return;

    const subscription = supabase.current
      .channel(`products-${storeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'dynamic_product',
        filter: `store_id=eq.${storeId}`
      }, async (payload) => {
        console.log('Real-time update:', payload);

        if (payload.eventType === 'INSERT') {
          const formatted = formatProduct(payload.new);
          setProducts(prev => {
            if (prev.some(p => p.id === formatted.id)) return prev;
            return [formatted, ...prev];
          });
          await offlineDB.cacheProducts([payload.new], storeId);
        }

        if (payload.eventType === 'UPDATE') {
          const formatted = formatProduct(payload.new);
          setProducts(prev => prev.map(p => p.id === formatted.id ? formatted : p));
          await offlineDB.cacheProducts([payload.new], storeId);
        }

        if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          await offlineDB.permanentlyDeleteProduct(payload.old.id);
        }
      })
      .subscribe();

    realtimeSubscription.current = subscription;

    return () => {
      if (realtimeSubscription.current) {
        supabase.current?.removeChannel(realtimeSubscription.current);
      }
    };
  }, [storeId, isOnline, formatProduct]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    isOnline,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    refreshProducts: fetchProducts
  };
}

export default useOfflineProducts;