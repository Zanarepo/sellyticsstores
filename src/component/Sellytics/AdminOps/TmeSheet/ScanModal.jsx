// components/attendance/ScanModal.jsx
import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function ScanModal({ isOpen, onClose, onScan }) {
  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (isOpen) {
      codeReader.current.decodeFromVideoDevice(null, webcamRef.current.video, (result) => {
        if (result) onScan(result.text);
      });
    }
    return () => codeReader.current.reset();
  }, [isOpen, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg">
        <Webcam ref={webcamRef} width={300} height={300} />
        <button onClick={onClose} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Stop</button>
      </div>
    </div>
  );
}