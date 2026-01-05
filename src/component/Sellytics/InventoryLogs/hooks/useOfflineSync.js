/**
 * SwiftInventory - useOfflineSync Hook
 * Manages offline data syncing
 */
import { useState, useEffect, useCallback } from 'react';
import syncService from '../services/syncService';
import offlineCache from '../../db/offlineCache';
import toast from 'react-hot-toast';

export default function useOfflineSync(storeId, userEmail, onSyncComplete) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ------------------- SYNC ALL -------------------
  const syncAll = useCallback(async () => {
    if (!storeId || !userEmail || !isOnline) {
      toast.error('Cannot sync: offline or missing credentials');
      return;
    }

    const result = await syncService.syncAll(storeId, userEmail);
    return result;
  }, [storeId, userEmail, isOnline]);

  // ------------------- ONLINE/OFFLINE -------------------
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online!');
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

  // ------------------- PENDING COUNT -------------------
  const updatePendingCount = useCallback(async () => {
    if (!storeId) return;
    const count = await syncService.getPendingCount(storeId);
    setPendingCount(count);
  }, [storeId]);

  useEffect(() => {
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  // ------------------- SUBSCRIBE TO SYNC EVENTS -------------------
  useEffect(() => {
    const unsubscribe = syncService.subscribe((event) => {
      switch (event.type) {
        case 'sync_start':
          setIsSyncing(true);
          break;
        case 'progress':
          setProgress(event.progress);
          break;
        case 'sync_complete':
          setIsSyncing(false);
          updatePendingCount();
          toast.success('Sync complete!');
          onSyncComplete?.();
          break;
        case 'sync_error':
          setIsSyncing(false);
          toast.error(`Sync failed: ${event.error}`);
          break;
        case 'sync_paused':
          setIsPaused(true);
          break;
        case 'sync_resumed':
          setIsPaused(false);
          break;
        default:
          // Do nothing for unknown events
          break;
      }
    });

    return unsubscribe;
  }, [updatePendingCount, onSyncComplete]);

  // ------------------- AUTO SYNC -------------------
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing && storeId && userEmail) {
      const timeout = setTimeout(() => {
        syncAll();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, pendingCount, syncAll, isSyncing, storeId, userEmail]);

  // ------------------- QUEUE OPERATIONS -------------------
  const queueInventoryUpdate = useCallback(
    async (productId, operation, data) => {
      await offlineCache.queueInventoryUpdate(storeId, productId, operation, data);
      await updatePendingCount();
      await offlineCache.addNotification(storeId, 'queue', `Queued ${operation} for product`);
    },
    [storeId, updatePendingCount]
  );

  const queueImeiUpdate = useCallback(
    async (productId, operation, imei) => {
      await offlineCache.queueImeiUpdate(storeId, productId, operation, imei);
      await updatePendingCount();
    },
    [storeId, updatePendingCount]
  );

  const queueAdjustment = useCallback(
    async (inventoryId, difference, reason) => {
      await offlineCache.queueAdjustment(storeId, inventoryId, difference, reason);
      await updatePendingCount();
    },
    [storeId, updatePendingCount]
  );

  // ------------------- CONTROLS -------------------
  const pauseSync = useCallback(() => syncService.pause(), []);
  const resumeSync = useCallback(() => syncService.resume(), []);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    isPaused,
    progress,
    syncAll,
    pauseSync,
    resumeSync,
    queueInventoryUpdate,
    queueImeiUpdate,
    queueAdjustment,
    updatePendingCount,
  };
}
