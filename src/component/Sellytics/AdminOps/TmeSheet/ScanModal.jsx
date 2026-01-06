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
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setScanning(false);

    // Check for secure context
    if (window.location.protocol !== 'https:') {
      setError('Camera access requires a secure (HTTPS) connection.');
      return;
    }

    setScanning(true);
    let stream;
    try {
      const constraints = {
        video: { 
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 }, // Use a standard HD resolution
          height: { ideal: 720 }
        }
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        const videoPromise = new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Video loading timeout.')), 10000);
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timer);
            videoRef.current.play().then(resolve).catch(reject);
          };
        });

        await videoPromise;

        codeReaderRef.current = new BrowserMultiFormatReader();
        codeReaderRef.current.decodeFromVideoElement(
          videoRef.current,
          (result, err) => {
            if (result) {
              onScan(result.getText());
              stopCamera();
              onClose();
            }
            // Continuous scanning, so we don't need to handle 'err' here
            // as it fires frequently when no barcode is found.
          }
        );
        setScanning(true);
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      let errorMessage = 'Failed to start camera.';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No suitable camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use or cannot be accessed.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Camera timed out. Please try again.';
      }
      setError(errorMessage);
      setScanning(false);
      // Clean up stream if it was partially acquired
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [onClose, onScan, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleRetry = () => {
    stopCamera();
    setTimeout(startCamera, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" aria-labelledby="scan-modal-title" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 id="scan-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                Scan Barcode
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {scanning ? 'Point camera at a barcode' : 'Initializing camera...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Close scanner">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="relative aspect-video bg-slate-900">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-white font-medium mb-2">Camera Error</p>
              <p className="text-sm text-slate-300 mb-4">{error}</p>
              {error.includes('HTTPS') ? null : (
                <button onClick={handleRetry} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                aria-label="Barcode scanner video feed"
              />
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 border-2 border-white rounded-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                    </div>
                    <div className="absolute inset-x-0 h-1 bg-indigo-500 animate-scan" />
                  </div>
                </div>
              )}
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

        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Position the barcode within the frame for automatic scanning.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 4px); }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}