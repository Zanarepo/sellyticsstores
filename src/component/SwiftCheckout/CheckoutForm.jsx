/**
 * SwiftCheckout - Checkout Form Component
 * Main checkout UI with lines, scanner, payment selection
 */
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Scan, 
  Plus, 
  ShoppingCart, 
  CreditCard, 
  Banknote,
  Wallet,
  Building2,
  Receipt,
  Loader2,
  Package,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import useSalesForm from '../SwiftCheckout//hooks/useSalesForm';
import useScanner from '../SwiftCheckout/hooks/useScanner';
import useOfflineCache from '../SwiftCheckout/hooks/useOfflineCache';

import ScannerModal from './ScannerModal';
import { SalesLineRow, SalesLineCard, EmptyLinesPlaceholder } from './SalesLineRow';
import SyncControls from './SyncControls';
import ProductPerformanceModal from './ProductPerformanceModal';
import { formatPrice } from '../SwiftCheckout/utils/formatting';
import { getCurrentUser } from '../SwiftCheckout/utils/identity';

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', icon: Banknote, color: 'emerald' },
  { id: 'Card', label: 'Card', icon: CreditCard, color: 'blue' },
  { id: 'Bank Transfer', label: 'Transfer', icon: Building2, color: 'violet' },
  { id: 'Wallet', label: 'Wallet', icon: Wallet, color: 'amber' }
];

export default function CheckoutForm({ onSaleComplete }) {
  const [isMobile, setIsMobile] = useState(false);
  const [productModalData, setProductModalData] = useState(null);
  
  const { storeId } = getCurrentUser();
  
  // Hooks
  const salesForm = useSalesForm(onSaleComplete, offlineCache);
  const offlineCache = useOfflineCache();
  
  // Scanner hook
  const scanner = useScanner(async (barcode) => {
    return salesForm.handleBarcodeScan(barcode);
  });
  
  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // View product performance
  const handleViewProduct = (line) => {
    if (line.productId) {
      setProductModalData({
        productId: line.productId,
        productName: line.productName
      });
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (lineIdx, newQty) => {
    salesForm.updateLine(lineIdx, 'quantity', newQty);
  };
  
  // Handle add device ID
  const handleAddDeviceId = (lineIdx) => {
    // This would open a mini modal or input for device ID
    const deviceId = window.prompt('Enter device ID:');
    if (deviceId) {
      salesForm.addDeviceId(lineIdx, deviceId);
    }
  };
  
  const validLines = salesForm.lines.filter(l => l.productId);
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-indigo-600" />
              Swift Checkout
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Scan products to add to sale
            </p>
          </div>
          
          <SyncControls
            isOnline={offlineCache.isOnline}
            pendingCount={offlineCache.pendingCount}
            isSyncing={offlineCache.isSyncing}
            isPaused={offlineCache.isPaused}
            lastSyncAt={offlineCache.lastSyncAt}
            onSync={offlineCache.syncAll}
            onPause={offlineCache.pauseSync}
            onResume={offlineCache.resumeSync}
            onClearQueue={offlineCache.clearQueue}
            compact
          />
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={scanner.openScanner}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Scan className="w-5 h-5" />
            <span>Open Scanner</span>
          </button>
          
          <button
            type="button"
            onClick={salesForm.addLine}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Line</span>
          </button>
        </div>
        
        {/* Lines */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {validLines.length === 0 ? (
            <EmptyLinesPlaceholder onOpenScanner={scanner.openScanner} />
          ) : isMobile ? (
            // Mobile Cards
            <div className="p-4 space-y-3">
              <AnimatePresence>
                {salesForm.lines.map((line, idx) => (
                  line.productId && (
                    <SalesLineCard
                      key={idx}
                      line={line}
                      index={idx}
                      onQuantityChange={handleQuantityChange}
                      onRemoveLine={salesForm.removeLine}
                      onAddDeviceId={handleAddDeviceId}
                      onRemoveDeviceId={salesForm.removeDeviceId}
                      onViewProduct={handleViewProduct}
                      disabled={salesForm.isSubmitting}
                    />
                  )
                ))}
              </AnimatePresence>
            </div>
          ) : (
            // Desktop Table
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {salesForm.lines.map((line, idx) => (
                      line.productId && (
                        <SalesLineRow
                          key={idx}
                          line={line}
                          index={idx}
                          onQuantityChange={handleQuantityChange}
                          onRemoveLine={salesForm.removeLine}
                          onAddDeviceId={handleAddDeviceId}
                          onRemoveDeviceId={salesForm.removeDeviceId}
                          onViewProduct={handleViewProduct}
                          disabled={salesForm.isSubmitting}
                        />
                      )
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Payment Method Selection */}
        {validLines.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Payment Method
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => salesForm.setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    salesForm.paymentMethod === method.id
                      ? `border-${method.color}-500 bg-${method.color}-50 dark:bg-${method.color}-900/30`
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <method.icon className={`w-6 h-6 ${
                    salesForm.paymentMethod === method.id
                      ? `text-${method.color}-600 dark:text-${method.color}-400`
                      : 'text-slate-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    salesForm.paymentMethod === method.id
                      ? `text-${method.color}-700 dark:text-${method.color}-300`
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Email Receipt Toggle */}
            <label className="flex items-center gap-3 mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={salesForm.emailReceipt}
                onChange={(e) => salesForm.setEmailReceipt(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Email receipt to customer
                </span>
              </div>
            </label>
          </div>
        )}
        
        {/* Summary & Submit */}
        {validLines.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-indigo-100 text-sm">Total Amount</p>
                <p className="text-3xl font-bold">
                  {formatPrice(salesForm.totalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 text-sm">Items</p>
                <p className="text-2xl font-bold">{salesForm.totalItems}</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={salesForm.submitSale}
              disabled={salesForm.isSubmitting || validLines.length === 0}
              className="w-full py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {salesForm.isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Complete Sale</span>
                </>
              )}
            </button>
            
            {!offlineCache.isOnline && (
              <p className="text-center text-indigo-200 text-sm mt-3">
                Sale will be saved offline and synced when online
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Scanner Modal */}
      <ScannerModal
        isOpen={scanner.isOpen}
        isCameraMode={scanner.isCameraMode}
        isContinuousMode={scanner.isContinuousMode}
        isLoading={scanner.isLoading}
        error={scanner.error}
        manualInput={scanner.manualInput}
        videoRef={scanner.videoRef}
        scannerDivRef={scanner.scannerDivRef}
        onClose={scanner.closeScanner}
        onManualInputChange={scanner.setManualInput}
        onManualSubmit={scanner.handleManualSubmit}
        onModeChange={scanner.handleModeChange}
        onContinuousModeChange={scanner.setIsContinuousMode}
        setError={scanner.setError}
      />
      
      {/* Product Performance Modal */}
      <ProductPerformanceModal
        isOpen={!!productModalData}
        onClose={() => setProductModalData(null)}
        productId={productModalData?.productId}
        productName={productModalData?.productName}
      />
    </div>
  );
}