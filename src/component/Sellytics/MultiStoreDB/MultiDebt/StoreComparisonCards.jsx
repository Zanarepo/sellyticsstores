import React from "react";
import { useCurrency } from "../../../context/currencyContext";

export default function StoreComparisonCards({
  stores = [],
  compact = false,
  wrapText = false,
  topStore = null,
}) {
  const { formatPrice } = useCurrency();

  return (
    <div
      className={`grid gap-2 mb-6 ${
        compact ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
      }`}
    >
      {stores.map((store, idx) => {
        const isTopStore = topStore && store.storeName === topStore.storeName;

        return (
          <div
            key={idx}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-3 border min-h-[80px] flex flex-col justify-between ${
              isTopStore
                ? "border-red-500"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            {/* Store name + top store badge */}
            <div className="flex justify-between items-start mb-1">
              <h3
                className={`font-semibold text-gray-800 dark:text-gray-200 text-sm min-w-0 ${
                  wrapText ? "break-words" : "truncate"
                }`}
              >
                {store.storeName}
              </h3>
              {isTopStore && (
                <span className="text-red-500 font-bold text-xs ml-1">★ Highest Debt</span>
              )}
            </div>

            {/* Store metrics */}
            <div className={`flex flex-col gap-1 text-xs sm:text-sm`}>
              <p>
                Total Owed:{" "}
                <span className="font-bold">{formatPrice(store.totalOwed)}</span>
              </p>
              <p>
                Total Deposited:{" "}
                <span className="font-bold">{formatPrice(store.totalDeposited)}</span>
              </p>
              <p>
                Outstanding:{" "}
                <span className="font-bold text-red-500">{formatPrice(store.outstanding)}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
