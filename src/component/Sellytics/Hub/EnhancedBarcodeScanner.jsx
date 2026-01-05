// EnhancedBarcodeScanner.jsx - Buttons Fixed
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Trash2, Barcode } from "lucide-react";
import toast from "react-hot-toast";
import { useEnhancedBarcodeScanner } from "./useEnhancedBarcodeScanner";
import ScannerHeader from "./ScannerEnhancedHeader";
import ScannerInputArea from "./ScannerInputArea";

export default function EnhancedBarcodeScanner({
  sessionId,
  userId,
  productType = "SERIALIZED",
  onScanUpdate,
  onClose,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    scannedItems,
    inputValue,
    setInputValue,
    inputRef,
    isListening,
    setIsListening,
    soundEnabled,
    setSoundEnabled,
    uniqueCount,
    totalCount,
    duplicateCount,
    handleScan,
    handleDelete,      // ← Now used correctly
    handleClearAll,    // ← Now used correctly
  } = useEnhancedBarcodeScanner({ sessionId, userId, productType, onScanUpdate });

  return (
    <motion.div
      layout
      className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col ${
        isExpanded ? "fixed inset-4 z-50" : "max-w-md"
      }`}
    >
      {/* Header with working minimize/expand */}
      <ScannerHeader
        productType={productType}
        totalCount={totalCount}
        uniqueCount={uniqueCount}
        duplicateCount={duplicateCount}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(prev => !prev)} // ← Proper toggle
        onClose={onClose}
      />

      <ScannerInputArea
        inputValue={inputValue}
        setInputValue={setInputValue}
        inputRef={inputRef}
        isListening={isListening}
        setIsListening={setIsListening}
        scannedItems={scannedItems}
        handleScan={handleScan}
        handleClearAll={handleClearAll} // ← Passed correctly
      />

      {/* Scanned Items List with working Delete button */}
      <div className={`flex-1 overflow-y-auto ${isExpanded ? "h-full" : "max-h-96"}`}>
        <div className="p-4 space-y-2">
          <AnimatePresence>
            {scannedItems.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Barcode className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No items scanned yet</p>
                <p className="text-sm text-slate-400 mt-1">Start scanning to add items</p>
              </motion.div>
            ) : (
              scannedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-8">#{scannedItems.length - index}</span>
                    <code className="font-mono text-sm text-slate-700 break-all">{item.scanned_value}</code>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.scanned_value);
                        toast.success("Copied!");
                      }}
                      className="p-2 rounded hover:bg-slate-100 transition"
                    >
                      <Copy className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)} // ← Works: deletes from DB + UI
                      className="p-2 rounded hover:bg-rose-100 text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}