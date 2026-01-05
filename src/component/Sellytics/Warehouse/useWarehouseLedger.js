import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';

export const useWarehouseLedger = (warehouseId, limit = 100) => {
  return useQuery({
    queryKey: ['warehouse-ledger', warehouseId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_ledger')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!warehouseId
  });
};

export const useLedgerByProduct = (productId, limit = 50) => {
  return useQuery({
    queryKey: ['ledger-by-product', productId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_ledger')
        .select('*')
        .eq('warehouse_product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!productId
  });
};

export const useCreateLedgerEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_ledger')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-ledger']);
      queryClient.invalidateQueries(['ledger-by-product']);
    }
  });
};

export const useBulkCreateLedgerEntries = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entries) => {
      const { error } = await supabase
        .from('warehouse_ledger')
        .insert(entries);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-ledger']);
      queryClient.invalidateQueries(['ledger-by-product']);
    }
  });
};