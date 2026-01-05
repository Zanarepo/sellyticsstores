/**
 * SwiftInventory - Scanner Hook
 * Manual and external scanner integration
 */
import { useState, useRef, useCallback, useEffect } from 'react';

export default function useScanner(onScanSuccess) {
  // ------------------- STATE -------------------
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState('external'); // 'external' only
  const [continuousScan, setContinuousScan] = useState(false);
  const [isLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');

  // ------------------- REFS -------------------
  const videoRef = useRef(null);
  const lastScanRef = useRef('');

  // ------------------- ACTIONS -------------------

  const closeScanner = useCallback(() => {
    setShowScanner(false);
    setManualInput('');
    setError(null);
  }, []);

  // Handle external scan
  const handleExternalScan = useCallback(
    async (barcode) => {
      if (barcode === lastScanRef.current) return;
      lastScanRef.current = barcode;

      setTimeout(() => {
        lastScanRef.current = '';
      }, 2000);

      try {
        const result = await onScanSuccess(barcode.trim());

        if (result.success) {
          console.log(`Scanned: ${result.productName || barcode}`);
          if (!continuousScan) closeScanner();
        } else {
          console.error(result.error || 'Product not found');
        }
      } catch (err) {
        console.error(err);
      }
    },
    [onScanSuccess, continuousScan, closeScanner]
  );

  // Handle external scanner input
  useEffect(() => {
    if (!showScanner || scannerMode !== 'external') return;

    let buffer = '';
    let timeout = null;

    const handleKeyDown = (e) => {
      // Enter triggers scan
      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          handleExternalScan(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          buffer = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [showScanner, scannerMode, handleExternalScan]);

  // Manual submit
  const handleManualSubmit = useCallback(async () => {
    if (!manualInput.trim()) return;

    try {
      const result = await onScanSuccess(manualInput.trim());

      if (result.success) {
        console.log(`Added: ${result.productName || manualInput}`);
        setManualInput('');

        if (!continuousScan) closeScanner();
      } else {
        console.error(result.error || 'Product not found');
      }
    } catch (err) {
      console.error(err);
    }
  }, [manualInput, onScanSuccess, continuousScan, closeScanner]);

  // Open scanner
  const openScanner = useCallback(() => {
    setScannerMode('external');
    setShowScanner(true);
    setError(null);
  }, []);

  // ------------------- RETURN -------------------
  return {
    showScanner,
    scannerMode,
    setScannerMode,
    continuousScan,
    setContinuousScan,
    isLoading,
    error,
    videoRef,
    manualInput,
    setManualInput,
    handleManualSubmit,
    openScanner,
    closeScanner,
  };
}
