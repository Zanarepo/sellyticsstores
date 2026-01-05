/**
 * SwiftCheckout - Sync Service (FINAL FIXED VERSION)
 * Works offline + online + first load + React StrictMode
 */
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  offlineSalesQueue, 
  syncStatusManager, 
  productCache, 
  inventoryCache 
} from '../db/offlineDb';
import { 
  createSaleGroup, 
  createSaleLine, 
  fetchProducts, 
  fetchInventory 
} from '../services/salesServices';

// Check online status
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// ─────────────────────── SYNC SINGLE SALE ───────────────────────

async function syncSingleSale(offlineSale) {
  const client_ref = offlineSale.client_ref;
  const storeId = Number(offlineSale.store_id);

  // SAFETY
  if (!storeId || isNaN(storeId)) {
    console.warn("Skipping offline sale: invalid store_id", offlineSale);
    return { success: false, error: "Invalid store_id" };
  }

  // BUILD LINES ARRAY — THIS IS THE KEY FIX
  let lines = [];
  if (Array.isArray(offlineSale.lines) && offlineSale.lines.length > 0) {
    lines = offlineSale.lines;
  } 
  // OLD FLAT FORMAT → convert to lines array
  else if (offlineSale.dynamic_product_id != null) {
    lines = [{
      dynamic_product_id: Number(offlineSale.dynamic_product_id),
      quantity: Number(offlineSale.quantity) || 1,
      unit_price: Number(offlineSale.unit_price || offlineSale.amount || 0),
    }];
  } 
  else {
    console.warn("Skipping offline sale: no items", offlineSale);
    return { success: false, error: "No items in sale" };
  }

  const totalAmount = Number(offlineSale.totalAmount || offlineSale.amount || 0);
  if (totalAmount <= 0) {
    console.warn("Skipping offline sale: invalid amount", offlineSale);
    return { success: false, error: "Invalid amount" };
  }

  const paymentMethod = offlineSale.paymentMethod || offlineSale.payment_method || "Cash";
  const customerId = offlineSale.customerId || offlineSale.customer_id || null;

  try {
    const groupResult = await createSaleGroup({
      store_id: storeId,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      customer_id: customerId,
      client_ref: client_ref
    });

    if (!groupResult.success) {
      return { success: false, error: groupResult.error || 'Failed to create sale group' };
    }

    const saleGroupId = groupResult.saleGroup.id;

    // Sync all lines
    for (const line of lines) {
      await createSaleLine({
        store_id: storeId,
        sale_group_id: saleGroupId,
        dynamic_product_id: line.dynamic_product_id || line.productId,
        quantity: line.quantity || 1,
        unit_price: line.unit_price || line.unitPrice || 0,
        deviceIds: line.deviceIds || [],
        deviceSizes: line.deviceSizes || [],
        payment_method: paymentMethod,
        customer_id: customerId
      });
    }

    return { success: true, saleGroupId };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}
// ─────────────────────── SYNC ALL PENDING SALES (NOW SAFE) ───────────────────────

export async function syncAllPendingSales(storeId, onProgress = null) {
  if (!isOnline()) {
    toast.warn('Cannot sync while offline');
    return { synced: 0, failed: 0 };
  }

  // ←←← THIS IS THE ONLY NEW LINE (fixes the crash)
  const progressCallback = typeof onProgress === 'function' ? onProgress : () => {};

  let status;
  try {
    status = await syncStatusManager.getStatus();
  } catch (err) {
    console.warn("First time sync — creating status record");
    status = { isPaused: false };
  }

  if (status?.isPaused) {
    toast.info('Sync is paused');
    return { synced: 0, failed: 0 };
  }

  const pendingSales = await offlineSalesQueue.getPendingSales(storeId);

  if (pendingSales.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (let i = 0; i < pendingSales.length; i++) {
    const sale = pendingSales[i];

    try {
      const currentStatus = await syncStatusManager.getStatus();
      if (currentStatus?.isPaused) {
        toast.info('Sync paused');
        break;
      }
    } catch (_) {}

    const result = await syncSingleSale(sale);

    if (result.success) {
      await offlineSalesQueue.markSynced(sale.client_ref, result.saleGroupId);
      synced++;
    } else {
      await offlineSalesQueue.updateSale(sale.client_ref, {
        syncError: result.error,
        lastSyncAttempt: new Date().toISOString()
      });
      failed++;
    }




    
    // ←←← THIS LINE CHANGED (was: if (onProgress) …)
    progressCallback({ current: i + 1, total: pendingSales.length, synced, failed });
  }

  try {
    await syncStatusManager.setLastSync();
  } catch (err) {
    console.warn("Could not update lastSyncAt", err);
  }

  if (synced > 0) toast.success(`Synced ${synced} sale${synced > 1 ? 's' : ''}`);
  if (failed > 0) toast.error(`${failed} sale${failed > 1 ? 's' : ''} failed to sync`);

  return { synced, failed };
}


// ─────────────────────── OTHER FUNCTIONS (SAFE) ───────────────────────
export async function pauseSync() {
  await syncStatusManager.setPaused(true);
  toast.info('Sync paused');
}

export async function resumeSync() {
  await syncStatusManager.setPaused(false);
  toast.info('Sync resumed');
}

export async function clearSyncQueue(storeId) {
  await offlineSalesQueue.clearQueue(storeId);
  toast.info('Sync queue cleared');
}

export async function getSyncStatus(storeId) {
  let pendingCount = 0;
  try {
    pendingCount = await offlineSalesQueue.getPendingCount(storeId);
  } catch (err) {
    pendingCount = 0;
  }

  let status;
  try {
    status = await syncStatusManager.getStatus();
  } catch (err) {
    status = { isPaused: false, lastSyncAt: null };
  }

  return {
    pendingCount,
    isPaused: !!status.isPaused,
    lastSyncAt: status.lastSyncAt,
    isOnline: isOnline()
  };
}

export async function refreshCache(storeId) {
  if (!isOnline()) {
    toast.warn('Cannot refresh while offline');
    return { success: false };
  }

  try {
    const [prodRes, invRes] = await Promise.all([
      fetchProducts(storeId),
      fetchInventory(storeId)
    ]);

    if (prodRes.success) await productCache.cacheProducts(prodRes.products);
    if (invRes.success) await inventoryCache.cacheInventories(invRes.inventories);

    toast.success('Cache refreshed');
    return { success: true };
  } catch (error) {
    toast.error('Failed to refresh cache');
    return { success: false };
  }
}




// Auto-sync when coming online – NOW 100% SAFE + NO DUPLICATES
export function setupAutoSync(storeId, onSyncComplete = null) {
  // Guard: if storeId is missing (user not logged in), do nothing
  if (!storeId) {
    console.warn("setupAutoSync called without storeId – skipping");
    return () => {};
  }

  let isSyncing = false; // ← NEW: Prevent multiple syncs at once

  const handleOnline = async () => {
    if (isSyncing) {
      console.log("Sync already in progress — skipping duplicate");
      return; // ← NEW: Skip if already syncing
    }
    isSyncing = true; // ← NEW: Lock during sync

    toast.info('Back online – syncing pending sales...');
    try {
      const result = await syncAllPendingSales(storeId); // ← now always has valid storeId
      if (onSyncComplete) onSyncComplete(result);
    } catch (err) {
      console.error("Auto-sync failed:", err);
      toast.error("Auto-sync failed");
    } finally {
      isSyncing = false; // ← NEW: Unlock after done
    }
  };

  window.addEventListener('online', handleOnline);

  // Also run once immediately if already online (no timeout to avoid races)
  if (isOnline()) {
    handleOnline(); // ← CHANGED: No setTimeout
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}