import { useState, useRef, useEffect, useCallback } from 'react';

export default function useScanner({ onScan }) {
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const lastScanRef = useRef('');
  const activeEntryRef = useRef({ entryIndex: 0, deviceIndex: 0 }); // Track active row

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      setIsLoading(true);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Process scanned code
  const processScannedCode = useCallback((code) => {
    const trimmed = code.trim();
    if (!trimmed || trimmed === lastScanRef.current) return;

    lastScanRef.current = trimmed;
    setTimeout(() => (lastScanRef.current = ''), 500);

    // Pass entryIndex and deviceIndex to parent handler
    onScan({ 
      code: trimmed, 
      entryIndex: activeEntryRef.current.entryIndex, 
      deviceIndex: activeEntryRef.current.deviceIndex 
    });
    setError(null);
  }, [onScan]);

  // Keyboard scanner listener
  useEffect(() => {
    if (!showScanner) return;

    let buffer = '';
    let timeout = null;

    const handleKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;

      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          processScannedCode(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => (buffer = ''), 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [showScanner, processScannedCode]);

  // Camera mode
  useEffect(() => {
    if (showScanner) startCamera();
    return () => stopCamera();
  }, [showScanner, startCamera, stopCamera]);

  // Open scanner with entry/device index
  const openScanner = useCallback(({ entryIndex = 0, deviceIndex = 0 } = {}) => {
    activeEntryRef.current = { entryIndex, deviceIndex };
    setShowScanner(true);
    setError(null);
  }, []);

  const closeScanner = useCallback(() => {
    setShowScanner(false);
    stopCamera();
  }, [stopCamera]);

  return {
    showScanner,
    isLoading,
    error,
    videoRef,
    openScanner,
    closeScanner,
  };
}
