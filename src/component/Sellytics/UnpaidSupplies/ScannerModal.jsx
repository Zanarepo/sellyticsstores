/**
 * SwiftCheckout - Scanner Modal for UnpaidSupplies
 * Camera and external scanner interface with square focus box
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

  // Camera scanning with html5-qrcode - SQUARE FOCUS BOX
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

        // Calculate square scanning area (focused for mobile)
        const getQrBoxSize = () => {
          const viewport = Math.min(window.innerWidth, window.innerHeight);
          // Square: 60% of smaller viewport dimension
          const size = Math.floor(viewport * 0.60);
          // Clamp between 200-280 for optimal mobile scanning
          return Math.max(200, Math.min(280, size));
        };

        const qrBoxSize = getQrBoxSize();

        // Camera configuration with enhanced settings for Android/iOS - SQUARE FOCUS
        const config = {
          fps: 30,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Return a square scanning box
            const size = qrBoxSize;
            const minEdgePercentage = 0.60; // 60% of viewfinder width
            const minEdgeSize = Math.floor(viewfinderWidth * minEdgePercentage);
            const finalSize = Math.min(size, minEdgeSize);
            return {
              width: finalSize,
              height: finalSize
            };
          },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
            focusMode: "continuous",
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b dark:border-slate-800 flex-shrink-0">
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

          <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0">
            {/* Continuous Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium">Continuous Scan</span>
              </div>
              <button onClick={() => setContinuousScan(!continuousScan)}>
                {continuousScan ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button onClick={() => setScannerMode('camera')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 ${scannerMode === 'camera' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-slate-300'}`}>
                <Camera className="w-4 h-4" />
                Camera
              </button>
              <button onClick={() => setScannerMode('external')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 ${scannerMode === 'external' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-slate-300'}`}>
                <Keyboard className="w-4 h-4" />
                External
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

                {/* Blur overlay - darkens/blurs everything outside square scanning area */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                  {/* Top dark area */}
                  <div className="absolute top-0 left-0 right-0 bg-black/65 backdrop-blur-[3px]" style={{ height: '20%' }} />
                  {/* Bottom dark area */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/65 backdrop-blur-[3px]" style={{ height: '20%' }} />
                  {/* Left dark area */}
                  <div className="absolute left-0 bg-black/65 backdrop-blur-[3px]" style={{ top: '20%', bottom: '20%', width: '20%' }} />
                  {/* Right dark area */}
                  <div className="absolute right-0 bg-black/65 backdrop-blur-[3px]" style={{ top: '20%', bottom: '20%', width: '20%' }} />
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
                  {/* Square scanning frame (centered) */}
                  <div 
                    className="border-3 border-indigo-500 rounded-xl relative"
                    style={{
                      width: '60%',
                      maxWidth: '280px',
                      minWidth: '200px',
                      aspectRatio: '1 / 1'
                    }}
                  >
                    {/* Corner indicators */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                    {isScanning && (
                      <motion.div
                        className="absolute inset-x-4 h-1 bg-indigo-400 rounded-full shadow-lg"
                        animate={{ top: ['20%', '80%', '20%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                </div>

                {isScanning && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-full z-10">
                    Scanning...
                  </div>
                )}
              </div>
            )}

            {/* External Mode */}
            {scannerMode === 'external' && (
              <div className="text-center py-12">
                <Keyboard className="w-20 h-20 mx-auto text-indigo-600 mb-4" />
                <p className="text-lg font-semibold">Ready for external scanner</p>
              </div>
            )}

           {/* Manual Entry */}
<div className="space-y-2 w-full">
  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
    Manual Entryss
  </label>

  <div className="flex flex-col sm:flex-row gap-2 w-full">
    <input
      ref={inputRef}
      type="text"
      value={manualInput}
      onChange={(e) => setManualInput(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onManualSubmit()}
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
