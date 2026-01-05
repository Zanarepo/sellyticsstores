import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import salesDb from '../db/salesDb';
import SalesService from '../services/SalesService';
import { v4 as uuidv4 } from 'uuid';

const OFFLINE_SALES_KEY = 'offline_sales_queue';

export default function useOfflineSync(storeId, onSyncComplete) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSales, setPendingSales] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Load pending sales from IndexedDB
  useEffect(() => {
    loadPendingSales();
  }, [storeId]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('You are offline. Sales will be saved locally.');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const loadPendingSales = async () => {
    try {
      const pending = await salesDb.offline_sales_queue
        .where({ store_id: Number(storeId), synced: 0 })
        .toArray();
      setPendingSales(pending);
    } catch (error) {
      console.error('Error loading pending sales:', error);
    }
  };

  const addOfflineSale = useCallback((saleData) => {
    const identity = SalesService.getIdentity();
    const offlineSale = {
      ...saleData,
      client_ref: uuidv4(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
      createdAt: new Date().toISOString(),
      store_id: Number(storeId),
      created_by_user_id: identity.currentUserId,
      created_by_stores: identity.currentStoreId,
      created_by_email: identity.currentUserEmail,
    };

    try {
      salesDb.offline_sales_queue.add({
        client_ref: offlineSale.client_ref,
        store_id: Number(storeId),
        payload: offlineSale,
        created_at: offlineSale.createdAt,
        synced: 0,
        sync_attempts: 0,
      });

      setPendingSales(prev => [...prev, offlineSale]);
      toast.info('Sale saved offline. Will sync when online.');
      return offlineSale;
    } catch (error) {
      console.error('Error adding offline sale:', error);
      toast.error('Failed to save sale offline');
      return null;
    }
  }, [storeId]);

  const syncSingle = async (offlineSale) => {
    const { payload, client_ref } = offlineSale;
    
    try {
      // Create sale group
      const { data: saleGroup, error: groupError } = await SalesService.createSaleGroup({
        total_amount: payload.total_amount || payload.amount,
        payment_method: payload.payment_method,
        customer_id: payload.customer_id,
        email_receipt: payload.email_receipt || false,
      });

      if (groupError) throw new Error(groupError);

      // Create sale line
      const lineData = {
        dynamic_product_id: payload.dynamic_product_id,
        quantity: payload.quantity,
        unit_price: payload.unit_price,
        device_ids: payload.deviceIds || [],
        device_sizes: payload.deviceSizes || [],
        payment_method: payload.payment_method,
        customer_id: payload.customer_id,
      };

      const { error: lineError } = await SalesService.createSaleLine(lineData, saleGroup.id);
      if (lineError) throw new Error(lineError);

      // Update inventory
      await SalesService.updateInventoryAfterSale(
        payload.dynamic_product_id,
        payload.quantity,
        Number(storeId)
      );

      // Mark as synced
      await salesDb.offline_sales_queue
        .where({ client_ref })
        .modify({ synced: 1, synced_at: new Date().toISOString() });

      return { success: true };
    } catch (error) {
      await salesDb.offline_sales_queue
        .where({ client_ref })
        .modify({ 
          sync_attempts: (offlineSale.sync_attempts || 0) + 1,
          last_error: error.message 
        });
      return { success: false, error: error.message };
    }
  };

  const syncAllPending = useCallback(async () => {
    if (!isOnline || pendingSales.length === 0 || isSyncing) {
      if (!isOnline) toast.warn('Cannot sync while offline');
      return { synced: 0, failed: 0 };
    }

    setIsSyncing(true);
    setSyncError(null);

    let synced = 0;
    let failed = 0;

    for (const sale of pendingSales) {
      const result = await syncSingle(sale);
      if (result.success) {
        synced++;
        toast.success(`Synced sale ${synced}/${pendingSales.length}`);
      } else {
        failed++;
        toast.error(`Failed: ${result.error}`);
      }
    }

    setIsSyncing(false);
    await loadPendingSales();

    if (synced > 0 && failed === 0) {
      toast.success(`All ${synced} sales synced successfully!`);
    } else if (synced > 0) {
      toast.warn(`Synced ${synced} sales, ${failed} failed`);
    }

    if (onSyncComplete) onSyncComplete();

    return { synced, failed };
  }, [isOnline, pendingSales, isSyncing, storeId, onSyncComplete]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingSales.length > 0 && !isSyncing) {
      syncAllPending();
    }
  }, [isOnline]);

  const removeOfflineSale = useCallback(async (saleId) => {
    try {
      await salesDb.offline_sales_queue.where({ client_ref: saleId }).delete();
      setPendingSales(prev => prev.filter(s => s.client_ref !== saleId));
    } catch (error) {
      console.error('Error removing offline sale:', error);
    }
  }, []);

  const clearPendingSales = useCallback(async () => {
    try {
      await salesDb.offline_sales_queue.where({ store_id: Number(storeId) }).delete();
      setPendingSales([]);
      toast.success('Sync queue cleared');
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast.error('Failed to clear sync queue');
    }
  }, [storeId]);

  return {
    isOnline,
    pendingSales,
    pendingCount: pendingSales.length,
    isSyncing,
    syncError,
    addOfflineSale,
    removeOfflineSale,
    syncAllPending,
    clearPendingSales,
  };
}