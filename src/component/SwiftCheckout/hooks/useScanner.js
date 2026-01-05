/**
 * SwiftCheckout - Scanner Hook
 * Handles camera and external scanner integration
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sanitizeBarcode } from '../utils/validation';

export default function useScanner(onScan) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(true);
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerDivRef = useRef(null);
  const externalBufferRef = useRef('');
  const externalTimeoutRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const lastScannedCodeRef = useRef(null);
  
  // Debounce time in ms
  const SCAN_DEBOUNCE = 1500;
  
  // Play success sound
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
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (err) {
      // Audio not supported
    }
  }, []);
  
  // Play error sound
  const playErrorSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 300;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      // Audio not supported
    }
  }, []);
  
  // Process scanned code
  const processScan = useCallback(async (rawCode) => {
    const code = sanitizeBarcode(rawCode);
    if (!code) return;
    
    const now = Date.now();
    
    // Debounce duplicate scans
    if (code === lastScannedCodeRef.current && now - lastScanTimeRef.current < SCAN_DEBOUNCE) {
      return;
    }
    
    lastScannedCodeRef.current = code;
    lastScanTimeRef.current = now;
    
    // Call the onScan callback
    const result = await onScan(code);
    
    if (result.success) {
      playSuccessSound();
      setManualInput('');
      
      // Close modal if not in continuous mode
      if (!isContinuousMode) {
        closeScanner();
      }
    } else {
      playErrorSound();
      setError(result.error || 'Scan failed');
    }
    
    return result;
  }, [onScan, isContinuousMode, playSuccessSound, playErrorSound]);
  
  // Start camera
  const startCamera = useCallback(async () => {
    if (!isCameraMode || !videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      setIsLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsLoading(false);
    }
  }, [isCameraMode]);
  
  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);
  
  // Open scanner
  const openScanner = useCallback(() => {
    setIsOpen(true);
    setError(null);
    setManualInput('');
    lastScannedCodeRef.current = null;
    externalBufferRef.current = '';
  }, []);
  
  // Close scanner
  const closeScanner = useCallback(() => {
    setIsOpen(false);
    stopCamera();
    setError(null);
    setManualInput('');
    externalBufferRef.current = '';
    
    if (externalTimeoutRef.current) {
      clearTimeout(externalTimeoutRef.current);
    }
  }, [stopCamera]);
  
  // Handle manual input submit
  const handleManualSubmit = useCallback(async () => {
    const code = sanitizeBarcode(manualInput);
    if (!code) {
      setError('Please enter a valid code');
      return;
    }
    
    return processScan(code);
  }, [manualInput, processScan]);
  
  // Handle mode change
  const handleModeChange = useCallback((cameraMode) => {
    setIsCameraMode(cameraMode);
    if (!cameraMode) {
      stopCamera();
    }
  }, [stopCamera]);
  
  // Start camera when modal opens and camera mode is active
  useEffect(() => {
    if (isOpen && isCameraMode) {
      startCamera();
    }
    
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, isCameraMode, startCamera, stopCamera]);
  
  // External scanner keyboard handler
  useEffect(() => {
    if (!isOpen || isCameraMode) return;
    
    const handleKeyPress = async (e) => {
      // Ignore if focused on input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Clear timeout for new input
      if (externalTimeoutRef.current) {
        clearTimeout(externalTimeoutRef.current);
      }
      
      if (e.key === 'Enter') {
        if (externalBufferRef.current) {
          await processScan(externalBufferRef.current);
          externalBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        externalBufferRef.current += e.key;
        
        // Auto-clear buffer after 100ms of no input
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
  }, [isOpen, isCameraMode, processScan]);
  
  return {
    // State
    isOpen,
    isCameraMode,
    isContinuousMode,
    isLoading,
    error,
    manualInput,
    
    // Refs
    videoRef,
    scannerDivRef,
    
    // Actions
    openScanner,
    closeScanner,
    setManualInput,
    handleManualSubmit,
    setIsContinuousMode,
    handleModeChange,
    setError,
    processScan
  };
}