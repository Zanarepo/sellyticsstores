/**
 * SwiftCheckout - Sales Service
 * Handles all Supabase API operations for sales
 */
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../supabaseClient';
import { getCreatorMetadata, getCurrentUser } from '../utils/identity';
import { deviceIdsToString, parseDeviceIds } from '../utils/validation';
import { productCache, inventoryCache, offlineSalesQueue } from '../db/offlineDb';

// Fetch product by barcode/IMEI
export async function fetchProductByBarcode(barcode, storeId) {
  const normalizedBarcode = barcode.trim().toUpperCase();
  
  try {
    // First try cache
    const cachedProduct = await productCache.getByBarcode(normalizedBarcode, storeId);
    if (cachedProduct) {
      return { success: true, product: cachedProduct, fromCache: true };
    }
    
    // Query Supabase - search in dynamic_product_imeis
    const { data, error } = await supabase
      .from('dynamic_product')
      .select('*')
      .eq('store_id', Number(storeId))
      .ilike('dynamic_product_imeis', `%${normalizedBarcode}%`)
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No match found, try by ID
        const { data: byId, error: idError } = await supabase
          .from('dynamic_product')
          .select('*')
          .eq('store_id', Number(storeId))
          .eq('id', Number(normalizedBarcode))
          .single();
        
        if (idError || !byId) {
          return { success: false, error: `Product ID "${barcode}" not found` };
        }
        
        await productCache.cacheProduct(byId);
        return { success: true, product: byId, fromCache: false };
      }
      throw error;
    }
    
    // Cache the product
    await productCache.cacheProduct(data);
    
    // Get device size for this specific barcode
    const imeis = data.dynamic_product_imeis?.split(',').map(i => i.trim().toUpperCase()) || [];
    const sizes = data.device_size?.split(',').map(s => s.trim()) || [];
    const barcodeIndex = imeis.indexOf(normalizedBarcode);
    const deviceSize = barcodeIndex !== -1 ? sizes[barcodeIndex] || '' : '';
    
    return { 
      success: true, 
      product: data, 
      deviceId: normalizedBarcode,
      deviceSize,
      fromCache: false 
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, error: error.message };
  }
}

// Fetch all products for store
export async function fetchProducts(storeId) {
  try {
    const { data, error } = await supabase
      .from('dynamic_product')
      .select('*')
      .eq('store_id', Number(storeId))
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Cache products
    await productCache.cacheProducts(data || []);
    
    return { success: true, products: data || [] };
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Try to get from cache
    const cached = await productCache.getAllForStore(storeId);
    if (cached.length > 0) {
      return { success: true, products: cached, fromCache: true };
    }
    
    return { success: false, error: error.message, products: [] };
  }
}

// Fetch inventory for store
export async function fetchInventory(storeId) {
  try {
    const { data, error } = await supabase
      .from('dynamic_inventory')
      .select('*')
      .eq('store_id', Number(storeId));
    
    if (error) throw error;
    
    // Cache inventories
    await inventoryCache.cacheInventories(data || []);
    
    return { success: true, inventories: data || [] };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    
    // Try cache
    const cached = await inventoryCache.getAllForStore(storeId);
    if (cached.length > 0) {
      return { success: true, inventories: cached, fromCache: true };
    }
    
    return { success: false, error: error.message, inventories: [] };
  }
}

// Check if device was already sold
export async function checkDeviceAlreadySold(deviceId, storeId) {
  const normalizedId = deviceId.trim().toUpperCase();
  
  try {
    const { data, error } = await supabase
      .from('dynamic_sales')
      .select('id, sold_at, created_by_user_id, created_by_email')
      .eq('store_id', Number(storeId))
      .eq('device_id', normalizedId)
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      return { 
        alreadySold: true, 
        sale: data,
        message: `Device ${deviceId} was already sold`
      };
    }
    
    return { alreadySold: false };
  } catch (error) {
    console.error('Error checking sold device:', error);
    return { alreadySold: false, error: error.message };
  }
}

// Create sale group
export async function createSaleGroup(saleGroupData) {
  const metadata = getCreatorMetadata();

  // ✅ 1 — IDEMPOTENCY CHECK (recommended solution)
  if (saleGroupData.client_ref) {
    const existing = await supabase
      .from('sale_groups')
      .select('*')
      .eq('client_ref', saleGroupData.client_ref)
      .single();

    if (existing.data) {
      return { success: true, saleGroup: existing.data };
    }
  }

  // Prepare payload
  const payload = {
    store_id: Number(saleGroupData.store_id),
    total_amount: Number(saleGroupData.total_amount),
    payment_method: saleGroupData.payment_method || 'Cash',
    customer_id: saleGroupData.customer_id || null,
    email_receipt: saleGroupData.email_receipt || false,
    client_ref: saleGroupData.client_ref || null,   // ← MUST SAVE IT
    ...metadata
  };

  try {
    const { data, error } = await supabase
      .from('sale_groups')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return { success: true, saleGroup: data };
  } catch (error) {
    console.error('Error creating sale group:', error);
    return { success: false, error: error.message };
  }
}

// Create sale line
export async function createSaleLine(saleLineData) {
  const metadata = getCreatorMetadata();
  
  const payload = {
    store_id: Number(saleLineData.store_id),
    sale_group_id: saleLineData.sale_group_id,
    dynamic_product_id: Number(saleLineData.dynamic_product_id),
    quantity: Number(saleLineData.quantity),
    unit_price: Number(saleLineData.unit_price),
    amount: Number(saleLineData.quantity) * Number(saleLineData.unit_price),
    device_id: deviceIdsToString(saleLineData.deviceIds),
    device_size: deviceIdsToString(saleLineData.deviceSizes),
    payment_method: saleLineData.payment_method,
    customer_id: saleLineData.customer_id || null,
    sold_at: new Date().toISOString(),
    ...metadata
  };
  
  try {
    const { data, error } = await supabase
      .from('dynamic_sales')
      .insert(payload)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update inventory
    await updateInventoryAfterSale(saleLineData.dynamic_product_id, saleLineData.store_id, saleLineData.quantity);
    
    return { success: true, sale: data };
  } catch (error) {
    console.error('Error creating sale line:', error);
    return { success: false, error: error.message };
  }
}

// Update inventory after sale
export async function updateInventoryAfterSale(productId, storeId, quantitySold) {
  try {
    const { data: inv, error: fetchError } = await supabase
      .from('dynamic_inventory')
      .select('*')
      .eq('dynamic_product_id', Number(productId))
      .eq('store_id', Number(storeId))
      .single();
    
    if (fetchError || !inv) {
      console.warn('No inventory record found');
      return;
    }
    
    const newAvailableQty = Math.max(0, (inv.available_qty || 0) - quantitySold);
    const newQuantitySold = (inv.quantity_sold || 0) + quantitySold;
    
    await supabase
      .from('dynamic_inventory')
      .update({
        available_qty: newAvailableQty,
        quantity_sold: newQuantitySold
      })
      .eq('id', inv.id);
    
    // Update local cache
    await inventoryCache.cacheInventory({
      ...inv,
      available_qty: newAvailableQty,
      quantity_sold: newQuantitySold
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
  }
}

// Full sale creation (group + lines)
export async function createCompleteSale(lines, paymentMethod, customerId, storeId, emailReceipt = false) {
  const totalAmount = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
  
  // Create sale group
  const groupResult = await createSaleGroup({
    store_id: storeId,
    total_amount: totalAmount,
    payment_method: paymentMethod,
    customer_id: customerId,
    email_receipt: emailReceipt
  });
  
  if (!groupResult.success) {
    return groupResult;
  }
  
  // Create each sale line
  const createdLines = [];
  const errors = [];
  
  for (const line of lines) {
    const lineResult = await createSaleLine({
      store_id: storeId,
      sale_group_id: groupResult.saleGroup.id,
      dynamic_product_id: line.productId,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      deviceIds: line.deviceIds || [],
      deviceSizes: line.deviceSizes || [],
      payment_method: paymentMethod,
      customer_id: customerId
    });
    
    if (lineResult.success) {
      createdLines.push(lineResult.sale);
    } else {
      errors.push(lineResult.error);
    }
  }
  
  if (errors.length > 0) {
    return { 
      success: createdLines.length > 0, 
      partial: true,
      saleGroup: groupResult.saleGroup,
      sales: createdLines,
      errors 
    };
  }
  
  return { 
    success: true, 
    saleGroup: groupResult.saleGroup, 
    sales: createdLines 
  };
}

// Fetch sales for display
export async function fetchSales(storeId, userId = null) {
  const currentUser = getCurrentUser();
  
  try {
    let query = supabase
      .from('dynamic_sales')
      .select(`
        *,
        dynamic_product:dynamic_product(id, name),
        customer:customer(fullname),
        sale_store:store_id(shop_name)
      `)
      .eq('store_id', Number(storeId))
      .order('sold_at', { ascending: false });
    
    // If specific user filter
    if (userId) {
      query = query.eq('created_by_user_id', Number(userId));
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Process sales data
    const processedSales = (data || []).map(s => ({
      ...s,
      product_name: s.dynamic_product?.name || 'Unknown Product',
      customer_name: s.customer?.fullname || 'Walk-in',
      deviceIds: parseDeviceIds(s.device_id),
      deviceSizes: parseDeviceIds(s.device_size)
    }));
    
    return { success: true, sales: processedSales };
  } catch (error) {
    console.error('Error fetching sales:', error);
    return { success: false, error: error.message, sales: [] };
  }
}

// Delete sale
export async function deleteSale(saleId, storeId) {
  const currentUser = getCurrentUser();
  
  try {
    // Get sale to check permissions and restore inventory
    const { data: sale, error: fetchError } = await supabase
      .from('dynamic_sales')
      .select('*')
      .eq('id', saleId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Check permission
    if (sale.created_by_user_id !== currentUser.userId) {
      return { success: false, error: 'You can only delete your own sales' };
    }
    
    // Delete sale
    const { error: deleteError } = await supabase
      .from('dynamic_sales')
      .delete()
      .eq('id', saleId);
    
    if (deleteError) throw deleteError;
    
    // Restore inventory
    const { data: inv } = await supabase
      .from('dynamic_inventory')
      .select('*')
      .eq('dynamic_product_id', sale.dynamic_product_id)
      .eq('store_id', storeId)
      .single();
    
    if (inv) {
      await supabase
        .from('dynamic_inventory')
        .update({
          available_qty: (inv.available_qty || 0) + sale.quantity,
          quantity_sold: Math.max(0, (inv.quantity_sold || 0) - sale.quantity)
        })
        .eq('id', inv.id);
    }
    
    toast.success('Sale deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting sale:', error);
    toast.error('Failed to delete sale');
    return { success: false, error: error.message };
  }
}

// Update sale
export async function updateSale(saleId, updates) {
  const currentUser = getCurrentUser();
  
  try {
    // Check permission
    const { data: existing, error: fetchError } = await supabase
      .from('dynamic_sales')
      .select('*')
      .eq('id', saleId)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (existing.created_by_user_id !== currentUser.userId) {
      return { success: false, error: 'You can only edit your own sales' };
    }
    
    const { data, error } = await supabase
      .from('dynamic_sales')
      .update({
        ...updates,
        device_id: deviceIdsToString(updates.deviceIds),
        device_size: deviceIdsToString(updates.deviceSizes),
        updated_at: new Date().toISOString()
      })
      .eq('id', saleId)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Sale updated successfully');
    return { success: true, sale: data };
  } catch (error) {
    console.error('Error updating sale:', error);
    toast.error('Failed to update sale');
    return { success: false, error: error.message };
  }
}