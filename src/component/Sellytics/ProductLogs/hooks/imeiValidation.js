import { supabase } from '../../../supabaseClient';

export async function validateIMEIsAgainstDatabase(
  imeis,
  storeId,
  excludeProductId = null
) {
  if (!imeis || imeis.length === 0) {
    return { valid: true, duplicates: [] };
  }

  const { data, error } = await supabase
    .from('dynamic_product')
    .select('id, name, dynamic_product_imeis')
    .eq('store_id', storeId);

  if (error) throw error;

  const duplicates = [];
  const imeiSet = new Set(imeis.map(i => i.toLowerCase().trim()));

  for (const product of data) {
    if (excludeProductId && product.id === excludeProductId) continue;
    if (!product.dynamic_product_imeis) continue;

    const existing = product.dynamic_product_imeis
      .split(',')
      .map(i => i.toLowerCase().trim());

    for (const imei of existing) {
      if (imeiSet.has(imei)) {
        duplicates.push({
          imei,
          productName: product.name,
          productId: product.id
        });
      }
    }
  }

  return {
    valid: duplicates.length === 0,
    duplicates
  };
}
