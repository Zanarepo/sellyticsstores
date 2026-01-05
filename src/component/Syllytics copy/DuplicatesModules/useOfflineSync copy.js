/**
 * SwiftCheckout - Offline Sync Hook
 * Handles automatic syncing with Supabase
 * @version 2.1.0
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import offlineCache from '../db/offlineCache';
import { supabase } from '../../../supabaseClient';
import { getIdentity, getCreatorMetadata } from '../services/identityService';
import inventoryService from '../InventoryLogs/services/inventoryServices';



const SYNC_INTERVAL = 30000;

export default function useOfflineSync(onSyncComplete, userEmail) {
  const { currentStoreId } = getIdentity();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPaused, setSyncPaused] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [queueCount, setQueueCount] = useState(0);
  const [syncError, setSyncError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [pendingSales, setPendingSales] = useState([]);
  const syncInProgress = useRef(false);
  const saleGroupMapRef = useRef({});


  
  // -------------------------
  // Network monitoring
  // -------------------------


  useEffect(() => {
  if (!currentStoreId) return;

  const fetchPendingSales = async () => {
    const sales = await offlineCache.getPendingSalesGrouped(currentStoreId);
    setPendingSales(sales);
  };

  fetchPendingSales();
}, [currentStoreId]);



  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored', { icon: '🌐' });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('Working offline', { icon: '📴' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // -------------------------
  // Update queue count
  // -------------------------
  const updateQueueCount = useCallback(async () => {
    if (!currentStoreId) return;
    const count = await offlineCache.getQueueCount(currentStoreId);
    setQueueCount(count);
  }, [currentStoreId]);

  useEffect(() => {
    updateQueueCount();
  }, [updateQueueCount]);

  // -------------------------
  // Sync single queue item
  // -------------------------
 
 
  const syncItem = useCallback(
          async (item) => {
            const { entity_type, operation, data, queue_id, client_ref } = item;
            const metadata = getCreatorMetadata();

            try {
              // --- Prevent duplicates for dynamic_sales ---
              if (entity_type === 'dynamic_sales' && operation === 'create' && client_ref) {
                const { data: existing } = await supabase
                  .from('dynamic_sales')
                  .select('id')
                  .eq('device_id', data.device_id)
                  .eq('created_by_email', metadata.created_by_email)
                  .limit(1);

            if (existing?.length > 0) {
        await offlineCache.markQueueItemSynced(queue_id);
        await offlineCache.markSaleSynced(data._offline_id, existing[0].id);
        return { success: true, skipped: true };
      }
        }

      

        
        // --- Create sale group ---
        if (entity_type === 'sale_groups' && operation === 'create') {
          const { data: result, error } = await supabase
            .from('sale_groups')
            .insert({
              store_id: data.store_id,
              total_amount: data.total_amount,
              payment_method: data.payment_method,
              customer_id: data.customer_id,
              customer_name: data.customer_name,
              email_receipt: data.email_receipt,
              ...metadata
            })
            .select()
            .single();

          if (error) throw error;

          saleGroupMapRef.current[data._offline_id] = result.id;
          await offlineCache.markSaleGroupSynced(data._offline_id, result.id);
          await offlineCache.markQueueItemSynced(queue_id);
          return { success: true, result };
        }

        // --- Create dynamic sales line ---
        if (entity_type === 'dynamic_sales' && operation === 'create') {
          const onlineSaleGroupId = saleGroupMapRef.current[data.client_sale_group_ref];
          if (!onlineSaleGroupId) {
            throw new Error(`Sale group not synced yet for offline ref ${data.client_sale_group_ref}`);
          }

          const { data: result, error } = await supabase
            .from('dynamic_sales')
            .insert({
              store_id: data.store_id,
              sale_group_id: onlineSaleGroupId,
              dynamic_product_id: data.dynamic_product_id,
              quantity: data.quantity,
              unit_price: data.unit_price,
              amount: data.amount || data.quantity * data.unit_price,
              payment_method: data.payment_method,
              device_id: data.device_id,
              dynamic_product_imeis: data.dynamic_product_imeis || data.device_id,
              device_size: data.device_size,
              customer_id: data.customer_id,
              customer_name: data.customer_name,
              status: 'sold',
              ...metadata
            })
            .select()
            .single();

          if (error) throw error;

          // Update inventory
          if (data.dynamic_product_id) {
            const { data: inv } = await supabase
              .from('dynamic_inventory')
              .select('*')
              .eq('dynamic_product_id', data.dynamic_product_id)
              .eq('store_id', data.store_id)
              .single();

            if (inv) {
              await supabase
                .from('dynamic_inventory')
                .update({
                  available_qty: Math.max(0, inv.available_qty - data.quantity),
                  quantity_sold: (inv.quantity_sold || 0) + data.quantity,
                  updated_at: new Date().toISOString()
                })
                .eq('id', inv.id);
            }
          }

          await offlineCache.markSaleSynced(data._offline_id, result.id);
          await offlineCache.markQueueItemSynced(queue_id);
          return { success: true, result };
        }

    if (entity_type === 'dynamic_inventory' && operation === 'update') {
            await inventoryService.adjustStock(
              item.entity_id,
              data.difference || 0,
              data.reason || 'Offline sync',
              userEmail
            );

            await offlineCache.markQueueItemSynced(queue_id);
            return { success: true };
          }

          if (entity_type === 'dynamic_product' && operation === 'update') {
            await inventoryService.updateProduct(item.entity_id, data);

            await offlineCache.markQueueItemSynced(queue_id);
            return { success: true };
          }



if (entity_type === 'dynamic_sales' && operation === 'update') {
  // Clean local fields — Supabase doesn't have them
  const cleanData = { ...data };
  delete cleanData._offline_status;
  delete cleanData._synced;
  delete cleanData._offline_id;
  delete cleanData._client_ref;
  delete cleanData.client_sale_group_ref;
  // Add more deletes if you have other local fields starting with _

  // Always include updated_at
  cleanData.updated_at = new Date().toISOString();

  const { data: onlineData, error } = await supabase
    .from('dynamic_sales')
    .update(cleanData)
    .eq('id', item.entity_id)
    .select()
    .single();

  if (error) throw error;

  // Mark queue item as synced
  await offlineCache.markQueueItemSynced(queue_id);

  return { success: true, result: onlineData };
}

        
        // --- Update inventory ---
        if (entity_type === 'dynamic_inventory' && operation === 'update') {
          const { error } = await supabase
            .from('dynamic_inventory')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', item.entity_id);

          if (error) throw error;
          await offlineCache.markQueueItemSynced(queue_id);
          return { success: true };
        }

        throw new Error(`Unsupported operation: ${entity_type}.${operation}`);
      } catch (error) {
        await offlineCache.markQueueItemFailed(queue_id, error.message);
        await offlineCache.logSync(currentStoreId, entity_type, operation, 'error', { error: error.message });
        return { success: false, error: error.message };
      }
    },
    [currentStoreId, userEmail]
  );

  // -------------------------
  // Sync all pending items
  // -------------------------




  const syncAll = useCallback(async () => {
  if (!isOnline || syncInProgress.current || syncPaused || !currentStoreId) {
    return { synced: 0, failed: 0 };
  }

  syncInProgress.current = true;
  setIsSyncing(true);
  setSyncError(null);

  try {
    const items = await offlineCache.getPendingQueueItems(currentStoreId);

    if (!items?.length) {
      return { synced: 0, failed: 0 };
    }

    setSyncProgress({ current: 0, total: items.length });

    let synced = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i++) {
      if (syncPaused) break;
      setSyncProgress({ current: i + 1, total: items.length });

      const result = await syncItem(items[i]);

      // Treat success or skipped (e.g. duplicate prevention) as synced
      if (result.success || result.skipped) {
        synced++;
      } else {
        failed++;
      }
    }




       setLastSync(new Date());
    await updateQueueCount();

    if (synced > 0) {
      toast.success(`Synced successfully`, { icon: '✅' });
    }

    if (failed > 0) {
      console.warn(`Sync completed with ${failed} minor issue(s) — sale data is still safe`);
    }

    // ALWAYS refresh UI after sync attempt — ensures list is current
    onSyncComplete?.({ synced, failed });

    return { synced, failed };


  } catch (error) {
    console.error('Sync error:', error);
    setSyncError(error.message);
    toast.error('Sync failed — will retry later');
    return { synced: 0, failed: 0 };
  } finally {
    setIsSyncing(false);
    syncInProgress.current = false;
    setSyncProgress({ current: 0, total: 0 });
  }
}, [isOnline, syncPaused, currentStoreId, syncItem, onSyncComplete, updateQueueCount]);




  // -------------------------
  // Pause / Resume / Clear
  // -------------------------
  const pauseSync = useCallback(() => {
    setSyncPaused(true);
    toast.info('Sync paused', { icon: '⏸️' });
  }, []);

  const resumeSync = useCallback(() => {
    setSyncPaused(false);
    toast.info('Sync resumed', { icon: '▶️' });
  }, []);

  const clearQueue = useCallback(async () => {
    await offlineCache.clearSyncQueue(currentStoreId);
    await updateQueueCount();
    toast.success('Sync queue cleared');
  }, [currentStoreId, updateQueueCount]);

  // -------------------------
  // Auto-sync when online
  // -------------------------
  useEffect(() => {
    if (isOnline && queueCount > 0 && !syncInProgress.current && !syncPaused) {
      const timer = setTimeout(syncAll, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queueCount, syncAll, syncPaused]);

  // -------------------------
  // Periodic sync
  // -------------------------
  useEffect(() => {
    if (!isOnline || syncPaused) return;

    const interval = setInterval(() => {
      if (queueCount > 0 && !syncInProgress.current) {
        syncAll();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline, queueCount, syncAll, syncPaused]);

  return {
    isOnline,
    isSyncing,
    syncPaused,
    syncProgress,
    queueCount,
    syncError,
    lastSync,
    syncAll,
    //syncItem,
    pauseSync,
    resumeSync,
    clearQueue,
    updateQueueCount,
    pendingSales
  };
}

