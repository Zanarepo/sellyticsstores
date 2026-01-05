// ScannerInputArea.jsx
import React from "react";
import { Scan, Trash2 } from "lucide-react";

export default function ScannerInputArea({
  inputValue,
  setInputValue,
  inputRef,
  isListening,
  setIsListening,
  scannedItems,
  handleScan,
  handleClearAll,
}) {
  return (
    <div className="p-4 border-b border-slate-100 bg-slate-50">
      <div className="relative">
        <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue.trim()) {
              e.preventDefault();
              handleScan(inputValue);
            }
          }}
          placeholder={isListening ? "Scan or type + Enter..." : "Scanner paused"}
          disabled={!isListening}
          autoFocus
          className="w-full pl-12 pr-12 py-6 text-lg font-mono bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition"
        />
        {inputValue.trim() && (
          <button
            onClick={() => handleScan(inputValue)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            Add
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isListening}
            onChange={(e) => setIsListening(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-600">Auto-focus scanner</span>
        </label>

        {scannedItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1 hover:bg-rose-50 px-3 py-1 rounded transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}