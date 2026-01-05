import db from './dexieDb';
import { withMetadata } from '../utils';

// ==================== PRODUCTS ====================

export const cacheProducts = async (products, storeId) => {
  if (!products?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = products.map((p) => withMetadata(p, sid));
  await db.dynamic_product.bulkPut(records);
};

export const getProductById = (productId) =>
  db.dynamic_product.get(Number(productId));

export const getProductByBarcode = async (barcode, storeId) => {
  if (!barcode || !storeId) return null;
  const normalized = barcode.trim().toLowerCase();
  const sid = Number(storeId);
  if (isNaN(sid)) return null;

  const products = await db.dynamic_product
    .where('store_id')
    .equals(sid)
    .toArray();

  let match = products.find(
    p => p.device_id?.trim().toLowerCase() === normalized
  );
  if (match) return match;

  match = products.find(p => {
    const imeis =
      p.dynamic_product_imeis?.split(',').map(i => i.trim().toLowerCase()) || [];
    return imeis.includes(normalized);
  });

  return match || null;
};

export const getAllProducts = (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return Promise.resolve([]);
  return db.dynamic_product.where('store_id').equals(sid).toArray();
};
