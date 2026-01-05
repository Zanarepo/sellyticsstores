import offlineCache from '../../db/offlineCache';
import {
  createSaleGroup,
  createDynamicSale,
  updateDynamicSale,
} from './salesSyncHandlers';
import { supabase } from '../../../../supabaseClient';

export function useSalesOfflineSync(sharedRefs) {
  // 🔗 Shared dependency memory (owned by parent)
  const saleGroupMap = sharedRefs.saleGroupMap;

  return {
    sale_groups: {
      create: async (item) => {
        const result = await createSaleGroup(item);

        // Map offline → online sale group id
       saleGroupMap[item.data._client_ref] = result.id;


        return { success: true, result };
      },
    },

    dynamic_sales: {
      create: async (item) => {
        const { data, client_ref, queue_id } = item;

        // 🛑 Prevent duplicate uploads
        if (client_ref) {
          const { data: existing } = await supabase
            .from('dynamic_sales')
            .select('id')
            .eq('device_id', data.device_id)
            .eq('created_by_email', data.created_by_email)
            .limit(1);

          if (existing?.length > 0) {
            await offlineCache.markQueueItemSynced(queue_id);
            await offlineCache.markSaleSynced(
              data._offline_id,
              existing[0].id
            );
            return { success: true, skipped: true };
          }
        }

       const result = await createDynamicSale(item, saleGroupMap);

        return { success: true, result };
      },

    update: async (item) => {
  const result = await updateDynamicSale(item);

  // IMPORTANT: Mark the sale and queue as synced
  await offlineCache.markSaleSynced(
    item.data._offline_id,  // offlineId
    item.entity_id         // serverId (or local ID if no server ID)
  );

  await offlineCache.markQueueItemSynced(item.client_ref || item.queue_id);

  return { success: true, result };
},
    },
  };
}
