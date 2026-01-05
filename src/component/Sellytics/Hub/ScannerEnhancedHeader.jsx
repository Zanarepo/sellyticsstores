// ScannerHeader.jsx
import React from "react";
import { Scan, Volume2, VolumeX, Maximize2, Minimize2, X, Hash, Barcode, AlertTriangle } from "lucide-react";

export default function ScannerHeader({
  productType,
  totalCount,
  uniqueCount,
  duplicateCount,
  soundEnabled,
  setSoundEnabled,
  isExpanded,
  onToggleExpand,
  onClose,
}) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Barcode Scanner</h3>
            <p className="text-xs opacity-70">
              {productType === "SERIALIZED" ? "Unique codes only" : "Batch scanning"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded hover:bg-white/10">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={onToggleExpand} className="p-2 rounded hover:bg-white/10">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 opacity-70" />
          <span className="text-2xl font-bold">{totalCount}</span>
          <span className="text-xs opacity-70">total</span>
        </div>
        <div className="flex items-center gap-2">
          <Barcode className="w-4 h-4 text-emerald-300" />
          <span className="text-2xl font-bold text-emerald-300">{uniqueCount}</span>
          <span className="text-xs opacity-70">unique</span>
        </div>
        {duplicateCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span className="text-lg font-bold text-amber-300">{duplicateCount}</span>
            <span className="text-xs opacity-70">blocked</span>
          </div>
        )}
      </div>
    </div>
  );
}