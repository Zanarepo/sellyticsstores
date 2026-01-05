import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });
};

export const useWarehouse = (id) => {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouses')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
    }
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('warehouses')
        .update({ ...data, updated_at: new Date() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
    }
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
    }
  });
};