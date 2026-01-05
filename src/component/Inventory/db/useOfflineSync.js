/**
 * useOfflineSync Hook
 * Handles background sync of offline changes with server
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import offlineDB from '../../db/offlineDB';

import { supabase } from '../../../supabaseClient';

const getSupabase = () => {
  // Dynamic import to handle SSR
  if (typeof window === 'undefined') return null;
  
  return supabase;
}


export function useOfflineSync(storeId, onSyncComplete) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  const syncInProgress = useRef(false);
  const supabase = useRef(getSupabase());

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending count and notifications
  const loadSyncStatus = useCallback(async () => {
    try {
      const count = await offlineDB.getPendingCount();
      setPendingCount(count);
      
      const notifs = await offlineDB.getNotifications();
      setNotifications(notifs);
      
      const lastSync = await offlineDB.getSetting('last_sync_time');
      setLastSyncTime(lastSync);
    } catch (err) {
      console.error('Failed to load sync status:', err);
    }
  }, []);

  // Sync a single queue item
  const syncQueueItem = useCallback(async (item) => {
    if (!supabase.current) throw new Error('Supabase not available');

    const { entity_type, action, data } = item;

    if (entity_type === 'product') {
      switch (action) {
        case 'create': {
          const { id: tempId, sync_status, cached_at, ...cleanData } = data;
          
          const { data: created, error } = await supabase.current
            .from('dynamic_product')
            .insert(cleanData)
            .select()
            .single();

          if (error) throw error;

          // Create inventory
          await supabase.current
            .from('dynamic_inventory')
            .upsert({
              dynamic_product_id: created.id,
              store_id: Number(storeId),
              available_qty: created.purchase_qty || 0,
              quantity_sold: 0,
              last_updated: new Date().toISOString()
            }, { onConflict: ['dynamic_product_id', 'store_id'] });

          // Update local cache with real ID
          await offlineDB.markProductSynced(tempId, created.id, created);
          
          return { success: true, data: created };
        }

        case 'update': {
          const { id, updates } = data;
          
          const { data: updated, error } = await supabase.current
            .from('dynamic_product')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          await offlineDB.cacheProducts([updated], storeId);
          return { success: true, data: updated };
        }

        case 'delete': {
          const { id } = data;
          
          await supabase.current
            .from('dynamic_product')
            .delete()
            .eq('id', id);

          await supabase.current
            .from('dynamic_inventory')
            .delete()
            .eq('dynamic_product_id', id)
            .eq('store_id', storeId);

          await offlineDB.permanentlyDeleteProduct(id);
          return { success: true };
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }

    throw new Error(`Unknown entity type: ${entity_type}`);
  }, [storeId]);

  // Sync all pending items
  const syncNow = useCallback(async () => {
    if (!isOnline || syncInProgress.current || !supabase.current) {
      if (!isOnline) toast.error('Cannot sync while offline');
      return { synced: 0, failed: 0 };
    }

    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const queue = await offlineDB.getSyncQueue();
      
      if (queue.length === 0) {
        toast.success('Everything is up to date!');
        return { synced: 0, failed: 0 };
      }

      setSyncProgress({ current: 0, total: queue.length });
      
      let synced = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        setSyncProgress({ current: i + 1, total: queue.length });

        try {
          await syncQueueItem(item);
          await offlineDB.markQueueItemSynced(item.id);
          synced++;
        } catch (err) {
          console.error('Sync item failed:', err);
          await offlineDB.markQueueItemFailed(item.id, err.message);
          failed++;
          errors.push({ item, error: err.message });
        }

        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update sync time
      const now = new Date().toISOString();
      await offlineDB.setSetting('last_sync_time', now);
      setLastSyncTime(now);

      // Log sync
      await offlineDB.logSync(
        'bulk_sync',
        failed === 0 ? 'success' : 'partial',
        `Synced: ${synced}, Failed: ${failed}`
      );

      // Add notification
      if (synced > 0) {
        await offlineDB.addNotification(
          'sync_complete',
          `Successfully synced ${synced} item${synced > 1 ? 's' : ''}`
        );
      }

      // Show toast
      if (synced > 0 && failed === 0) {
        toast.success(`Synced ${synced} item${synced > 1 ? 's' : ''}`);
      } else if (synced > 0 && failed > 0) {
        toast.error(`Synced ${synced}, failed ${failed}`);
      } else if (failed > 0) {
        toast.error(`Failed to sync ${failed} item${failed > 1 ? 's' : ''}`);
      }

      // Reload pending count and notifications
      await loadSyncStatus();

      // Callback
      if (onSyncComplete) {
        onSyncComplete({ synced, failed, errors });
      }

      return { synced, failed, errors };
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error('Sync failed');
      return { synced: 0, failed: 0 };
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0 });
    }
  }, [isOnline, syncQueueItem, loadSyncStatus, onSyncComplete]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !syncInProgress.current) {
      const timer = setTimeout(() => {
        if (isOnline && pendingCount > 0) {
          syncNow();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount, syncNow]);

  // Clear a notification
  const clearNotification = useCallback(async (id) => {
    await offlineDB.markNotificationRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    await offlineDB.clearNotifications();
    setNotifications([]);
  }, []);

  // Load initial status
  useEffect(() => {
    loadSyncStatus();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadSyncStatus, 10000);
    return () => clearInterval(interval);
  }, [loadSyncStatus]);

  return {
    isOnline,
    isSyncing,
    syncProgress,
    pendingCount,
    lastSyncTime,
    notifications,
    syncNow,
    clearNotification,
    clearAllNotifications,
    loadSyncStatus
  };
}

export default useOfflineSync;