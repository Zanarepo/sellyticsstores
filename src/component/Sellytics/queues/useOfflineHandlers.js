import { useSalesOfflineSync } from '../Sales/hooks/useSalesOfflineSync';
import { useInventoryOfflineSync } from '../InventoryLogs/hooks/useInventoryOfflineSync';
// import { useProductsOfflineSync } from '../products/useProductsOfflineSync';

export function useOfflineHandlers(sharedRefs) {
  return {
    ...useSalesOfflineSync(sharedRefs),
    ...useInventoryOfflineSync(sharedRefs),
    // ...useProductsOfflineSync(sharedRefs),
  };
}
