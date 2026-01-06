// components/attendance/ScanModal.jsx
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function ScanModal({ isOpen, onClose, onScan }) {
  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Handle webcam ready
  const handleUserMedia = () => {
    console.log('Webcam ready');
    setIsReady(true);
    setError(null);
  };

  // Handle webcam error
  const handleUserMediaError = (err) => {
    console.error('Webcam error:', err);
    setError('Camera access denied or unavailable');
    setIsReady(false);
  };

  // Start scanning when webcam is ready
  useEffect(() => {
    if (!isOpen || !isReady || !webcamRef.current?.video) return;

    let mounted = true;
    const reader = codeReader.current; // Copy ref to variable

    const startScanning = async () => {
      try {
        console.log('Starting scanner...');
        
        await reader.decodeFromVideoDevice(
          undefined,
          webcamRef.current.video,
          (result, err) => {
            if (result && mounted) {
              console.log('Code detected:', result.text);
              onScan(result.text);
              reader.reset();
            }
          }
        );
      } catch (err) {
        console.error('Scanner error:', err);
        if (mounted) {
          setError('Failed to start scanner: ' + err.message);
        }
      }
    };

    const timeout = setTimeout(startScanning, 300);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      reader.reset(); // Use the copied variable
    };
  }, [isOpen, isReady, onScan]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsReady(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const videoConstraints = {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Scan QR/Barcode</h3>
        
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            screenshotFormat="image/jpeg"
          />
          
          {/* Loading state */}
          {!isReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white">Starting camera...</div>
            </div>
          )}
          
          {/* Scanning overlay */}
          {isReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-green-500 w-48 h-48 rounded-lg shadow-lg"></div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
            <div className="mt-2 text-xs">
              Please check:
              <ul className="list-disc list-inside mt-1">
                <li>Camera permissions in browser settings</li>
                <li>No other app is using the camera</li>
                <li>You're on HTTPS or localhost</li>
              </ul>
            </div>
          </div>
        )}

        {isReady && !error && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Position the code within the green frame
          </div>
        )}

        <button 
          onClick={onClose} 
          className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}