import React, { useMemo } from "react";
import { useCurrency } from "../../../context/currencyContext";

export default function StoreComparisonCards({ stores }) {
  const { formatPrice } = useCurrency();

  const safeStores = useMemo(
    () => (stores || []).map(store => ({ ...store, totalSalesSafe: Number(store.totalSales || 0) })),
    [stores]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
      {safeStores.map(store => (
        <div key={store.storeName} className="bg-white dark:bg-slate-800 p-3 rounded-lg border">
          <p className="text-xs font-semibold truncate">{store.storeName}</p>
          <p className="text-sm font-bold text-indigo-600">{formatPrice(store.totalSalesSafe)}</p>
        </div>
      ))}
    </div>
  );
}
