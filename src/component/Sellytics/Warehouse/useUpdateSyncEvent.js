import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const useInventorySyncEvents = (warehouseId) => {
  return useQuery({
    queryKey: ['inventory-sync-events', warehouseId],
    queryFn: async () => {
      // Get ledger entries for this warehouse first
      const { data: ledgerEntries, error: ledgerError } = await supabase
        .from('warehouse_ledger')
        .select('id')
        .eq('warehouse_id', warehouseId);
      
      if (ledgerError) throw ledgerError;
      
      const ledgerIds = ledgerEntries.map(l => l.id);
      if (ledgerIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('inventory_sync_events')
        .select('*')
        .in('warehouse_ledger_id', ledgerIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!warehouseId
  });
};

export const usePendingSyncEvents = () => {
  return useQuery({
    queryKey: ['pending-sync-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_sync_events')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useCreateSyncEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('inventory_sync_events')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory-sync-events']);
      queryClient.invalidateQueries(['pending-sync-events']);
    }
  });
};

export const useUpdateSyncEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('inventory_sync_events')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory-sync-events']);
      queryClient.invalidateQueries(['pending-sync-events']);
    }
  });
};

export const useMarkSyncSuccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('inventory_sync_events')
        .update({ status: 'SUCCESS', processed_at: new Date() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory-sync-events']);
      queryClient.invalidateQueries(['pending-sync-events']);
    }
  });
};

export const useMarkSyncFailed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data: event } = await supabase
        .from('inventory_sync_events')
        .select('retry_count')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('inventory_sync_events')
        .update({
          status: 'FAILED',
          failure_reason: reason,
          retry_count: (event?.retry_count || 0) + 1,
          last_retry_at: new Date()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory-sync-events']);
      queryClient.invalidateQueries(['pending-sync-events']);
    }
  });
};