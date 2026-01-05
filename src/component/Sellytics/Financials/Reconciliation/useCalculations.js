// hooks/useCalculations.js
import { useMemo } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';
import { normalizePaymentMethod, downloadCSV } from './reconciliationUtils';

export default function useCalculations(sales, reconciliationChecks) {
  const salesByPaymentMethod = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const method = normalizePaymentMethod(sale.payment_method || 'Unknown');
      acc[method] = acc[method] || { amount: 0, count: 0 };
      acc[method].amount += sale.amount;
      acc[method].count += 1;
      return acc;
    }, {});
  }, [sales]);

  const totalSalesAmount = useMemo(() => {
    return Object.values(salesByPaymentMethod).reduce((sum, { amount }) => sum + amount, 0);
  }, [salesByPaymentMethod]);

  const totalDiscrepancy = useMemo(() => {
    return reconciliationChecks.reduce((sum, check) => sum + (check.discrepancy || 0), 0);
  }, [reconciliationChecks]);

  const discrepanciesByPaymentMethod = useMemo(() => {
    return reconciliationChecks.reduce((acc, check) => {
      const method = normalizePaymentMethod(check.payment_method);
      acc[method] = acc[method] || 0;
      acc[method] += check.discrepancy || 0;
      return acc;
    }, {});
  }, [reconciliationChecks]);

  const suspiciousPatterns = useMemo(() => {
    const patterns = [];
    if (salesByPaymentMethod['Cash']?.amount > totalSalesAmount * 0.5) {
      patterns.push('High cash transactions detected (>50% of total sales). Verify cash deposits.');
    }
    const nonSoldSales = sales.filter(s => s.status !== 'sold').length;
    if (nonSoldSales > sales.length * 0.1) {
      patterns.push('Frequent non-sold transactions detected. Check for voids or cancellations.');
    }
    return patterns;
  }, [salesByPaymentMethod, totalSalesAmount, sales]);

  const handleAddCheck = async (newCheck, storeId, checkDate, timePeriod) => {
    let expectedAmount;
    if (newCheck.payment_method === 'All Payment Methods') {
      expectedAmount = totalSalesAmount;
    } else {
      expectedAmount = salesByPaymentMethod[newCheck.payment_method]?.amount || 0;
    }

    const { error } = await supabase.from('reconciliation_checks').insert({
      store_id: storeId,
      check_date: checkDate,
      period: timePeriod,
      payment_method: newCheck.payment_method.toLowerCase(),
      expected_amount: expectedAmount,
      actual_amount: newCheck.actual_amount,
      notes: newCheck.notes,
      status: newCheck.status,
    });

    if (error) throw error;
    toast.success('Reconciliation check added!');
  };

  // Add similar handlers for edit and delete...

  return {
    salesByPaymentMethod,
    totalSalesAmount,
    totalDiscrepancy,
    discrepanciesByPaymentMethod,
    suspiciousPatterns,
    downloadCSV,
    handleAddCheck,
    // ... other handlers
  };
}