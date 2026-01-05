// EditMultipleProductsModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import useScanner from './hooks/useScanner';
import ScannerModal from './ScannerModal';
import ProductItemForm from './ProductItemForm';

export default function EditMultipleProductsModal({ productsToEdit, onClose, onSave }) {
  const [products, setProducts] = useState(productsToEdit.map(p => ({
    ...p,
    deviceIds: p.is_unique && p.dynamic_product_imeis
      ? p.dynamic_product_imeis.split(',').map(s => s.trim()).filter(Boolean).concat([''])
      : [''],
    deviceSizes: p.is_unique && p.device_size
      ? p.device_size.split(',').map(s => s.trim()).concat(Array(p.deviceIds?.length || 1).fill(''))
      : [''],
    restock_qty: '',
  })));

  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scanner = useScanner({
    onScanItem: (item) => {
      if (currentProductIndex === null) return;

      setProducts(prev => {
        const updated = [...prev];
        const product = updated[currentProductIndex];

        if (!product.is_unique) return prev;

        if (product.deviceIds.includes(item.code)) return prev; // prevent duplicates

        updated[currentProductIndex] = {
          ...product,
          deviceIds: [...product.deviceIds.filter(Boolean), item.code, ''],
          deviceSizes: [...product.deviceSizes.filter(Boolean), '', ''],
        };
        return updated;
      });
    },
    onScanComplete: (scannedItems) => {
      if (currentProductIndex === null) return;

      setProducts(prev => {
        const updated = [...prev];
        const product = updated[currentProductIndex];

        if (!product.is_unique && scannedItems.length > 0) {
          updated[currentProductIndex] = {
            ...product,
            device_id: scannedItems[0].code,
            purchase_qty: String(scannedItems.length),
          };
        }

        return updated;
      });

      setCurrentProductIndex(null);
    },
  });

  const openScannerForProduct = (index) => {
    setCurrentProductIndex(index);
    const mode = products[index].is_unique ? 'unique' : 'standard';
    scanner.openScanner(mode, 'camera');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      for (const product of products) {
        if (!product.name.trim()) throw new Error('Product name required');
        if (product.is_unique && product.deviceIds.filter(Boolean).length === 0)
          throw new Error(`"${product.name}" needs at least one device ID`);

        const payload = {
          name: product.name.trim(),
          description: product.description?.trim() || null,
          suppliers_name: product.suppliers_name?.trim() || null,
          purchase_price: Number(product.purchase_price) || 0,
          selling_price: Number(product.selling_price) || 0,
          is_unique: product.is_unique,
        };

        if (product.is_unique) {
          const ids = product.deviceIds.filter(Boolean);
          payload.dynamic_product_imeis = ids.join(',');
          payload.device_size = product.deviceSizes.slice(0, ids.length).join(',') || null;
          payload.purchase_qty = ids.length;
          payload.device_id = null;
        } else {
          payload.purchase_qty = Number(product.purchase_qty) || 0;
          payload.device_id = product.device_id?.trim() || null;
          payload.device_size = product.device_size?.trim() || null;
          payload.dynamic_product_imeis = null;
        }

        await onSave(product.id, payload);
      }

      toast.success('Products updated successfully');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save products');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.form
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
        >
          <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 mb-4">
            <h2 className="text-2xl font-bold">Edit Multiple Products</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {products.map((product, index) => (
            <ProductItemForm
              key={product.id}
              product={product}
              productIndex={index}
              productsLength={products.length}
              setProducts={setProducts}
              onOpenScanner={() => openScannerForProduct(index)}
              onRemoveProduct={(i) => setProducts(prev => prev.filter((_, j) => j !== i))}
            />
          ))}

          <button
            type="button"
            onClick={() => setProducts(prev => [...prev, { ...products[0], id: Date.now(), name: '', deviceIds: [''], deviceSizes: [''], restock_qty: '' }])}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Another Product
          </button>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Changes
            </button>
          </div>
        </motion.form>
      </motion.div>

      {scanner.showScanner && (
        <ScannerModal
          show={scanner.showScanner}
          scannerMode={scanner.scannerMode}
          setScannerMode={scanner.setScannerMode}
          continuousScan={scanner.continuousScan}
          setContinuousScan={scanner.setContinuousScan}
          isLoading={scanner.isLoading}
          error={scanner.error}
          videoRef={scanner.videoRef}
          manualInput={scanner.manualInput}
          setManualInput={scanner.setManualInput}
          onManualSubmit={scanner.handleManualSubmit}
          scannedItems={scanner.scannedItems}
          removeScannedItem={scanner.removeScannedItem}
          updateScannedItemSize={scanner.updateScannedItemSize}
          completeScanning={scanner.completeScanning}
          onClose={scanner.closeScanner}
          scanningFor={scanner.scanningFor}
        />
      )}
    </>
  );
}
