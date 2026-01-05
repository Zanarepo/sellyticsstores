// src/component/Sellytics/AdminOps/TmeSheet/BarcodeModal.jsx
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { format, getWeek } from 'date-fns';

export default function BarcodeModal({ isOpen, onClose }) {
  const canvasRef = useRef(null);

  const storeId = localStorage.getItem('store_id');

  // Get rotation from localStorage (default: daily)
  const rotation = localStorage.getItem('barcode_rotation') || 'daily';

  // Calculate suffix based on rotation
  const today = new Date();
  let suffix = '';
  let rotationLabel = 'Daily';

  if (rotation === 'weekly') {
    suffix = `W${getWeek(today)}`;
    rotationLabel = 'Weekly';
  } else if (rotation === 'monthly') {
    suffix = format(today, 'yyyy-MM');
    rotationLabel = 'Monthly';
  } else {
    suffix = format(today, 'd');
    rotationLabel = 'Daily';
  }

  const barcodeText = storeId ? `STORE-${storeId}-${suffix}` : 'STORE-ID-MISSING';

  // Hook is now UNCONDITIONAL — always runs
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !storeId) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      JsBarcode(canvas, barcodeText, {
        format: 'CODE128',
        width: 3,
        height: 100,
        fontSize: 20,
        textMargin: 12,
        margin: 20,
        displayValue: true,
        background: '#ffffff',
        lineColor: '#000000',
        font: 'monospace',
        flat: true,
      });
    } catch (err) {
      console.error('Barcode generation failed:', err);
    }
  }, [isOpen, storeId, barcodeText]); // Safe dependencies

  // Early return AFTER all hooks
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
          {rotationLabel} Store Barcode
        </h2>

        {!storeId ? (
          <div className="text-red-600 dark:text-red-400 text-lg font-medium py-12">
            Error: Store ID not found. Please log in again.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-inner p-6 sm:p-10 mx-auto">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto mx-auto block"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>

            <div className="mt-8">
              <p className="text-base sm:text-lg font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-xl inline-block break-all">
                {barcodeText}
              </p>
            </div>

            <p className="mt-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              This barcode changes <strong>{rotationLabel.toLowerCase()}</strong> as set by the admin.
              <br />
              Valid until next rotation.
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-10 w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-lg font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
}