/**
 * SwiftCheckout - Scanner Modal
 * Camera and external scanner interface
 * @version 2.0.0
 */
import React, { useRef, useEffect, useState } from 'react';
import { 
  X, Camera, Keyboard, 
  Scan, RefreshCw, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function ScannerModal({
  show,
  scannerMode,
  setScannerMode,
  continuousScan,
  setContinuousScan,
  manualInput,
  setManualInput,
  onManualSubmit,
  processScannedCode,
  onClose
}) {
  const inputRef = useRef(null);
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const audioRef = useRef(null);
  const isProcessingRef = useRef(false);
  const processScannedCodeRef = useRef(processScannedCode);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    processScannedCodeRef.current = processScannedCode;
  }, [processScannedCode]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (_) {}
    scannerRef.current = null;
    setIsScanning(false);
    isProcessingRef.current = false;
  };

  // Initialize audio once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://freesound.org/data/previews/171/171671_2437358-lq.mp3");
      audioRef.current.volume = 0.5;
      audioRef.current.preload = 'auto';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playScanSound = () => {
    if (audioRef.current && !isProcessingRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } catch (err) {}
    }
  };

  // Camera scanning with html5-qrcode
  useEffect(() => {
    if (!show || scannerMode !== 'camera') {
      stopScanner();
      return;
    }

    // Prevent multiple scanner instances
    if (scannerRef.current) {
      return;
    }

    const startScanning = async () => {
      try {
        const scanner = new Html5Qrcode("scanner-container");
        scannerRef.current = scanner;

        // Get available cameras and use the best one
        const cameras = await Html5Qrcode.getCameras();
        let cameraId = null;
        
        // Prefer back camera (environment) on mobile devices
        const backCamera = cameras.find(cam => 
          cam.label.toLowerCase().includes('back') || 
          cam.label.toLowerCase().includes('rear') ||
          cam.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          cameraId = backCamera.id;
        } else if (cameras.length > 0) {
          cameraId = cameras[0].id;
        }

        // Calculate rectangular scanning area (barcode-shaped: wider than tall)
        // Use function-based qrbox that creates a rectangular focus area
        const getQrBoxDimensions = () => {
          const viewport = Math.min(window.innerWidth, window.innerHeight);
          // Rectangle dimensions: wider than tall (typical barcode shape)
          // Width: 75% of viewport, Height: ~40% of viewport
          const width = Math.floor(viewport * 0.75);
          const height = Math.floor(viewport * 0.40);
          // Clamp dimensions for optimal mobile scanning
          return {
            width: Math.max(200, Math.min(320, width)),
            height: Math.max(120, Math.min(180, height))
          };
        };

        const qrBoxDims = getQrBoxDimensions();

        // Camera configuration with enhanced settings for Android/iOS - RECTANGULAR FOCUS
        const config = {
          fps: 30,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Return a rectangular scanning box (wider than tall - barcode shape)
            const maxWidth = Math.floor(viewfinderWidth * 0.80); // Max 80% of viewfinder width
            const maxHeight = Math.floor(viewfinderHeight * 0.45); // Max 45% of viewfinder height
            
            // Ensure it fits within viewfinder and maintains barcode-like proportions
            const width = Math.min(qrBoxDims.width, maxWidth);
            const height = Math.min(qrBoxDims.height, maxHeight);
            
            return {
              width: width,
              height: height
            };
          },
          // Remove square aspect ratio constraint for rectangular scanning
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
            focusMode: "continuous",
            // Enhanced mobile focus settings
            advanced: [
              { focusMode: "continuous" },
              { exposureMode: "continuous" },
              { whiteBalanceMode: "continuous" },
            ]
          },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.ITF,
          ],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          rememberLastUsedCamera: true,
        };

        await scanner.start(
          cameraId || { facingMode: "environment" },
          config,
          (decodedText, decodedResult) => {
            const code = decodedText.trim();
            if (!code || isProcessingRef.current) return;

            // Prevent rapid duplicate processing
            isProcessingRef.current = true;

            // Use the EXACT SAME logic as external/manual (via ref to get latest)
            processScannedCodeRef.current(code);

            // Play sound (single instance, controlled)
            playScanSound();

            // Reset processing flag after a delay to allow next scan
            setTimeout(() => {
              isProcessingRef.current = false;
            }, 500);
          },
          (errorMessage) => {
            // Silently handle scanning errors - don't spam console
          }
        );

        setIsScanning(true);
        
        // Apply additional video constraints for better focus (iOS fix)
        setTimeout(() => {
          const videoElement = document.querySelector('#scanner-container video');
          if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject;
            const track = stream.getVideoTracks()[0];
            if (track && track.getCapabilities) {
              const capabilities = track.getCapabilities();
              
              // Apply advanced settings for mobile focus optimization
              const advancedConstraints = [];
              
              // Continuous autofocus for mobile
              if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
                advancedConstraints.push({ focusMode: 'continuous' });
              }
              
              // Optimize resolution for mobile - use native or high quality
              if (capabilities.width && capabilities.height) {
                // Use higher resolution for better barcode clarity on mobile
                const preferredWidth = Math.min(1920, capabilities.width.max || 1920);
                const preferredHeight = Math.min(1080, capabilities.height.max || 1080);
                
                advancedConstraints.push({
                  width: preferredWidth,
                  height: preferredHeight
                });
              }
              
              // Exposure and white balance for better barcode capture
              if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
                advancedConstraints.push({ exposureMode: 'continuous' });
              }
              
              // Apply all constraints together
              if (advancedConstraints.length > 0) {
                track.applyConstraints({
                  advanced: advancedConstraints
                }).catch(() => {});
              }
            }
          }
        }, 500);

      } catch (err) {
        console.error('Scanner error:', err);
        setIsScanning(false);
        scannerRef.current = null;
      }
    };

    startScanning();

    return () => {
      stopScanner();
    };
  }, [show, scannerMode]); // Removed processScannedCode from dependencies to prevent restart

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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
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
                  {continuousScan ? 'Continuous mode' : 'Single scan mode'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0">
            {/* Continuous Scan Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Continuous Scan
                </span>
              </div>
              <button
                onClick={() => setContinuousScan(!continuousScan)}
                className="text-indigo-600"
              >
                {continuousScan ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setScannerMode('camera')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  scannerMode === 'camera'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Camera</span>
              </button>
              <button
                onClick={() => setScannerMode('external')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  scannerMode === 'external'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span className="text-sm font-medium">External</span>
              </button>
            </div>

            {/* Camera View */}
            {scannerMode === 'camera' && (
              <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
                <div 
                  id="scanner-container" 
                  className="w-full h-full"
                  style={{
                    minHeight: '400px',
                  }}
                />

                {/* Blur overlay - darkens/blurs everything outside rectangular scanning area */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                  {/* Top dark area */}
                  <div className="absolute top-0 left-0 right-0 bg-black/65 backdrop-blur-[3px]" style={{ height: '30%' }} />
                  {/* Bottom dark area */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/65 backdrop-blur-[3px]" style={{ height: '30%' }} />
                  {/* Left dark area */}
                  <div className="absolute left-0 bg-black/65 backdrop-blur-[3px]" style={{ top: '30%', bottom: '30%', width: '12.5%' }} />
                  {/* Right dark area */}
                  <div className="absolute right-0 bg-black/65 backdrop-blur-[3px]" style={{ top: '30%', bottom: '30%', width: '12.5%' }} />
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
                  {/* Rectangular scanning frame (barcode-shaped: wider than tall) */}
                  <div 
                    className="border-3 border-indigo-500 rounded-lg relative"
                    style={{
                      width: '75%',
                      maxWidth: '320px',
                      minWidth: '200px',
                      height: '180px',
                      maxHeight: '180px',
                      minHeight: '120px'
                    }}
                  >
                    {/* Corner indicators */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-indigo-500 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-indigo-500 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-indigo-500 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-indigo-500 rounded-br-lg" />
                    {isScanning && (
                      <motion.div
                        className="absolute inset-x-2 h-0.5 bg-indigo-400 rounded-full shadow-lg"
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </div>
                </div>

                {isScanning && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-full">
                    Scanning...
                  </div>
                )}
              </div>
            )}

            {/* External Scanner Mode */}
            {scannerMode === 'external' && (
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

        {/* Manual Input */}
<div className="space-y-2 w-full">
  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
    Manual Entry
  </label>

  <div className="flex flex-col sm:flex-row gap-2 w-full">
    <input
      ref={inputRef}
      type="text"
      value={manualInput}
      onChange={(e) => setManualInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onManualSubmit()}
      placeholder="Enter IMEI or barcode"
      className="
        w-full min-w-0
        px-4 py-3
        border border-slate-200 dark:border-slate-700
        rounded-lg
        bg-white dark:bg-slate-800
        focus:ring-2 focus:ring-indigo-500
        text-sm
      "
    />

    <button
      onClick={onManualSubmit}
      className="
        w-full sm:w-auto
        px-6 py-3
        bg-indigo-600 hover:bg-indigo-700
        text-white
        rounded-lg
        font-medium
        text-sm
        whitespace-nowrap
      "
    >
      Add
    </button>
  </div>
</div>

{/* Footer */}
<div className="p-4 sm:p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
  <button
    onClick={onClose}
    className="
      w-full
      py-3
      border border-slate-200 dark:border-slate-700
      rounded-lg
      hover:bg-slate-100 dark:hover:bg-slate-700
      font-medium
      text-sm
    "
  >
    Done
  </button>
</div>
</div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}