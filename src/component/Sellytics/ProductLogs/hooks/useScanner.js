import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function useScanner({ onScanItem, onScanComplete }) {
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState('external');
  const [continuousScan, setContinuousScan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');

  const [scannedItems, setScannedItems] = useState([]); // Now used for batch tracking
  const [scanningFor, setScanningFor] = useState('standard');

  const lastScanRef = useRef('');
  const scanTimeoutRef = useRef(null);
  const isProcessingRef = useRef(false);

  const closeScanner = useCallback(() => {
    setShowScanner(false);
    setManualInput('');
    setError(null);
    setScannedItems([]);
    setScanningFor('standard');
    lastScanRef.current = '';
    isProcessingRef.current = false;
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  }, []);

  // SAME LOGIC FOR ALL SCAN METHODS (external, manual, AND camera)
  const processScannedCode = useCallback((barcode) => {
    const code = barcode.trim();
    if (!code) return;

    // Prevent duplicate scans with improved debouncing
    if (code === lastScanRef.current || isProcessingRef.current) {
      return;
    }

    // Mark as processing to prevent rapid duplicate scans
    isProcessingRef.current = true;
    lastScanRef.current = code;

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Reset the last scan reference after a longer delay (2 seconds for camera scans)
    scanTimeoutRef.current = setTimeout(() => { 
      lastScanRef.current = '';
      isProcessingRef.current = false;
      scanTimeoutRef.current = null;
    }, 2000);

    setScannedItems(prev => {
      // Duplicate guard for unique mode
      if (scanningFor === 'unique' && prev.some(i => i.code === code)) {
        // Non-intrusive duplicate notification
        toast('Duplicate detected', { 
          icon: '⚠️',
          duration: 1200,
          position: 'top-right',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            maxWidth: '200px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        });
        return prev;
      }

      const newItem = { code, size: '', id: Date.now() + Math.random() };

      // Always trigger onScanItem (this updates the form UI)
      onScanItem?.(newItem);

      // Success notification for successful scan (non-intrusive)
      const successMessage = scanningFor === 'unique' 
        ? `✓ ${code.substring(0, 10)}...` 
        : `✓ Scanned`;
      
      toast.success(successMessage, {
        duration: 1200,
        position: 'top-right',
        style: {
          background: '#D1FAE5',
          color: '#065F46',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          maxWidth: '180px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#FFFFFF',
        },
      });

      // For non-unique: auto-complete after first scan
      if (scanningFor === 'standard') {
        onScanComplete?.([newItem]);
        if (!continuousScan) {
          setTimeout(closeScanner, 150);
        }
        return [newItem];
      }

      // Unique mode: accumulate
      return [...prev, newItem];
    });

    // Reset processing flag after a short delay to allow next scan
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  }, [scanningFor, onScanItem, onScanComplete, continuousScan, closeScanner]);

  const openScanner = useCallback((type = 'standard', mode = 'external') => {
    setScanningFor(type);
    setScannedItems([]);
    setScannerMode(mode);
    setContinuousScan(type === 'unique'); // Continuous on by default for unique
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

  // External scanner (keyboard input)
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

  // Return processScannedCode so ScannerModal can use it for camera
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
    processScannedCode, // ← NEW: Expose this for camera scanning
    scanningFor,
    scannedItems,
    setScannedItems
  };
}