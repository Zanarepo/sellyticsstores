import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';


export function useWarehouseData(warehouseId) {
  const { data: warehouse, isLoading: loadingWarehouse } = useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', warehouseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!warehouseId
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['warehouse-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_clients')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['warehouse-products', warehouseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_products')
        .select('*')
        .eq('warehouse_id', warehouseId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!warehouseId
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['warehouse-inventory', warehouseId],
    queryFn: async () => {
      if (!products.length) return [];
      const productIds = products.map(p => p.id);
      const { data, error } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .in('warehouse_product_id', productIds);
      if (error) throw error;
      return data || [];
    },
    enabled: products.length > 0
  });

  const { data: ledger = [] } = useQuery({
    queryKey: ['warehouse-ledger', warehouseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_ledger')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!warehouseId
  });

  const { data: serialItems = [] } = useQuery({
    queryKey: ['warehouse-serials', warehouseId],
    queryFn: async () => {
      if (!products.length) return [];
      const productIds = products.map(p => p.id);
      const { data, error } = await supabase
        .from('warehouse_serial_items')
        .select('*')
        .in('warehouse_product_id', productIds);
      if (error) throw error;
      return data || [];
    },
    enabled: products.length > 0
  });

  const { data: returnRequests = [] } = useQuery({
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

  return {
    warehouse,
    loadingWarehouse,
    clients,
    products,
    inventory,
    ledger,
    serialItems,
    returnRequests
  };
}