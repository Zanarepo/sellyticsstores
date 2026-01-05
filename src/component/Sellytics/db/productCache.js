import db from './dexieDb';
import { withMetadata } from '../utils';

// ==================== PRODUCTS ====================

// Cache or update products in IndexedDB, preserving dynamic_product_imeis
export const cacheProducts = async (products, storeId) => {
  if (!products?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  for (const p of products) {
    const existing = await db.dynamic_product.get(Number(p.id));

    const record = {
      ...existing, // preserve existing fields
      ...p,        // overwrite with new fields from server
      dynamic_product_imeis: p.dynamic_product_imeis || existing?.dynamic_product_imeis || '',
      ...withMetadata(p, sid), // add offline metadata
    };

    await db.dynamic_product.put(record);
  }
};

// Get product by ID
export const getProductById = (productId) =>
  db.dynamic_product.get(Number(productId));

// Get product by device_id or IMEI (barcode)
export const getProductByBarcode = async (barcode, storeId) => {
  if (!barcode || !storeId) return null;
  const normalized = barcode.trim().toLowerCase();
  const sid = Number(storeId);
  if (isNaN(sid)) return null;

  const products = await db.dynamic_product.where('store_id').equals(sid).toArray();

  // Match by device_id first
  let match = products.find(p => p.device_id?.trim().toLowerCase() === normalized);
  if (match) return match;

  // Then match by IMEIs
  match = products.find(p => {
    const imeis = p.dynamic_product_imeis?.split(',').map(i => i.trim().toLowerCase()) || [];
    return imeis.includes(normalized);
  });

  return match || null;
};

// Get all products for a store
export const getAllProducts = (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return Promise.resolve([]);
  return db.dynamic_product.where('store_id').equals(sid).toArray();
};
