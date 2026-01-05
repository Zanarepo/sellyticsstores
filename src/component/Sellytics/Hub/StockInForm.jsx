// StockInForm.jsx - Original Working Scanner + Dynamic Full Width When Inactive
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedBarcodeScanner from "./EnhancedBarcodeScanner";
import StockInFormMain from "./StockInFormMain";
import ScannerTogglePanel from "./ScannerTogglePanel";
import ScannerPlaceholder from "./ScannerPlaceholder";
import { useStockIn } from "./useStockIn";
import { useSession } from "./useSession";

export default function StockInForm({ warehouseId, clientId, products = [], onSuccess }) {
  const { userId } = useSession();

  const {
    selectedProductId,
    setSelectedProductId,
    quantity,
    setQuantity,
    notes,
    setNotes,
    condition,
    setCondition,
    scannerActive,
    setScannerActive,
    sessionId,
    scanStats,
     setUnitCost,
    isSubmitting,
    selectedProduct,
    startScanSession,
    handleScanUpdate,
    handleSubmit,
  } = useStockIn({ warehouseId, clientId, products, onSuccess });

  const isScannerEligible = selectedProduct && ["SERIALIZED", "BATCH"].includes(selectedProduct.product_type);

  return (
    <div className={`grid ${scannerActive ? "lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
      {/* Left Column: Form + Toggle */}
      <div className="space-y-6">
        <StockInFormMain
          products={products}
          selectedProductId={selectedProductId}
          setSelectedProductId={setSelectedProductId}
          quantity={quantity}
          setQuantity={setQuantity}
          condition={condition}
          setCondition={setCondition}
          notes={notes}
          setNotes={setNotes}
          scannerActive={scannerActive}
          scanStats={scanStats}
          selectedProduct={selectedProduct}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          setUnitCost={setUnitCost}
        />
 
        <ScannerTogglePanel
          selectedProduct={selectedProduct}
          scannerActive={scannerActive}
          startScanSession={startScanSession}
        />
      </div>

      {/* Right Column: Scanner - Only rendered when active */}
      <AnimatePresence>
        {scannerActive && sessionId && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EnhancedBarcodeScanner
              sessionId={sessionId}
              warehouseId={warehouseId}
              clientId={clientId}
              userId={userId}
              productType={selectedProduct?.product_type || "STANDARD"}
              onScanUpdate={handleScanUpdate}
              onClose={() => setScannerActive(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder - Only when inactive and eligible */}
      {!scannerActive && isScannerEligible && (
        <div className="col-span-1 lg:col-span-2 max-w-2xl mx-auto w-full">
          <ScannerPlaceholder selectedProduct={selectedProduct} />
        </div>
      )}
    </div>
  );
}