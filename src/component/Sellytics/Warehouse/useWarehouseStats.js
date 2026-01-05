import { useMemo } from 'react';

export function useWarehouseStats(inventory, returnRequests, ledger) {
  return useMemo(() => {
    const totalStock = inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    const availableStock = inventory.reduce((sum, inv) => sum + (inv.available_qty || 0), 0);
    const damagedStock = inventory.reduce((sum, inv) => sum + (inv.damaged_qty || 0), 0);
    const lowStockCount = inventory.filter(inv => inv.quantity <= 10).length;
    const pendingReturns = returnRequests.filter(r => r.status === 'REQUESTED').length;
    
    const recentIn = ledger.filter(l => l.direction === 'IN').slice(0, 10).reduce((sum, l) => sum + l.quantity, 0);
    const recentOut = ledger.filter(l => l.direction === 'OUT').slice(0, 10).reduce((sum, l) => sum + l.quantity, 0);

    return { 
      totalStock, 
      availableStock, 
      damagedStock, 
      lowStockCount, 
      pendingReturns, 
      recentIn, 
      recentOut 
    };
  }, [inventory, returnRequests, ledger]);
}