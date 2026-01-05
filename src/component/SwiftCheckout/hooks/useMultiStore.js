/**
 * SwiftCheckout - Multi-Store Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../supabaseClient';

export default function useMultiStore(userEmail, storeId) {
  const [isMultiStoreOwner, setIsMultiStoreOwner] = useState(false);
  const [ownedStores, setOwnedStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('all');

  useEffect(() => {
    const fetchOwnedStores = async () => {
      if (!userEmail) return;

      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('email_address', userEmail.trim().toLowerCase());

        if (error) throw error;

        if (data && data.length > 1) {
          setIsMultiStoreOwner(true);
          setOwnedStores(data);
        } else if (data && data.length === 1) {
          setIsMultiStoreOwner(false);
          setOwnedStores(data);
          setSelectedStoreId(String(data[0].id));
        }
      } catch (error) {
        console.error('Error fetching owned stores:', error);
      }
    };

    fetchOwnedStores();
  }, [userEmail]);

  const canEdit = useCallback((sale) => {
    if (!sale) return false;
    const saleStoreId = sale.store_id || sale.created_by_stores;
    return Number(saleStoreId) === Number(storeId);
  }, [storeId]);

  const canDelete = useCallback((sale) => {
    if (!sale) return false;
    const saleStoreId = sale.store_id || sale.created_by_stores;
    return Number(saleStoreId) === Number(storeId);
  }, [storeId]);

  return {
    isMultiStoreOwner,
    ownedStores,
    selectedStoreId,
    setSelectedStoreId,
    canEdit,
    canDelete,
  };
}