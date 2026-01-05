/**
 * SwiftCheckout - Sales Tracker (Complete Integration)
 * Main component integrating all features
 */
import React, { useState, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Components
import SalesHeader from './SalesHeader';
import SalesTable from './SalesTable';
import SalesForm from './SalesForm';
import SalesPagination from './SalesPagination';
import ExportButtons from './ExportButtons';
import ScannerModal from './ScannerModal';
import DeviceDetailModal from './DeviceDetailModal';
import ProductPerformanceModal from './ProductPerformanceModal';

// Hooks
import useMultiStore from '../SwiftCheckout/hooks/useMultiStore';
import useSalesData from '../SwiftCheckout/hooks/useSalesData';
import useOfflineCache from '../SwiftCheckout/hooks/useOfflineCache';
import useSalesCrud from '../SwiftCheckout/hooks/useSalesCrud';
import useDeviceValidation from '../SwiftCheckout/hooks/useDeviceValidation';
import useDeviceLineHandler from '../SwiftCheckout/hooks/useDeviceLineHandler';
import useSalesPagination from '../SwiftCheckout/hooks/useSalesPagination';
import useScanHandler from '../SwiftCheckout/hooks/useScanHandler';
import useSaleFormHandlers from '../SwiftCheckout/hooks/useSaleFormHandlers';
import useModalHandlers from '../SwiftCheckout/hooks/useModalHandlers';
// Adjust path if needed
// Utils
import { formatPrice } from '../SwiftCheckout/utils/formatting';
export default function SalesTracker() {
  const storeId = typeof window !== 'undefined' ? localStorage.getItem('store_id') : null;





  const userEmail = typeof window !== 'undefined'
    ? (localStorage.getItem('user_email') || '').trim().toLowerCase()
    : null;

  // View & Pagination
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedDeviceInfo, setSelectedDeviceInfo] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);

  // Form State
  const [lines, setLines] = useState([
    { dynamic_product_id: '', quantity: 1, unit_price: '', deviceIds: [''], deviceSizes: [''], isQuantityManual: false }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [emailReceipt, setEmailReceipt] = useState(false);
  const [availableDeviceIds, setAvailableDeviceIds] = useState({});
  const [saleForm, setSaleForm] = useState({
    quantity: 1,
    unit_price: '',
    deviceIds: [''],
    deviceSizes: [''],
    payment_method: 'Cash',
    isQuantityManual: false,
  });

  // Hooks
  const { isMultiStoreOwner, ownedStores, selectedStoreId, setSelectedStoreId, canDelete, canEdit } =
    useMultiStore(userEmail, storeId);

  const {
    products,
    inventory,
    sales,
    filtered,
    search,
    setSearch,
    isLoading,
    dailyTotals,
    weeklyTotals,
    isOwner,
    fetchSales,
    fetchInventory,
    setSales,
  } = useSalesData(storeId, userEmail);

  // Give offline queue access to update the main sales list
window.tempSetSales = setSales;
const offlineCache = useOfflineCache();

  const { pendingSales = [], refreshPendingSales } = offlineCache;

  const { checkSoldDevices } = useDeviceValidation(products, storeId, setAvailableDeviceIds);

  const { handleLineChange, addDeviceId, removeDeviceId, removeLine } = useDeviceLineHandler({
    storeId,
    products,
    inventory,
    lines,
    setLines,
    checkSoldDevices,
  });

  const { scanner } = useScanHandler(storeId, setLines, setSaleForm);

  const { totalsData, paginatedSales, paginatedTotals, totalItems } = useSalesPagination({
    viewMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filtered,
    dailyTotals,
    weeklyTotals,
    search,
  });

  const { handleEditChange, addEditDeviceId, removeEditDeviceId, handleEdit: handleEditForm } = useSaleFormHandlers({
    saleForm,
    setSaleForm,
    products,
    setSelectedCustomerId,
  });

  const handleEdit = (sale) => {
    setEditing(sale.id);
    handleEditForm(sale);
  };

  const { openDetailModal, closeAddModal, closeEditModal, closeDetailModal } = useModalHandlers({
    setShowAddModal,
    setShowDetailModal,
    setSelectedDeviceInfo,
    setEditing,
    setSelectedCustomerId,
  });

  const openProductDetailModal = (sale) => {
    setSelectedProduct(sale);
    setShowProductDetailModal(true);
  };

  const closeProductDetailModal = () => {
    setSelectedProduct(null);
    setShowProductDetailModal(false);
  };

  const { createSale: createSaleCrud, saveEdit: saveEditCrud, deleteSale } = useSalesCrud(
    storeId,
    offlineCache.isOnline,
    inventory,
    offlineCache.queueSale,
    fetchSales,
    fetchInventory,
    setSales
  );

  const totalAmount = useMemo(
    () => lines.reduce((sum, l) => sum + (l.quantity * (l.unit_price || 0)), 0),
    [lines]
  );

  const createSale = async () => {
    if (!paymentMethod) return alert('Please select a payment method');
    for (const line of lines) {
      if (!line.dynamic_product_id || line.quantity <= 0 || !line.unit_price) {
        return alert('Please fill in all required fields');
      }
    }
    await createSaleCrud(lines, totalAmount, paymentMethod, selectedCustomerId, emailReceipt, products);
    resetForm();
  };

  const resetForm = () => {
    setShowAddModal(false);
    setLines([{ dynamic_product_id: '', quantity: 1, unit_price: '', deviceIds: [''], deviceSizes: [''], isQuantityManual: false }]);
    setPaymentMethod('Cash');
    setSelectedCustomerId(null);
    setEmailReceipt(false);
  };

  const saveEdit = async () => {
    try {
      const original = sales.find((s) => s.id === editing);
      if (!original) return;
      await saveEditCrud(editing, saleForm, original);
      setEditing(null);
      setSelectedCustomerId(null);
    } catch {}
  };

  if (isLoading && sales.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-slate-500 text-center">Loading sales...</p>
      </div>
    );
  }
// HARD-GATE: Prevent Dexie hooks from running until storeId is valid
if (!storeId || storeId === "undefined" || storeId === "") {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <p className="text-slate-500 text-center">Invalid store ID. Please log in again.</p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6">
      <ToastContainer 
        position="top-right" 
        autoClose= {3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <SalesHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          search={search}
          setSearch={setSearch}
          onNewSale={() => setShowAddModal(true)}
          isMultiStoreOwner={isMultiStoreOwner}
          ownedStores={ownedStores}
          selectedStoreId={selectedStoreId}
          setSelectedStoreId={setSelectedStoreId}
          isOnline={offlineCache.isOnline}
          pendingCount={offlineCache.pendingCount || 0}
          onSync={offlineCache.syncAll}
          isSyncing={offlineCache.isSyncing}
        />

        {/* OFFLINE SALES — SHOWS INSTANTLY (no refresh needed) */}
{!offlineCache.isOnline && offlineCache.pendingCount > 0 && (
  <div className="mb-6 bg-amber-50 border border-amber-300 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-900">
          Pending Offline Sales ({offlineCache.pendingCount})
        </h3>
        <span className="text-sm text-amber-700">Will sync when online</span>
      </div>

      <div className="text-sm text-amber-800 bg-amber-100 p-3 rounded">
        Your sales are saved locally and will sync automatically when you're back online.
      </div>
    </div>
  )}


{/* OFFLINE SALES — INSTANT DISPLAY WITH REAL PRODUCT NAME & DYNAMIC CURRENCY */}
{!offlineCache.isOnline && pendingSales.length > 0 && (
  <div className="mb-8 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-2xl font-bold text-orange-900 flex items-center gap-3">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        Offline Sales ({pendingSales.length})
      </h3>
      <span className="text-sm font-medium text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
        Will sync when online
      </span>
    </div>

    <div className="space-y-4">
      {pendingSales.map((sale) => {
        // Get first line (or fallback)
        const line = sale.lines?.[0] || {};
        const productName = line.productName || 
                           sale.product_name || 
                           products.find(p => p.id === line.dynamic_product_id)?.name ||
                           'Unknown Product';

        const qty = line.quantity || sale.quantity || 1;
        const amount = sale.totalAmount || sale.amount || 0;

        return (
          <div
            key={sale.client_ref}
            className="bg-white rounded-xl p-5 shadow-md border border-orange-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900">{productName}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Qty: {qty} × {formatPrice(line.unitPrice || amount / qty)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(sale.sold_at || sale.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-3xl font-bold text-green-600">
                  {formatPrice(amount)}
                </div>
                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  OFFLINE
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
        <SalesTable
          viewMode={viewMode}
          paginatedSales={paginatedSales}
          paginatedTotals={paginatedTotals}
          onViewDetails={openProductDetailModal}
          onEdit={handleEdit}
          onDelete={deleteSale}
          isMultiStoreOwner={isMultiStoreOwner}
          ownedStores={ownedStores}
          selectedStoreId={selectedStoreId}
          setSelectedStoreId={setSelectedStoreId}
          canDelete={canDelete}
          canEdit={canEdit}
          formatPrice={formatPrice}
        />

        <SalesPagination 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          totalItems={totalItems} 
          itemsPerPage={itemsPerPage} 
        />

        <ExportButtons 
          viewMode={viewMode} 
          filtered={filtered} 
          totalsData={totalsData} 
          formatPrice={formatPrice} 
        />

        {/* Add Sale Modal */}
        <AnimatePresence>
          {showAddModal && (
            <SalesForm
              type="add"
              onSubmit={createSale}
              onCancel={() => {
                scanner.closeScanner();
                closeAddModal();
              }}
              lines={lines}
              setLines={setLines}
              removeLine={removeLine}
              products={products}
              availableDeviceIds={availableDeviceIds}
              handleLineChange={handleLineChange}
              openScanner={scanner.openScanner}
              removeDeviceId={removeDeviceId}
              addDeviceId={addDeviceId}
              paymentMethod={paymentMethod}
              isOwner={isOwner}
              setPaymentMethod={setPaymentMethod}
              storeId={storeId}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              totalAmount={totalAmount}
              emailReceipt={emailReceipt}
              setEmailReceipt={setEmailReceipt}
              formatPrice={formatPrice}
              isOnline={offlineCache.isOnline}
            />
          )}
        </AnimatePresence>

        {/* Edit Sale Modal */}
        <AnimatePresence>
          {editing && (
            <SalesForm
              type="edit"
              onSubmit={saveEdit}
              onCancel={() => {
                scanner.closeScanner();
                closeEditModal();
              }}
              products={products}
              openScanner={scanner.openScanner}
              saleForm={saleForm}
              handleEditChange={handleEditChange}
              addEditDeviceId={addEditDeviceId}
              removeEditDeviceId={removeEditDeviceId}
              storeId={storeId}
              emailReceipt={emailReceipt}
              setEmailReceipt={setEmailReceipt}
              formatPrice={formatPrice}
              isOnline={offlineCache.isOnline}
            />
          )}
        </AnimatePresence>

        {/* Scanner Modal */}
        <ScannerModal
          isOpen={scanner.showScanner}
          isCameraMode={!scanner.externalScannerMode}
          isContinuousMode={true}
          isLoading={scanner.scannerLoading}
          error={scanner.scannerError}
          manualInput={scanner.manualInput}
          videoRef={scanner.videoRef}
          scannerDivRef={scanner.scannerDivRef}
          onClose={scanner.closeScanner}
          onManualInputChange={scanner.setManualInput}
          onManualSubmit={scanner.handleManualInput}
          onModeChange={(isCamera) => scanner.setExternalScannerMode(!isCamera)}
          onContinuousModeChange={() => {}}
          setError={scanner.setScannerError}
        />

        {/* Device Detail Modal */}
        <DeviceDetailModal
          isOpen={showDetailModal}
          onClose={closeDetailModal}
          devices={selectedDeviceInfo}
          search={search}
        />

        {/* Product Detail Modal */}
        {selectedProduct && showProductDetailModal && (
          <ProductPerformanceModal
            isOpen={showProductDetailModal}
            onClose={closeProductDetailModal}
            productId={selectedProduct.dynamic_product_id || selectedProduct.id}
            productName={selectedProduct.product_name || selectedProduct.name}
          />
        )}
      </div>
    </div>
  );
}