/**
 * Returns Stats Hook
 */
import { useMemo } from 'react';

export default function useReturnsStats(returns) {
  const stats = useMemo(() => {
    const totalReturns = returns.length;
    const totalValue = returns.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Analyze reasons
    const reasonsMap = {};
    returns.forEach(r => {
      if (r.remark) {
        const reason = r.remark.trim().toLowerCase();
        reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
      }
    });

    const topReasons = Object.entries(reasonsMap)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Status breakdown
    const statusMap = {};
    returns.forEach(r => {
      const status = r.status || 'Unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return {
      totalReturns,
      totalValue,
      topReasons,
      statusBreakdown: statusMap,
      averageValue: totalReturns > 0 ? totalValue / totalReturns : 0
    };
  }, [returns]);

  return stats;
}