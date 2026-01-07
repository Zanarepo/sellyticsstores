import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function useScanner({ onScanItem, onScanComplete }) {
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState('external');
  const [continuousScan, setContinuousScan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');

  const [, setScannedItems] = useState([]);
  const [scanningFor, setScanningFor] = useState('standard');

  const lastScanRef = useRef('');

  const closeScanner = useCallback(() => {
    setShowScanner(false);
    setManualInput('');
    setError(null);
    setScannedItems([]);
    setScanningFor('standard');
  }, []);

  const processScannedCode = useCallback((barcode) => {
    const code = barcode.trim();
    if (!code || code === lastScanRef.current) return;

    lastScanRef.current = code;
    setTimeout(() => { lastScanRef.current = ''; }, 800);

    setScannedItems(prev => {
      if (scanningFor === 'unique' && prev.some(i => i.code === code)) {
        toast.error('Duplicate IMEI detected', { icon: '⚠️' });
        return prev;
      }

      const newItem = { code, size: '', id: Date.now() + Math.random() };
      setError(null);
      onScanItem?.(newItem);

      if (scanningFor === 'standard') {
        onScanComplete?.([newItem]);
        if (!continuousScan) setTimeout(closeScanner, 150);
        return [newItem];
      }

      return [...prev, newItem];
    });
  }, [scanningFor, onScanItem, onScanComplete, continuousScan, closeScanner]);

  const openScanner = useCallback((type = 'standard', mode = 'external') => {
    setScanningFor(type);
    setScannedItems([]);
    setScannerMode(mode);
    setShowScanner(true);
    setError(null);
    setManualInput('');
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  const handleManualSubmit = useCallback(() => {
    if (!manualInput.trim()) {
      toast.error('Please enter a code');
      return;
    }
    processScannedCode(manualInput.trim());
    setManualInput('');
  }, [manualInput, processScannedCode]);

  useEffect(() => {
    if (!showScanner || scannerMode !== 'external') return;

    let buffer = '';
    let timeout = null;

    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;

      if (e.key === 'Enter') {
        if (buffer) {
          processScannedCode(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { buffer = ''; }, 100);
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(timeout);
    };
  }, [showScanner, scannerMode, processScannedCode]);

  return {
    showScanner,
    scannerMode,
    setScannerMode,
    continuousScan,
    setContinuousScan,
    isLoading,
    error,
    manualInput,
    setManualInput,
    handleManualSubmit,
    openScanner,
    closeScanner,
  };
}