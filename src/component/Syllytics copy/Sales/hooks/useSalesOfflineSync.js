import offlineCache from '../../db/offlineCache';
import { createSaleGroup, createDynamicSale, updateDynamicSale } from './salesSyncHandlers';
import { supabase } from '../../../../supabaseClient';

export function useSalesOfflineSync() {
  const saleGroupMapRef = { current: {} };

  return {
    sale_groups: {
      create: async (item) => {
        const result = await createSaleGroup(item);
        saleGroupMapRef.current[item.data._offline_id] = result.id;
        return { success: true, result };
      },
    },
    dynamic_sales: {
      create: async (item) => {
        const { data, client_ref, queue_id } = item;

        // Prevent duplicate
        if (client_ref) {
          const { data: existing } = await supabase
            .from('dynamic_sales')
            .select('id')
            .eq('device_id', data.device_id)
            .eq('created_by_email', data.created_by_email)
            .limit(1);

          if (existing?.length > 0) {
            await offlineCache.markQueueItemSynced(queue_id);
            await offlineCache.markSaleSynced(data._offline_id, existing[0].id);
            return { success: true, skipped: true };
          }
        }

        const result = await createDynamicSale(item, saleGroupMapRef);
        return { success: true, result };
      },
      update: async (item) => {
        const result = await updateDynamicSale(item);
        return { success: true, result };
      },
    },
  };
}
