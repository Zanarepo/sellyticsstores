import React, { useMemo } from "react";
import { DollarSign, TrendingUp, Store, Award } from "lucide-react";
import { useCurrency } from "../../../context/currencyContext";

export default function SalesSummaryCard({ metrics }) {
  const { formatPrice } = useCurrency();

  const { totalRevenue, bestStore, avgStoreSales, totalStores } = useMemo(() => {
    if (!metrics || !metrics.storeSummary)
      return { totalRevenue: 0, bestStore: null, avgStoreSales: 0, totalStores: 0 };

    const totalRevenueSafe = Number(metrics.totalRevenue || 0);
    const stores = metrics.storeSummary;
    const best = stores.reduce(
      (best, curr) => (!best || (curr.totalSales || 0) > (best.totalSales || 0) ? curr : best),
      null
    );
    const avg = stores.length ? totalRevenueSafe / stores.length : 0;
    return { totalRevenue: totalRevenueSafe, bestStore: best, avgStoreSales: avg, totalStores: stores.length };
  }, [metrics]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      <Card icon={<DollarSign />} label="Total Revenue" value={formatPrice(totalRevenue)} bg="bg-indigo-100" color="text-indigo-600" />
      <Card icon={<TrendingUp />} label="Avg / Store" value={formatPrice(avgStoreSales)} bg="bg-emerald-100" color="text-emerald-600" />
      <Card icon={<Award />} label="Best Store" value={bestStore?.storeName || "—"} subValue={formatPrice(bestStore?.totalSales || 0)} bg="bg-amber-100" color="text-amber-600" />
      <Card icon={<Store />} label="Total Stores" value={totalStores} bg="bg-sky-100" color="text-sky-600" />
    </div>
  );
}

function Card({ icon, label, value, subValue, bg, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border flex items-center gap-3 w-full">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{label}</p>
        <p className="text-sm sm:text-base font-bold truncate">{value}</p>
        {subValue && <p className={`text-[10px] sm:text-xs ${color} truncate`}>{subValue}</p>}
      </div>
    </div>
  );
}
