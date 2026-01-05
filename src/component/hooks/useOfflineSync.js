/**
 * Offline Sync Hook
 * Handles automatic syncing with Supabase
 * @version 2.0.0
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import offlineCache from '../db/offlineCache';
import { supabase } from '../../supabaseClient';

const MAX_ATTEMPTS = 5;
const SYNC_INTERVAL = 30000;

export default function useOfflineSync(storeId, onSyncComplete) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [queueCount, setQueueCount] = useState(0);
  const [syncError, setSyncError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  
  const syncInProgress = useRef(false);

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
      offlineCache.addNotification(storeId, 'network_online', {
        title: 'Back Online',
        message: 'Syncing pending changes...'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('Working offline');
      offlineCache.addNotification(storeId, 'network_offline', {
        title: 'Offline Mode',
        message: 'Changes will sync when online'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [storeId]);

  // Update queue count
  const updateQueueCount = useCallback(async () => {
    const count = await offlineCache.getQueueCount(storeId);
    setQueueCount(count);
  }, [storeId]);

  useEffect(() => {
    updateQueueCount();
  }, [updateQueueCount]);

  // Sync single item
  const syncItem = useCallback(async (item) => {
    const { entity_type, operation, data, queue_id } = item;

    try {
      if (entity_type === 'sale_groups' && operation === 'create') {
        const { data: result, error } = await supabase
          .from('sale_groups')
          .insert({
            store_id: data.store_id,
            total_amount: data.total_amount,
            payment_method: data.payment_method,
            customer_id: data.customer_id,
            customer_name: data.customer_name,
            email_receipt: data.email_receipt
          })
          .select()
          .single();

        if (error) throw error;
        await offlineCache.markQueueItemSynced(queue_id);
        return { success: true, result };
      }

      if (entity_type === 'dynamic_sales' && operation === 'create') {
        const { data: result, error } = await supabase
          .from('dynamic_sales')
          .insert({
            store_id: data.store_id,
            sale_group_id: data.sale_group_id,
            dynamic_product_id: data.dynamic_product_id,
            quantity: data.quantity,
            unit_price: data.unit_price,
            amount: data.amount,
            payment_method: data.payment_method,
            device_id: data.device_id,
            dynamic_product_imeis: data.dynamic_product_imeis,
            device_size: data.device_size,
            customer_id: data.customer_id,
            customer_name: data.customer_name,
            created_by_user_id: data.created_by_user_id,
            status: 'sold'
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
                quantity_sold: (inv.quantity_sold || 0) + data.quantity
              })
              .eq('id', inv.id);
          }
        }

        await offlineCache.markSaleSynced(data._offline_id, result.id);
        await offlineCache.markQueueItemSynced(queue_id);
        return { success: true, result };
      }

      if (entity_type === 'dynamic_inventory' && operation === 'update') {
        const { error } = await supabase
          .from('dynamic_inventory')
          .update(data)
          .eq('id', item.entity_id);

        if (error) throw error;
        await offlineCache.markQueueItemSynced(queue_id);
        return { success: true };
      }

      throw new Error(`Unsupported: ${entity_type}.${operation}`);
    } catch (error) {
      await offlineCache.markQueueItemFailed(queue_id, error.message);
      await offlineCache.logSync(storeId, entity_type, operation, 'error', { error: error.message });
      return { success: false, error: error.message };
    }
  }, [storeId]);

  // Main sync
  const syncAll = useCallback(async () => {
    if (!isOnline || syncInProgress.current) return { synced: 0, failed: 0 };

    syncInProgress.current = true;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const items = await offlineCache.getPendingQueueItems(storeId, MAX_ATTEMPTS);
      
      if (!items.length) {
        return { synced: 0, failed: 0 };
      }

      setSyncProgress({ current: 0, total: items.length });

      // Sort by priority (sale_groups first, then sales)
      const sorted = items.sort((a, b) => a.priority - b.priority);

      let synced = 0, failed = 0;

      for (let i = 0; i < sorted.length; i++) {
        setSyncProgress({ current: i + 1, total: sorted.length });
        const result = await syncItem(sorted[i]);
        result.success ? synced++ : failed++;
      }

      setLastSync(new Date());
      await updateQueueCount();

      if (synced > 0) {
        toast.success(`Synced ${synced} item${synced > 1 ? 's' : ''}`);
        await offlineCache.addNotification(storeId, 'sync_complete', {
          title: 'Sync Complete',
          message: `${synced} synced${failed > 0 ? `, ${failed} failed` : ''}`
        });
      }

      if (failed > 0) {
        setSyncError(`${failed} item${failed > 1 ? 's' : ''} failed`);
      }

      onSyncComplete?.({ synced, failed });
      return { synced, failed };

    } catch (error) {
      setSyncError(error.message);
      return { synced: 0, failed: 0 };
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
      setSyncProgress({ current: 0, total: 0 });
    }
  }, [isOnline, storeId, syncItem, onSyncComplete, updateQueueCount]);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && queueCount > 0 && !syncInProgress.current) {
      const timer = setTimeout(syncAll, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queueCount, syncAll]);

  // Periodic sync
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(() => {
      if (queueCount > 0 && !syncInProgress.current) {
        syncAll();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline, queueCount, syncAll]);

  return {
    isOnline,
    isSyncing,
    syncProgress,
    queueCount,
    syncError,
    lastSync,
    syncAll,
    updateQueueCount
  };
}