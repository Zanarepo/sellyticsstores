import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const useWarehouseClients = () => {
  return useQuery({
    queryKey: ['warehouse-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });
};

export const useWarehouseClient = (id) => {
  return useQuery({
    queryKey: ['warehouse-client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

export const useCreateWarehouseClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_clients')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-clients']);
    }
  });
};

export const useUpdateWarehouseClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('warehouse_clients')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-clients']);
    }
  });
};

export const useDeleteWarehouseClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('warehouse_clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-clients']);
    }
  });
};