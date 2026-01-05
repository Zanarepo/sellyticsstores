import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Scan, 
  X, 
  Minimize2, 
  Maximize2,
  Package,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Camera,
  Keyboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function ScannerPanel({
  isOpen,
  onClose,
  onCommit,
  onCancel,
  products = [],
  existingSerials = [],
  sessionType = 'INTAKE'
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [scanMode, setScanMode] = useState('keyboard'); // 'keyboard' | 'camera'
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const inputRef = useRef(null);
  const DEBOUNCE_TIME = 2000; // 2 seconds

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const findProduct = useCallback((code) => {
    return products.find(p => 
      p.sku === code || 
      p.product_name?.toLowerCase().includes(code.toLowerCase())
    );
  }, [products]);

  const handleScan = useCallback((code) => {
    const now = Date.now();
    const trimmedCode = code.trim();
    
    if (!trimmedCode) return;

    // Debounce duplicate scans
    if (now - lastScanTime < DEBOUNCE_TIME) {
      const lastItem = scannedItems[scannedItems.length - 1];
      if (lastItem?.serial_number === trimmedCode || lastItem?.sku === trimmedCode) {
        setDuplicateWarning('Duplicate scan detected - waiting...');
        setTimeout(() => setDuplicateWarning(null), 2000);
        return;
      }
    }
    setLastScanTime(now);

    // Check if it's a serial number (IMEI/serial)
    const isSerial = trimmedCode.length >= 10;

    if (isSerial) {
      // Prevent duplicate serial in warehouse (for intake)
      if (existingSerials.includes(trimmedCode)) {
        if (sessionType === 'INTAKE') {
          toast.error(`Serial ${trimmedCode} already exists in warehouse`);
          return;
        }
      }

      // Prevent duplicate in current session
      const existsInSession = scannedItems.some(item => item.serial_number === trimmedCode);
      if (existsInSession) {
        setDuplicateWarning(`Serial ${trimmedCode} already scanned`);
        setTimeout(() => setDuplicateWarning(null), 2000);
        return;
      }

      setScannedItems(prev => [...prev, {
        id: Date.now(),
        serial_number: trimmedCode,
        is_serialized: true,
        quantity: 1,
        scanned_at: new Date().toISOString(),
        product: null,
        needs_product_assignment: true
      }]);
      toast.success(`Scanned: ${trimmedCode}`);
    } else {
      // Non-unique product (SKU scan)
      const product = findProduct(trimmedCode);
      
      if (product) {
        const existingIndex = scannedItems.findIndex(
          item => !item.is_serialized && item.product?.id === product.id
        );

        if (existingIndex >= 0) {
          setScannedItems(prev => {
            const updated = [...prev];
            updated[existingIndex].quantity += 1;
            return updated;
          });
          toast.success(`Added 1x ${product.product_name}`);
        } else {
          setScannedItems(prev => [...prev, {
            id: Date.now(),
            sku: trimmedCode,
            is_serialized: false,
            quantity: 1,
            scanned_at: new Date().toISOString(),
            product: product,
            needs_product_assignment: false
          }]);
          toast.success(`Scanned: ${product.product_name}`);
        }
      } else {
        // Unknown code
        setScannedItems(prev => [...prev, {
          id: Date.now(),
          sku: trimmedCode,
          is_serialized: false,
          quantity: 1,
          scanned_at: new Date().toISOString(),
          product: null,
          needs_product_assignment: true
        }]);
        toast.warning(`Unknown product: ${trimmedCode}`);
      }
    }

    setScanInput('');
  }, [scannedItems, lastScanTime, existingSerials, sessionType, findProduct]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan(scanInput);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setScannedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (itemId) => {
    setScannedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const totalItems = scannedItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = new Set(scannedItems.map(i => i.product?.id || i.sku || i.serial_number)).size;

  const handleCommit = () => {
    const unassigned = scannedItems.filter(i => i.needs_product_assignment);
    if (unassigned.length > 0) {
      toast.error(`${unassigned.length} item(s) need product assignment`);
      return;
    }
    onCommit(scannedItems);
  };

  const handleCancel = () => {
    setScannedItems([]);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed right-4 top-20 z-50 ${isMinimized ? 'w-80' : 'w-96'}`}
      >
        <div className="rounded-lg shadow-2xl border-2 border-indigo-200 bg-white/95 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scan className="h-6 w-6" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {sessionType === 'INTAKE' ? 'Stock Intake' : 
                     sessionType === 'DISPATCH' ? 'Dispatch' : 
                     sessionType === 'COUNT' ? 'Stock Count' : 'Scanner'}
                  </h3>
                  {!isMinimized && (
                    <p className="text-sm opacity-90 mt-1">
                      <strong>{totalItems}</strong> items • <strong>{uniqueProducts}</strong> products
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded hover:bg-white/20 transition"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded hover:bg-white/20 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Minimized View */}
          {isMinimized && (
            <div className="p-4 bg-slate-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium">{totalItems} items scanned</span>
                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-medium">
                  {uniqueProducts} products
                </span>
              </div>
            </div>
          )}

          {/* Full View */}
          {!isMinimized && (
            <div className="p-4 space-y-4">
              {/* Scan Mode Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setScanMode('keyboard')}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                    scanMode === 'keyboard'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Keyboard className="h-4 w-4" />
                  Keyboard
                </button>
                <button
                  onClick={() => setScanMode('camera')}
                  disabled
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition opacity-50 cursor-not-allowed ${
                    scanMode === 'camera'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  Camera (Soon)
                </button>
              </div>

              {/* Scan Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Scan or type barcode/IMEI..."
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <Scan className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>

              {/* Duplicate Warning */}
              <AnimatePresence>
                {duplicateWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    {duplicateWarning}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scanned Items List */}
              <div className="h-64 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50">
                <div className="p-3 space-y-2">
                  {scannedItems.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Start scanning items...</p>
                    </div>
                  ) : (
                    scannedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border ${
                          item.needs_product_assignment 
                            ? 'border-amber-300 bg-amber-50' 
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {item.needs_product_assignment ? (
                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              )}
                              <span className="font-medium text-sm truncate">
                                {item.product?.product_name || item.serial_number || item.sku || 'Unknown'}
                              </span>
                            </div>
                            {item.serial_number && (
                              <p className="text-xs text-slate-500 font-mono mt-1 truncate">
                                {item.serial_number}
                              </p>
                            )}
                            {item.is_serialized && !item.serial_number && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-700">
                                Serial Item
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {!item.is_serialized && (
                              <>
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="p-1.5 rounded hover:bg-slate-200 transition"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-10 text-center font-bold text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="p-1.5 rounded hover:bg-slate-200 transition"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommit}
                  disabled={scannedItems.length === 0}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 font-medium text-white shadow-md hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  Commit ({totalItems})
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}