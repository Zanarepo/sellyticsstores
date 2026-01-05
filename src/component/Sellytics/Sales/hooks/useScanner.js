/**
 * SwiftCheckout - Scanner Hook
 * Handles camera and external barcode scanner integration
 * @version 2.0.0
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function useScanner(onScanSuccess) {
  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState('camera');
  const [continuousScan, setContinuousScan] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [targetLineId, setTargetLineId] = useState(null);
  
  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const externalBufferRef = useRef('');
  const externalTimeoutRef = useRef(null);
  const lastScanRef = useRef({ code: '', time: 0 });
  const scanIntervalRef = useRef(null);
  
  // Audio context for sounds
  const audioCtxRef = useRef(null);
  
  // Get or create audio context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);
  
  // Play success sound
  const playSuccessSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio not available
    }
  }, [getAudioContext]);
  
  // Play error sound
  const playErrorSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = 300;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio not available
    }
  }, [getAudioContext]);

  // Sanitize barcode input
  const sanitizeBarcode = useCallback((code) => {
    if (!code || typeof code !== 'string') return '';

    // Remove all ASCII control characters (0–31 and 127) using Unicode escapes
    // This avoids the no-control-regex lint rule completely
    return code
      .replace(/[-\u001F\u007F]/gu, '')
      .trim();
  }, []);





  // Handle successful scan
  const handleScan = useCallback(async (code, lineId = null) => {
    const normalizedCode = sanitizeBarcode(code);
    if (!normalizedCode) return;
    
    const now = Date.now();
    
    // Debounce: prevent same code within 1 second
    if (
      lastScanRef.current.code === normalizedCode && 
      now - lastScanRef.current.time < 1000
    ) {
      return;
    }
    
    lastScanRef.current = { code: normalizedCode, time: now };
    
    try {
      const result = await onScanSuccess(normalizedCode, lineId || targetLineId);
      
      if (result.success) {
        playSuccessSound();
        toast.success(`Added: ${result.productName || normalizedCode}`, { 
          icon: '📦',
          autoClose: 2000 
        });
        
        if (!continuousScan) {
          closeScanner();
        }
      } else {
        playErrorSound();
        toast.error(result.error || 'Failed to process scan', { icon: '❌' });
        setError(result.error || 'Failed to process scan');
      }
    } catch (err) {
      playErrorSound();
      toast.error(err.message || 'Scan failed');
      setError(err.message || 'Scan failed');
    }
  }, [onScanSuccess, continuousScan, targetLineId, playSuccessSound, playErrorSound, sanitizeBarcode]);
  
  // Start camera
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please check permissions.');
      setIsLoading(false);
    }
  }, []);
  
  // Stop camera
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);
  
  // Open scanner
  const openScanner = useCallback((mode = 'camera', lineId = null) => {
    setScannerMode(mode);
    setShowScanner(true);
    setError(null);
    setManualInput('');
    setTargetLineId(lineId);
  }, []);
  
  // Close scanner
  const closeScanner = useCallback(() => {
    stopCamera();
    setShowScanner(false);
    setError(null);
    setManualInput('');
    setTargetLineId(null);
  }, [stopCamera]);
  
  // Handle manual input
  const handleManualSubmit = useCallback(async () => {
    const code = sanitizeBarcode(manualInput);
    if (!code) {
      setError('Please enter a barcode or ID');
      return;
    }
    
    await handleScan(code);
    setManualInput('');
  }, [manualInput, handleScan, sanitizeBarcode]);
  
  // External scanner keyboard handler
  useEffect(() => {
    if (!showScanner || scannerMode !== 'external') return;
    
    const handleKeyPress = (e) => {
      // Clear timeout
      if (externalTimeoutRef.current) {
        clearTimeout(externalTimeoutRef.current);
      }
      
      if (e.key === 'Enter') {
        const code = sanitizeBarcode(externalBufferRef.current);
        externalBufferRef.current = '';
        
        if (code) {
          handleScan(code);
        }
      } else if (e.key.length === 1) {
        externalBufferRef.current += e.key;
        
        // Auto-clear after 100ms of no input (scanner sends rapidly)
        externalTimeoutRef.current = setTimeout(() => {
          externalBufferRef.current = '';
        }, 100);
      }
    };
    
    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      if (externalTimeoutRef.current) {
        clearTimeout(externalTimeoutRef.current);
      }
    };
  }, [showScanner, scannerMode, handleScan, sanitizeBarcode]);
  
  // Global external scanner listener (when scanner is closed)
  useEffect(() => {
    if (showScanner) return;
    
    let buffer = '';
    let timeout = null;
    
    const handleKeyPress = (e) => {
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
        const code = sanitizeBarcode(buffer);
        buffer = '';
        
        if (code && code.length >= 4) {
          handleScan(code);
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
        
        timeout = setTimeout(() => {
          buffer = '';
        }, 100);
      }
    };
    
    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      if (timeout) clearTimeout(timeout);
    };
  }, [showScanner, handleScan, sanitizeBarcode]);
  
  // Start camera when scanner opens in camera mode
  useEffect(() => {
    if (showScanner && scannerMode === 'camera') {
      startCamera();
    }
    
    return () => {
      if (!showScanner) {
        stopCamera();
      }
    };
  }, [showScanner, scannerMode, startCamera, stopCamera]);
  
  return {
    // State
    showScanner,
    scannerMode,
    continuousScan,
    isLoading,
    error,
    manualInput,
    targetLineId,
    
    // Refs
    videoRef,
    
    // Setters
    setScannerMode,
    setContinuousScan,
    setManualInput,
    setError,
    
    // Actions
    openScanner,
    closeScanner,
    handleScan,
    handleManualSubmit
  };
}