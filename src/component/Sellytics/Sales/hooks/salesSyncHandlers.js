import { supabase } from '../../../../supabaseClient';
import offlineCache from '../../db/offlineCache';
import { getCreatorMetadata } from '../../services/identityService';

// Create sale group
export async function createSaleGroup(item) {
  const metadata = getCreatorMetadata();
  const { data, queue_id } = item;

  const { data: result, error } = await supabase
    .from('sale_groups')
    .insert({
      store_id: data.store_id,
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      customer_id: data.customer_id,
      customer_name: data.customer_name,
      email_receipt: data.email_receipt,
      ...metadata,
    })
    .select()
    .single();

  if (error) throw error;

  await offlineCache.markSaleGroupSynced(data._offline_id, result.id);
  await offlineCache.markQueueItemSynced(queue_id);

  return result;
}
export async function createDynamicSale(item, saleGroupMap) {
  const metadata = getCreatorMetadata();
  const { data, queue_id } = item;

  const onlineSaleGroupId = saleGroupMap[data.client_sale_group_ref];
  if (!onlineSaleGroupId) {
    // Sale group not synced yet, retry later
    return { success: false, skipped: true };
  }

  // Prevent duplicate online sales
  const { data: existing } = await supabase
    .from('dynamic_sales')
    .select('id')
    .eq('_offline_id', data._offline_id)
    .limit(1);

  if (existing?.length > 0) {
    await offlineCache.markQueueItemSynced(queue_id);
    await offlineCache.markSaleSynced(data._offline_id, existing[0].id);
    return { success: true, skipped: true };
  }

  // Insert sale into Supabase
  const { data: result, error } = await supabase
    .from('dynamic_sales')
    .insert({
      store_id: data.store_id,
      sale_group_id: onlineSaleGroupId,
      dynamic_product_id: data.dynamic_product_id,
      quantity: data.quantity,
      unit_price: data.unit_price,
      amount: data.amount || data.quantity * data.unit_price,
      payment_method: data.payment_method,
      device_id: data.device_id,
      dynamic_product_imeis: data.dynamic_product_imeis || data.device_id,
      device_size: data.device_size,
      customer_id: data.customer_id,
      customer_name: data.customer_name,
      status: 'sold',
      _offline_id: data._offline_id,
      ...metadata,
    })
    .select()
    .single();

  if (error) throw error;

  // ✅ Mark synced, inventory handled by BE trigger
  await offlineCache.markSaleSynced(data._offline_id, result.id);
  await offlineCache.markQueueItemSynced(queue_id);

  return result;
}

// Update dynamic sale
export async function updateDynamicSale(item) {
  const { data, queue_id } = item;
  const cleanData = { ...data };
  delete cleanData._offline_status;
  delete cleanData._synced;
  delete cleanData._offline_id;
  delete cleanData._client_ref;
  delete cleanData.client_sale_group_ref;
  cleanData.updated_at = new Date().toISOString();

  const { data: onlineData, error } = await supabase
    .from('dynamic_sales')
    .update(cleanData)
    .eq('id', item.entity_id)
    .select()
    .single();

  if (error) throw error;

  await offlineCache.markQueueItemSynced(queue_id);
  return onlineData;
}
