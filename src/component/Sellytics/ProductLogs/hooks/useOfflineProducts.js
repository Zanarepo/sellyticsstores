// useOfflineProducts.js
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../supabaseClient';
import { useProductFetch } from './useProductFetch';
import { useProductMutations } from './useProductMutations';
import { useProductFormatter } from './useProductFormatter';
import { useUserPermissions } from './usePermissions';

export function useOfflineProducts(storeId) {
  const supabaseRef = useRef(supabase);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Online/offline monitoring
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

  // Sub-hooks
  const { products, setProducts, loading, error, fetchProducts } = useProductFetch(storeId, isOnline, supabaseRef);
  const { createProduct, updateProduct, deleteProduct, getProductById } = useProductMutations(
    storeId, isOnline, supabaseRef, products, setProducts, fetchProducts
  );
  const { formatProduct } = useProductFormatter();
  const { userPermissions, loadUserPermissions } = useUserPermissions(storeId, isOnline);

    // Real-time subscription
  useEffect(() => {
    if (!storeId || !isOnline || !supabaseRef.current) return;

    // Capture the current ref value to use in cleanup
    const supabaseClient = supabaseRef.current;
    
    const subscription = supabaseClient
      .channel(`products-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dynamic_product',
          filter: `store_id=eq.${storeId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const formatted = formatProduct(payload.new);
            setProducts(prev => prev.some(p => p.id === formatted.id) ? prev : [formatted, ...prev]);
          }
          if (payload.eventType === 'UPDATE') {
            const formatted = formatProduct(payload.new);
            setProducts(prev => prev.map(p => p.id === formatted.id ? formatted : p));
          }
          if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup using the captured ref value
    return () => supabaseClient?.removeChannel(subscription);
  }, [storeId, isOnline, formatProduct, setProducts]);
  return {
    products,
    loading,
    error,
    isOnline,
    userPermissions,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    refreshProducts: fetchProducts,
    formatProduct,
    loadUserPermissions
  };
}

export default useOfflineProducts;
