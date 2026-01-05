import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function useScanner(onScanSuccess) {
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null);
  const [scannerError, setScannerError] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [externalScannerMode, setExternalScannerMode] = useState(false);

  const html5QrCodeRef = useRef(null);
  const videoRef = useRef(null);
  const scannerDivRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const lastScannedCodeRef = useRef(null);
  const externalBufferRef = useRef('');
  const externalTimeoutRef = useRef(null);

  const playSuccessSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      console.log('Audio not available');
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState?.();
        if (state === 2 || state === 3) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setScannerError(null);
    setScannerLoading(false);
  }, []);

  const openScanner = useCallback((modal, lineIdx, deviceIdx) => {
    setScannerTarget({ modal, lineIdx, deviceIdx });
    setShowScanner(true);
    setScannerError(null);
    setScannerLoading(true);
    setManualInput('');
    setExternalScannerMode(false);
  }, []);

  const closeScanner = useCallback(() => {
    setShowScanner(false);
    setScannerTarget(null);
    setScannerError(null);
    setScannerLoading(false);
    setManualInput('');
    setExternalScannerMode(false);
    stopScanner();
  }, [stopScanner]);

  const handleManualInput = useCallback(async () => {
    const trimmedInput = manualInput.trim();
    if (!trimmedInput) {
      setScannerError('Product ID cannot be empty');
      return;
    }

    if (!scannerTarget) {
      setScannerError('No scanner target set');
      return;
    }

    const result = await onScanSuccess(trimmedInput, scannerTarget);
    if (result.success) {
      setManualInput('');
      setScannerError(null);
      playSuccessSound();
    } else {
      setScannerError(result.error);
    }
  }, [manualInput, scannerTarget, onScanSuccess, playSuccessSound]);

  // External scanner keyboard handler
  useEffect(() => {
    if (!externalScannerMode || !scannerTarget || !showScanner) return;

    const handleKeypress = async (e) => {
      if (externalTimeoutRef.current) {
        clearTimeout(externalTimeoutRef.current);
      }

      if (e.key === 'Enter' && externalBufferRef.current) {
        const scannedId = externalBufferRef.current.trim();
        externalBufferRef.current = '';
        
        if (scannedId) {
          const result = await onScanSuccess(scannedId, scannerTarget);
          if (result.success) {
            playSuccessSound();
            setScannerError(null);
          } else {
            setScannerError(result.error);
          }
        }
      } else if (e.key !== 'Enter') {
        externalBufferRef.current += e.key;
        
        externalTimeoutRef.current = setTimeout(() => {
          externalBufferRef.current = '';
        }, 100);
      }
    };

    document.addEventListener('keypress', handleKeypress);
    return () => {
      document.removeEventListener('keypress', handleKeypress);
      if (externalTimeoutRef.current) {
        clearTimeout(externalTimeoutRef.current);
      }
    };
  }, [externalScannerMode, scannerTarget, showScanner, onScanSuccess, playSuccessSound]);

  return {
    showScanner,
    scannerTarget,
    scannerError,
    setScannerError,
    scannerLoading,
    setScannerLoading,
    manualInput,
    setManualInput,
    externalScannerMode,
    setExternalScannerMode,
    html5QrCodeRef,
    videoRef,
    scannerDivRef,
    lastScanTimeRef,
    lastScannedCodeRef,
    openScanner,
    closeScanner,
    stopScanner,
    handleManualInput,
    playSuccessSound,
  };
}