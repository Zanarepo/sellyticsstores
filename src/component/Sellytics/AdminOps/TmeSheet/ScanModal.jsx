// components/attendance/ScanModal.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function ScanModal({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    // Stop the code reader
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
    setError(null);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setScanning(true);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(resolve)
              .catch(reject);
          };

          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Video loading timeout')), 10000);
        });

        // Initialize barcode scanner
        codeReaderRef.current = new BrowserMultiFormatReader();
        
        // Start decoding
        codeReaderRef.current.decodeFromVideoElement(
          videoRef.current,
          (result, error) => {
            if (result) {
              const code = result.getText();
              console.log('Scanned code:', code);
              onScan(code);
              stopCamera();
              onClose();
            }
            // Ignore decode errors, just keep scanning
          }
        );

        setScanning(true);
        setError(null);
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'Failed to start camera';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setScanning(false);
    }
  }, [onClose, onScan, stopCamera]);

  useEffect(() => {
    if (!isOpen) {
      // Clean up when modal closes
      stopCamera();
      return;
    }

    // Start camera when modal opens
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleRetry = () => {
    stopCamera();
    setTimeout(() => startCamera(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Scan Barcode
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {scanning ? 'Point camera at barcode' : 'Initializing camera...'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-slate-900">
          {error ? (
            // Error State
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-white font-medium mb-2">Camera Error</p>
              <p className="text-sm text-slate-300 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            // Video Feed
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Scanning Overlay */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    {/* Scanning Frame */}
                    <div className="absolute inset-0 border-2 border-white rounded-lg">
                      {/* Corner decorations */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                    </div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-0 h-1 bg-indigo-500 animate-scan" />
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {!scanning && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-sm">Starting camera...</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Position the barcode within the frame to scan automatically
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}