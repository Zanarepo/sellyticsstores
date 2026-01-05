import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInventory = useCallback(async (storeId) => {
    if (!storeId) {
      setInventory([]);
      setProducts([]);
      return;
    }
    
    setIsLoading(true);
    const { data: invData, error: invError } = await supabase
      .from('dynamic_inventory')
      .select('available_qty, dynamic_product_id')
      .eq('store_id', storeId);
    
    const { data: prodData, error: prodError } = await supabase
      .from('dynamic_product')
      .select('id, name, purchase_price, selling_price, store_id')
      .eq('store_id', storeId);
    
    if (invError || prodError) {
      toast.error('Error loading inventory/products: ' + (invError?.message || prodError?.message));
      setInventory([]);
      setProducts([]);
    } else {
      setInventory(invData || []);
      setProducts(prodData || []);
    }
    setIsLoading(false);
  }, []);

  return { inventory, products, fetchInventory, isLoading };
};