import React from "react";

export default function RestockHeader({ storeName }) {
  return (
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">
      Market Demand Recommendations for {storeName || "Store"}
    </h2>
  );
}
