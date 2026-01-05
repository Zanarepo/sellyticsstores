/**
 * useProductLookup - Hook for product lookup (scan/manual entry)
 * 
 * Handles:
 * - Barcode/IMEI lookup (cache-first, then online)
 * - Inventory validation
 * - Duplicate device ID detection
 * - Sold device checking
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalesService from '../services/SalesService';

export default function useProductLookup(storeId, offlineCache) {
  const [isLooking, setIsLooking] = useState(false);
  const [lastLookup, setLastLookup] = useState(null);

  /**
   * Normalize barcode input
   */
  const normalizeBarcode = (barcode) => {
    return barcode
      .trim()
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .toUpperCase();
  };

  /**
   * Check inventory levels and show appropriate alerts
   */
  const checkInventoryLevels = useCallback(async (productId, productName) => {
    let inventory = null;

    // Try cache first
    if (offlineCache) {
      inventory = await offlineCache.getInventory(productId);
    }

    // If online and no cache, fetch from server
    if (!inventory && navigator.onLine) {
      const { data } = await SalesService.fetchInventory(productId, storeId);
      inventory = data;

      // Cache for future use
      if (inventory && offlineCache) {
        await offlineCache.cacheInventory(inventory);
      }
    }

    if (!inventory) {
      // No inventory record - might be a new product
      return { availableQty: null, warning: null };
    }

    const availableQty = inventory.available_qty || 0;

    if (availableQty === 0) {
      toast.error(`Out of stock: ${productName}. Restock needed!`, {
        autoClose: 5000,
      });
      return { availableQty, warning: 'out_of_stock' };
    }

    if (availableQty <= 6) {
      toast.warn(`Low stock: Only ${availableQty} left for ${productName}`, {
        autoClose: 4000,
      });
      return { availableQty, warning: 'low_stock' };
    }

    return { availableQty, warning: null };
  }, [storeId, offlineCache]);

  /**
   * Check if device was already sold
   */
  const checkDeviceSold = useCallback(async (deviceId) => {
    if (!navigator.onLine) {
      // Can't verify online - allow sale but warn
      return { sold: false, cannotVerify: true };
    }

    const { sold, saleRecord, error } = await SalesService.checkDeviceSold(
      deviceId,
      storeId
    );

    if (error) {
      console.error('Error checking device sold status:', error);
      return { sold: false, error };
    }

    if (sold) {
      const identity = SalesService.getIdentity();
      const isSameUser = saleRecord.created_by_user_id === identity.currentUserId;

      return {
        sold: true,
        saleRecord,
        isSameUser,
      };
    }

    return { sold: false };
  }, [storeId]);

  /**
   * Look up product by barcode/IMEI
   */
  const lookupByBarcode = useCallback(async (barcode) => {
    const normalizedBarcode = normalizeBarcode(barcode);
    
    if (!normalizedBarcode) {
      return { 
        success: false, 
        error: 'Empty barcode', 
        product: null 
      };
    }

    setIsLooking(true);
    setLastLookup({ barcode: normalizedBarcode, timestamp: Date.now() });

    try {
      let product = null;
      let deviceSize = '';

      // Step 1: Check if device was already sold
      const soldCheck = await checkDeviceSold(normalizedBarcode);
      if (soldCheck.sold) {
        setIsLooking(false);
        return {
          success: false,
          error: 'already_sold',
          message: `Device "${normalizedBarcode}" was already sold`,
          saleRecord: soldCheck.saleRecord,
          isSameUser: soldCheck.isSameUser,
          product: null,
        };
      }

      // Step 2: Try cache first
      if (offlineCache) {
        product = await offlineCache.getProductByBarcode(normalizedBarcode);
      }

      // Step 3: If not in cache and online, fetch from server
      if (!product && navigator.onLine) {
        const { data, error } = await SalesService.fetchProductByBarcode(
          normalizedBarcode,
          storeId
        );

        if (error) {
          setIsLooking(false);
          return {
            success: false,
            error: 'lookup_error',
            message: error,
            product: null,
          };
        }

        product = data;

        // Cache for future use
        if (product && offlineCache) {
          await offlineCache.cacheProduct(product);
        }
      }

      // Step 4: Product not found
      if (!product) {
        setIsLooking(false);
        toast.error(`Product not found: "${normalizedBarcode}"`);
        return {
          success: false,
          error: 'not_found',
          message: `Product with ID "${normalizedBarcode}" not found`,
          product: null,
        };
      }

      // Step 5: Extract device size if available
      if (product.dynamic_product_imeis && product.device_size) {
        const imeis = product.dynamic_product_imeis.split(',').map(i => i.trim());
        const sizes = product.device_size.split(',').map(s => s.trim());
        const idx = imeis.indexOf(normalizedBarcode);
        if (idx !== -1 && sizes[idx]) {
          deviceSize = sizes[idx];
        }
      }

      // Step 6: Check inventory levels
      const inventoryCheck = await checkInventoryLevels(product.id, product.name);

      setIsLooking(false);
      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          selling_price: product.selling_price,
          purchase_price: product.purchase_price,
          dynamic_product_imeis: product.dynamic_product_imeis,
          device_size: product.device_size,
        },
        deviceId: normalizedBarcode,
        deviceSize,
        inventory: inventoryCheck,
      };

    } catch (error) {
      console.error('lookupByBarcode error:', error);
      setIsLooking(false);
      return {
        success: false,
        error: 'exception',
        message: error.message,
        product: null,
      };
    }
  }, [storeId, offlineCache, checkDeviceSold, checkInventoryLevels]);

  /**
   * Look up product by ID (for manual selection)
   */
  const lookupById = useCallback(async (productId) => {
    setIsLooking(true);

    try {
      let product = null;

      // Try cache first
      if (offlineCache) {
        product = await offlineCache.getProductById(productId);
      }

      // If not in cache and online, fetch from server
      if (!product && navigator.onLine) {
        const { data, error } = await SalesService.fetchProductById(
          productId,
          storeId
        );

        if (error) {
          setIsLooking(false);
          return { success: false, error, product: null };
        }

        product = data;

        // Cache for future use
        if (product && offlineCache) {
          await offlineCache.cacheProduct(product);
        }
      }

      if (!product) {
        setIsLooking(false);
        return { success: false, error: 'Product not found', product: null };
      }

      // Check inventory levels
      const inventoryCheck = await checkInventoryLevels(product.id, product.name);

      setIsLooking(false);
      return {
        success: true,
        product,
        inventory: inventoryCheck,
      };

    } catch (error) {
      console.error('lookupById error:', error);
      setIsLooking(false);
      return { success: false, error: error.message, product: null };
    }
  }, [storeId, offlineCache, checkInventoryLevels]);

  return {
    isLooking,
    lastLookup,
    lookupByBarcode,
    lookupById,
    checkDeviceSold,
    checkInventoryLevels,
  };
}