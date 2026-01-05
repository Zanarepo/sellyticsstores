/**
 * SwiftCheckout - Sales Service
 * Handles all Supabase operations for sales
 * @version 1.0.0
 */
import { supabase } from '../../../../supabaseClient';
import { getIdentity, getCreatorMetadata } from '../../services/identityService';
import offlineCache from '../../db/offlineCache';

/**
 * Check if a device has already been sold
 * @param {string} deviceId - Device ID/IMEI to check
 * @param {number} storeId - Store ID
 * @returns {Promise<boolean>}
 */
export const checkDeviceAlreadySold = async (deviceId, storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid) || !deviceId) return false;
  
  const normalized = deviceId.trim();
  
  // Check local cache first
  const localSold = await offlineCache.checkDeviceSold(normalized, sid);
  if (localSold) return true;
  
  // Check Supabase
  const { data, error } = await supabase
    .from('dynamic_sales')
    .select('id, device_id')
    .eq('store_id', sid)
    .eq('status', 'sold');
    
  if (error || !data) return false;
  
  return data.some(sale => {
    const ids = sale.device_id?.split(',').map(d => d.trim().toLowerCase()) || [];
    return ids.includes(normalized.toLowerCase());
  });
};

/**
 * Create a sale group (transaction header)
 * @param {Object} groupData - Sale group data
 * @returns {Promise<Object>}
 */
export const createSaleGroup = async (groupData) => {
  const { currentStoreId } = getIdentity();
  const metadata = getCreatorMetadata();
  
  const { data, error } = await supabase
    .from('sale_groups')
    .insert({
      store_id: currentStoreId,
      total_amount: groupData.total_amount,
      payment_method: groupData.payment_method,
      customer_id: groupData.customer_id || null,
      customer_name: groupData.customer_name || null,
      email_receipt: groupData.email_receipt || false,
      ...metadata
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Create a sale line (transaction item)
 * @param {Object} lineData - Sale line data
 * @param {number} saleGroupId - Parent sale group ID
 * @returns {Promise<Object>}
 */
export const createSaleLine = async (lineData, saleGroupId) => {
  const { currentStoreId } = getIdentity();
  const metadata = getCreatorMetadata();
  
  const { data, error } = await supabase
    .from('dynamic_sales')
    .insert({
      store_id: currentStoreId,
      sale_group_id: saleGroupId,
      dynamic_product_id: lineData.dynamic_product_id,
      quantity: lineData.quantity,
      unit_price: lineData.unit_price,
      amount: lineData.quantity * lineData.unit_price,
      payment_method: lineData.payment_method,
      device_id: lineData.device_id || null,
      dynamic_product_imeis: lineData.dynamic_product_imeis || lineData.device_id || null,
      device_size: lineData.device_size || null,
      customer_id: lineData.customer_id || null,
      customer_name: lineData.customer_name || null,
      status: 'sold',
      ...metadata
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Update inventory quantity after sale
 * @param {number} inventoryId - Inventory record ID
 * @param {number} newAvailableQty - New available quantity
 * @returns {Promise<Object>}
 */
export const updateInventoryQty = async (inventoryId, newAvailableQty) => {
  const { data: current, error: fetchError } = await supabase
    .from('dynamic_inventory')
    .select('*')
    .eq('id', inventoryId)
    .single();
    
  if (fetchError) throw fetchError;
  
  const { data, error } = await supabase
    .from('dynamic_inventory')
    .update({
      available_qty: Math.max(0, newAvailableQty),
      quantity_sold: (current.quantity_sold || 0) + (current.available_qty - newAvailableQty),
      updated_at: new Date().toISOString()
    })
    .eq('id', inventoryId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Get all sales for current store
 * @returns {Promise<Array>}
 */
export const getSales = async () => {
  const { currentStoreId } = getIdentity();
  if (!currentStoreId) return [];
  
  const { data, error } = await supabase
    .from('dynamic_sales')
    .select(`
      *,
      dynamic_product:dynamic_product_id (name, selling_price)
    `)
    .eq('store_id', currentStoreId)
    .order('sold_at', { ascending: false });
    
  if (error) throw error;
  
  return (data || []).map(sale => ({
    ...sale,
    product_name: sale.dynamic_product?.name || 'Unknown Product',
    deviceIds: sale.device_id?.split(',').filter(Boolean) || []
  }));
};

/**
 * Get sales by user
 * @param {number} userId - User ID
 * @returns {Promise<Array>}
 */
export const getSalesByUser = async (userId) => {
  const { currentStoreId } = getIdentity();
  if (!currentStoreId) return [];
  
  const { data, error } = await supabase
    .from('dynamic_sales')
    .select(`
      *,
      dynamic_product:dynamic_product_id (name, selling_price)
    `)
    .eq('store_id', currentStoreId)
    .eq('created_by_email', userId)
    .order('sold_at', { ascending: false });
    
  if (error) throw error;
  
  return (data || []).map(sale => ({
    ...sale,
    product_name: sale.dynamic_product?.name || 'Unknown Product',
    deviceIds: sale.device_id?.split(',').filter(Boolean) || []
  }));
};

/**
 * Update a sale
 * @param {number} saleId - Sale ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>}
 */
export const updateSale = async (saleId, updates) => {
  const { error } = await supabase
    .from('dynamic_sales')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', saleId);
    
  return !error;
};

/**
 * Delete a sale
 * @param {number} saleId - Sale ID
 * @returns {Promise<boolean>}
 */
export const deleteSale = async (saleId) => {
  const { error } = await supabase
    .from('dynamic_sales')
    .delete()
    .eq('id', saleId);
    
  return !error;
};

/**
 * Get products for current store
 * @returns {Promise<Array>}
 */
export const getProducts = async () => {
  const { currentStoreId } = getIdentity();
  if (!currentStoreId) return [];
  
  const { data, error } = await supabase
    .from('dynamic_product')
    .select('*')
    .eq('store_id', currentStoreId)
    .order('name');
    
  if (error) throw error;
  return data || [];
};

/**
 * Get product by barcode/device ID
 * @param {string} barcode - Barcode or device ID
 * @returns {Promise<Object|null>}
 */
export const getProductByBarcode = async (barcode) => {
  const { currentStoreId } = getIdentity();
  if (!currentStoreId || !barcode) return null;
  
  const normalized = barcode.trim();
  
  // First try exact device_id match
  const { data: exactMatch } = await supabase
    .from('dynamic_product')
    .select('*')
    .eq('store_id', currentStoreId)
    .eq('device_id', normalized)
    .single();
    
  if (exactMatch) return exactMatch;
  
  // Search in IMEI list
  const { data: products } = await supabase
    .from('dynamic_product')
    .select('*')
    .eq('store_id', currentStoreId);
    
  if (!products) return null;
  
  return products.find(p => {
    const imeis = p.dynamic_product_imeis?.split(',').map(i => i.trim().toLowerCase()) || [];
    return imeis.includes(normalized.toLowerCase());
  }) || null;
};

/**
 * Get inventory for current store
 * @returns {Promise<Array>}
 */
export const getInventory = async () => {
  const { currentStoreId } = getIdentity();
  if (!currentStoreId) return [];
  
  const { data, error } = await supabase
    .from('dynamic_inventory')
    .select('*')
    .eq('store_id', currentStoreId);
    
  if (error) throw error;
  return data || [];
};

/**
 * Get inventory for a specific product
 * @param {number} productId - Product ID
 * @returns {Promise<Object|null>}
 */
export const getInventoryForProduct = async (productId) => {
  const { currentStoreId } = getIdentity();
  if (!currentStoreId || !productId) return null;
  
  const { data, error } = await supabase
    .from('dynamic_inventory')
    .select('*')
    .eq('store_id', currentStoreId)
    .eq('dynamic_product_id', productId)
    .single();
    
  if (error) return null;
  return data;
};

/**
 * Get customers for current store
 * @returns {Promise<Array>}
 */
export const getCustomers = async () => {
  const { currentStoreId } = getIdentity();
  if (!currentStoreId) return [];
  
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .eq('store_id', currentStoreId)
    .order('fullname');
    
  if (error) return [];
  return data || [];
};

/**
 * Check if current user is store owner
 * @returns {Promise<boolean>}
 */
export const checkIsOwner = async () => {
  const { currentStoreId, currentUserEmail } = getIdentity();
  if (!currentStoreId || !currentUserEmail) return false;
  
  const { data } = await supabase
    .from('stores')
    .select('email_address')
    .eq('id', currentStoreId)
    .single();
    
  return data?.email_address?.toLowerCase().trim() === currentUserEmail;
};

const salesServices = {
  checkDeviceAlreadySold,
  createSaleGroup,
  createSaleLine,
  updateInventoryQty,
  getSales,
  getSalesByUser,
  updateSale,
  deleteSale,
  getProducts,
  getProductByBarcode,
  getInventory,
  getInventoryForProduct,
  getCustomers,
  checkIsOwner,
  getIdentity,

  
};
export default salesServices;