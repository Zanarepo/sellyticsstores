import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const useScanItems = (sessionId) => {
  return useQuery({
    queryKey: ['scan-items', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_scan_items')
        .select('*')
        .eq('session_id', sessionId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sessionId
  });
};

export const useCreateScanItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_scan_items')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['scan-items', variables.session_id]);
    }
  });
};

export const useBulkCreateScanItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, items }) => {
      const { error } = await supabase
        .from('warehouse_scan_items')
        .insert(items);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['scan-items', variables.sessionId]);
    }
  });
};

export const useDeleteScanItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, sessionId }) => {
      const { error } = await supabase
        .from('warehouse_scan_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['scan-items', variables.sessionId]);
    }
  });
};