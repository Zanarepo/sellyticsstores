import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const useWarehouseScanSessions = (warehouseId) => {
  return useQuery({
    queryKey: ['warehouse-scan-sessions', warehouseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_scan_sessions')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!warehouseId
  });
};

export const useScanSession = (id) => {
  return useQuery({
    queryKey: ['scan-session', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_scan_sessions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

export const useCreateScanSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { data: session, error } = await supabase
        .from('warehouse_scan_sessions')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-scan-sessions']);
    }
  });
};

export const useUpdateScanSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('warehouse_scan_sessions')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-scan-sessions']);
      queryClient.invalidateQueries(['scan-session']);
    }
  });
};

export const useCloseScanSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('warehouse_scan_sessions')
        .update({ status: 'CLOSED', closed_at: new Date() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-scan-sessions']);
    }
  });
};