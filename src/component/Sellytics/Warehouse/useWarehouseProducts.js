import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const useWarehouseProducts = (warehouseId) => {
  return useQuery({
    queryKey: ['warehouse-products', warehouseId],
    queryFn: async () => {
      let query = supabase
        .from('warehouse_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
};

export const useWarehouseProduct = (id) => {
  return useQuery({
    queryKey: ['warehouse-product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

export const useCreateWarehouseProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_products')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-products']);
    }
  });
};

export const useUpdateWarehouseProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('warehouse_products')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-products']);
    }
  });
};

export const useDeleteWarehouseProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('warehouse_products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-products']);
    }
  });
};