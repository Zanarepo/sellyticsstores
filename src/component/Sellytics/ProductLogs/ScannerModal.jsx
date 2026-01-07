/**
 * Product Catalogue - Scanner Modal
 * Uses proven html5-qrcode pattern that works perfectly on mobile
 */
import React, { useRef, useEffect, useState } from 'react';
import { 
  X, Camera, Keyboard, Loader2, AlertCircle, 
  Scan, RefreshCw, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';

const playSuccessSound = () => {
  new Audio("https://freesound.org/data/previews/171/171671_2437358-lq.mp3")
    .play()
    .catch(() => {});
};

export default function ScannerModal({
  show,
  scannerMode,
  setScannerMode,
  continuousScan,
  setContinuousScan,
  isLoading,
  error,
  manualInput,
  setManualInput,
  onManualSubmit,
  onClose
}) {
  const inputRef = useRef(null);
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  // Auto-focus manual input
  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  // Safe stop function — same pattern as your working example
  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (_) {
      // Silently ignore — this is expected on mode switch or fast close
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  // Camera scanning — exactly like your working simple version
  useEffect(() => {
    if (!show || scannerMode !== 'camera') {
      stopScanner();
      return;
    }

    const initScanner = async () => {
      try {
        setScanError(null);
        const scanner = new Html5Qrcode("scanner-container");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 100 },
            aspectRatio: 1.777778,
          },
          (decodedText) => {
            const code = decodedText.trim();
            if (!code) return;

            playSuccessSound();
            onManualSubmit({ preventDefault: () => {} }, code);

            if (!continuousScan) {
              stopScanner(); // Safe stop
            }
          },
          () => {
            // Suppress frame errors
          }
        );

        setIsScanning(true);
      } catch (err) {
        setScanError('Camera access denied or unavailable.');
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      stopScanner();
    };
  }, [show, scannerMode, continuousScan, onManualSubmit]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Scan className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Scan Product</h2>
                <p className="text-xs text-slate-500">
                  {continuousScan ? 'Continuous mode' : 'Single scan mode'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium">Continuous Scan</span>
              </div>
              <button onClick={() => setContinuousScan(!continuousScan)}>
                {continuousScan ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setScannerMode('camera')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  scannerMode === 'camera'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Camera</span>
              </button>
              <button
                onClick={() => setScannerMode('external')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  scannerMode === 'external'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span className="text-sm font-medium">External</span>
              </button>
            </div>

            {scannerMode === 'camera' && (
              <div className="space-y-3">
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Starting camera...</span>
                  </div>
                )}

                <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
                  <div id="scanner-container" className="w-full h-full" />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-72 h-24 border-2 border-indigo-400 rounded-lg relative">
                      <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                      {isScanning && (
                        <motion.div
                          className="absolute left-2 right-2 h-0.5 bg-indigo-400 shadow-lg"
                          animate={{ top: ['10%', '90%', '10%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </div>
                  </div>

                  {isScanning && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Scanning...
                    </div>
                  )}
                </div>
              </div>
            )}

            {scannerMode === 'external' && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                  <Keyboard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="font-medium">Ready for scanner input</p>
                <p className="text-sm text-slate-500 mt-1">Point your barcode scanner at the product</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-500">Listening...</span>
                </div>
              </div>
            )}

            {(error || scanError) && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">{error || scanError}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Manual Entry</label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onManualSubmit()}
                  placeholder="Enter IMEI or barcode"
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={onManualSubmit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
            >
              Done Scanning
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}