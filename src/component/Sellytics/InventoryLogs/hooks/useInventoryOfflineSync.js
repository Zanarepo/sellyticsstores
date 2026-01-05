import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import inventoryCache from '../../db/inventoryCache';
import { getIdentity } from '../../services/identityService';

const SYNC_INTERVAL = 30000;

export function useInventoryOfflineSync() {
  const { currentStoreId } = getIdentity();

  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPaused, setSyncPaused] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const syncInProgress = useRef(false);

  // -------------------------
  // Network monitoring
  // -------------------------
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
    const count = await inventoryCache.getQueueCount(currentStoreId);
    setQueueCount(count);
  }, [currentStoreId]);

  useEffect(() => {
    updateQueueCount();
  }, [updateQueueCount]);

  // -------------------------
  // Sync single queue item
  // -------------------------
  const syncItem = useCallback(async (item) => {
    const { entity_type, operation,  queue_id } = item;

    try {
      if (entity_type === 'dynamic_inventory' && operation === 'adjust') {
        // For offline adjustments, you could call your server API here if online
        // For now, we just mark it as synced in the offline cache
        await inventoryCache.markQueueItemSynced(queue_id);
        return { success: true };
      }

      throw new Error(`Unsupported operation: ${entity_type}.${operation}`);
    } catch (error) {
      await inventoryCache.markQueueItemFailed(queue_id, error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // -------------------------
  // Sync all pending items
  // -------------------------
  const syncAll = useCallback(async () => {
    if (!isOnline || syncPaused || syncInProgress.current || !currentStoreId) return;

    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const items = await inventoryCache.getPendingQueueItems(currentStoreId);
      if (!items || !items.length) return { synced: 0, failed: 0 };

      let synced = 0;
      let failed = 0;

      for (let i = 0; i < items.length; i++) {
        const result = await syncItem(items[i]);
        if (result.success) synced++;
        else failed++;
      }

      await updateQueueCount();
      return { synced, failed };
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [isOnline, syncPaused, syncItem, currentStoreId, updateQueueCount]);

  // -------------------------
  // Pause / Resume / Clear
  // -------------------------
  const pauseSync = useCallback(() => setSyncPaused(true), []);
  const resumeSync = useCallback(() => setSyncPaused(false), []);
  const clearQueue = useCallback(async () => {
    if (!currentStoreId) return;
    await inventoryCache.clearSyncQueue(currentStoreId);
    await updateQueueCount();
  }, [currentStoreId, updateQueueCount]);

  // -------------------------
  // Auto & periodic sync
  // -------------------------
  useEffect(() => {
    if (isOnline && queueCount > 0 && !syncInProgress.current && !syncPaused) {
      const timer = setTimeout(syncAll, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queueCount, syncAll, syncPaused]);

  useEffect(() => {
    if (!isOnline || syncPaused) return;
    const interval = setInterval(() => {
      if (queueCount > 0 && !syncInProgress.current) syncAll();
    }, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [isOnline, queueCount, syncAll, syncPaused]);

  return {
    isOnline,
    isSyncing,
    syncPaused,
    queueCount,
    syncAll,
    pauseSync,
    resumeSync,
    clearQueue,
    updateQueueCount
  };
}
