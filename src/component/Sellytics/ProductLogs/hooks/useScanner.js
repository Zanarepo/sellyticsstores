import { useState, useRef, useCallback, useEffect } from 'react';

export default function useScanner({ onScanItem, onScanComplete }) {

    const [showScanner, setShowScanner] = useState(false);
    const [scannerMode, setScannerMode] = useState('external');
    const [continuousScan, setContinuousScan] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manualInput, setManualInput] = useState('');
    
    // --- BATCH SCANNING STATE ---
    const [scannedItems, setScannedItems] = useState([]);
    const [scanningFor, setScanningFor] = useState('standard'); 
    
    const videoRef = useRef(null);
    const lastScanRef = useRef('');
    const lastScanTimeRef = useRef(0);
    const streamRef = useRef(null);

    const startCamera = useCallback(async () => {
        if (!videoRef.current) return;

        try {
            setIsLoading(true);
            setError(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
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

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    // Close scanner
    const closeScanner = useCallback(() => {
        stopCamera();
        setShowScanner(false);
        setManualInput('');
        setError(null);
        setScannedItems([]);
        setScanningFor('standard');
    }, [stopCamera]);

    // --- Core logic to handle a single scanned code ---
    const processScannedCode = useCallback((barcode) => {
        const trimmedCode = barcode.trim();
        if (!trimmedCode) return;

        const now = Date.now();

        // Enhanced debounce with timestamp check
        if (trimmedCode === lastScanRef.current && (now - lastScanTimeRef.current) < 1000) {
            console.log('⏭️ Debounced duplicate:', trimmedCode);
            return;
        }

        lastScanRef.current = trimmedCode;
        lastScanTimeRef.current = now;

        console.log('✅ Processing scanned code:', trimmedCode);

        setScannedItems(prev => {
            // duplicate protection (unique products)
            if (scanningFor === 'unique' && prev.some(i => i.code === trimmedCode)) {
                setError('Duplicate item scanned');
                setTimeout(() => setError(null), 2000);
                return prev;
            }

            const newItem = {
                code: trimmedCode,
                size: '',
                id: Date.now() + Math.random(),
            };

            setError(null);

            // LIVE PUSH (updates ProductForm immediately)
            console.log('📤 Calling onScanItem with:', newItem);
            onScanItem?.(newItem);

            // STANDARD (NON-UNIQUE) → auto complete immediately
            if (scanningFor === 'standard' && !continuousScan) {
                console.log('🎯 Standard mode (single scan) - auto-completing');
                setTimeout(() => {
                    onScanComplete?.([newItem]);
                    closeScanner();
                }, 500); // Delay to ensure scan processing completes
                return [newItem];
            } else if (scanningFor === 'standard' && continuousScan) {
                // Continuous mode - keep scanning, don't auto-close
                console.log('🔄 Continuous mode - keeping scanner open');
                return [...prev, newItem];
            }

            // UNIQUE → keep accumulating
            console.log('📋 Unique mode - accumulating items');
            return [...prev, newItem];
        });
    }, [scanningFor, onScanItem, onScanComplete, closeScanner, continuousScan]);

    // --- MODAL/FLOW ACTIONS ---
    const openScanner = useCallback((type = 'standard', mode = 'external') => {
        console.log('🔓 Opening scanner:', { type, mode });
        setScanningFor(type);
        setScannedItems([]);
        setScannerMode(mode);
        setShowScanner(true);
        setError(null);
        setManualInput('');
    }, []);

    // Camera scan handler - THIS IS THE KEY FOR CAMERA SCANNING
    const handleCameraScan = useCallback((code) => {
        console.log('📸 Camera scanned code:', code);
        processScannedCode(code);
    }, [processScannedCode]);

    // --- External Scanner Handler (useEffect) ---
    useEffect(() => {
        if (!showScanner || scannerMode !== 'external') return;

        console.log('⌨️ External scanner listener active');
        let buffer = '';
        let timeout = null;

        const handleKeyDown = (e) => {
            // Ignore if typing in an input field (except our manual input)
            const activeElement = document.activeElement;
            const isInputField = activeElement && (
                activeElement.tagName === 'INPUT' || 
                activeElement.tagName === 'TEXTAREA'
            );

            if (e.key === 'Enter') {
                if (buffer.length > 0) {
                    console.log('⌨️ External scanner captured:', buffer);
                    processScannedCode(buffer);
                    buffer = '';
                }
            } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Only capture if not in an input field OR if it's very rapid typing (barcode scanner)
                if (!isInputField || timeout === null) {
                    buffer += e.key;
                    
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        buffer = '';
                    }, 100);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            console.log('🧹 External scanner listener removed');
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeout);
        };
    }, [showScanner, scannerMode, processScannedCode]);

    // Camera management - Note: html5-qrcode handles its own camera now
    // This is kept for backward compatibility but not actively used
    useEffect(() => {
        if (!showScanner || scannerMode !== 'camera') {
            stopCamera();
            return;
        }

        // html5-qrcode manages the camera itself
        // This effect is just for cleanup

        return () => {
            stopCamera();
        };
    }, [showScanner, scannerMode, startCamera, stopCamera]);

    // --- MANUAL SUBMIT HANDLER ---
    const handleManualSubmit = useCallback(() => {
        if (!manualInput.trim()) {
            setError('Please enter a barcode or ID');
            setTimeout(() => setError(null), 2000);
            return;
        }
        
        console.log('✍️ Manual input:', manualInput.trim());
        processScannedCode(manualInput.trim());
        setManualInput('');
    }, [manualInput, processScannedCode]);

    // --- BATCH MANAGEMENT ACTIONS ---
    const removeScannedItem = useCallback((id) => {
        setScannedItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateScannedItemSize = useCallback((id, size) => {
        setScannedItems(prev => prev.map(item => 
            item.id === id ? { ...item, size } : item
        ));
    }, []);

    const completeScanning = useCallback(() => {
        console.log('✅ Completing scan with items:', scannedItems);
        onScanComplete?.(scannedItems);
        closeScanner();
    }, [scannedItems, onScanComplete, closeScanner]);

    // --- EXPORTS ---
    return {
        // Basic State
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
        handleCameraScan, // THIS IS CRITICAL - must be passed to ScannerModal
        
        // BATCH/UI State & Actions
        scannedItems,
        scanningFor,
        removeScannedItem,
        updateScannedItemSize,
        completeScanning,
        
        // Flow Actions
        handleManualSubmit,
        openScanner,
        closeScanner
    };
}