/**
 * SwiftInventory - useLowStock Hook
 * Filters and sorts low stock items
 */
import { useMemo } from 'react';

export default function useLowStock(inventory, threshold = 5, sortBy = 'quantity') {
  const lowStockItems = useMemo(() => {
    if (!inventory?.length) return [];

    const filtered = inventory.filter(item => {
      const qty = item.available_qty ?? 0;
      return qty <= threshold;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'quantity') {
        return (a.available_qty ?? 0) - (b.available_qty ?? 0);
      } else if (sortBy === 'name') {
        const nameA = a.dynamic_product?.name || '';
        const nameB = b.dynamic_product?.name || '';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [inventory, threshold, sortBy]);

  return lowStockItems;
}