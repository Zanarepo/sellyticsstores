import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../../supabaseClient';

export const getIdentity = () => {
  const userId = localStorage.getItem('user_id');
  const storeId = localStorage.getItem('store_id');
  const userEmail = localStorage.getItem('user_email');

  return {
    currentUserId: userId ? Number(userId) : null,
    currentStoreId: storeId ? Number(storeId) : null,
    currentUserEmail: userEmail ? userEmail.trim().toLowerCase() : null,
  };
};

const validateStoreId = (storeId) => {
  const numId = Number(storeId);
  if (isNaN(numId) || numId <= 0) {
    console.error('Invalid store_id:', storeId);
    return null;
  }
  return numId;
};

export const fetchProductByBarcode = async (barcode, storeId) => {
  const validStoreId = validateStoreId(storeId);
  if (!validStoreId) return { data: null, error: 'Invalid store ID' };

  const normalizedBarcode = barcode.trim();

  try {
    const { data, error } = await supabase
      .from('dynamic_product')
      .select('*')
      .eq('store_id', validStoreId)
      .ilike('dynamic_product_imeis', `%${normalizedBarcode}%`);

    if (error) throw error;

    const exactMatch = data?.find(product => {
      const imeis = (product.dynamic_product_imeis || '').split(',').map(i => i.trim());
      return imeis.includes(normalizedBarcode);
    });

    return { data: exactMatch || null, error: null };
  } catch (error) {
    console.error('fetchProductByBarcode error:', error);
    return { data: null, error: error.message };
  }
};

export const fetchProductById = async (productId, storeId) => {
  const validStoreId = validateStoreId(storeId);
  if (!validStoreId) return { data: null, error: 'Invalid store ID' };

  try {
    const { data, error } = await supabase
      .from('dynamic_product')
      .select('*')
      .eq('id', productId)
      .eq('store_id', validStoreId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data: data || null, error: null };
  } catch (error) {
    console.error('fetchProductById error:', error);
    return { data: null, error: error.message };
  }
};

export const fetchProducts = async (storeId) => {
  const validStoreId = validateStoreId(storeId);
  if (!validStoreId) return { data: [], error: 'Invalid store ID' };

  try {
    const { data, error } = await supabase
      .from('dynamic_product')
      .select('*')
      .eq('store_id', validStoreId)
      .order('name', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('fetchProducts error:', error);
    return { data: [], error: error.message };
  }
};

export const fetchInventory = async (productId, storeId) => {
  const validStoreId = validateStoreId(storeId);
  if (!validStoreId) return { data: null, error: 'Invalid store ID' };

  try {
    const { data, error } = await supabase
      .from('dynamic_inventory')
      .select('*')
      .eq('dynamic_product_id', productId)
      .eq('store_id', validStoreId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data: data || null, error: null };
  } catch (error) {
    console.error('fetchInventory error:', error);
    return { data: null, error: error.message };
  }
};

export const fetchAllInventory = async (storeId) => {
  const validStoreId = validateStoreId(storeId);
  if (!validStoreId) return { data: [], error: 'Invalid store ID' };

  try {
    const { data, error } = await supabase
      .from('dynamic_inventory')
      .select('*')
      .eq('store_id', validStoreId);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('fetchAllInventory error:', error);
    return { data: [], error: error.message };
  }
};

export const checkDeviceSold = async (deviceId, storeId) => {
  const validStoreId = validateStoreId(storeId);
  if (!validStoreId) return { sold: false, error: 'Invalid store ID' };

  try {
    const { data, error } = await supabase
      .from('dynamic_sales')
      .select('id, device_id, created_by_user_id')
      .eq('store_id', validStoreId)
      .ilike('device_id', `%${deviceId.trim()}%`);

    if (error) throw error;

    const exactMatch = data?.find(sale => {
      const ids = (sale.device_id || '').split(',').map(i => i.trim());
      return ids.includes(deviceId.trim());
    });

    return { 
      sold: !!exactMatch, 
      saleRecord: exactMatch || null,
      error: null 
    };
  } catch (error) {
    console.error('checkDeviceSold error:', error);
    return { sold: false, error: error.message };
  }
};

export const createSaleGroup = async (groupData) => {
  const identity = getIdentity();
  const validStoreId = validateStoreId(identity.currentStoreId);
  
  if (!validStoreId) return { data: null, error: 'Invalid store ID' };

  try {
    const { data, error } = await supabase
      .from('sale_groups')
      .insert({
        store_id: validStoreId,
        total_amount: groupData.total_amount,
        payment_method: groupData.payment_method,
        customer_id: groupData.customer_id || null,
        email_receipt: groupData.email_receipt || false,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createSaleGroup error:', error);
    return { data: null, error: error.message };
  }
};

export const createSaleLine = async (lineData, saleGroupId) => {
  const identity = getIdentity();
  const validStoreId = validateStoreId(identity.currentStoreId);
  
  if (!validStoreId) return { data: null, error: 'Invalid store ID' };

  try {
    const { data, error } = await supabase
      .from('dynamic_sales')
      .insert({
        store_id: validStoreId,
        sale_group_id: saleGroupId,
        dynamic_product_id: lineData.dynamic_product_id,
        quantity: lineData.quantity,
        unit_price: lineData.unit_price,
        amount: lineData.quantity * lineData.unit_price,
        device_id: lineData.device_ids?.join(',') || null,
        device_size: lineData.device_sizes?.join(',') || null,
        payment_method: lineData.payment_method,
        customer_id: lineData.customer_id || null,
        created_by_user_id: identity.currentUserId,
        created_by_owner: validStoreId,
        owner_id: validStoreId,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createSaleLine error:', error);
    return { data: null, error: error.message };
  }
};

export const updateInventoryAfterSale = async (productId, quantitySold, storeId) => {
  const validStoreId = validateStoreId(storeId);
  if (!validStoreId) return { success: false, error: 'Invalid store ID' };

  try {
    const { data: inv, error: fetchError } = await supabase
      .from('dynamic_inventory')
      .select('*')
      .eq('dynamic_product_id', productId)
      .eq('store_id', validStoreId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (inv) {
      const newAvailableQty = Math.max(0, (inv.available_qty || 0) - quantitySold);
      const newQuantitySold = (inv.quantity_sold || 0) + quantitySold;

      const { error: updateError } = await supabase
        .from('dynamic_inventory')
        .update({
          available_qty: newAvailableQty,
          quantity_sold: newQuantitySold,
        })
        .eq('id', inv.id);

      if (updateError) throw updateError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('updateInventoryAfterSale error:', error);
    return { success: false, error: error.message };
  }
};

export const fetchSales = async (storeId, filters = {}) => {
  const validStoreId = validateStoreId(storeId);
  if (!validStoreId) return { data: [], error: 'Invalid store ID' };

  try {
    let query = supabase
      .from('dynamic_sales')
      .select(`
        *,
        dynamic_product:dynamic_product_id(id, name, selling_price),
        customer:customer_id(id, fullname)
      `)
      .eq('store_id', validStoreId)
      .order('sold_at', { ascending: false });

    if (filters.created_by_user_id) {
      query = query.eq('created_by_user_id', filters.created_by_user_id);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    const processedSales = (data || []).map(sale => ({
      ...sale,
      product_name: sale.dynamic_product?.name || 'Unknown Product',
      customer_name: sale.customer?.fullname || 'Walk-in',
      deviceIds: sale.device_id?.split(',').filter(Boolean) || [],
      deviceSizes: sale.device_size?.split(',').filter(Boolean) || [],
    }));

    return { data: processedSales, error: null };
  } catch (error) {
    console.error('fetchSales error:', error);
    return { data: [], error: error.message };
  }
};

export const checkStoreOwner = async (storeId, userEmail) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('email_address', userEmail)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const filterByCreator = (sales, userId) => {
  return sales.filter(sale => sale.created_by_user_id === userId);
};

export const filterByStore = (sales, storeId) => {
  return sales.filter(sale => sale.store_id === storeId);
};

export default {
  getIdentity,
  fetchProductByBarcode,
  fetchProductById,
  fetchProducts,
  fetchInventory,
  fetchAllInventory,
  checkDeviceSold,
  createSaleGroup,
  createSaleLine,
  updateInventoryAfterSale,
  fetchSales,
  checkStoreOwner,
  filterByCreator,
  filterByStore,
};