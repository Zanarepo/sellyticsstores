import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import offlineCache from '../db/offlineCache';
import { getIdentity } from '../services/identityService';
import { useOfflineHandlers } from '../queues/useOfflineHandlers';

const SYNC_INTERVAL = 30000;

export default function useOfflineSync(onSyncComplete) {
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

  const handlers = useOfflineHandlers();

  const updateQueueCount = useCallback(async () => {
    if (!currentStoreId) return;
    const count = await offlineCache.getQueueCount(currentStoreId);
    setQueueCount(count);
  }, [currentStoreId]);

  useEffect(() => { updateQueueCount(); }, [updateQueueCount]);

  useEffect(() => {
    if (!currentStoreId) return;
    offlineCache.getPendingSalesGrouped(currentStoreId).then(setPendingSales);
  }, [currentStoreId]);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); toast.success('Connection restored', { icon: '🌐' }); };
    const handleOffline = () => { setIsOnline(false); toast.warn('Working offline', { icon: '📴' }); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncItem = useCallback(async (item) => {
    try {
      const { entity_type, operation } = item;
      const handler = handlers?.[entity_type]?.[operation];
      if (!handler) throw new Error(`Unsupported operation: ${entity_type}.${operation}`);
      return await handler(item);
    } catch (error) {
      await offlineCache.markQueueItemFailed(item.queue_id, error.message);
      return { success: false, error: error.message };
    }
  }, [handlers]);

  const syncAll = useCallback(async () => {
    if (!isOnline || syncInProgress.current || syncPaused || !currentStoreId) return { synced: 0, failed: 0 };
    syncInProgress.current = true;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const items = await offlineCache.getPendingQueueItems(currentStoreId);
      if (!items?.length) return { synced: 0, failed: 0 };

      setSyncProgress({ current: 0, total: items.length });
      let synced = 0, failed = 0;

      for (let i = 0; i < items.length; i++) {
        if (syncPaused) break;
        setSyncProgress({ current: i + 1, total: items.length });
        const result = await syncItem(items[i]);
        if (result.success || result.skipped) synced++; else failed++;
      }

      setLastSync(new Date());
      await updateQueueCount();
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
  }, [isOnline, syncPaused, currentStoreId, syncItem, updateQueueCount, onSyncComplete]);

  const pauseSync = () => { setSyncPaused(true); toast.info('Sync paused', { icon: '⏸️' }); };
  const resumeSync = () => { setSyncPaused(false); toast.info('Sync resumed', { icon: '▶️' }); };
  const clearQueue = async () => { await offlineCache.clearSyncQueue(currentStoreId); await updateQueueCount(); toast.success('Sync queue cleared'); };

  useEffect(() => { if (isOnline && queueCount > 0 && !syncPaused) { const timer = setTimeout(syncAll, 2000); return () => clearTimeout(timer); } }, [isOnline, queueCount, syncAll, syncPaused]);
  useEffect(() => { if (!isOnline || syncPaused) return; const interval = setInterval(() => { if (queueCount > 0) syncAll(); }, SYNC_INTERVAL); return () => clearInterval(interval); }, [isOnline, queueCount, syncAll, syncPaused]);

  return {
    isOnline,
    isSyncing,
    syncPaused,
    syncProgress,
    queueCount,
    syncError,
    lastSync,
    syncAll,
    pauseSync,
    resumeSync,
    clearQueue,
    updateQueueCount,
    pendingSales,
  };
}
