import React from "react";
import { Star } from "lucide-react";

export default function StoreComparisonCards({ stores, compact, wrapText, topStore }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
      {stores.map((store) => (
        <div
          key={store.storeId}
          className="bg-white dark:bg-slate-800 p-3 rounded-lg border flex flex-col gap-1"
        >
          <div className="flex justify-between items-center">
            <h3 className={`text-sm font-bold truncate ${wrapText ? "break-words" : ""}`}>{store.storeName}</h3>
            {store.storeId === topStore?.storeId && <Star className="text-yellow-400 w-4 h-4" />}
          </div>
          <p className="text-[10px] text-slate-500">Available</p>
          <p className="text-sm font-bold">{store.totalAvailable}</p>
          <p className="text-[10px] text-slate-500">Sold</p>
          <p className="text-sm font-bold">{store.totalSold}</p>
        </div>
      ))}
    </div>
  );
}
