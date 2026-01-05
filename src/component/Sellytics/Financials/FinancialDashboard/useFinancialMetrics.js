import { useMemo } from 'react';

export const useFinancialMetrics = (sales, expenses, debts, inventory, products) => {
  return useMemo(() => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalDebts = debts.reduce((sum, debt) => sum + (debt.remaining_balance || 0), 0);
    const totalInventoryCost = inventory.reduce((sum, inv) => {
      const product = products.find(p => p.id === inv.dynamic_product_id);
      return sum + (product?.purchase_price || 0) * inv.available_qty;
    }, 0);
    const totalCOGS = sales.reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.dynamic_product_id);
      return sum + (product?.purchase_price || 0) * sale.quantity;
    }, 0);
    const totalProfit = totalSales - totalCOGS - totalExpenses;
    const profitMargin = totalSales ? ((totalProfit / totalSales) * 100).toFixed(2) : 0;

    // Sales by product
    const salesByProduct = sales.reduce((acc, sale) => {
      const productName = sale.dynamic_product?.name || 'Unknown';
      if (!acc[productName]) {
        acc[productName] = { amount: 0, quantity: 0 };
      }
      acc[productName].amount += sale.amount;
      acc[productName].quantity += sale.quantity;
      return acc;
    }, {});

    const topProducts = Object.entries(salesByProduct)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));

    return {
      totalSales,
      totalExpenses,
      totalDebts,
      totalInventoryCost,
      totalCOGS,
      totalProfit,
      profitMargin,
      topProducts,
    };
  }, [sales, expenses, debts, inventory, products]);
};