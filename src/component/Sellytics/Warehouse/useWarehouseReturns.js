import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const useWarehouseReturns = (warehouseId) => {
  return useQuery({
    queryKey: ['warehouse-returns', warehouseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_return_requests')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!warehouseId
  });
};

export const useReturnRequest = (id) => {
  return useQuery({
    queryKey: ['return-request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_return_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

export const useCreateReturnRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_return_requests')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-returns']);
    }
  });
};

export const useUpdateReturnRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('warehouse_return_requests')
        .update({ ...data, processed_at: new Date() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-returns']);
      queryClient.invalidateQueries(['return-request']);
    }
  });
};

export const useApproveReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('warehouse_return_requests')
        .update({ status: 'RECEIVED', processed_at: new Date() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-returns']);
    }
  });
};

export const useRejectReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('warehouse_return_requests')
        .update({ status: 'REJECTED', processed_at: new Date() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-returns']);
    }
  });
};