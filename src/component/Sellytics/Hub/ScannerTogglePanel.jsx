// ScannerTogglePanel.jsx
import React from "react";
import { Scan, Check } from "lucide-react";
import { useSession } from "./useSession";

export default function ScannerTogglePanel({
  selectedProduct,
  scannerActive,
  startScanSession,
}) {
  useSession();

  if (!selectedProduct || !["SERIALIZED", "BATCH"].includes(selectedProduct.product_type)) {
    return null;
  }

  return (
    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-emerald-900">Barcode Scanner</p>
          <p className="text-sm text-emerald-600">
            {selectedProduct.product_type === "SERIALIZED"
              ? "Scan unique serial numbers"
              : "Scan to count items"}
          </p>
        </div>
        {!scannerActive ? (
          <button
            onClick={startScanSession}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 font-medium"
          >
            <Scan className="w-4 h-4" />
            Activate
          </button>
        ) : (
          <span className="inline-flex items-center px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium">
            <Check className="w-4 h-4 mr-1" />
            Active
          </span>
        )}
      </div>
    </div>
  );
}