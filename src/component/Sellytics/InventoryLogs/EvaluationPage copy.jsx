
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Package, TrendingUp, AlertTriangle, 
  BarChart2, PieChart as PieChartIcon, ArrowUp, ArrowDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import useCurrency from './hooks/useCurrency'; // Adjust path if needed

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function EvaluationPage({ inventory }) {
  // Use the currency formatter correctly from the hook
  const { formatPrice } = useCurrency();

  // Calculate all metrics
  const metrics = useMemo(() => {
    if (!inventory?.length) return null;

    let totalCostValue = 0;
    let totalRetailValue = 0;
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryData = {};

    inventory.forEach(item => {
      const product = item.dynamic_product;
      if (!product) return;

      const qty = item.available_qty || 0;
      const costPrice = product.purchase_price || 0;
      const sellPrice = product.selling_price || 0;

      totalUnits += qty;
      totalCostValue += qty * costPrice;
      totalRetailValue += qty * sellPrice;

      if (qty === 0) outOfStockCount++;
      else if (qty <= 5) lowStockCount++;

      const category = product.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = { name: category, value: 0, units: 0 };
      }
      categoryData[category].value += qty * costPrice;
      categoryData[category].units += qty;
    });

    const potentialProfit = totalRetailValue - totalCostValue;
    const profitMargin = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

    return {
      totalCostValue,
      totalRetailValue,
      potentialProfit,
      profitMargin,
      totalUnits,
      totalProducts: inventory.length,
      lowStockCount,
      outOfStockCount,
      categoryData: Object.values(categoryData).sort((a, b) => b.value - a.value),
    };
  }, [inventory]);

  // Top 10 products by inventory value
  const topProducts = useMemo(() => {
    if (!inventory?.length) return [];

    return inventory
      .map(item => ({
        name: item.dynamic_product?.name || 'Unknown',
        value: (item.available_qty || 0) * (item.dynamic_product?.purchase_price || 0),
        qty: item.available_qty || 0,
      }))
      .filter(p => p.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [inventory]);

  if (!metrics) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No inventory data to evaluate</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Cost Value</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formatPrice(metrics.totalCostValue)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Retail Value</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formatPrice(metrics.totalRetailValue)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Units</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {metrics.totalUnits.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              metrics.profitMargin >= 30 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : metrics.profitMargin >= 15 
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {metrics.profitMargin >= 20 ? (
                <ArrowUp className={`w-6 h-6 ${metrics.profitMargin >= 30 ? 'text-emerald-600' : 'text-amber-600'}`} />
              ) : (
                <ArrowDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">Profit Margin</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {metrics.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stock Alerts */}
      {(metrics.lowStockCount > 0 || metrics.outOfStockCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.outOfStockCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  {metrics.outOfStockCount} products out of stock
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Restock immediately</p>
              </div>
            </div>
          )}
          {metrics.lowStockCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  {metrics.lowStockCount} products low on stock
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Consider restocking soon</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Value */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Top Products by Value</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  tickFormatter={(v) => formatPrice(v).replace(/[^0-9.km]/g, '') + (v >= 1000000 ? 'M' : v >= 1000 ? 'k' : '')}
                />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => formatPrice(value)}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Value by Category</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatPrice(value)}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {metrics.categoryData.slice(0, 6).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 dark:text-slate-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Potential Profit Highlight */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100">Potential Profit</p>
            <p className="text-3xl font-bold mt-1">{formatPrice(metrics.potentialProfit)}</p>
            <p className="text-sm text-indigo-200 mt-2">
              If all {metrics.totalUnits.toLocaleString()} units are sold at retail price
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}