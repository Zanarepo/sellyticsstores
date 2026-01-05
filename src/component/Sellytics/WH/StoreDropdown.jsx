// components/StoreDropdown.js
import React from "react";

export function StoreDropdown({
  stores = [],
  selectedStore,
  onSelectStore,
  loading = false,
  disabled = false,
  label = "Store",
  placeholder = "Select a store",
}) {
  return (
    <div className="w-full">
      <label htmlFor="store-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
        {label} {stores.length > 0 && <span className="text-red-500">*</span>}
      </label>

      {loading ? (
        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-sm">
          Loading stores...
        </div>
      ) : stores.length === 0 ? (
        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 text-sm italic">
          No stores available
        </div>
      ) : (
        <select
          id="store-dropdown"
          value={selectedStore || ""}
          onChange={(e) => onSelectStore(e.target.value)}
          disabled={disabled || stores.length === 0}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm text-base
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            transition-colors duration-200
            ${disabled || stores.length === 0
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-900 cursor-pointer hover:border-gray-400"
            }
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.shop_name}
              {store.location && ` — ${store.location}`}
              {store.store_code && ` (${store.store_code})`}
            </option>
          ))}
        </select>
      )}

      {stores.length > 0 && selectedStore && (
        <p className="mt-1 text-xs text-gray-500">
          Selected: {stores.find((s) => s.id === selectedStore)?.shop_name || "Unknown"}
        </p>
      )}
    </div>
  );
}