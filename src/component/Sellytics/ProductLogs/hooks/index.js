import { useState } from 'react';
import offlineDB from '../db/offlin';

import { getSupabase } from './supabaseClient';
import { useOnlineStatus } from './useOnlineStatus';
import { usePermissions } from './usePermissions';
import { useProductFormatter } from './useProductFormatter';
import { useProductFetch } from './useProductFetch';
import { useProductMutations } from './useProductMutations';

export function useOfflineProducts(storeId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOnline = useOnlineStatus();
  const permissions = usePermissions(storeId, isOnline);
  const formatProduct = useProductFormatter();
  const supabase = getSupabase();

  const { refreshProducts } = useProductFetch({
    storeId,
    isOnline,
    supabase,
    offlineDB,
    formatProduct,
    setProducts,
    setLoading,
    setError
  });

  const mutations = useProductMutations({
    storeId,
    isOnline,
    permissions,
    formatProduct,
    supabase,
    offlineDB
  });

  return {
    products,
    loading,
    error,
    isOnline,
    userPermissions: permissions,
    ...mutations,
    refreshProducts
  };
}

export default useOfflineProducts;
