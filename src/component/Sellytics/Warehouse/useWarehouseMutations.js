import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

import { toast } from 'react-hot-toast';

export function useWarehouseMutations() {
  const queryClient = useQueryClient();

  const createLedgerEntry = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_ledger')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(['warehouse-ledger'])
  });

  const createInventory = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_inventory')
        .insert([data]);
      if (error) throw error;
    }
  });

  const updateInventory = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('warehouse_inventory')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(['warehouse-inventory'])
  });

  const createSerialItem = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_serial_items')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(['warehouse-serials'])
  });

  const createClient = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_clients')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-clients']);
      toast.success('Client added successfully');
    }
  });

  const createProduct = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_products')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-products']);
      toast.success('Product added successfully');
    }
  });

  const createReturnRequest = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouse_return_requests')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouse-returns']);
      toast.success('Return request submitted');
    }
  });

  return {
    createLedgerEntry,
    createInventory,
    updateInventory,
    createSerialItem,
    createClient,
    createProduct,
    createReturnRequest,
    queryClient
  };
}