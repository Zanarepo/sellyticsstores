/**
 * SwiftCheckout - Main Tracker Component
 * Production-grade offline-first POS system
 * @version 2.0.0
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Plus, RefreshCw, ShoppingCart, History, 
  Wifi, WifiOff, Loader2, Play, Pause
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Hooks
import useDataLoader from '../hooks/useDataLoader';
import useOfflineSync from '../hooks/useOfflineSync';
import useScanner from './hooks/useScanner';
import useCheckoutState from './hooks/useCheckoutState';
import useCurrency from './hooks/useCurrency';

// Services
import { getIdentity, filterSalesByPermission } from '../services/identityService';
import salesService from './services/salesService';
import offlineCache from '../db/offlineCache';

// ./
import ScannerModal from './ScannerModal';
import CheckoutForm from './CheckoutForm';
import PendingSalesList from './PendingSalesList';
import SalesHistory from './SalesHistory';
//import NotificationsPanel, { NotificationBadge } from './NotificationsPanel';
import ProductPerformanceModal from './ProductPerformanceModal';
import ViewSaleModal from './ViewSaleModal';
import EditSaleModal from './EditSaleModal';

export default function Tracker() {
  const { currentStoreId, currentUserId, isValid } = getIdentity();
  // Data loading
  const {
    products,
    inventory,
    customers,
    sales,
    pendingSales,
    isOwner,
    isLoading,
    refreshData,
    refreshSales,
    refreshInventory,
    getProductByBarcode,
    getInventoryForProduct,
    setPendingSales
  } = useDataLoader();

  // Offline sync
  const {
    isOnline,
    isSyncing,
    syncPaused,
    syncProgress,
    queueCount,
    syncAll,
    pauseSync,
    resumeSync,
    clearQueue,
    updateQueueCount
  } = useOfflineSync(() => {
    refreshSales();
    refreshInventory();
  });

  // Checkout state
  const checkoutState = useCheckoutState();

  // UI State
  const [activeTab, setActiveTab] = useState('checkout');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  //const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewingSale, setViewingSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const { formatPrice } = useCurrency();


  // Format price helper

useEffect(() => {
  const handleSalesChange = () => {
    refreshSales();
  };

  window.addEventListener('salesChanged', handleSalesChange);

  return () => {
    window.removeEventListener('salesChanged', handleSalesChange);
  };
}, [refreshSales]);

  // Filter sales by permission
  const filteredSales = useMemo(() => {
    const visible = filterSalesByPermission(sales, isOwner);
    if (!search) return visible;
    
    const lower = search.toLowerCase();
    return visible.filter(s =>
      s.product_name?.toLowerCase().includes(lower) ||
      s.customer_name?.toLowerCase().includes(lower) ||
      s.device_id?.toLowerCase().includes(lower)
    );
  }, [sales, isOwner, search]);

  // Handle scan success
  const handleScanSuccess = useCallback(async (barcode, targetLineId = null, targetRowKey = null) => {
    const normalizedBarcode = barcode.trim();
    
    // Check for duplicate in current checkout
    if (checkoutState.hasDuplicateDevice(normalizedBarcode, targetLineId, targetRowKey)) {
      toast.error(`Device ID "${normalizedBarcode}" is already in the cart`);
      return { success: false, error: 'Duplicate device ID' };
    }
    
    // Find product
    let product = getProductByBarcode(normalizedBarcode);
    
    // Try online if not found locally
    if (!product && isOnline) {
      product = await salesService.getProductByBarcode(normalizedBarcode);
    }
    
    if (!product) {
      return { success: false, error: `Product not found for: ${normalizedBarcode}` };
    }
    
    // Check if already sold
    const alreadySold = isOnline 
      ? await salesService.checkDeviceAlreadySold(normalizedBarcode, currentStoreId)
      : await offlineCache.checkDeviceSold(normalizedBarcode, currentStoreId);
      
    if (alreadySold) {
      return { success: false, error: `Device "${normalizedBarcode}" has already been sold` };
    }
    
    // Check inventory
    const inv = getInventoryForProduct(product.id);
    if (inv) {
      if (inv.available_qty === 0) {
        toast.error('Out of stock — restock needed', { icon: '⚠️' });
      } else if (inv.available_qty <= 6) {
        toast.warn(`Low stock: ${inv.available_qty} left`, { icon: '📦' });
      }
    }
    
    // Get device size from IMEI mapping
    const deviceImeis = product.dynamic_product_imeis?.split(',').map(i => i.trim()) || [];
    const deviceSizes = product.device_size?.split(',').map(s => s.trim()) || [];
    const deviceIndex = deviceImeis.findIndex(id => id.toLowerCase() === normalizedBarcode.toLowerCase());
    const deviceSize = deviceIndex >= 0 ? deviceSizes[deviceIndex] || '' : '';
    
    // Apply to checkout state
    checkoutState.applyBarcode(product, normalizedBarcode, deviceSize, targetLineId, targetRowKey);
    
    // Open checkout form if not open
    if (!showCheckoutForm) {
      setShowCheckoutForm(true);
    }
    
    return { success: true, productName: product.name };
  }, [currentStoreId, isOnline, getProductByBarcode, getInventoryForProduct, checkoutState, showCheckoutForm]);

  // Scanner hook
  const scanner = useScanner(handleScanSuccess);

  // Handle manual device ID confirmation
  const handleManualDeviceConfirm = useCallback(async (lineId, rowKey, deviceId) => {
    const code = deviceId?.trim();
    if (!code) return;
    
    const result = await handleScanSuccess(code, lineId, rowKey);
    
    if (!result.success) {
      // Clear the device ID field on failure
      checkoutState.updateDeviceRow(lineId, rowKey, { deviceId: '' });
    }
    
    return result;
  }, [handleScanSuccess, checkoutState]);
// Create sale (fully offline-compatible)

const createSale = useCallback(async () => {
  const { lines, paymentMethod, selectedCustomerId, selectedCustomerName, emailReceipt, totalAmount } = checkoutState;

  // Validate
  const validLines = lines.filter(l => l.dynamic_product_id && l.quantity > 0);
  if (validLines.length === 0) {
    toast.error('Please add at least one product');
    return;
  }

  setIsSubmitting(true);

try {
  if (isOnline) {
    // ===================== ONLINE SALE =====================
    const saleGroup = await salesService.createSaleGroup({
      total_amount: totalAmount,
      payment_method: paymentMethod,
      customer_id: selectedCustomerId,
      customer_name: selectedCustomerName,
      email_receipt: emailReceipt
    });

    for (const line of validLines) {
      const deviceIds = (line.deviceRows || []).map(r => r.deviceId).filter(Boolean).join(',');
      const deviceSizes = (line.deviceRows || []).map(r => r.deviceSize).filter(Boolean).join(',');

      await salesService.createSaleLine({
        dynamic_product_id: line.dynamic_product_id,
        quantity: line.quantity,
        unit_price: line.unit_price,
        device_id: deviceIds || undefined,
        device_size: deviceSizes || undefined,
        payment_method: paymentMethod,
        customer_id: selectedCustomerId || undefined,
        customer_name: selectedCustomerName || undefined
      }, saleGroup.id);

      // Update inventory
      const inv = getInventoryForProduct(line.dynamic_product_id);
      if (inv) {
        await salesService.updateInventoryQty(inv.id, inv.available_qty - line.quantity);
      }
    }

    toast.success('Sale completed successfully!', { icon: '✅' });
    refreshSales();
    refreshInventory();

  } else {
    // ===================== OFFLINE SALE =====================
    const storeId = Number(currentStoreId);
    if (isNaN(storeId)) {
      toast.error('Invalid store configuration. Please reload.');
      return;
    }

    // 1️⃣ Create offline sale group once
    const saleGroup = await offlineCache.createOfflineSaleGroup({
      total_amount: totalAmount,
      payment_method: paymentMethod,
      customer_id: selectedCustomerId || undefined,
      customer_name: selectedCustomerName || undefined,
      email_receipt: emailReceipt,
      created_at: new Date().toISOString()
    }, storeId);

    // 2️⃣ Track inventory updates locally
    const inventoryUpdates = {};

    // 3️⃣ Loop through valid lines and create offline sales
    for (const line of validLines) {
      const sanitizeValue = v => (v === null || v === undefined || v === '' ? undefined : v);

      const deviceIds = (line.deviceRows || []).map(r => sanitizeValue(r.deviceId)).filter(Boolean).join(',');
      const deviceSizes = (line.deviceRows || []).map(r => sanitizeValue(r.deviceSize)).filter(Boolean).join(',');

      const salePayload = {
        dynamic_product_id: line.dynamic_product_id,
        quantity: line.quantity,
        unit_price: line.unit_price,
        amount: line.quantity * line.unit_price,
        payment_method: paymentMethod,
        client_sale_group_ref: saleGroup._client_ref, // link to group
        sold_at: new Date().toISOString()
      };

      if (deviceIds) salePayload.device_id = deviceIds;
      if (deviceSizes) salePayload.device_size = deviceSizes;
      if (selectedCustomerId) salePayload.customer_id = selectedCustomerId;
      if (selectedCustomerName) salePayload.customer_name = selectedCustomerName;

      // ✅ Create offline sale line with its own unique _offline_id
      await offlineCache.createOfflineSale(salePayload, storeId, saleGroup._offline_id, saleGroup._client_ref);

      // Update cached inventory locally
      if (!inventoryUpdates[line.dynamic_product_id]) {
        const inv = getInventoryForProduct(line.dynamic_product_id);
        if (inv) inventoryUpdates[line.dynamic_product_id] = inv.available_qty;
      }

      const newQty = inventoryUpdates[line.dynamic_product_id] - line.quantity;
      await offlineCache.updateCachedInventory(line.dynamic_product_id, storeId, newQty);
      inventoryUpdates[line.dynamic_product_id] = newQty;
    }

    toast.success('Sale saved offline! It will sync when online.', { icon: '✅' });

    // Refresh pending sales and queue count
    const pending = await offlineCache.getPendingSales(storeId);
    setPendingSales(pending);
    updateQueueCount();
  }

  // Reset form
  checkoutState.resetForm();
  setShowCheckoutForm(false);

} catch (error) {
  console.error('Sale creation error:', error);
  toast.error('Failed to create sale: ' + error.message);
} finally {
  setIsSubmitting(false);
}



}, [
  checkoutState,
  currentStoreId,
  isOnline,
  getInventoryForProduct,
  refreshSales,
  refreshInventory,
  setPendingSales,
  updateQueueCount
]);





 // Delete offline sale (only allowed when online)
const handleDeleteOfflineSale = useCallback(async (saleId) => {
  // Prevent deletion when offline — safety first
  if (!isOnline) {
    toast.warn('Cannot delete pending sale while offline');
    return false;
  }

  const success = await offlineCache.deleteOfflineSale(saleId);
  
  if (success) {
    // Refresh pending sales list
    const pending = await offlineCache.getPendingSales(currentStoreId);
    setPendingSales(pending);
    
    // Update queue count in sync button
    await updateQueueCount();
    
    toast.success('Pending sale deleted');
  } else {
    toast.error('Failed to delete sale');
  }
  
  return success;
}, [isOnline, currentStoreId, setPendingSales, updateQueueCount]);







  // Edit pending sale
  const handleEditPendingSale = useCallback((sale) => {
    checkoutState.loadFromSale(sale);
    setEditingSale(sale);
    setShowCheckoutForm(true);
  }, [checkoutState]);

  // Delete synced sale
  const handleDeleteSale = useCallback(async (saleId) => {
    const success = await salesService.deleteSale(saleId);
    if (success) {
      refreshSales();
    }
    return success;
  }, [refreshSales]);

  // View product performance
  const handleViewProduct = useCallback((sale) => {
    const product = products.find(p => p.id === sale.dynamic_product_id);
    setSelectedProduct(product || {
      id: sale.dynamic_product_id,
      name: sale.product_name
    });
  }, [products]);

  // Edit synced sale
  const handleEditSyncedSale = useCallback((sale) => {
    setEditingSale(sale);
  }, []);

  // Save edited sale
  const handleSaveEditedSale = useCallback(async (editedData) => {
    if (!editingSale) return;
    
    const success = await salesService.updateSale(editingSale.id, editedData);
    if (success) {
      toast.success('Sale updated');
      refreshSales();
      setEditingSale(null);
    } else {
      toast.error('Failed to update sale');
    }
  }, [editingSale, refreshSales]);

  // Loading state
  if (!isValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Configuration Required
          </h2>
          <p className="text-slate-500">
            Please ensure store_id is set in localStorage
          </p>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  if (isLoading && sales.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-slate-500">Loading checkout...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Swift Checkout
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Fast, offline-ready point of sale
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Connection Status */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              isOnline 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>

            {/* Pending Count */}
            {queueCount > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={syncAll}
                  disabled={!isOnline || isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync ({queueCount})
                </button>
                
                {isSyncing && (
                  <button
                    onClick={syncPaused ? resumeSync : pauseSync}
                    className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  >
                    {syncPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}

            {/* Notifications */}
          
            {/* New Sale Button */}
            <button
              onClick={() => setShowCheckoutForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Sale
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'checkout'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Checkout
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Sales History
          </button>
        </div>

        {/* Content */}
        {activeTab === 'checkout' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => scanner.openScanner('camera')}
                className="flex flex-col items-center justify-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-white">Quick Scan</span>
                <span className="text-xs text-slate-500">Camera or scanner</span>
              </button>

              <button
                onClick={refreshData}
                className="flex flex-col items-center justify-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-white">Refresh Data</span>
                <span className="text-xs text-slate-500">Sync products & inventory</span>
              </button>
            </div>

            {/* Pending Sales */}
            <PendingSalesList
              pendingSales={pendingSales}
              isOnline={isOnline}
              isSyncing={isSyncing}
              syncPaused={syncPaused}
              syncProgress={syncProgress}
              onSync={syncAll}
              onPauseSync={syncPaused ? resumeSync : pauseSync}
              onClearQueue={clearQueue}
              onEditSale={handleEditPendingSale}
              onDeleteSale={handleDeleteOfflineSale}
              formatPrice={formatPrice}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <SalesHistory
            sales={filteredSales}
            isOnline={isOnline}
            isOwner={isOwner}
            currentUserId={currentUserId}
            onViewSale={setViewingSale}
            onViewProduct={handleViewProduct}
            onEditSale={handleEditSyncedSale}
            onDeleteSale={handleDeleteSale}
            formatPrice={formatPrice}
            search={search}
            setSearch={setSearch}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />
        )}
      </div>

      {/* Checkout Form Modal */}
      <AnimatePresence>
        {showCheckoutForm && (
          <CheckoutForm
            lines={checkoutState.lines}
            products={products}
            inventory={inventory}
            customers={customers}
            paymentMethod={checkoutState.paymentMethod}
            selectedCustomerId={checkoutState.selectedCustomerId}
            emailReceipt={checkoutState.emailReceipt}
            totalAmount={checkoutState.totalAmount}
            isOnline={isOnline}
            isSubmitting={isSubmitting}
            onProductChange={(lineId, productId) => {
              const product = products.find(p => p.id === productId);
              if (product) {
                checkoutState.setLineProduct(lineId, product);
              }
            }}
            onQuantityChange={(lineId, qty) => checkoutState.updateLine(lineId, { 
              quantity: qty, 
              isQuantityManual: true 
            })}
            onPriceChange={(lineId, price) => checkoutState.updateLine(lineId, { unit_price: price })}
            onAddDeviceRow={checkoutState.addDeviceRow}
            onUpdateDeviceRow={checkoutState.updateDeviceRow}
            onRemoveDeviceRow={checkoutState.removeDeviceRow}
            onConfirmDeviceRow={handleManualDeviceConfirm}
            onAddLine={checkoutState.addLine}
            onRemoveLine={checkoutState.removeLine}
            onPaymentMethodChange={checkoutState.setPaymentMethod}
            onCustomerChange={(customerId) => {
              const customer = customers.find(c => c.id === customerId);
              checkoutState.setSelectedCustomerId(customerId);
              checkoutState.setSelectedCustomerName(customer?.fullname || '');
            }}
            onEmailReceiptChange={checkoutState.setEmailReceipt}
            onOpenScanner={(lineId) => {
              checkoutState.openScanner(lineId);
              scanner.openScanner('camera', lineId);
            }}
            onSubmit={createSale}
            onCancel={() => {
              setShowCheckoutForm(false);
              setEditingSale(null);
              checkoutState.resetForm();
            }}
            formatPrice={formatPrice}
          />
        )}
      </AnimatePresence>

      {/* Scanner Modal */}
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
        onClose={scanner.closeScanner}
      />

  

      {/* Product Performance Modal */}
      {selectedProduct && (
        <ProductPerformanceModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          formatPrice={formatPrice}
        />
      )}

      {/* View Sale Modal */}
      {viewingSale && (
        <ViewSaleModal
          sale={viewingSale}
          onClose={() => setViewingSale(null)}
          formatPrice={formatPrice}
        />
      )}

      {/* Edit Sale Modal */}
      {editingSale && !showCheckoutForm && (
        <EditSaleModal
         sale={editingSale}
          products={products}
          customers={customers}
          isOwner={isOwner}
          isOnline={isOnline}
          currentUserId={currentUserId}
          onSave={handleSaveEditedSale}
          onClose={() => setEditingSale(null)}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}