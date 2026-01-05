import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const useWarehouseSerials = (productIds) => {
  return useQuery({
    queryKey: ['warehouse-serials', productIds],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('warehouse_serial_items')
        .select('*')
        .in('warehouse_product_id', productIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!productIds && productIds.length > 0
  });
};

export const useSerialsByProduct = (productId) => {
  return useQuery({
    queryKey: ['serials-by-product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_serial_items')
        .select('*')
        .eq('warehouse_product_id', productId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!productId
  });
};

export const useCreateSerialItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_serial_items')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-serials']);
      queryClient.invalidateQueries(['serials-by-product']);
    }
  });
};

export const useBulkCreateSerials = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serials) => {
      const { error } = await supabase
        .from('warehouse_serial_items')
        .insert(serials);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-serials']);
      queryClient.invalidateQueries(['serials-by-product']);
    }
  });
};

export const useUpdateSerialStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from('warehouse_serial_items')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-serials']);
      queryClient.invalidateQueries(['serials-by-product']);
    }
  });
};

export const useBulkUpdateSerialStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ serial_numbers, product_id, status }) => {
      const { error } = await supabase
        .from('warehouse_serial_items')
        .update({ status })
        .eq('warehouse_product_id', product_id)
        .in('serial_number', serial_numbers);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-serials']);
      queryClient.invalidateQueries(['serials-by-product']);
    }
  });
};