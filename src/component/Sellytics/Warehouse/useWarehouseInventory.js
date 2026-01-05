import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';

export const useWarehouseInventory = (warehouseId, productIds) => {
  return useQuery({
    queryKey: ['warehouse-inventory', warehouseId, productIds],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .in('warehouse_product_id', productIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!productIds && productIds.length > 0
  });
};

export const useInventoryByProduct = (productId) => {
  return useQuery({
    queryKey: ['inventory-by-product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('warehouse_product_id', productId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!productId
  });
};

export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_inventory')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-inventory']);
      queryClient.invalidateQueries(['inventory-by-product']);
    }
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('warehouse_inventory')
        .update({ ...data, updated_at: new Date() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-inventory']);
      queryClient.invalidateQueries(['inventory-by-product']);
    }
  });
};

export const useUpsertInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ warehouse_product_id, quantity, available_qty, damaged_qty }) => {
      const { data: existing } = await supabase
        .from('warehouse_inventory')
        .select('id, quantity, available_qty, damaged_qty')
        .eq('warehouse_product_id', warehouse_product_id)
        .single();
      
      if (existing) {
        const { error } = await supabase
          .from('warehouse_inventory')
          .update({
            quantity: (existing.quantity || 0) + quantity,
            available_qty: (existing.available_qty || 0) + available_qty,
            damaged_qty: (existing.damaged_qty || 0) + damaged_qty,
            updated_at: new Date()
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('warehouse_inventory')
          .insert([{
            warehouse_product_id,
            quantity,
            available_qty,
            damaged_qty
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-inventory']);
      queryClient.invalidateQueries(['inventory-by-product']);
    }
  });
};