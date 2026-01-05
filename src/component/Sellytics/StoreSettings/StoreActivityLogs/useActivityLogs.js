// hooks/useActivityLogs.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

export function useActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canDelete, setCanDelete] = useState(false);

  const storeId = localStorage.getItem('store_id') ? parseInt(localStorage.getItem('store_id')) : null;
  const userEmail = localStorage.getItem('user_email');

  // Permission check
  const checkDeletePermission = useCallback(async () => {
    if (!storeId || !userEmail) return setCanDelete(false);
    try {
      const { data } = await supabase
        .from('stores')
        .select('email_address')
        .eq('id', storeId)
        .single();
      setCanDelete(data?.email_address?.toLowerCase() === userEmail.toLowerCase());
    } catch (err) {
      setCanDelete(false);
    }
  }, [storeId, userEmail]);

  // Load logs
  const loadLogs = useCallback(async () => {
    if (!storeId) {
      toast.error('Store not found');
      setError('Invalid store');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [salesRes, productRes] = await Promise.all([
        supabase.from('sales_log').select(`
          id, store_id, activity_type, details, created_at,
          dynamic_product_id,
          dynamic_product:dynamic_product!dynamic_product_id (id, name)
        `).eq('store_id', storeId),
        supabase.from('product_logs').select(`
          id, store_id, activity_type, details, created_at,
          dynamic_product_id,
          dynamic_product:dynamic_product!dynamic_product_id (id, name)
        `).eq('store_id', storeId)
      ]);

      if (salesRes.error) throw salesRes.error;
      if (productRes.error) throw productRes.error;

      const combined = [
        ...(salesRes.data || []).map(l => ({ ...l, source: 'sales' })),
        ...(productRes.data || []).map(l => ({ ...l, source: 'product' }))
      ];

      const sorted = combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setLogs(sorted);

      // Batch notifications
      if (sorted.length === 0) {
        toast('No activity logs found', { icon: 'ℹ️' });
      } else if (sorted.length > 50) {
        toast.success(`Loaded ${sorted.length} logs`);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const deleteLog = async (logId, source) => {
    if (!canDelete) return toast.error('No permission to delete');
    if (!window.confirm('Delete this log permanently?')) return;

    try {
      const table = source === 'sales' ? 'sales_log' : 'product_logs';
      const { error } = await supabase.from(table).delete().eq('id', logId);
      if (error) throw error;
      toast.success('Log deleted');
      await loadLogs();
    } catch (err) {
      toast.error('Delete failed');
    }
  };


  const clearAllLogs = async () => {
  if (!canDelete) {
    toast.error('You do not have permission to clear logs');
    return false;
  }

  if (!window.confirm(
    '⚠️ PERMANENT ACTION ⚠️\n\n' +
    'This will delete ALL activity logs for this store from both Sales and Product tables.\n\n' +
    'This action CANNOT be undone.\n\n' +
    'Are you absolutely sure?'
  )) {
    return false;
  }

  try {
    // Delete from both tables in parallel
    const [salesRes, productRes] = await Promise.all([
      supabase.from('sales_log').delete().eq('store_id', storeId),
      supabase.from('product_logs').delete().eq('store_id', storeId)
    ]);

    if (salesRes.error) throw salesRes.error;
    if (productRes.error) throw productRes.error;

    toast.success('All activity logs have been permanently cleared');
    await loadLogs(); // Refresh UI
    return true;
  } catch (err) {
    console.error('Clear all logs error:', err);
    toast.error('Failed to clear logs: ' + (err.message || 'Unknown error'));
    return false;
  }
};


  useEffect(() => {
    loadLogs();
    checkDeletePermission();
  }, [loadLogs, checkDeletePermission]);

  return {
    logs,
    loading,
    error,
    canDelete,
    deleteLog,
    clearAllLogs,
    reload: loadLogs
    ,
  };
}