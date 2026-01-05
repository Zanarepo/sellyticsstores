/**
 * SwiftCheckout - Device Validation Utility
 * Validates and fetches device information from database
 */
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../supabaseClient';
import { sanitizeBarcode } from './validation';

/**
 * Validate and fetch device from dynamic_product
 * @param {string} deviceId - The device ID/IMEI to validate
 * @param {number|string} storeId - The store ID
 * @returns {Promise<object>} - Validation result with product data
 */
export async function validateAndFetchDevice(deviceId, storeId) {
  const trimmedId = sanitizeBarcode(deviceId);
  
  if (!trimmedId) {
    return {
      success: false,
      message: 'Invalid device ID format'
    };
  }

  try {
    // Check if device was already sold
    const { data: soldData, error: soldError } = await supabase
      .from('dynamic_sales')
      .select('id, sold_at, created_by_email')
      .eq('device_id', trimmedId)
      .eq('store_id', Number(storeId))
      .single();

    if (soldError && soldError.code !== 'PGRST116') {
      console.error('Error checking sold status:', soldError);
      return {
        success: false,
        message: 'Failed to validate device ID'
      };
    }

    if (soldData) {
      return {
        success: false,
        message: `Device ID "${trimmedId}" has already been sold`,
        alreadySold: true,
        soldAt: soldData.sold_at,
        soldBy: soldData.created_by_email
      };
    }

    // Query dynamic_product for matching device ID
    const { data: productData, error: productError } = await supabase
      .from('dynamic_product')
      .select('id, name, selling_price, purchase_price, dynamic_product_imeis, device_size, is_unique')
      .eq('store_id', Number(storeId))
      .ilike('dynamic_product_imeis', `%${trimmedId}%`)
      .limit(1)
      .single();

    if (productError || !productData) {
      return {
        success: false,
        message: `Product ID "${trimmedId}" not found in inventory`
      };
    }

    // Get device index and size
    const deviceIds = productData.dynamic_product_imeis
      ? productData.dynamic_product_imeis.split(',').map(id => id.trim()).filter(id => id)
      : [];
    const deviceSizes = productData.device_size
      ? productData.device_size.split(',').map(size => size.trim()).filter(size => size)
      : [];
    const idIndex = deviceIds.findIndex(id => id.toUpperCase() === trimmedId);
    const size = idIndex !== -1 ? deviceSizes[idIndex] || '' : '';

    return {
      success: true,
      message: 'Device validated successfully',
      product: productData,
      deviceId: trimmedId,
      size,
      isUnique: productData.is_unique || false
    };

  } catch (error) {
    console.error('Device validation error:', error);
    return {
      success: false,
      message: 'Validation failed: ' + error.message
    };
  }
}

/**
 * Check if multiple devices are sold
 * @param {Array<string>} deviceIds - Array of device IDs to check
 * @param {number|string} storeId - The store ID
 * @returns {Promise<object>} - Object mapping device IDs to sold status
 */
export async function checkMultipleDevicesSold(deviceIds, storeId) {
  if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
    return {};
  }

  const normalizedIds = deviceIds.map(sanitizeBarcode).filter(Boolean);

  try {
    const { data, error } = await supabase
      .from('dynamic_sales')
      .select('device_id, sold_at')
      .eq('store_id', Number(storeId))
      .in('device_id', normalizedIds);

    if (error) throw error;

    const soldMap = {};
    (data || []).forEach(item => {
      soldMap[item.device_id] = {
        sold: true,
        soldAt: item.sold_at
      };
    });

    return soldMap;
  } catch (error) {
    console.error('Error checking multiple devices:', error);
    return {};
  }
}

/**
 * Get available device IDs for a product (not yet sold)
 * @param {object} product - Product object with deviceIds
 * @param {number|string} storeId - The store ID
 * @returns {Promise<Array>} - Array of available device IDs with sizes
 */
export async function getAvailableDeviceIds(product, storeId) {
  if (!product?.deviceIds || product.deviceIds.length === 0) {
    return [];
  }

  const soldMap = await checkMultipleDevicesSold(product.deviceIds, storeId);

  return product.deviceIds
    .map((id, idx) => ({
      id,
      size: product.deviceSizes?.[idx] || '',
      sold: !!soldMap[id]
    }))
    .filter(item => !item.sold);
}