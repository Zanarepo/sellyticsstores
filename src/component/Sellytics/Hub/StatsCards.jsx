// components/StatsCards.jsx - Now includes Total Inventory Value
import React from "react";
import { useCurrency } from "../../context/currencyContext" // ← Added

export default function StatsCards({ totalStock, availableStock, totalValue = 0 }) {
  const { formatPrice } = useCurrency(); // ← Get formatPrice for beautiful currency display

  return (
    <div className="flex items-center gap-8  dark:bg-slate-950 dark:text-white">
      {/* Total Stock */}
      <div className="text-right">
        <p className="text-2xl font-bold text-slate-900">
          {totalStock.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500">Total Stock</p>
      </div>

      {/* Available Stock */}
      <div className="text-right">
        <p className="text-2xl font-bold text-emerald-600">
          {availableStock.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500">Available</p>
      </div>

      {/* Total Inventory Value */}
      <div className="text-right">
        <p className="text-2xl font-bold text-indigo-600">
          {formatPrice(totalValue)}
        </p>
        <p className="text-xs text-slate-500">Inventory Value</p>
      </div>
    </div>
  );
}