/**
 * SwiftCheckout - Scanner Modal Component
 * Camera and external scanner support with continuous mode
 */
import React, { useEffect, useRef } from 'react';

import 'react-toastify/dist/ReactToastify.css';
import { X, Camera, Keyboard, Loader2, AlertCircle, Scan, RotateCcw, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScannerModal({
  isOpen,
  isCameraMode,
  isContinuousMode,
  isLoading,
  error,
  manualInput,
  videoRef,
  scannerDivRef,
  onClose,
  onManualInputChange,
  onManualSubmit,
  onModeChange,
  onContinuousModeChange,
  setError
}) {
  const inputRef = useRef(null);
  
  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isCameraMode]);
  
  if (!isOpen) return null;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onManualSubmit();
    }
  };
  
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
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Scan className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Scan Product
                </h2>
                <p className="text-xs text-slate-500">
                  {isContinuousMode ? 'Continuous mode' : 'Single scan mode'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="p-5 space-y-5">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => onModeChange(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  isCameraMode
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Camera</span>
              </button>
              <button
                onClick={() => onModeChange(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  !isCameraMode
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span className="text-sm font-medium">External</span>
              </button>
            </div>
            
            {/* Continuous Mode Toggle */}
            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Continuous Scanning
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isContinuousMode}
                onClick={() => onContinuousModeChange(!isContinuousMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isContinuousMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isContinuousMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
            
            {/* Camera View */}
            {isCameraMode && (
              <div className="space-y-3">
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Starting camera...</span>
                  </div>
                )}
                
                <div
                  ref={scannerDivRef}
                  className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden"
                >
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {/* Scanner Frame */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-24 border-2 border-indigo-400 rounded-lg relative">
                      <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                      {/* Scan line animation */}
                      <motion.div
                        className="absolute left-2 right-2 h-0.5 bg-indigo-400"
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* External Scanner Mode */}
            {!isCameraMode && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                  <Keyboard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-slate-900 dark:text-white font-medium">
                  Ready for scanner input
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Point your barcode scanner at the product
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-500">Listening...</span>
                </div>
              </div>
            )}
            
            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </div>
            )}
            
            {/* Manual Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Manual Entry
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualInput}
                  onChange={(e) => onManualInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter IMEI or barcode"
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  onClick={onManualSubmit}
                  disabled={!manualInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button 
              onClick={onClose}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Done Scanning
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}