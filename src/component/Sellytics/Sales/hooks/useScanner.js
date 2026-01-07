/**
 * SwiftCheckout - Scanner Hook
 * Handles camera and external barcode scanner integration
 * @version 2.0.0
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function useScanner(onScanSuccess) {
  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState('external');
  const [continuousScan, setContinuousScan] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [targetLineId, setTargetLineId] = useState(null);
  
  // Refs
  const externalBufferRef = useRef('');
  const externalTimeoutRef = useRef(null);
  const lastScanRef = useRef('');
  const scanTimeoutRef = useRef(null);
  const isProcessingRef = useRef(false);
  
  // Close scanner
  const closeScanner = useCallback(() => {
    setShowScanner(false);
    setManualInput('');
    setTargetLineId(null);
    lastScanRef.current = '';
    isProcessingRef.current = false;
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  }, []);

  // Process scanned code - SAME LOGIC FOR ALL SCAN METHODS (external, manual, AND camera)
  const processScannedCode = useCallback(async (barcode) => {
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

    // Reset the last scan reference after a delay (2 seconds for camera scans)
    scanTimeoutRef.current = setTimeout(() => { 
      lastScanRef.current = '';
      isProcessingRef.current = false;
      scanTimeoutRef.current = null;
    }, 2000);

    try {
      const result = await onScanSuccess(code, targetLineId);
      
      if (result.success) {
        // Show success notification with product name (like external scanner)
        const productName = result.productName || code.substring(0, 15);
        toast.success(`✓ ${productName}`, {
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#D1FAE5',
            color: '#065F46',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            maxWidth: '250px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
        });
        
        if (!continuousScan) {
          setTimeout(closeScanner, 150);
        }
      } else {
        // Show error notifications for all error scenarios
        if (result.error) {
          toast.error(result.error, { 
            duration: 3000,
            position: 'top-right',
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              maxWidth: '300px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
          });
        }
      }
    } catch (err) {
      // Error handling for unexpected errors
      toast.error(err.message || 'Scan failed', {
        duration: 2000,
        position: 'top-right',
      });
      console.error('Scan error:', err);
    }

    // Reset processing flag after a short delay to allow next scan
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  }, [onScanSuccess, targetLineId, continuousScan, closeScanner]);

  
  // Open scanner
  const openScanner = useCallback((mode = 'external', lineId = null) => {
    setScannerMode(mode);
    setShowScanner(true);
    setManualInput('');
    setTargetLineId(lineId);
  }, []);
  
  // Handle manual input
  const handleManualSubmit = useCallback(() => {
    if (!manualInput.trim()) {
      toast.error('Please enter a code');
      return;
    }
    processScannedCode(manualInput.trim());
    setManualInput('');
  }, [manualInput, processScannedCode]);
  
  // External scanner keyboard handler
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
  
  // Global external scanner listener (when scanner is closed)
  useEffect(() => {
    if (showScanner) return;
    
    let buffer = '';
    let timeout = null;
    
    const handler = (e) => {
      // Only capture if no input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );
      
      if (isInputFocused) return;
      
      if (timeout) clearTimeout(timeout);
      
      if (e.key === 'Enter') {
        if (buffer && buffer.length >= 4) {
          processScannedCode(buffer);
        }
        buffer = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
        
        timeout = setTimeout(() => {
          buffer = '';
        }, 100);
      }
    };
    
    window.addEventListener('keydown', handler);
    
    return () => {
      window.removeEventListener('keydown', handler);
      if (timeout) clearTimeout(timeout);
    };
  }, [showScanner, processScannedCode]);
  
  return {
    showScanner,
    scannerMode,
    setScannerMode,
    continuousScan,
    setContinuousScan,
    manualInput,
    setManualInput,
    handleManualSubmit,
    openScanner,
    closeScanner,
    processScannedCode, // Expose this for camera scanning
    targetLineId,
    externalBufferRef,
    externalTimeoutRef
  };
}