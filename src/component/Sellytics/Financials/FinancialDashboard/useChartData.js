import { useMemo } from 'react';
import { parseISO, format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export const useChartData = (sales, expenses, timeGranularity, totalSales, totalCOGS, preferredCurrency) => {
  return useMemo(() => {
    // Sales trend data
    const salesByPeriod = sales.reduce((acc, sale) => {
      const date = parseISO(sale.sold_at);
      let period;
      if (timeGranularity === 'daily') {
        period = format(startOfDay(date), 'yyyy-MM-dd');
      } else if (timeGranularity === 'weekly') {
        period = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else {
        period = format(startOfMonth(date), 'yyyy-MM');
      }
      acc[period] = (acc[period] || 0) + sale.amount;
      return acc;
    }, {});

    const salesTrendData = {
      labels: Object.keys(salesByPeriod).sort(),
      datasets: [{
        label: `Money Earned ${preferredCurrency.symbol}`,
        data: Object.keys(salesByPeriod).sort().map(period => salesByPeriod[period]),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
      }],
    };

    // COGS vs Sales
    const cogsVsSalesData = {
      labels: ['Money Earned', 'Cost of Goods'],
      datasets: [{
        label: `Amount (${preferredCurrency.symbol})`,
        data: [totalSales, totalCOGS],
        backgroundColor: ['#10B981', '#EF4444'],
      }],
    };

    // Expense breakdown
    const expenseByType = expenses.reduce((acc, exp) => {
      acc[exp.expense_type] = (acc[exp.expense_type] || 0) + exp.amount;
      return acc;
    }, {});

    const expensePieData = {
      labels: Object.keys(expenseByType),
      datasets: [{
        label: `Money Spent (${preferredCurrency.symbol})`,
        data: Object.values(expenseByType),
        backgroundColor: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#6B7280'],
      }],
    };

    return {
      salesTrendData,
      cogsVsSalesData,
      expensePieData,
      expenseByType,
    };
  }, [sales, expenses, timeGranularity, totalSales, totalCOGS, preferredCurrency]);
};