// ScannerPlaceholder.jsx
import React from "react";
import { Scan } from "lucide-react";

export default function ScannerPlaceholder({ selectedProduct }) {
  if (!selectedProduct || !["SERIALIZED", "BATCH"].includes(selectedProduct.product_type)) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <Scan className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="font-medium text-slate-600 mb-2">Scanner Ready</h3>
        <p className="text-sm text-slate-400">Activate to start scanning barcodes</p>
      </div>
    </div>
  );
}