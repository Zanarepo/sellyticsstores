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

        // debounce
        if (trimmedCode === lastScanRef.current) return;
        lastScanRef.current = trimmedCode;
        setTimeout(() => (lastScanRef.current = ''), 500);

        setScannedItems(prev => {
            // duplicate protection (unique products)
            if (scanningFor === 'unique' && prev.some(i => i.code === trimmedCode)) {
                setError('Duplicate item scanned');
                return prev;
            }

            const newItem = {
                code: trimmedCode,
                size: '',
                id: Date.now() + Math.random(),
            };

            setError(null);

            // LIVE PUSH (updates ProductForm immediately)
            onScanItem?.(newItem);

            // NON-UNIQUE → auto complete
            if (scanningFor === 'standard') {
                setTimeout(() => {
                    onScanComplete?.([newItem]);
                    closeScanner();
                }, 0);
                return [newItem];
            }

            // UNIQUE → keep accumulating
            return [...prev, newItem];
        });
    }, [scanningFor, onScanItem, onScanComplete, closeScanner]);

    // --- MODAL/FLOW ACTIONS ---
    const openScanner = useCallback((type = 'standard', mode = 'external') => {
        setScanningFor(type);
        setScannedItems([]);
        setScannerMode(mode);
        setShowScanner(true);
        setError(null);
        setManualInput('');
    }, []);

    // Camera scan handler - THIS IS THE KEY FOR CAMERA SCANNING
    const handleCameraScan = useCallback((code) => {
        console.log('📸 Camera scanned:', code);
        processScannedCode(code);
    }, [processScannedCode]);

    // --- External Scanner Handler (useEffect) ---
    useEffect(() => {
        if (!showScanner || scannerMode !== 'external') return;

        let buffer = '';
        let timeout = null;

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                if (buffer.length > 0) {
                    processScannedCode(buffer);
                    buffer = '';
                }
            } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
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
    }, [showScanner, scannerMode, processScannedCode]);

    // Camera management
    useEffect(() => {
        if (!showScanner || scannerMode !== 'camera') {
            stopCamera();
            return;
        }

        startCamera();

        return () => {
            stopCamera();
        };
    }, [showScanner, scannerMode, startCamera, stopCamera]);

    // --- MANUAL SUBMIT HANDLER ---
    const handleManualSubmit = useCallback(() => {
        if (!manualInput.trim()) {
            setError('Please enter a barcode or ID');
            return;
        }
        
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
        handleCameraScan,
        
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